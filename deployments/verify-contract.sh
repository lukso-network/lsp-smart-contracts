#!/usr/bin/env bash
set -euo pipefail

ADDRESS=""
CHAIN=""
SKIP_SOURCIFY=false
SOURCIFY_ONLY=false
TESTNET=false

usage() {
    cat <<'EOF'
Usage: $0 --address <address> --chain <chain_name> [options]

Submits contract verification to a block explorer (Etherscan or Blockscout) + Sourcify. 
Contract verification is always submitted to Sourcify by default for the specified `chain`.
This can be skipped via `--skip-sourcify` to submit only to the selected explorer.
To submit to Sourcify only for the specified chain, use `--sourcify-only`.
 
Options:
  --address                        Deployed contract address
  --chain                          A valid chain name from `deployments/chains-mainnet.json`
                                   (or `deployments/chains-testnet.json` with --testnet)
  --testnet (optional)             Use the testnet chain registry (chains-testnet.json) instead of mainnet
  --skip-sourcify (optional)       Skip Sourcify for the specified `chain`
  --sourcify-only (optional)       Submit only to Sourcify for the specified `chain`.
  -h, --help                       Show this help

Explorer failures do not prevent the Sourcify step from running. 
The script exits non-zero if any step that was requested fails.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --address) ADDRESS="${2:?Missing value for --address}"; shift 2 ;;
        --chain) CHAIN="${2:?Missing value for --chain}"; shift 2 ;;
        --skip-sourcify) SKIP_SOURCIFY=true; shift ;;
        --sourcify-only) SOURCIFY_ONLY=true; shift ;;
        --testnet) TESTNET=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

if [[ -z "$ADDRESS" || -z "$CHAIN" ]]; then
    echo "Required options: --address, --chain." >&2
    usage
    exit 1
fi

if [[ "$SKIP_SOURCIFY" == true && "$SOURCIFY_ONLY" == true ]]; then
    echo "Cannot use --skip-sourcify and --sourcify-only together." >&2
    exit 1
fi

# Relay the tier selection to the python subprocesses via the environment.
# `chains.py` reads DEPLOY_TESTNET (must be exactly "true" or "false") and
# inherits it automatically, so no per-call flag forwarding is needed.
if [[ "$TESTNET" == true ]]; then
    export DEPLOY_TESTNET=true
fi

# Normalize to lowercase for consistent explorer API calls 
# (the contracts.json lookup below is case-insensitive regardless).
ADDRESS=$(echo "$ADDRESS" | tr '[:upper:]' '[:lower:]')

if ! [[ "$ADDRESS" =~ ^0x[a-f0-9]{40}$ ]]; then
    echo "Error: Contract address must be 20 bytes long (40 hex chars), 0x-prefixed." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CONTRACT_VERIFICATION_DATA=$(python3 "$SCRIPT_DIR/python/contracts.py" "get-verification-metadata" --address "$ADDRESS")
COMPILER_VERSION=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.compilerVersion')
CONTRACT_ID=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.contractIdentifier')

CHAIN_ID=$(python3 "$SCRIPT_DIR/python/chains.py" "get-chain-id" --chain "$CHAIN")

verify_with_etherscan() {
    if [[ -z "${ETHERSCAN_API_KEY:-}" ]]; then
        echo "🔍❌ Missing ETHERSCAN_API_KEY. Cannot submit verification to Etherscan-family explorers. Use --sourcify-only or set ETHERSCAN_API_KEY." >&2
        return 1
    fi
    
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

# Params $1: Blockscout base URL
verify_with_blockscout() {
    local blockscout_base_url
    blockscout_base_url="$1"

    : "${blockscout_base_url:?❌🔍 Missing Blockscout base URL for explorer. (required as first argument)}"

    CONTRACT_NAME=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.contractName')
    STANDARD_JSON_INPUT_FILE_PATH=$(echo "$CONTRACT_VERIFICATION_DATA" | jq -r '.stdJsonInputFilePath')

    echo "🔍🔄 Submitting verification request to Blockscout ($blockscout_base_url)..." >&2

    local response http_code is_verified
    response=$(curl -sS -X POST \
        "$blockscout_base_url/api/v2/smart-contracts/$ADDRESS/verification/via/standard-input" \
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

    # Poll in a loop
    is_verified="null"
    for attempt in $(seq 1 30); do
        is_verified=$(curl -sS "$blockscout_base_url/api/v2/smart-contracts/$ADDRESS" | jq -r ".is_verified")
        [[ "$is_verified" == "true" ]] && break
        sleep 5
    done

    if [[ "$is_verified" != "true" ]]; then
        echo "🔍❌ Blockscout verification failed/timed out (is_verified=$is_verified)." >&2
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

    echo "🔍🔄 Sourcify submission response: $verification_result"
    verification_id=$(echo "$verification_result" | jq -r '.verificationId // empty')

    # Based on Sourcify docs: https://docs.sourcify.dev/docs/api/#verification
    if [ -n "$verification_id" ]; then
        curl -sS "https://sourcify.dev/server/v2/verify/${verification_id}"
    else
        return 1
    fi
}

EXPLORER_EXIT=0
SOURCIFY_EXIT=0

if [[ "$SOURCIFY_ONLY" != true ]]; then
    # Get all the block explorers for the specified chain
    if ! all_explorers=$(python3 "$SCRIPT_DIR/python/chains.py" "get-all-explorers" --chain "$CHAIN"); then
        echo "⚠️ Could not fetch explorers for chain $CHAIN; continuing to Sourcify only." >&2
        all_explorers='[]'
    fi
    
    while IFS= read -r explorer; do
        explorer_category=$(echo "$explorer" | jq -r '.category')
        explorer_url=$(echo "$explorer" | jq -r '.url')

        case "$explorer_category" in
            etherscan)
                echo "Submitting contract verification on $explorer_url" >&2
                verify_with_etherscan || EXPLORER_EXIT=$?
                ;;
            blockscout)
                echo "Submitting contract verification on $explorer_url" >&2
                verify_with_blockscout "$explorer_url" || EXPLORER_EXIT=$?
                ;;
            subscan)
                echo "Contract verification on Subscan not supported yet" >&2
                ;;
            routescan)
                echo "Contract verification on Routescan not supported yet" >&2
                ;;
            other)
                echo "Contract verification not supported for this type of explorer. Please verify contract manually. Skipping: $explorer_url" >&2
                ;;
        esac
    done < <(echo "$all_explorers" | jq -c '.[]')
else
    echo "Skipping explorer submission because of --sourcify-only option." >&2
fi

if [[ "$SKIP_SOURCIFY" != true ]]; then
    verify_with_sourcify || SOURCIFY_EXIT=$?
fi

if [[ $EXPLORER_EXIT -ne 0 ]]; then
    echo "Explorer verification failed." >&2
fi
if [[ $SOURCIFY_EXIT -ne 0 ]]; then
    echo "Sourcify submission failed." >&2
fi

if [[ $EXPLORER_EXIT -ne 0 || $SOURCIFY_EXIT -ne 0 ]]; then
    exit 1
fi
