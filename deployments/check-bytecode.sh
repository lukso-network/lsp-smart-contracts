#!/usr/bin/env bash
set -euo pipefail

# Pre-deployment sanity check.
#
# Confirms that the Standard JSON input (used later for block explorer
# verification) compiles to the *exact* `creationBytecode` recorded in
# `deployments/contracts.json` for a given contract.
#
# Why this matters:
# - The Standard JSON input embeds its own source code, so this check is
#   self-contained: it does NOT depend on the current (or historical) `.sol`
#   files in the repository.
# - A match guarantees that the bytecode about to be deployed corresponds to the
#   verification input, so the contract will verify successfully (full match)
#   after deployment.

CONTRACT=""

usage() {
    cat <<EOF
Usage: $0 --contract <CONTRACT_TO_DEPLOY>

Verifies that the Standard JSON input in deployments/solc-inputs/ compiles to the
exact creationBytecode recorded in deployments/contracts.json for the contract.

Options:
  --contract  Contract identifier (same value as CONTRACT_TO_DEPLOY), e.g.
              UniversalProfileInit-v0.14.0, LSP7MintableInit-v0.17.3 or the flat
              singleton LSP23LinkedContractsFactory
  -h, --help  Show this help
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --contract) CONTRACT="${2:?Missing value for --contract}"; shift 2 ;;
        -h|--help) usage; exit 0 ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

if [[ -z "$CONTRACT" ]]; then
    echo "Required option: --contract" >&2
    usage
    exit 1
fi

# Map the contract identifier to its Standard JSON input file. Only contracts
# that have a Standard JSON input (i.e. are meant to be verified) are listed.
# The compiler version and the expected creation bytecode are read from
# contracts.json, so they stay in sync with a single source of truth.
SOLC_INPUT_DIR="deployments/solc-inputs"

case "$CONTRACT" in
    LSP23LinkedContractsFactory)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP23LinkedContractFactory.json" ;;
    UniversalProfileInitPostDeploymentModule)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-UniversalProfileInitPostDeploymentModule.json" ;;
    UniversalProfileInit-v0.14.0)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-UniversalProfileInit-v0-14-0.json" ;;
    LSP6KeyManagerInit-v0.14.0)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP6KeyManagerInit-v0-14-0.json" ;;
    LSP1UniversalReceiverDelegateUP-v0.14.0)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP1UniversalReceiverDelegateUP-v0-14-0.json" ;;
    LSP7MintableInit-v0.17.3)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP7MintableInit-v0-17-3.json" ;;
    LSP8MintableInit-v0.17.3)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP8MintableInit-v0-17-3.json" ;;
    LSP7CustomizableTokenInit-v0.18.1)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP7CustomizableTokenInit-v0-18-1.json" ;;
    LSP8CustomizableTokenInit-v0.18.1)
        SOLC_INPUT_FILE="$SOLC_INPUT_DIR/Standard-JSON-input-LSP8CustomizableTokenInit-v0-18-1.json" ;;
    *)
        echo "No Standard JSON input available for: $CONTRACT" >&2
        echo "Supported values:" >&2
        echo "  LSP23LinkedContractsFactory" >&2
        echo "  UniversalProfileInitPostDeploymentModule" >&2
        echo "  UniversalProfileInit-v0.14.0" >&2
        echo "  LSP6KeyManagerInit-v0.14.0" >&2
        echo "  LSP1UniversalReceiverDelegateUP-v0.14.0" >&2
        echo "  LSP7MintableInit-v0.17.3" >&2
        echo "  LSP8MintableInit-v0.17.3" >&2
        echo "  LSP7CustomizableTokenInit-v0.18.1" >&2
        echo "  LSP8CustomizableTokenInit-v0.18.1" >&2
        exit 1
        ;;
esac

if [[ ! -f "$SOLC_INPUT_FILE" ]]; then
    echo "Standard JSON input file not found: $SOLC_INPUT_FILE" >&2
    exit 1
fi

# The short contract name (used to locate the contract in the solc output) is
# the identifier without the trailing "-v<version>" suffix.
CONTRACT_NAME="${CONTRACT%%-v*}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/python/check_bytecode.py" "$CONTRACT" "$CONTRACT_NAME" "$SOLC_INPUT_FILE"
