#!/usr/bin/env python3
"""Resolve a chain name to its chain ID from deployments/deployed-chains.json."""

import argparse
import json
import sys
from pathlib import Path

DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
DEPLOYED_CHAINS_JSON = DEPLOYMENTS_DIR / "deployed-chains.json"


def main():
    parser = argparse.ArgumentParser(description="Look up a chain ID by chain name.")
    parser.add_argument("chain_name", help="Chain name from deployed-chains.json")
    args = parser.parse_args()

    chains = json.loads(DEPLOYED_CHAINS_JSON.read_text())
    match = next((c["chainId"] for c in chains if c["name"] == args.chain_name), None)
    if match is None:
        sys.exit(f"Unknown chain name: {args.chain_name}")

    print(match)


if __name__ == "__main__":
    main()
