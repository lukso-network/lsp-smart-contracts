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
import json
import sys
from pathlib import Path

DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
CONTRACTS_JSON = DEPLOYMENTS_DIR / "contracts.json"

REQUIRED_FIELDS = ("standardJsonInputFilePath", "compilerVersion", "contractId")


def iter_entries(contracts):
    for name, entry in contracts.items():
        if "versions" in entry:
            for version_entry in entry["versions"]:
                yield name, version_entry
        else:
            yield name, entry


def find_entry_by_address(contracts, address):
    target = address.lower()
    for name, entry in iter_entries(contracts):
        entry_address = entry.get("address")
        if entry_address and entry_address.lower() == target:
            return name, entry
    return None, None


def main():
    parser = argparse.ArgumentParser(
        description="Look up contract verification metadata by deployed address."
    )
    parser.add_argument("address", help="Deployed contract address")
    args = parser.parse_args()

    contracts = json.loads(CONTRACTS_JSON.read_text())
    name, entry = find_entry_by_address(contracts, args.address)

    if entry is None:
        sys.exit(f"Unknown contract address: {args.address}")

    missing = [f for f in REQUIRED_FIELDS if entry.get(f) is None]
    if missing:
        version = entry.get("version", "")
        label = f"{name} v{version}" if version else name
        sys.exit(
            f"No verification metadata for {label} ({args.address}). "
            f"Missing fields in contracts.json: {', '.join(missing)}"
        )

    for field in REQUIRED_FIELDS:
        print(entry[field])


if __name__ == "__main__":
    main()
