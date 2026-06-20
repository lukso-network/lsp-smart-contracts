#!/usr/bin/env bash
# Generates the deployment artifact + solc standard JSON input for the
# DummyPingRegistry proof-of-concept contract.
#
# The standard JSON input is the SINGLE SOURCE OF TRUTH: we compile it with
# `solc --standard-json` and take the creation bytecode from that exact compile.
# This guarantees the deployed bytecode and the verification input always agree,
# so explorers report an EXACT match (not a partial/metadata-only match).
#
# Outputs:
#   deployments/scripts/solc-inputs/DummyPingRegistry.json  (standard JSON input, for verification)
#   deployments/scripts/artifacts/DummyPingRegistry.json    (salt, creationBytecode, address, for deployment)
#
# Requirements: solc 0.8.17 and `cast`. The script auto-detects the solc 0.8.17
# binary that Foundry manages under ~/.svm; override with SOLC=/path/to/solc.
#
# Run from anywhere:
#   ./deployments/scripts/generate-dummy-artifact.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

NICK_FACTORY="0x4e59b44847b379578588920cA78FbF26c0B4956C"
SALT="0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
CONTRACT_NAME="DummyPingRegistry"
CONTRACT_FILE="deployments/scripts/contracts/DummyPingRegistry.sol"
SOLC_VERSION="0.8.17"

SOLC="${SOLC:-$HOME/.svm/${SOLC_VERSION}/solc-${SOLC_VERSION}}"
if [ ! -x "$SOLC" ]; then
  echo "solc ${SOLC_VERSION} not found at $SOLC."
  echo "Install it (e.g. 'forge build' once to let Foundry fetch it, or 'solc-select install ${SOLC_VERSION}')"
  echo "or pass SOLC=/path/to/solc-${SOLC_VERSION}."
  exit 1
fi

SOLC_INPUT="deployments/scripts/solc-inputs/${CONTRACT_NAME}.json"
ARTIFACT="deployments/scripts/artifacts/${CONTRACT_NAME}.json"
mkdir -p "$(dirname "$SOLC_INPUT")" "$(dirname "$ARTIFACT")"

# 1. Build the standard JSON input from the contract source files.
echo "Assembling standard JSON input -> $SOLC_INPUT"
python3 - "$CONTRACT_NAME" "$SOLC_INPUT" <<'PY'
import json, os, sys
contract_name, out_path = sys.argv[1], sys.argv[2]
base = "deployments/scripts/contracts"
files = [
    "DummyPingRegistry.sol",
    "DummyPingRegistryCore.sol",
    "DummyPingCounter.sol",
    "IDummyPingRegistry.sol",
]
sources = {}
for fn in files:
    p = os.path.join(base, fn)
    with open(p) as fh:
        sources[p] = {"content": fh.read()}
std = {
    "language": "Solidity",
    "sources": sources,
    "settings": {
        "optimizer": {"enabled": True, "runs": 1000},
        "evmVersion": "london",
        "metadata": {"bytecodeHash": "ipfs"},
        "outputSelection": {
            "*": {
                "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object", "metadata"]
            }
        },
    },
}
with open(out_path, "w") as fh:
    json.dump(std, fh, indent=2)
PY

# 2. Compile the standard JSON input with solc; this output is the source of truth.
echo "Compiling with solc ${SOLC_VERSION}..."
SOLC_OUT_TMP=$(mktemp)
trap 'rm -f "$SOLC_OUT_TMP"' EXIT
"$SOLC" --standard-json "$SOLC_INPUT" > "$SOLC_OUT_TMP"

# 3. Extract creation bytecode and write the deployment artifact.
echo "Writing artifact -> $ARTIFACT"
CREATION_BYTECODE=$(python3 - "$SOLC_OUT_TMP" "$CONTRACT_FILE" "$CONTRACT_NAME" <<'PY'
import json, sys
out_path, path, name = sys.argv[1], sys.argv[2], sys.argv[3]
with open(out_path) as fh:
    out = json.load(fh)
errors = [e for e in out.get("errors", []) if e.get("severity") == "error"]
if errors:
    for e in errors:
        print(e.get("formattedMessage", e), file=sys.stderr)
    sys.exit(1)
print("0x" + out["contracts"][path][name]["evm"]["bytecode"]["object"])
PY
)

# 4. Compute the deterministic CREATE2 address.
INIT_CODE_HASH=$(cast keccak "$CREATION_BYTECODE")
ADDRESS_HASH=$(cast keccak "$(cast concat-hex 0xff "$NICK_FACTORY" "$SALT" "$INIT_CODE_HASH")")
ADDRESS=$(cast to-check-sum-address "0x${ADDRESS_HASH:26}")

python3 - "$ADDRESS" "$SALT" "$SOLC_VERSION" "$CREATION_BYTECODE" "$ARTIFACT" <<'PY'
import json, sys
address, salt, solc_version, creation, out_path = sys.argv[1:6]
artifact = {
    "version": "poc",
    "address": address,
    "salt": salt,
    "compilerSettings": {
        "solcVersion": solc_version,
        "optimisation": {"enabled": True, "runs": "1000"},
    },
    "creationBytecode": creation,
}
with open(out_path, "w") as fh:
    json.dump(artifact, fh, indent=2)
PY

echo "Done."
echo "  Standard JSON input: $SOLC_INPUT"
echo "  Deployment artifact: $ARTIFACT"
echo "  Deterministic address on every chain: $ADDRESS"
