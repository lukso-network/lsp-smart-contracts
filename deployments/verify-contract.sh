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

Submits contract verification to a block explorer (Etherscan or Sourcify). 
Contract verification is always submitted to Sourcify by default for the specified `chain`.

Options:
  --address        Deployed contract address
  --chain          Chain name from deployed-chains.json
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

# Normalize to lowercase for consistent explorer API calls 
# (the contracts.json lookup below is case-insensitive regardless).
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

# python3 "$SCRIPT_DIR/python/cli.py get-verification-data"

CONTRACT_VERIFICATION_DATA=$(python3 "$SCRIPT_DIR/python/get_contract_verification_data.py" "$ADDRESS")
COMPILER_VERSION=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.compilerVersion')
CONTRACT_ID=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.contractIdentifier')

verify_with_etherscan() {
    : "${ETHERSCAN_API_KEY:?Set ETHERSCAN_API_KEY}"
    
    STANDARD_JSON_INPUT_FILE_PATH=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.stdJsonInputFilePath')

    echo "Submitting to Etherscan (chain $CHAIN_ID)..." >&2

    RESPONSE=$(curl -sS -X POST "https://api.etherscan.io/v2/api" \
        --data-urlencode "apikey=$ETHERSCAN_API_KEY" \
        --data-urlencode "module=contract" \
        --data-urlencode "action=verifysourcecode" \
        --data-urlencode "chainid=$CHAIN_ID" \
        --data-urlencode "codeformat=solidity-standard-json-input" \
        --data-urlencode "contractaddress=$ADDRESS" \
        --data-urlencode "contractname=$CONTRACT_ID" \
        --data-urlencode "compilerversion=$COMPILER_VERSION" \
        --data-urlencode "sourceCode@$STANDARD_JSON_INPUT_FILE_PATH")

    local status message guid
    
    status=$(echo "$RESPONSE" | jq -r '.status')
    message=$(echo "$RESPONSE" | jq -r '.message')
    # Result is the GUID for polling the verification status
    guid=$(echo "$RESPONSE" | jq -r '.result')

    if [[ "$status" != "1" ]]; then
        echo "🔍❌ Etherscan submission failed. Not polling verification status. Etherscan API error: (status=$status, message=$message): $guid" >&2
        return 1
    fi

    echo "🔍🔄 Etherscan submission response: $RESPONSE"

    echo "Polling Etherscan verification status..." >&2
    curl -sS -G "https://api.etherscan.io/v2/api" \
        --data-urlencode "apikey=$ETHERSCAN_API_KEY" \
        --data-urlencode "module=contract" \
        --data-urlencode "action=checkverifystatus" \
        --data-urlencode "chainid=$CHAIN_ID" \
        --data-urlencode "guid=$guid" 
    echo
}

verify_with_blockscout() {
    : "${BLOCKSCOUT_BASE_URL:?Set BLOCKSCOUT_BASE_URL (e.g. https://explorer.execution.testnet.lukso.network)}"

    CONTRACT_NAME=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.contractName')
    STANDARD_JSON_INPUT_FILE_PATH=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.stdJsonInputFilePath')

    echo "🔍🔄 Submitting verification request to Blockscout ($BLOCKSCOUT_BASE_URL)..." >&2

    local response http_code is_verified
    response=$(curl -sS -X POST \
        "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS/verification/via/standard-input" \
        -F "compiler_version=$COMPILER_VERSION" \
        -F "contract_name=$CONTRACT_NAME" \
        -F "autodetect_constructor_args=false" \
        -F "files[0]=@$STANDARD_JSON_INPUT_FILE_PATH;type=application/json" \
        -w "\nhttp=%{http_code}\n")

    echo "🔍🔄 Blockscout submission response: $response"

    http_code=$(echo "$response" | sed -n 's/^http=//p' | tail -1)
    if [[ -z "$http_code" || "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
        echo "🔍❌ Blockscout submission failed (http=$http_code)." >&2
        return 1
    fi

    echo "🔍🔄 Polling Blockscout verification status..." >&2

    is_verified=$(curl -sS "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS" | jq -r ".is_verified")
    if [[ "$is_verified" != "true" ]]; then
        echo "🔍❌ Blockscout verification failed (is_verified=$is_verified)." >&2
        return 1
    fi

    echo "🔍✅ Blockscout verification successful." >&2
}

verify_with_sourcify() {
    echo "Submitting to Sourcify (chain $CHAIN_ID)..." >&2

    # Don't extract as raw since we pass `--argjson` to jq
    STANDARD_JSON_INPUT=$(echo "$CONTRACT_VERIFICATION_DATA" | jq '.stdJsonInput')

    local body
    body=$(jq -n \
        --argjson stdJsonInput "$STANDARD_JSON_INPUT" \
        --arg compilerVersion "$COMPILER_VERSION" \
        --arg contractIdentifier "$CONTRACT_ID" \
        '{ "stdJsonInput": $stdJsonInput, "compilerVersion": $compilerVersion, "contractIdentifier": $contractIdentifier }'
    )

    verification_result=$(
        curl -sS -X POST \
            "https://sourcify.dev/server/v2/verify/$CHAIN_ID/$ADDRESS" \
            -H 'Content-Type: application/json' \
            --data-raw "$body"
    )

    verification_id=$(echo "$verification_result" | jq -r '.verificationId // empty')

    # Based on Sourcify docs: https://docs.sourcify.dev/docs/api/#verification
    if [ -n "$verification_id" ]; then
        curl -sS "https://sourcify.dev/server/v2/verify/${verification_id}"
    else
        echo "Sourcify submission failed." >&2
        return 1
    fi
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
