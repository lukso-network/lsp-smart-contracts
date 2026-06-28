#!/usr/bin/env python3
"""Chain metadata lookups from configured chain registry JSON file."""

from pathlib import Path
import json
import sys
import argparse

# Constants
DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
CHAINS_JSON_FILE_NAME = "chains-mainnet.json"
CHAINS_JSON_FILE_PATH = DEPLOYMENTS_DIR / CHAINS_JSON_FILE_NAME

class ChainRegistry:
    def __init__(self):
        self.chains = json.loads(CHAINS_JSON_FILE_PATH.read_text())

    def get_chain_id(self, chain_name):
        """Look up chain ID by chain name."""
        chain_id = self._find_chain_by_name(chain_name).get("chainId")
        if chain_id is None:
            sys.exit(f"❌⛓️ No chain ID set for chain: {chain_name}")
        return chain_id

    def get_all_explorers(self, chain_name):
        """Get all the block explorers available for a specified chain
        
        Returns an empty list (not an error) when the chain exists but has no
        explorers configured, so callers can still proceed (e.g. Sourcify-only).
        """
        explorers = self._find_chain_by_name(chain_name).get("explorers")
        if explorers is None:
            print(f"⚠️⛓️ Property `explorers` not set for chain {chain_name} in {CHAINS_JSON_FILE_PATH}.", file=sys.stderr)
            return []
        elif len(explorers) == 0:
            print(f"⚠️⛓️ List of explorers is empty `[]` for chain {chain_name} in {CHAINS_JSON_FILE_PATH}.", file=sys.stderr)
            return []
        return explorers

    def load_chains(self):
        return self.chains

    # Private methods
    def _find_chain_by_name(self, name):
        match = next((c for c in self.chains if c["name"] == name), None)
        if match is None:
            sys.exit(f"❌⛓️ Unknown chain: {name}. Not found in {CHAINS_JSON_FILE_PATH}.")
        return match

def main():
    parser = argparse.ArgumentParser(
        description="Chain metadata lookups."
    )
    sub_parser = parser.add_subparsers(dest="command", required=True)

    for cmd in ("get-chain-id", "get-all-explorers"):
        p = sub_parser.add_parser(cmd)
        p.add_argument("--chain", required=True, help=f"Chain name defined in {CHAINS_JSON_FILE_PATH}.")
    
    args = parser.parse_args()
    chain_registry = ChainRegistry()

    if args.command == "get-chain-id":
        chain_id = chain_registry.get_chain_id(args.chain)
        print(chain_id)
    elif args.command == "get-all-explorers":
        explorers = chain_registry.get_all_explorers(args.chain)
        print(json.dumps(explorers))

if __name__ == "__main__":
    main()
