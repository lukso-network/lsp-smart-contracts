
from pathlib import Path
import json

class ContractLoader:
    def __init__(self):
        self.contracts = json.loads(CONTRACTS_JSON.read_text())


    def load_contract_verification_data(self, address):
        """Load the contract verification data for a given address.

        Args:
            address: The deployed contract address

        Returns:
            A object containing the contract verification data with the following structure
            e.g: '{ "stdJsonInput": { ... }, "compilerVersion": "v0.8.17+commit.8df45f5f, "contractIdentifier": "contracts/UniversalProfileInit.sol:UniversalProfileInit" }'
        """
        name, entry = self._find_entry_by_address(self.contracts, address)
        if entry is None:
            sys.exit(f"Unknown contract address: {address}")

        # Load the content of the standard json input file
        stdJsonInputFilePath = entry["standardJsonInputFilePath"]

        # close the file after loading the content
        with open(stdJsonInputFilePath) as file:
            # save as JSON string
            stdJsonInput = json.load(file)

        compilerVersion = entry["compilerVersion"]
        contractIdentifier = entry["contractIdentifier"]

        return {
            "stdJsonInput": stdJsonInput,
            "stdJsonInputFilePath": stdJsonInputFilePath, # for blockscout
            "compilerVersion": compilerVersion,
            "contractName": name,
            "contractIdentifier": contractIdentifier
        }

    # Private methods
    def _find_entry_by_address(contracts, address):
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

    contract_loader = ContractLoader()
    contract_verification_data = contract_loader.load_contract_verification_data(args.address)
    print(json.dumps(contract_verification_data))
    return json.dumps(contract_verification_data)

if __name__ == "__main__":
    main()
