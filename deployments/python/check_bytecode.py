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
    list_verifiable_contract_ids
)
from resolve_solc import ensure_solc_binary


def strip_cbor_metadata(bytecode):
    """Strip the CBOR metadata blob from the bytecode
    The CBOR metadata blob is appended at the end of the bytecode, and its last
    2 bytes encode the blob length. Removing it isolates the executable code.
    
    @param: bytecode The bytecode to strip the CBOR metadata blob from
    @return: The bytecode with the CBOR metadata blob stripped
    """
    
    if len(bytecode) < 4:
        return bytecode
    meta_len = int(bytecode[-4:], 16)
    cut = (meta_len + 2) * 2
    return bytecode[:-cut] if cut < len(bytecode) else bytecode

def compile_creation_bytecode(solc_version, std_json_input_file, contract_name):
    """Return the compiled bytecode

    @param: solc_version The Solidity compiler version to use
    @param: std_json_input_file The path to the std-json-input file to use for compilation
    @param: contract_name The name of the contract to compile

    @return: The generated compiled creation bytecode
    """
    solc_bin = ensure_solc_binary(solc_version)

    std_input = json.loads(Path(std_json_input_file).read_text())
    std_input.setdefault("settings", {})["outputSelection"] = {
        "*": {"*": ["evm.bytecode.object"]}
    }

    # Run solc compiler
    result = subprocess.run(
        [str(solc_bin), "--standard-json"],
        input=json.dumps(std_input),
        capture_output=True,
        text=True,
        check=False,
    )
    output = json.loads(result.stdout)

    errors = [error for error in output.get("errors", []) if error.get("severity") == "error"]
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
        help=(
            "Contract identifier (CONTRACT_TO_DEPLOY), e.g. UniversalProfileInit-v0.14.0.\n"
            "Available contracts:\n"
            + "\n".join(list_verifiable_contract_ids())
        ),
   
    )
    args = parser.parse_args()

    name, entry = load_entry_by_contract_id(args.contract)
    metadata = require_verification_metadata(name, entry, args.contract)
    std_json_input_file = metadata["standardJsonInputFilePath"]

    if not Path(std_json_input_file).is_file():
        sys.exit(f"❌ Standard JSON input file not found: {std_json_input_file}")

    solc_version = entry["compilerSettings"]["solcVersion"]
    expected = entry["creationBytecode"].removeprefix("0x")
    contract_name = contract_name_from_id(args.contract)
    compiled = compile_creation_bytecode(solc_version, std_json_input_file, contract_name)

    print(f"🔍 Verifying if the compiling via the std-json-input will generate the expected `creationBytecode` for {contract_name}")
    print(f"- Contract : {contract_name}")
    print(f"- solc     : {solc_version}")
    print(f"- Input    : {std_json_input_file}")

    if compiled == expected:
        print("Result   : ✅ EXACT MATCH (creation bytecode reproduced)")
        sys.exit(0)

    if strip_cbor_metadata(compiled) == strip_cbor_metadata(expected):
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
