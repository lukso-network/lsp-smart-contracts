#!/usr/bin/env bash
set -euo pipefail

# This script requires Bash >= 4 (associative arrays `declare -A`,
# lowercase expansion `${var,,}`). macOS ships Bash 3.2 at /bin/bash.
if (( BASH_VERSINFO[0] < 4 )); then
    echo "Error: this script requires Bash >= 4, but you are running Bash $BASH_VERSION." >&2
    echo "On macOS, install a newer Bash with 'brew install bash' and re-run." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ADDRESS=""
CHAIN=""
ALL_UP_CONTRACTS=false
ALL_TOKEN_CONTRACTS=false
SKIP_SOURCIFY=false
SOURCIFY_ONLY=false
TESTNET=false

readonly UP_STACK_CONTRACTS=(
    "LSP23LinkedContractsFactory"
    "UniversalProfileInitPostDeploymentModule"
    "UniversalProfilePostDeploymentModule"
    "ERCTokenCallbacks"
    "UniversalProfileInit-v0.14.0"
    "LSP6KeyManagerInit-v0.14.0"
    "LSP1UniversalReceiverDelegateUP-v0.14.0"
)
readonly TOKEN_CONTRACTS=(
    "LSP7MintableInit-v0.17.3"
    "LSP8MintableInit-v0.17.3"
    "LSP7CustomizableTokenInit-v0.18.1"
    "LSP8CustomizableTokenInit-v0.18.1"
)

usage() {
    cat <<'EOF'
Usage: $0 (--address <address> | --all-up-contracts | --all-token-contracts) --chain <chain_name> [options]

Submits contract verification to a block explorer (Etherscan or Blockscout) + Sourcify. 
Contract verification is always submitted to Sourcify by default for the specified `chain`.
This can be skipped via `--skip-sourcify` to submit only to the selected explorer.
To submit to Sourcify only for the specified chain, use `--sourcify-only`.
 
Options (required at least one of the following):
  --address                        Address of the deployed contract to verify the source code on-chain

  --all-up-contracts               Verify all the 7 x contracts of the Universal Profile stack 
                                   (LSP23LinkedContractsFactory, UniversalProfileInitPostDeploymentModule, UniversalProfilePostDeploymentModule, 
                                   ERCTokenCallbacks, UniversalProfile (v0.14.0), LSP6KeyManager (v0.14.0), LSP1UniversalReceiverDelegate (v0.14.0))
                                   
  --all-token-contracts            Verify all the 4 x contracts of the LSP7/8 token stack (LSP7/8 Mintable + LSP7/8 Customizable Token)
  
Options (required):
  --chain                          A valid chain name from `deployments/chains-mainnet.json`
                                   (or `deployments/chains-testnet.json` with --testnet)

Additional options:
  --testnet (optional)             Use the testnet chain registry (chains-testnet.json) instead of mainnet
  --skip-sourcify (optional)       Skip Sourcify for the specified `chain`
  --sourcify-only (optional)       Submit only to Sourcify for the specified `chain`.
  -h, --help                       Show this help

Explorer failures do not prevent the Sourcify step from running.
A failure on one contract does not stop the remaining ones: every contract is
processed and a per-contract summary is printed at the end.
Contracts already verified are treated as successful, so the script can be
safely re-run (e.g. after a partial failure).
The script exits non-zero if any step that was requested fails.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --address) ADDRESS="${2:?Missing value for --address}"; shift 2 ;;
        --all-up-contracts) ALL_UP_CONTRACTS=true; shift ;;
        --all-token-contracts) ALL_TOKEN_CONTRACTS=true; shift ;;
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

MODE=""
MODE_COUNT=0
[[ -n "$ADDRESS" ]] && MODE="address" && MODE_COUNT=$((MODE_COUNT + 1))
[[ "$ALL_UP_CONTRACTS" == true ]] && MODE="all-up-contracts" && MODE_COUNT=$((MODE_COUNT + 1))
[[ "$ALL_TOKEN_CONTRACTS" == true ]] && MODE="all-token-contracts" && MODE_COUNT=$((MODE_COUNT + 1))

if [[ $MODE_COUNT -ne 1 ]]; then
    echo "Exactly one of this option is required (cannot be used together): --address, --all-up-contracts, or --all-token-contracts" >&2
    usage
    exit 1
fi

if [[ -z "$CHAIN" ]]; then
    echo "Option --chain is required." >&2
    usage
    exit 1
fi

readonly CHAIN_ID=$(python3 "$SCRIPT_DIR/python/chains.py" "get-chain-id" --chain "$CHAIN")

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
# Params $1: Address to normalize
normalize_address() {
    local address_to_normalize="$1"
    address_to_normalize=$(echo "$address_to_normalize" | tr '[:upper:]' '[:lower:]')

    if ! [[ "$address_to_normalize" =~ ^0x[a-f0-9]{40}$ ]]; then
        echo "Error: Contract address must be 20 bytes long (40 hex chars), 0x-prefixed." >&2
        exit 1
    fi

    echo "$address_to_normalize"
}

# Resolve a contract option name to its address and prefetch its verification metadata.
# Params $1: contract option name (e.g. "UniversalProfileInit-v0.14.0")
resolve_and_prefetch_contract() {
    local contract_name="$1"
    local addr metadata

    addr=$(python3 "$SCRIPT_DIR/python/contracts.py" get-address --contract "$contract_name")
    addr=$(normalize_address "$addr")
    ADDRESSES+=("$addr")

    metadata=$(python3 "$SCRIPT_DIR/python/contracts.py" get-verification-metadata --address "$addr")
    CONTRACT_VERIFICATION_DATA[$addr]="$metadata"
    COMPILER_VERSION[$addr]=$(jq -r '.compilerVersion' <<< "$metadata")
    CONTRACT_ID[$addr]=$(jq -r '.contractIdentifier' <<< "$metadata")
    CONTRACT_NAMES[$addr]="$contract_name"
}

ADDRESSES=()

declare -A CONTRACT_VERIFICATION_DATA
declare -A COMPILER_VERSION
declare -A CONTRACT_ID
declare -A CONTRACT_NAMES

# Per-address results for the final summary ("✅ ok" / "❌ failed",
# unset means the step was skipped or unsupported).
declare -A EXPLORER_RESULTS
declare -A SOURCIFY_RESULTS

case "$MODE" in
    "address")
        addr=$(normalize_address "$ADDRESS")
        ADDRESSES+=("$addr")
        metadata=$(python3 "$SCRIPT_DIR/python/contracts.py" get-verification-metadata --address "$addr")
        CONTRACT_VERIFICATION_DATA[$addr]="$metadata"
        COMPILER_VERSION[$addr]=$(jq -r '.compilerVersion' <<< "$metadata")
        CONTRACT_ID[$addr]=$(jq -r '.contractIdentifier' <<< "$metadata")
        CONTRACT_NAMES[$addr]=$(jq -r '.contractName' <<< "$metadata")
        ;;
    "all-up-contracts")
        for contract in "${UP_STACK_CONTRACTS[@]}"; do resolve_and_prefetch_contract "$contract"; done
        ;;
    "all-token-contracts")
        for contract in "${TOKEN_CONTRACTS[@]}"; do resolve_and_prefetch_contract "$contract"; done
        ;;
esac

# Params $1: Address to verify
verify_with_etherscan() {
    local address="$1"
    local metadata="${CONTRACT_VERIFICATION_DATA[$address]}"
    local compiler_version="${COMPILER_VERSION[$address]}"
    local contract_id="${CONTRACT_ID[$address]}"
    local standard_json_input_file_path=$(echo "$metadata" | jq -r '.stdJsonInputFilePath')

    if [[ -z "${ETHERSCAN_API_KEY:-}" ]]; then
        echo "🔍❌ Missing ETHERSCAN_API_KEY. Cannot submit verification to Etherscan-family explorers. Use --sourcify-only or set ETHERSCAN_API_KEY." >&2
        return 1
    fi

    echo "Submitting to Etherscan (chain $CHAIN_ID)..." >&2

    local response=$(curl -sS -X POST "https://api.etherscan.io/v2/api" \
        --data-urlencode "apikey=$ETHERSCAN_API_KEY" \
        --data-urlencode "module=contract" \
        --data-urlencode "action=verifysourcecode" \
        --data-urlencode "chainid=$CHAIN_ID" \
        --data-urlencode "codeformat=solidity-standard-json-input" \
        --data-urlencode "contractaddress=$address" \
        --data-urlencode "contractname=$contract_id" \
        --data-urlencode "compilerversion=$compiler_version" \
        --data-urlencode "sourceCode@$standard_json_input_file_path")

    local status message guid
    
    status=$(echo "$response" | jq -r '.status')
    message=$(echo "$response" | jq -r '.message')
    # Result is the GUID for polling the verification status
    guid=$(echo "$response" | jq -r '.result')

    if [[ "$status" != "1" ]]; then
        # Etherscan responds with status=0 and "Contract source code already verified"
        # when re-submitting an already verified contract. Treat this as success so
        # that batch re-runs are idempotent.
        if [[ "${guid,,}" == *"already verified"* || "${message,,}" == *"already verified"* ]]; then
            echo "🔍✅ Contract $address already verified on Etherscan. Skipping." >&2
            return 0
        fi
        echo "🔍❌ Etherscan submission failed. Not polling verification status. Etherscan API error: (status=$status, message=$message): $guid" >&2
        return 1
    fi

    echo "🔍🔄 Etherscan submission response: $response"

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
# Params $2: Address to verify
verify_with_blockscout() {
    local blockscout_base_url="$1"
    local address="$2"

    : "${blockscout_base_url:?❌🔍 Missing Blockscout base URL for explorer. (required as first argument)}"

    local contract_name=$(echo "${CONTRACT_VERIFICATION_DATA[$address]}" | jq -r '.contractName')
    local standard_json_input_file_path=$(echo "${CONTRACT_VERIFICATION_DATA[$address]}" | jq -r '.stdJsonInputFilePath')
    local compiler_version="${COMPILER_VERSION[$address]}"

    echo "🔍🔄 Submitting verification request to Blockscout ($blockscout_base_url)..." >&2

    local response http_code is_verified
    response=$(curl -sS -X POST \
        "$blockscout_base_url/api/v2/smart-contracts/$address/verification/via/standard-input" \
        -F "compiler_version=$compiler_version" \
        -F "contract_name=$contract_name" \
        -F "autodetect_constructor_args=false" \
        -F "files[0]=@$standard_json_input_file_path;type=application/json" \
        -w "\nhttp=%{http_code}\n")

    echo "🔍🔄 Blockscout submission response: $response"

    http_code=$(echo "$response" | sed -n 's/^http=//p' | tail -1)
    if [[ -z "$http_code" || "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
        # Blockscout rejects re-submissions of already verified contracts (e.g. with
        # "Smart-contract verification is not required"). Treat this as success so
        # that batch re-runs are idempotent.
        is_verified=$(curl -sS "$blockscout_base_url/api/v2/smart-contracts/$address" | jq -r '.is_verified')
        if [[ "$is_verified" == "true" ]]; then
            echo "🔍✅ Contract $address already verified on Blockscout. Skipping." >&2
            return 0
        fi
        echo "🔍❌ Blockscout submission failed (http=$http_code)." >&2
        return 1
    fi

    echo "🔍🔄 Polling Blockscout verification status..." >&2

    # Poll in a loop
    is_verified="null"
    for attempt in $(seq 1 30); do
        is_verified=$(curl -sS "$blockscout_base_url/api/v2/smart-contracts/$address" | jq -r ".is_verified")
        [[ "$is_verified" == "true" ]] && break
        sleep 5
    done

    if [[ "$is_verified" != "true" ]]; then
        echo "🔍❌ Blockscout verification failed/timed out (is_verified=$is_verified)." >&2
        return 1
    fi

    echo "🔍✅ Blockscout verification successful." >&2
}

# Params $1: Address to verify
verify_with_sourcify() {
    local address="$1"
    echo "Submitting to Sourcify (chain $CHAIN_ID)..." >&2

    # Don't extract as raw since we pass `--argjson` to jq
    local standard_json_input=$(echo "${CONTRACT_VERIFICATION_DATA[$address]}" | jq '.stdJsonInput')
    local compiler_version="${COMPILER_VERSION[$address]}"
    local contract_id="${CONTRACT_ID[$address]}"

    local body
    body=$(jq -n \
        --argjson stdJsonInput "$standard_json_input" \
        --arg compilerVersion "$compiler_version" \
        --arg contractIdentifier "$contract_id" \
        '{ "stdJsonInput": $stdJsonInput, "compilerVersion": $compilerVersion, "contractIdentifier": $contractIdentifier }'
    )

    local verification_result=$(
        curl -sS -X POST \
            "https://sourcify.dev/server/v2/verify/$CHAIN_ID/$address" \
            -H 'Content-Type: application/json' \
            --data-raw "$body"
    )

    echo "🔍🔄 Sourcify submission response: $verification_result"

    # Sourcify rejects re-submissions of already verified contracts with the
    # custom error code "already_verified". Treat this as success so that
    # batch re-runs are idempotent.
    local custom_code
    custom_code=$(echo "$verification_result" | jq -r '.customCode // empty')
    if [[ "$custom_code" == "already_verified" ]]; then
        echo "🔍✅ Contract $address already verified on Sourcify. Skipping." >&2
        return 0
    fi

    local verification_id
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

# Record the outcome of an explorer verification for the final summary.
# A chain can have several explorers: a contract is only marked "ok"
# if none of them failed for it.
# Params $1: Address verified
# Params $2: Exit code of the verification function
record_explorer_result() {
    local address="$1"
    local exit_code="$2"

    if [[ "$exit_code" -ne 0 ]]; then
        EXPLORER_EXIT="$exit_code"
        EXPLORER_RESULTS[$address]="❌ failed"
    elif [[ "${EXPLORER_RESULTS[$address]:-}" != "❌ failed" ]]; then
        EXPLORER_RESULTS[$address]="✅ ok"
    fi
}

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
                for address in "${ADDRESSES[@]}"; do
                    echo "Submitting contract verification on $explorer_url for address $address" >&2
                    exit_code=0; verify_with_etherscan "$address" || exit_code=$?
                    record_explorer_result "$address" "$exit_code"
                    # Wait for 2 seconds to avoid rate limiting
                    sleep 2
                done
                ;;
            blockscout)
                for address in "${ADDRESSES[@]}"; do
                    echo "Submitting contract verification on $explorer_url for address $address" >&2
                    exit_code=0; verify_with_blockscout "$explorer_url" "$address" || exit_code=$?
                    record_explorer_result "$address" "$exit_code"
                    # Wait for 2 seconds to avoid rate limiting
                    sleep 2
                done
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
    for address in "${ADDRESSES[@]}"; do
        echo "Submitting contract verification to Sourcify for address $address" >&2
        exit_code=0; verify_with_sourcify "$address" || exit_code=$?
        if [[ "$exit_code" -ne 0 ]]; then
            SOURCIFY_EXIT="$exit_code"
            SOURCIFY_RESULTS[$address]="❌ failed"
        else
            SOURCIFY_RESULTS[$address]="✅ ok"
        fi
    done
fi

echo "" >&2
echo "===== 📋 Verification summary ($CHAIN, chain ID: $CHAIN_ID) =====" >&2
for address in "${ADDRESSES[@]}"; do
    printf '%-42s %-45s explorers: %-12s sourcify: %s\n' \
        "$address" \
        "${CONTRACT_NAMES[$address]}" \
        "${EXPLORER_RESULTS[$address]:-"⏭️ skipped"}" \
        "${SOURCIFY_RESULTS[$address]:-"⏭️ skipped"}" >&2
done
echo "" >&2

if [[ $EXPLORER_EXIT -ne 0 ]]; then
    echo "Explorer verification failed." >&2
fi
if [[ $SOURCIFY_EXIT -ne 0 ]]; then
    echo "Sourcify submission failed." >&2
fi

if [[ $EXPLORER_EXIT -ne 0 || $SOURCIFY_EXIT -ne 0 ]]; then
    exit 1
fi
