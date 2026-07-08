#!/usr/bin/env bash
set -euo pipefail

# Enriches deployment status records written by the Foundry deploy scripts with
# txHash, blockNumber, and rpcUrlUsed from broadcast/run-latest.json files.
#
# Requires Bash >= 4 and jq.

if (( BASH_VERSINFO[0] < 4 )); then
    echo "Error: this script requires Bash >= 4, but you are running Bash $BASH_VERSION." >&2
    echo "On macOS, install a newer Bash with 'brew install bash' and re-run." >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: this script requires 'jq' but it was not found in PATH." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CHAIN_ID=""
RPC_URL="${RPC_URL:-}"

readonly NICK_FACTORY_ADDRESS="0x4e59b44847b379578588920ca78fbf26c0b4956c"

readonly DEPLOYMENT_SCRIPTS=(
    "DeployFromArtifact.s.sol"
    "DeployUniversalProfileStack.s.sol"
    "DeployTokenImplementationContracts.s.sol"
)

usage() {
    cat <<'EOF'
Usage: write-deployment-records.sh --chain-id <id> [--rpc-url <url>]

Fills txHash, blockNumber, and rpcUrlUsed in deployment status records under
deployments/chains/ for records with status "deployed" and txHash null.

Options:
  --chain-id <id>     Target chain ID (required)
  --rpc-url <url>     RPC URL used for the deployment (defaults to $RPC_URL)
  -h, --help          Show this help
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --chain-id) CHAIN_ID="${2:?Missing value for --chain-id}"; shift 2 ;;
        --rpc-url) RPC_URL="${2:?Missing value for --rpc-url}"; shift 2 ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
    esac
done

if [[ -z "$CHAIN_ID" ]]; then
    echo "Error: --chain-id is required." >&2
    usage
    exit 1
fi

declare -A TX_BY_ADDRESS=()
declare -A BLOCK_BY_ADDRESS=()

# Computes the CREATE2 address for a raw Nick Factory deployment calldata
# (`salt ++ creationBytecode`). Used as a fallback when the broadcast file does
# not record the created contract address. Requires `cast` (Foundry).
compute_create2_address_from_calldata() {
    local input="${1#0x}"

    command -v cast >/dev/null 2>&1 || return 1
    # Calldata must contain at least the 32-byte salt plus some init code.
    (( ${#input} > 64 )) || return 1

    cast create2 \
        --deployer "$NICK_FACTORY_ADDRESS" \
        --salt "0x${input:0:64}" \
        --init-code "0x${input:64}" 2>/dev/null \
        | grep -oE '0x[0-9a-fA-F]{40}' | head -n 1
}

for script_name in "${DEPLOYMENT_SCRIPTS[@]}"; do
    broadcast_file="$REPO_ROOT/broadcast/$script_name/$CHAIN_ID/run-latest.json"

    if [[ ! -f "$broadcast_file" ]]; then
        continue
    fi

    # Deployments go through the Nick Factory, so the created contract address
    # can appear in three different shapes in the broadcast file:
    #  1. `transactionType: "CREATE2"` with a top-level `contractAddress`
    #     (forge special-cases the canonical CREATE2 deployer proxy);
    #  2. a factory `CALL` with the created contract listed under
    #     `additionalContracts[]`;
    #  3. a factory `CALL` with no recorded address at all, in which case the
    #     CREATE2 address is recomputed from the calldata (salt ++ init code).
    # Note: the jq query emits "-" instead of an empty address, because bash
    # `read` collapses leading tab-separated empty fields (tab is IFS whitespace).
    while IFS=$'\t' read -r address tx_hash block_number input; do
        [[ -z "$tx_hash" ]] && continue
        [[ "$address" == "-" ]] && address=""

        if [[ -z "$address" && -n "$input" ]]; then
            address="$(compute_create2_address_from_calldata "$input" || true)"
            if [[ -z "$address" ]]; then
                echo "Warning: could not derive CREATE2 address for factory tx $tx_hash (is 'cast' installed?)" >&2
                continue
            fi
        fi
        [[ -z "$address" ]] && continue

        address="${address,,}"
        TX_BY_ADDRESS["$address"]="$tx_hash"
        BLOCK_BY_ADDRESS["$address"]="$block_number"
    done < <(
        jq -r --arg factory "$NICK_FACTORY_ADDRESS" '
            . as $root
            | ($root.transactions // []) as $txs
            | ($root.receipts // []) as $receipts
            | $txs[]
            | . as $tx
            | (
                ($receipts[]? | select(.transactionHash == $tx.hash) | .blockNumber)
                // ""
              ) as $block
            | (
                # 1. forge recorded the created address on the tx itself
                ( select($tx.transactionType == "CREATE2" and ($tx.contractAddress // "") != "")
                  | [$tx.contractAddress, ($tx.hash // ""), $block, ""] ),
                # 2. contracts created inside a factory call
                ( $tx.additionalContracts[]?
                  | select(.transactionType == "CREATE2" and ((.address // "") != ""))
                  | [.address, ($tx.hash // ""), $block, ""] ),
                # 3. raw call to the Nick Factory with no recorded address:
                #    emit the calldata so the address can be recomputed
                ( select(
                      ((($tx.transaction.to // "") | ascii_downcase) == $factory)
                      and (($tx.contractAddress // "") == "")
                      and ((($tx.additionalContracts // []) | length) == 0)
                    )
                  | ["-", ($tx.hash // ""), $block, ($tx.transaction.input // $tx.transaction.data // "")] )
              )
            | @tsv
        ' "$broadcast_file"
    )
done

if [[ ${#TX_BY_ADDRESS[@]} -eq 0 ]]; then
    echo "No deployment transactions found in broadcast files for chain $CHAIN_ID." >&2
    exit 0
fi

updated=0
skipped=0

while IFS= read -r record_file; do
    record_chain_id="$(jq -r '.chainId // empty' "$record_file")"
    record_status="$(jq -r '.status // empty' "$record_file")"
    record_tx_hash="$(jq -r '.txHash // empty' "$record_file")"
    record_address="$(jq -r '.address // empty' "$record_file")"

    if [[ "$record_chain_id" != "$CHAIN_ID" ]]; then
        continue
    fi

    if [[ "$record_status" != "deployed" ]]; then
        ((skipped++)) || true
        continue
    fi

    if [[ -n "$record_tx_hash" && "$record_tx_hash" != "null" ]]; then
        ((skipped++)) || true
        continue
    fi

    address_key="${record_address,,}"
    tx_hash="${TX_BY_ADDRESS[$address_key]:-}"
    block_number="${BLOCK_BY_ADDRESS[$address_key]:-}"

    if [[ -z "$tx_hash" ]]; then
        echo "Warning: no broadcast tx found for $record_file ($record_address)" >&2
        continue
    fi

    if [[ -n "$block_number" && "$block_number" == 0x* ]]; then
        block_number=$((16#${block_number#0x}))
    fi

    tmp_file="$(mktemp)"

    rpc_url_used="${RPC_URL}"
     if [[ -n "$rpc_url_used" ]]; then
         rpc_url_used="${rpc_url_used%%\?*}" # drop query params (often contain API keys)
         rpc_url_used="$(sed -E 's#(https?://)[^/@]+@#\1#' <<<"$rpc_url_used")" # drop userinfo
     fi
     
    jq \
        --arg txHash "$tx_hash" \
        --argjson blockNumber "${block_number:-null}" \
        --arg rpcUrlUsed "${rpc_url_used}" \
        '
            .txHash = $txHash
            | .blockNumber = (if ($blockNumber | type) == "number" then $blockNumber else .blockNumber end)
            | .rpcUrlUsed = (if ($rpcUrlUsed | length) > 0 then $rpcUrlUsed else .rpcUrlUsed end)
        ' "$record_file" > "$tmp_file"
    mv "$tmp_file" "$record_file"

    echo "Enriched: $record_file"
    ((updated++)) || true
done < <(find "$SCRIPT_DIR/chains" -type f -name 'deploy-*.json' 2>/dev/null | sort)

echo "Done. Enriched $updated record(s), skipped $skipped record(s)."
