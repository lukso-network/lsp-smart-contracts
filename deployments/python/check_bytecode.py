#!/usr/bin/env python3
"""Compile a Standard JSON input and compare it to contracts.json creationBytecode."""

import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from resolve_solc import ensure_solc_binary

DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
CONTRACTS_JSON = DEPLOYMENTS_DIR / "contracts.json"


def parse_contract_id(contract_id):
    if "-v" in contract_id:
        name, version = contract_id.split("-v", 1)
        return name, version
    return contract_id, None


def load_contract_entry(contract_id):
    name, version = parse_contract_id(contract_id)

    contracts = json.loads(CONTRACTS_JSON.read_text())
    if name not in contracts:
        sys.exit(f"❌ {name} not found in deployments/contracts.json")

    entry = contracts[name]
    if "versions" in entry:
        if version is None:
            sys.exit(f"❌ {name} is versioned, use {name}-v<version>")
        entry = next((v for v in entry["versions"] if v.get("version") == version), None)
        if entry is None:
            sys.exit(f"❌ Version {version} not found for {name} in contracts.json")

    return entry


def strip_metadata(bytecode):
    # The CBOR metadata blob is appended at the end of the bytecode, and its last
    # 2 bytes encode the blob length. Removing it isolates the executable code.
    if len(bytecode) < 4:
        return bytecode
    meta_len = int(bytecode[-4:], 16)
    cut = (meta_len + 2) * 2
    return bytecode[:-cut] if cut < len(bytecode) else bytecode


def compile_creation_bytecode(solc_version, solc_input_file, contract_name):
    solc_bin = ensure_solc_binary(solc_version)

    std_input = json.loads(Path(solc_input_file).read_text())
    std_input.setdefault("settings", {})["outputSelection"] = {
        "*": {"*": ["evm.bytecode.object"]}
    }

    result = subprocess.run(
        [str(solc_bin), "--standard-json"],
        input=json.dumps(std_input),
        capture_output=True,
        text=True,
        check=False,
    )
    output = json.loads(result.stdout)

    errors = [e for e in output.get("errors", []) if e.get("severity") == "error"]
    if errors:
        sys.exit("❌ Compilation failed:\n" + errors[0].get("formattedMessage", "")[:500])

    for source_contracts in output.get("contracts", {}).values():
        if contract_name in source_contracts:
            return source_contracts[contract_name]["evm"]["bytecode"]["object"]

    sys.exit(f"❌ Contract {contract_name} not found in compiler output")


def main():
    parser = argparse.ArgumentParser(
        description="Verify that a Standard JSON input reproduces the recorded creation bytecode."
    )
    parser.add_argument("contract_id", help="Contract identifier, e.g. UniversalProfileInit-v0.14.0")
    parser.add_argument("contract_name", help="Solidity contract name in the solc output")
    parser.add_argument("solc_input_file", help="Path to the Standard JSON input file")
    args = parser.parse_args()

    entry = load_contract_entry(args.contract_id)
    solc_version = entry["compilerSettings"]["solcVersion"]
    expected = entry["creationBytecode"].removeprefix("0x")
    compiled = compile_creation_bytecode(solc_version, args.solc_input_file, args.contract_name)

    print(f"Contract : {args.contract_id}")
    print(f"solc     : {solc_version}")
    print(f"Input    : {args.solc_input_file}")

    if compiled == expected:
        print("Result   : ✅ EXACT MATCH (creation bytecode reproduced)")
        sys.exit(0)

    if strip_metadata(compiled) == strip_metadata(expected):
        print("Result   : ⚠️  PARTIAL MATCH (executable bytecode identical, metadata hash differs)")
        print("           The on-chain bytecode was produced by a different toolchain")
        print("           (see deployments/SETTINGS.md). Verification will be a partial match.")
        sys.exit(2)

    print("Result   : ❌ MISMATCH (compiled bytecode != contracts.json)")
    print(f"           compiled length={len(compiled)} expected length={len(expected)}")
    sys.exit(1)


if __name__ == "__main__":
    main()
