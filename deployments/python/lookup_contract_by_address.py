#!/usr/bin/env python3
"""Resolve a deployed address to its verification metadata from contracts.json.

Given a contract address, prints the three values needed to verify the contract
on a block explorer, one per line and in this exact order:

  1. standardJsonInputFilePath
  2. compilerVersion
  3. contractId

The lookup is case-insensitive and searches both flat entries and versioned
entries (under `versions[]`). Exits with an error if the address is unknown, or
if the matching entry has no verification metadata (fields set to `null`).
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from contracts_json import (
    VERIFICATION_FIELDS,
    contract_id_from_entry,
    find_entry_by_address,
    load_contracts,
    require_verification_metadata,
)


def main():
    parser = argparse.ArgumentParser(
        description="Look up contract verification metadata by deployed address."
    )
    parser.add_argument("address", help="Deployed contract address")
    args = parser.parse_args()

    contracts = load_contracts()
    name, entry = find_entry_by_address(contracts, args.address)

    if entry is None:
        sys.exit(f"Unknown contract address: {args.address}")

    identifier = contract_id_from_entry(name, entry)
    metadata = require_verification_metadata(name, entry, identifier)

    for field in VERIFICATION_FIELDS:
        print(metadata[field])


if __name__ == "__main__":
    main()
