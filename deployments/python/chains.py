#!/usr/bin/env python3
"""Chain metadata lookups from deployments/deployed-chains.json."""

from pathlib import Path
import json
import sys
import argparse

DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
CHAINS_JSON_FILE = DEPLOYMENTS_DIR / "deployed-chains.json"

# Chains explorers based on etherscan use all the same endpoints for their API
ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api"

class ChainRegistry:
    def __init__(self):
        self.chains = json.loads(CHAINS_JSON_FILE.read_text())

    def get_chain_id(self, name):
        """Look up chain ID by chain name."""
        return self._find_chain_by_name(name).get("chainId")

    def get_all_explorers(self, name):
        """Get all the block explorers available for a specified chain"""
        explorers = self._find_chain_by_name(name).get("explorers")
        if not explorers: # catches None AND []
            sys.exit(f"❌⛓️ No block explorers available for chain: {name}")
        return explorers

    def load_chains(self):
        return self.chains

    # Private methods
    def _find_chain_by_name(self, name):
        match = next((c for c in self.chains if c["name"] == name), None)
        if match is None:
            sys.exit(f"❌⛓️ Unknown chain name: {name}")
        return match

def main():
    parser = argparse.ArgumentParser(
        description="Chain metadata lookups."
    )
    sub_parser = parser.add_subparsers(dest="command", required=True)

    for cmd in ("get-chain-id", "get-all-explorers"):
        p = sub_parser.add_parser(cmd)
        p.add_argument("chain", help="Chain name defined in `deployed-chains.json`")
    
    args = parser.parse_args()
    chain_registry = ChainRegistry()

    if args.command == "get-chain-id":
        chain_id = chain_registry.get_chain_id(args.chain)
        print(chain_id)
        return chain_id
    elif args.command == "get-all-explorers":
        explorers = chain_registry.get_all_explorers(args.chain)
        print(json.dumps(explorers))
        return explorers

if __name__ == "__main__":
    main()
