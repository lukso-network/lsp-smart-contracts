#!/usr/bin/env python3
"""Resolve a CONTRACT_TO_DEPLOY identifier to verification metadata from contracts.json.

Given a contract identifier (e.g. UniversalProfileInit-v0.14.0 or
LSP23LinkedContractsFactory), prints the three values needed to verify the
contract on a block explorer, one per line and in this exact order:

  1. standardJsonInputFilePath
  2. compilerVersion
  3. contractId

Exits with an error if the contract is unknown or has no verification metadata
(fields set to `null`).
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from contracts_json import (
    VERIFICATION_FIELDS,
    load_contracts,
    load_entry_by_contract_id,
    require_verification_metadata,
)


def main():
    parser = argparse.ArgumentParser(
        description="Look up contract verification metadata by CONTRACT_TO_DEPLOY identifier."
    )
    parser.add_argument(
        "contract_id",
        help="Contract identifier, e.g. UniversalProfileInit-v0.14.0 or LSP23LinkedContractsFactory",
    )
    args = parser.parse_args()

    contracts = load_contracts()
    name, entry = load_entry_by_contract_id(args.contract_id, contracts)
    metadata = require_verification_metadata(name, entry, args.contract_id)

    for field in VERIFICATION_FIELDS:
        print(metadata[field])


if __name__ == "__main__":
    main()
