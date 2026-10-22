#!/usr/bin/env python3
"""Chain metadata lookups from configured chain registry JSON file."""

from pathlib import Path
import json
import sys
import os
import argparse

# Constants
DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
CHAIN_REGISTRY_FILES = {
    "mainnet": "chains-mainnet.json",
    "testnet": "chains-testnet.json",
}
DEPLOY_TESTNET_ENV_VAR = "DEPLOY_TESTNET"

def resolve_network(cli_testnet):
    """Decide which chain registry to load.

    Precedence: explicit `--testnet` flag > `DEPLOY_TESTNET` env var > default mainnet.
    When set, `DEPLOY_TESTNET` must be exactly "true" or "false", otherwise we exit.
    """
    if cli_testnet:
        return "testnet"

    raw = os.environ.get(DEPLOY_TESTNET_ENV_VAR)
    if raw is None:
        return "mainnet"
    if raw not in ("true", "false"):
        sys.exit(
            f"❌⛓️ Invalid value for {DEPLOY_TESTNET_ENV_VAR} env variable: '{raw}'. "
            f"Value must be set to 'true' or 'false'."
        )
    return "testnet" if raw == "true" else "mainnet"

class ChainRegistry:
    def __init__(self, network="mainnet"):
        self.chains_file_path = DEPLOYMENTS_DIR / CHAIN_REGISTRY_FILES[network]
        self.chains = json.loads(self.chains_file_path.read_text())

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
            print(f"⚠️⛓️ Property `explorers` not set for chain {chain_name} in {self.chains_file_path}.", file=sys.stderr)
            return []
        elif len(explorers) == 0:
            print(f"⚠️⛓️ List of explorers is empty `[]` for chain {chain_name} in {self.chains_file_path}.", file=sys.stderr)
            return []
        return explorers

    def load_chains(self):
        return self.chains

    # Private methods
    def _find_chain_by_name(self, name):
        match = next((c for c in self.chains if c["name"] == name), None)
        if match is None:
            sys.exit(f"❌⛓️ Unknown chain: {name}. Not found in {self.chains_file_path}.")
        return match

def main():
    parser = argparse.ArgumentParser(
        description="Chain metadata lookups."
    )
    sub_parser = parser.add_subparsers(dest="command", required=True)

    for cmd in ("get-chain-id", "get-all-explorers"):
        p = sub_parser.add_parser(cmd)
        p.add_argument("--chain", required=True, help="Chain name defined in the chain registry JSON file (chains-mainnet.json or chains-testnet.json).")
        p.add_argument("--testnet", action="store_true", help=f"Use chains-testnet.json instead of chains-mainnet.json. Overrides the {DEPLOY_TESTNET_ENV_VAR} env variable.")
    
    args = parser.parse_args()
    chain_registry = ChainRegistry(network=resolve_network(args.testnet))

    if args.command == "get-chain-id":
        chain_id = chain_registry.get_chain_id(args.chain)
        print(chain_id)
    elif args.command == "get-all-explorers":
        explorers = chain_registry.get_all_explorers(args.chain)
        print(json.dumps(explorers))

if __name__ == "__main__":
    main()
