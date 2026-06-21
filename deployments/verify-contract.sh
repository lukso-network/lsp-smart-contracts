#!/usr/bin/env bash
set -euo pipefail

# Grabbed as arguments from CLI:
ADDRESS=""
CHAIN=""
EXPLORER=""

usage() {
    cat <<'EOF'
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

# Normalize to lowercase so mixed-case checksum addresses match the case arms below.
ADDRESS=$(echo "$ADDRESS" | tr '[:upper:]' '[:lower:]')

case "$EXPLORER" in
  etherscan|blockscout) ;;
  *)
    echo "Invalid --explorer: $EXPLORER (use: etherscan or blockscout)" >&2
    exit 1
    ;;
esac

# Resolve CHAIN_ID from --chain: a numeric value is used as-is, otherwise it is
# treated as a chain name and looked up in deployments/deployed-chains.json.
if [[ "$CHAIN" =~ ^[0-9]+$ ]]; then
    CHAIN_ID="$CHAIN"
else
    CHAIN_ID=$(python3 -c "
import json, sys
chains = json.load(open('deployments/deployed-chains.json'))
match = next((c['chainId'] for c in chains if c['name'] == sys.argv[1]), None)
if match is None:
    sys.exit('Unknown chain name: ' + sys.argv[1])
print(match)" "$CHAIN")
fi

# Compiler is either 0.8.17 for UniversalProfile base contracts
# or 0.8.28 for LSP7/8MintableInit (latest) and LSP7/8CustomizableTokenInit
# Grab the Standard JSON input file depending on the address and the contract it corresponds to
STANDARD_JSON_INPUT_FILE=
COMPILER_VERSION=
CONTRACT_ID=

case $ADDRESS in
    # LSP23LinkedContractsFactory
    "0x2300000a84d25df63081fea37ba6b62c4c89a30")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP23LinkedContractFactory.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        CONTRACT_ID="contracts/LSP23LinkedContractsFactory/LSP23LinkedContractsFactory.sol:LSP23LinkedContractsFactory"
        ;;

    # UniversalProfileInitPostDeploymentModule 
    "0x000000000066093407b6704b89793beffd0d8f00")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-UniversalProfileInitPostDeploymentModule.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        CONTRACT_ID="contracts/LSP23LinkedContractsDeployment/modules/UniversalProfileInitPostDeploymentModule.sol:UniversalProfileInitPostDeploymentModule"
        ;;
    
    # UniversalProfileInit (v0.14.0)
    "0x3024d38ea2434ba6635003dc1bdc0dab5882ed4f")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-UniversalProfileInit-v0-14-0.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        CONTRACT_ID="contracts/UniversalProfileInit.sol:UniversalProfileInit"
        ;;

    # LSP6KeyManagerInit (v0.14.0)
    "0x2fe3aed98684e7351ad2d408a43ce09a738bf8a4")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP6KeyManagerInit-v0-14-0.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        CONTRACT_ID="contracts/LSP6KeyManager/LSP6KeyManagerInit.sol:LSP6KeyManagerInit"
        ;;
        
    # LSP1UniversalReceiverDelegateUP (v0.14.0)
    "0x7870c5b8bc9572a8001c3f96f7ff59961b23500d")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP1UniversalReceiverDelegateUP-v0-14-0.json"
        COMPILER_VERSION="v0.8.17+commit.8df45f5f"
        CONTRACT_ID="contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol:LSP1UniversalReceiverDelegateUP"
        ;;

    # LSP7MintableInit (v0.17.3)
    "0xf006554f96bf91616dada3fdb73ca213874dcff9")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP7MintableInit-v0-17-3.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        CONTRACT_ID="packages/lsp7-contracts/contracts/presets/LSP7MintableInit.sol:LSP7MintableInit"
        ;;

    # LSP8MintableInit (v0.17.3)
    "0xe0835d37b9b2ed3719409b52499af6411cef49eb")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP8MintableInit-v0-17-3.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        CONTRACT_ID="packages/lsp8-contracts/contracts/presets/LSP8MintableInit.sol:LSP8MintableInit"
        ;;

    # LSP7CustomizableTokenInit (v0.18.1)
    "0x2803ba6e11bb5fd9fdd3afba653428f341df5a0f")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP7CustomizableTokenInit-v0-18-1.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        CONTRACT_ID="packages/lsp7-contracts/contracts/presets/LSP7CustomizableTokenInit.sol:LSP7CustomizableTokenInit"
        ;;

    # LSP8CustomizableTokenInit (v0.18.1)
    "0xc95b5e293d6f1bfcedb803c763a5b83a6484b5b8")
        STANDARD_JSON_INPUT_FILE="deployments/solc-inputs/Standard-JSON-input-LSP8CustomizableTokenInit-v0-18-1.json"
        COMPILER_VERSION="v0.8.28+commit.7893614a"
        CONTRACT_ID="packages/lsp8-contracts/contracts/presets/LSP8CustomizableTokenInit.sol:LSP8CustomizableTokenInit"
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
BODY=$(python3 -c "
import json
std=json.load(open('$STANDARD_JSON_INPUT_FILE'))
print(json.dumps({'stdJsonInput':std,'compilerVersion':'$COMPILER_VERSION','contractIdentifier':'$CONTRACT_ID'}))")
curl -sS -X POST "https://sourcify.dev/server/v2/verify/$CHAIN_ID/$ADDRESS" \
  -H 'Content-Type: application/json' --data-raw "$BODY"
