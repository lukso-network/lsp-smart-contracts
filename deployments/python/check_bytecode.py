#!/usr/bin/env python3
"""Compile a Standard JSON input and compare it to contracts.json creationBytecode."""

import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from contracts_json import (
    contract_name_from_id,
    load_entry_by_contract_id,
    require_verification_metadata,
)
from resolve_solc import ensure_solc_binary


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
    parser.add_argument(
        "--contract",
        required=True,
        help="Contract identifier (CONTRACT_TO_DEPLOY), e.g. UniversalProfileInit-v0.14.0",
    )
    args = parser.parse_args()

    name, entry = load_entry_by_contract_id(args.contract)
    metadata = require_verification_metadata(name, entry, args.contract)
    solc_input_file = metadata["standardJsonInputFilePath"]

    if not Path(solc_input_file).is_file():
        sys.exit(f"❌ Standard JSON input file not found: {solc_input_file}")

    solc_version = entry["compilerSettings"]["solcVersion"]
    expected = entry["creationBytecode"].removeprefix("0x")
    contract_name = contract_name_from_id(args.contract)
    compiled = compile_creation_bytecode(solc_version, solc_input_file, contract_name)

    print(f"Contract : {args.contract}")
    print(f"solc     : {solc_version}")
    print(f"Input    : {solc_input_file}")

    if compiled == expected:
        print("Result   : ✅ EXACT MATCH (creation bytecode reproduced)")
        sys.exit(0)

    if strip_metadata(compiled) == strip_metadata(expected):
        print("Result   : ⚠️  PARTIAL MATCH (executable bytecode identical, metadata hash differs)")
        print("           The on-chain bytecode was produced by a different toolchain")
        print("           (see deployments/SETTINGS.md). Verification will be a partial match.")
        # Partial match is acceptable for deployment: executable bytecode matches.
        sys.exit(0)

    print("Result   : ❌ MISMATCH (compiled bytecode != contracts.json)")
    print(f"           compiled length={len(compiled)} expected length={len(expected)}")
    sys.exit(1)


if __name__ == "__main__":
    main()
