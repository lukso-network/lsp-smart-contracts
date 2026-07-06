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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CHAIN_ID=""
RPC_URL="${RPC_URL:-}"

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

for script_name in "${DEPLOYMENT_SCRIPTS[@]}"; do
    broadcast_file="$REPO_ROOT/broadcast/$script_name/$CHAIN_ID/run-latest.json"

    if [[ ! -f "$broadcast_file" ]]; then
        continue
    fi

    while IFS=$'\t' read -r address tx_hash block_number; do
        [[ -z "$address" ]] && continue
        address="${address,,}"
        TX_BY_ADDRESS["$address"]="$tx_hash"
        BLOCK_BY_ADDRESS["$address"]="$block_number"
    done < <(
        jq -r '
            . as $root
            | ($root.transactions // []) as $txs
            | ($root.receipts // []) as $receipts
            | range(0; ($txs | length)) as $i
            | ($txs[$i]) as $tx
            | select($tx.transactionType == "CREATE2")
            | ($tx.contractAddress // "") as $addr
            | select($addr != "")
            | (
                ($receipts[]? | select(.transactionHash == $tx.hash) | .blockNumber)
                // ""
              ) as $block
            | [$addr, ($tx.hash // ""), $block]
            | @tsv
        ' "$broadcast_file"
    )
done

if [[ ${#TX_BY_ADDRESS[@]} -eq 0 ]]; then
    echo "No CREATE2 transactions found in broadcast files for chain $CHAIN_ID." >&2
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
    jq \
        --arg txHash "$tx_hash" \
        --argjson blockNumber "${block_number:-null}" \
        --arg rpcUrlUsed "${RPC_URL}" \
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
