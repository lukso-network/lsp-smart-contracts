// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {console2} from "forge-std/console2.sol";
import {NickFactoryArtifactDeployer} from "./NickFactoryArtifactDeployer.sol";

/// @title Deploys the full Universal Profile stack on a new chain.
///
/// @notice Reads `deployments/contracts.json` and deploys, via the Nick Factory
/// (CREATE2), every contract needed for Universal Profiles on a new EVM chain:
///
/// Singletons:
/// - LSP23LinkedContractsFactory
/// - UniversalProfileInitPostDeploymentModule
/// - ERCTokenCallbacks
///
/// Implementation contracts (v0.14.0):
/// - UniversalProfileInit
/// - LSP6KeyManagerInit
/// - LSP1UniversalReceiverDelegateUP
///
/// The script is idempotent: contracts already deployed are skipped, so it can
/// be safely re-run on a partially deployed chain.
contract DeployUniversalProfileStack is NickFactoryArtifactDeployer {
    string internal constant TARGET_VERSION = "0.14.0";

    function run() public returns (address[] memory deployed) {
        string memory json = vm.readFile("deployments/contracts.json");

        string[3] memory singletons = [
            ".LSP23LinkedContractsFactory",
            ".UniversalProfileInitPostDeploymentModule",
            ".ERCTokenCallbacks"
        ];

        string[3] memory implementations = [
            ".UniversalProfileInit",
            ".LSP6KeyManagerInit",
            ".LSP1UniversalReceiverDelegateUP"
        ];

        deployed = new address[](singletons.length + implementations.length);

        for (uint256 ii = 0; ii < singletons.length; ii++) {
            console2.log("--- Singleton:", singletons[ii]);
            deployed[ii] = _deployContractFromArtifact(json, singletons[ii]);
        }

        for (uint256 ii = 0; ii < implementations.length; ii++) {
            console2.log(
                "--- Implementation:",
                implementations[ii],
                TARGET_VERSION
            );
            deployed[singletons.length + ii] = _deployContractFromArtifact(
                json,
                _findVersionKey(json, implementations[ii], TARGET_VERSION)
            );
        }
    }
}
