// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {console2} from "forge-std/console2.sol";
import {NickFactoryArtifactDeployer} from "./NickFactoryArtifactDeployer.sol";

/// @title Deploys the LSP7 / LSP8 token base implementation contracts on a new chain.
///
/// @notice Reads `deployments/contracts.json` and deploys, via the Nick Factory
/// (CREATE2), the token base implementation contracts used behind ERC-1167 minimal proxies:
///
/// Implementation contracts:
/// - LSP7MintableInit (v0.17.3)
/// - LSP8MintableInit (v0.17.3)
/// - LSP7CustomizableTokenInit (v0.18.1)
/// - LSP8CustomizableTokenInit (v0.18.1)
///
/// The script is idempotent: contracts already deployed are skipped, so it can
/// be safely re-run on a partially deployed chain.
contract DeployTokenImplementationContracts is NickFactoryArtifactDeployer {
    function run() public returns (address[] memory deployed) {
        string memory json = vm.readFile("deployments/contracts.json");

        string[4] memory implementations = [
            ".LSP7MintableInit",
            ".LSP8MintableInit",
            ".LSP7CustomizableTokenInit",
            ".LSP8CustomizableTokenInit"
        ];

        string[4] memory versions = ["0.17.3", "0.17.3", "0.18.1", "0.18.1"];

        deployed = new address[](implementations.length);

        for (uint256 ii = 0; ii < implementations.length; ii++) {
            console2.log(
                "--- Implementation:",
                implementations[ii],
                versions[ii]
            );
            deployed[ii] = _deployContractFromArtifact(
                json,
                _findVersionKey(json, implementations[ii], versions[ii])
            );
        }
    }
}
