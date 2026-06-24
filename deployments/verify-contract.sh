#!/usr/bin/env bash
set -euo pipefail

ADDRESS=""
CHAIN=""
EXPLORER=""
SKIP_EXPLORER=false
SOURCIFY_ONLY=false

usage() {
    cat <<EOF
Usage: $0 --address <address> --chain <chain_id|chain_name> [options]

Submits contract verification to a block explorer and/or Sourcify.

Options:
  --address        Deployed contract address
  --chain          Chain ID (e.g. 42) or name from deployed-chains.json
  --explorer       Blockchain Explorer backend: etherscan | blockscout
  --skip-explorer  Skip the explorer submission and only submit to Sourcify
  --sourcify-only  Alias for --skip-explorer
  -h, --help       Show this help

By default the script submits to the selected explorer and then always
submits to Sourcify. Explorer failures do not prevent the Sourcify step from
running. The script exits non-zero if any step that was requested fails.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --address) ADDRESS="${2:?Missing value for --address}"; shift 2 ;;
        --chain) CHAIN="${2:?Missing value for --chain}"; shift 2 ;;
        --explorer) EXPLORER="${2:?Missing value for --explorer}"; shift 2 ;;
        --skip-explorer) SKIP_EXPLORER=true; shift ;;
        --sourcify-only) SOURCIFY_ONLY=true; SKIP_EXPLORER=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

if [[ "$SOURCIFY_ONLY" == true ]]; then
    SKIP_EXPLORER=true
fi

if [[ -z "$ADDRESS" || -z "$CHAIN" ]]; then
    echo "Required options: --address, --chain." >&2
    usage
    exit 1
fi

if [[ "$SKIP_EXPLORER" != true && -z "$EXPLORER" ]]; then
    echo "Required option: --explorer (or pass --skip-explorer / --sourcify-only)." >&2
    usage
    exit 1
fi

# Normalize to lowercase for consistent explorer API calls (the contracts.json
# lookup below is case-insensitive regardless).
ADDRESS=$(echo "$ADDRESS" | tr '[:upper:]' '[:lower:]')

if [[ "$SKIP_EXPLORER" != true ]]; then
    case "$EXPLORER" in
        etherscan|blockscout) ;;
        *)
            echo "Invalid --explorer: $EXPLORER (use: etherscan or blockscout)" >&2
            exit 1
            ;;
    esac
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Resolve CHAIN_ID from --chain: a numeric value is used as-is, otherwise it is
# treated as a chain name and looked up in deployments/deployed-chains.json.
if [[ "$CHAIN" =~ ^[0-9]+$ ]]; then
    CHAIN_ID="$CHAIN"
else
    CHAIN_ID=$(python3 "$SCRIPT_DIR/python/lookup_chain_id.py" "$CHAIN")
fi

# Resolve the verification metadata (Standard JSON input file, full compiler
# version and contract identifier) for the given address from contracts.json.
CONTRACT_METADATA=$(python3 "$SCRIPT_DIR/python/lookup_contract_by_address.py" "$ADDRESS")
STANDARD_JSON_INPUT_FILE=$(sed -n '1p' <<<"$CONTRACT_METADATA")
COMPILER_VERSION=$(sed -n '2p' <<<"$CONTRACT_METADATA")
CONTRACT_ID=$(sed -n '3p' <<<"$CONTRACT_METADATA")

verify_with_etherscan() {
    : "${ETHERSCAN_API_KEY:?Set ETHERSCAN_API_KEY}"

    echo "Submitting to Etherscan (chain $CHAIN_ID)..." >&2

    RESPONSE=$(curl -sS -X POST "https://api.etherscan.io/v2/api?chainid=$CHAIN_ID" \
        --data-urlencode "apikey=$ETHERSCAN_API_KEY" \
        --data-urlencode "module=contract" \
        --data-urlencode "action=verifysourcecode" \
        --data-urlencode "codeformat=solidity-standard-json-input" \
        --data-urlencode "contractaddress=$ADDRESS" \
        --data-urlencode "contractname=$CONTRACT_ID" \
        --data-urlencode "compilerversion=$COMPILER_VERSION" \
        --data-urlencode "sourceCode@$STANDARD_JSON_INPUT_FILE")

    echo "$RESPONSE"

    local guid
    if ! guid=$(echo "$RESPONSE" | python3 "$SCRIPT_DIR/python/parse_etherscan_guid.py"); then
        echo "Etherscan submission failed; not polling verification status." >&2
        return 1
    fi

    echo "Polling Etherscan verification status..." >&2
    curl -sS -G "https://api.etherscan.io/v2/api" \
        --data-urlencode "chainid=$CHAIN_ID" \
        --data-urlencode "module=contract" \
        --data-urlencode "action=checkverifystatus" \
        --data-urlencode "guid=$guid" \
        --data-urlencode "apikey=$ETHERSCAN_API_KEY"
    echo
}

verify_with_blockscout() {
    : "${BLOCKSCOUT_BASE_URL:?Set BLOCKSCOUT_BASE_URL (e.g. https://explorer.execution.testnet.lukso.network)}"

    echo "Submitting to Blockscout ($BLOCKSCOUT_BASE_URL)..." >&2

    local response http_code
    response=$(curl -sS -X POST \
        "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS/verification/via/standard-input" \
        -F "compiler_version=$COMPILER_VERSION" \
        -F "contract_name=$CONTRACT_ID" \
        -F "autodetect_constructor_args=false" \
        -F "files[0]=@$STANDARD_JSON_INPUT_FILE;type=application/json" \
        -w "\nhttp=%{http_code}\n")

    echo "$response"

    http_code=$(echo "$response" | sed -n 's/^http=//p' | tail -1)
    if [[ -z "$http_code" || "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
        echo "Blockscout submission failed (http=$http_code)." >&2
        return 1
    fi

    curl -sS "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS" \
        | python3 -c "import sys,json;d=json.load(sys.stdin);print('verified:', d.get('is_verified'))"
}

verify_with_sourcify() {
    echo "Submitting to Sourcify (chain $CHAIN_ID)..." >&2

    local body
    body=$(python3 "$SCRIPT_DIR/python/build_sourcify_body.py" \
        "$STANDARD_JSON_INPUT_FILE" "$COMPILER_VERSION" "$CONTRACT_ID")

    curl -sS -X POST "https://sourcify.dev/server/v2/verify/$CHAIN_ID/$ADDRESS" \
        -H 'Content-Type: application/json' \
        --data-raw "$body"
    echo
}

EXPLORER_EXIT=0
SOURCIFY_EXIT=0

if [[ "$SKIP_EXPLORER" != true ]]; then
    case "$EXPLORER" in
        etherscan) verify_with_etherscan || EXPLORER_EXIT=$? ;;
        blockscout) verify_with_blockscout || EXPLORER_EXIT=$? ;;
    esac
else
    echo "Skipping explorer submission (--skip-explorer / --sourcify-only)." >&2
fi

verify_with_sourcify || SOURCIFY_EXIT=$?

if [[ $EXPLORER_EXIT -ne 0 ]]; then
    echo "Explorer verification failed." >&2
fi
if [[ $SOURCIFY_EXIT -ne 0 ]]; then
    echo "Sourcify submission failed." >&2
fi

if [[ $EXPLORER_EXIT -ne 0 || $SOURCIFY_EXIT -ne 0 ]]; then
    exit 1
fi
