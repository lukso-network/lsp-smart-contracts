#!/usr/bin/env bash
set -euo pipefail

# Grabbed as arguments from CLI:
ADDRESS=""
CHAIN=""
EXPLORER=""

usage() {
    cat <<EOF
Usage: $0 --address <address> --chain <chain_id|chain_name>

Options:
  --address   Deployed contract address
  --chain     Chain ID (e.g. 42) or name from deployed-chains.json
  --explorer  Blockchain Explorer backend: etherscan | blockscout
  -h, --help  Show this help
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --address) ADDRESS="${2:?Missing value for --address}"; shift 2 ;;
        --chain) CHAIN="${2:?Missing value for --chain}"; shift 2 ;;
        --explorer) EXPLORER="${2:?Missing value for --explorer}"; shift 2 ;;
        -h|--help) usage; exit 0 ;;
        *) 
            echo "Unknown option: $1" >&2
            usage 
            exit 1 
            ;;
    esac
done

if [[ -z "$ADDRESS" || -z "$CHAIN" || -z "$EXPLORER" ]]; then
    echo "Required options: --address, --chain, --explorer." >&2
    usage
    exit 1
fi

# Normalize to lowercase for consistent explorer API calls (the contracts.json
# lookup below is case-insensitive regardless).
ADDRESS=$(echo "$ADDRESS" | tr '[:upper:]' '[:lower:]')

case "$EXPLORER" in
  etherscan|blockscout) ;;
  *)
    echo "Invalid --explorer: $EXPLORER (use: etherscan or blockscout)" >&2
    exit 1
    ;;
esac

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
# The helper prints the three values, one per line, in this exact order:
#   1. standardJsonInputFilePath
#   2. compilerVersion
#   3. contractId
CONTRACT_METADATA=$(python3 "$SCRIPT_DIR/python/lookup_contract_by_address.py" "$ADDRESS")
STANDARD_JSON_INPUT_FILE=$(sed -n '1p' <<<"$CONTRACT_METADATA")
COMPILER_VERSION=$(sed -n '2p' <<<"$CONTRACT_METADATA")
CONTRACT_ID=$(sed -n '3p' <<<"$CONTRACT_METADATA")

verify_with_etherscan() {
    : "${ETHERSCAN_API_KEY:?Set ETHERSCAN_API_KEY}"

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
    GUID=$(echo "$RESPONSE" | python3 -c "import sys,json;print(json.load(sys.stdin)['result'])")
    curl -sS "https://api.etherscan.io/v2/api?chainid=$CHAIN_ID&module=contract&action=checkverifystatus&guid=$GUID&apikey=$ETHERSCAN_API_KEY"

}

verify_with_blockscout() {
    : "${BLOCKSCOUT_BASE_URL:?Set BLOCKSCOUT_BASE_URL (e.g. https://explorer.execution.testnet.lukso.network)}"

    curl -sS -X POST \
        "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS/verification/via/standard-input" \
        -F "compiler_version=$COMPILER_VERSION" \
        -F "contract_name=$CONTRACT_ID" \
        -F "autodetect_constructor_args=false" \
        -F "files[0]=@$STANDARD_JSON_INPUT_FILE;type=application/json" \
        -w "\nhttp=%{http_code}\n"
    
    curl -sS "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS" \
        | python3 -c "import sys,json;d=json.load(sys.stdin);print('verified:', d.get('is_verified'))"
}

case "$EXPLORER" in
  etherscan)  verify_with_etherscan ;;
  blockscout) verify_with_blockscout ;;
esac

# Always submit to Sourcify (chain-agnostic; many wallets/explorers read from it)
BODY=$(python3 "$SCRIPT_DIR/python/build_sourcify_body.py" \
    "$STANDARD_JSON_INPUT_FILE" "$COMPILER_VERSION" "$CONTRACT_ID")
curl -sS -X POST "https://sourcify.dev/server/v2/verify/$CHAIN_ID/$ADDRESS" \
  -H 'Content-Type: application/json' --data-raw "$BODY"
