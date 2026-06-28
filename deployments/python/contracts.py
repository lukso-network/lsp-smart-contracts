from pathlib import Path
import json
import sys
import argparse

from solc import (
    compile_creation_bytecode,
    strip_cbor_metadata
)

DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = DEPLOYMENTS_DIR.parent
CONTRACTS_JSON_FILE = DEPLOYMENTS_DIR / "contracts.json"

VERIFICATION_FIELDS = ("standardJsonInputFilePath", "compilerVersion", "contractId")

class ContractRegistry:
    def __init__(self):
        self.contracts = json.loads(CONTRACTS_JSON_FILE.read_text())

    @staticmethod
    def list_all_contract_options():
        # Since this is a static method, reads the JSON itself via the module-level 
        # CONTRACTS_JSON_FILE constant rather than self.contracts
        contracts_json = json.loads(CONTRACTS_JSON_FILE.read_text())
        all_contract_option_names = [
            f"{name}-v{version}" if (version := entry.get("version")) else name
            for name, entry in ContractRegistry._get_flat_entry_list(contracts_json)
            if entry.get("standardJsonInputFilePath") is not None
        ]
        return sorted(all_contract_option_names)

    def get_contract_verification_data(self, address):
        """Load the contract verification data for a given address.

        Args:
            address: The deployed contract address

        Returns:
            A object containing the contract verification data with the following structure
            e.g: '{ "stdJsonInput": { ... }, "compilerVersion": "v0.8.17+commit.8df45f5f, "contractId": "contracts/UniversalProfileInit.sol:UniversalProfileInit" }'
        """
        name, entry = self._find_entry_from_address(address)
        if entry is None:
            sys.exit(f"❌ Unknown contract address: {address}")

        self._validate_verification_metadata(entry, name)

        # Resolve the repo-root-relative path to an absolute one so the lookup
        # (and the shell `curl ...@<path>` submissions that consume it) work
        # regardless of the current working directory.
        stdJsonInputFilePath = self._resolve_std_json_input_path(entry)

        # close the file after loading the content
        with open(stdJsonInputFilePath) as file:
            # save as JSON string
            stdJsonInput = json.load(file)

        compilerVersion = entry["compilerVersion"]
        contractIdentifier = entry["contractId"]

        return {
            "stdJsonInput": stdJsonInput,
            "stdJsonInputFilePath": str(stdJsonInputFilePath), # for blockscout
            "compilerVersion": compilerVersion,
            "contractName": name,
            "contractIdentifier": contractIdentifier
        }

    def validate_contract_verification_metadata(self, contract_option_name):
        name, entry = self._find_entry_from_contract_option_name(contract_option_name)

        self._validate_verification_metadata(entry, contract_option_name)

        std_json_input_file = self._resolve_std_json_input_path(entry)
        solc_version = entry["compilerSettings"]["solcVersion"]
        
        expected_bytecode = entry["creationBytecode"].removeprefix("0x")
        compiled_bytecode = compile_creation_bytecode(solc_version, std_json_input_file, name)
        
        print(f"🔍 Verifying creationBytecode for {contract_option_name}")
        print(f"- solc  : {solc_version}")
        print(f"- Input : {std_json_input_file}")
        
        if compiled_bytecode == expected_bytecode:
            print("Result : ✅ EXACT MATCH"); sys.exit(0)
        if strip_cbor_metadata(compiled_bytecode) == strip_cbor_metadata(expected_bytecode):
            print("Result : ⚠️  PARTIAL MATCH (metadata hash differs)"); sys.exit(0)
        
        print(f"Result : ❌ MISMATCH (compiled={len(compiled_bytecode)} bytes, expected={len(expected_bytecode)} bytes)")
        sys.exit(1)

    # Private methods
    # ------------------

    @staticmethod
    def _resolve_std_json_input_path(entry):
        """Resolve the repo-root-relative `standardJsonInputFilePath` to an absolute path.

        Paths in contracts.json are stored relative to the repository root
        (e.g. `deployments/solc-inputs/...`), so they must be resolved against
        REPO_ROOT to work from any current working directory.
        """
        return REPO_ROOT / entry["standardJsonInputFilePath"]

    @staticmethod
    def _validate_verification_metadata(entry, contract_name):
        missing = [field for field in VERIFICATION_FIELDS if entry.get(field) is None]
        if missing:
            sys.exit(
                f"❌ No verification metadata for {contract_name}. "
                f"Missing fields in contracts.json: {', '.join(missing)}"
            )

        if not ContractRegistry._resolve_std_json_input_path(entry).is_file():
            sys.exit(f"❌ Standard JSON input file not found: {entry['standardJsonInputFilePath']}")

    @staticmethod
    def _get_flat_entry_list(contracts_with_versions):
        """Some contracts include multiple versions. This method returns a single array
        of all contracts, so that we can iterate through them easily
        """

        for name, entry in contracts_with_versions.items():
            if "versions" in entry:
                yield from ((name, version_entry) for version_entry in entry["versions"])
            else:
                yield name, entry
    
    @staticmethod
    def _parse_contract_option_name(contract_option_name):
        if "-v" in contract_option_name:
            name, version = contract_option_name.split("-v", 1)
            return name, version
        return contract_option_name, None

    def _find_entry_from_address(self, address):
        target = address.lower()
        for name, entry in self._get_flat_entry_list(self.contracts):
            entry_address = entry.get("address")
            if entry_address and entry_address.lower() == target:
                return name, entry
        return None, None

    def _find_entry_from_contract_option_name(self, contract_option_name):
        target_name, target_version = self._parse_contract_option_name(contract_option_name)
        all_contracts = self._get_flat_entry_list(self.contracts)
        for name, entry in all_contracts:
            if name == target_name and entry.get("version") == target_version:
                return name, entry
        sys.exit(f"❌ Contract option name not found: {contract_option_name}")

def main():
    parser = argparse.ArgumentParser(
        description="Get verification metadata for a contract + validate if this metadata is valid (reproduce the expected creation bytecode)."
    )
    sub_parser = parser.add_subparsers(dest="command", required=True)

    parser_get = sub_parser.add_parser("get-verification-metadata")
    parser_get.add_argument("--address", required=True, help="Deployed contract address")

    parser_validate = sub_parser.add_parser("validate-verification-metadata")
    parser_validate.add_argument(
        "--contract", required=True,
        help="Contract name options available:\n"
             + "\n".join(ContractRegistry.list_all_contract_options()),
    )

    args = parser.parse_args()
    contract_registry = ContractRegistry()

    if args.command == "get-verification-metadata":
        contract_verification_data = contract_registry.get_contract_verification_data(args.address)
        print(json.dumps(contract_verification_data))
    elif args.command == "validate-verification-metadata":
        contract_registry.validate_contract_verification_metadata(args.contract)

if __name__ == "__main__":
    main()
