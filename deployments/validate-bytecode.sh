#!/usr/bin/env bash
set -euo pipefail

# Pre-deployment sanity check.
#
# Confirms that the Standard JSON input (used later for block explorer
# verification) compiles to the *exact* `creationBytecode` recorded in
# `deployments/contracts.json` for a given contract.
#
# - The Standard JSON input embeds its own source code, so this check is
#   self-contained: it does NOT depend on the current (or historical) `.sol`
#   files in the repository.
# - A match guarantees that the bytecode about to be deployed corresponds to the
#   verification input, so the contract will verify successfully (full match)
#   after deployment.

CONTRACT=""

usage() {
    cat <<'EOF'
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/python/contracts.py" "validate-verification-metadata" --contract "$CONTRACT"
