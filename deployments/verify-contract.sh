#!/usr/bin/env bash
set -euo pipefail

# Grabbed as arguments from CLI:
ADDRESS=""
CHAIN=""
EXPLORER=""

usage() {
    cat <<'EOF'
Usage: $0 --address <address> --chain <chain_id>

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

case "$EXPLORER" in
  etherscan|blockscout) ;;
  *)
    echo "Invalid --explorer: $EXPLORER (use: etherscan or blockscout)" >&2
    exit 1
    ;;
esac

# Compiler is either 0.8.17 for UniversalProfile base contracts
# or 0.8.28 for LSP7/8MintableInit (latest) and LSP7/8CustomizableTokenInit
# Grab the Standard JSON input file depending on the address and the contract it corresponds to
STANDARD_JSON_INPUT_FILE=
COMPILER_VERSION=

case $ADDRESS in
    # LSP23LinkedContractsFactory
    "0x2300000A84D25dF63081feAa37ba6b62C4c89a30")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP23LinkedContractFactory.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        ;;

    # UniversalProfileInitPostDeploymentModule 
    "0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-UniversalProfileInitPostDeploymentModule.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        ;;
    
    # UniversalProfileInit (v0.14.0)
    "0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-UniversalProfileInit-v0-14-0.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        ;;

    # LSP6KeyManagerInit (v0.14.0)
    "0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP6KeyManagerInit-v0-14-0.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        ;;
        
    # LSP1UniversalReceiverDelegateUP (v0.14.0)
    "0x7870C5B8BC9572A8001C3f96f7ff59961B23500D")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP1UniversalReceiverDelegateUP-v0-14-0.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        ;;

    # LSP7MintableInit (v0.17.3)
    "0xf006554F96bf91616dAda3FdB73Ca213874DcFF9")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP7MintableInit-v0-17-3.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        ;;

    # LSP8MintableInit (v0.17.3)
    "0xE0835D37b9b2Ed3719409B52499Af6411CEF49eB")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP8MintableInit-v0-17-3.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        ;;

    # LSP7CustomizableTokenInit (v0.18.1)
    "0x2803BA6e11Bb5fD9fDd3aFba653428f341df5A0F")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP7CustomizableTokenInit-v0-18-1.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        ;;

    # LSP8CustomizableTokenInit (v0.18.1)
    "0xc95b5e293d6f1BfcedB803c763A5B83A6484B5b8")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP8CustomizableTokenInit-v0-18-1.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        ;;
    *)
        echo "Unknown base contract / factory address: $ADDRESS" >&2
        exit 1
        ;;
esac

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
    : "${BLOCKSCOUT_BASE:?Set BLOCKSCOUT_BASE (e.g. https://explorer.execution.testnet.lukso.network)}"

    curl -sS -X POST \
        "$BLOCKSCOUT_BASE/api/v2/smart-contracts/$ADDRESS/verification/via/standard-input" \
        -F "compiler_version=$COMPILER_VERSION" \
        -F "contract_name=$CONTRACT_ID" \
        -F "autodetect_constructor_args=false" \
        -F "files[0]=@$STANDARD_JSON_INPUT_FILE;type=application/json" \
        -w "\nhttp=%{http_code}\n"
    
    curl -sS "$BLOCKSCOUT_BASE/api/v2/smart-contracts/$ADDRESS" \
        | python3 -c "import sys,json;d=json.load(sys.stdin);print('verified:', d.get('is_verified'))"
}

case "$EXPLORER" in
  etherscan)  verify_with_etherscan ;;
  blockscout) verify_with_blockscout ;;
esac

# Always submit to Sourcify (chain-agnostic; many wallets/explorers read from it)
BODY=$(python3 -c "
import json
std=json.load(open('$STANDARD_JSON_INPUT_FILE'))
print(json.dumps({'stdJsonInput':std,'compilerVersion':'$COMPILER_VERSION','contractIdentifier':'$CONTRACT_ID'}))")
curl -sS -X POST "https://sourcify.dev/server/v2/verify/$CHAIN_ID/$ADDRESS" \
  -H 'Content-Type: application/json' --data-raw "$BODY"
