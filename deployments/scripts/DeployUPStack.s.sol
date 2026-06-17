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
///
/// Implementation contracts (v0.14.0):
/// - UniversalProfileInit
/// - LSP6KeyManagerInit
/// - LSP1UniversalReceiverDelegateUP
///
/// The script is idempotent: contracts already deployed are skipped, so it can
/// be safely re-run on a partially deployed chain.
///
/// Usage:
///   FOUNDRY_PROFILE=deployments forge script deployments/scripts/DeployUPStack.s.sol \
///     --rpc-url <url> --broadcast [--private-key <key> | --account <name>]
contract DeployUPStackScript is NickFactoryArtifactDeployer {
    string internal constant TARGET_VERSION = "0.14.0";

    function run() public returns (address[] memory deployed) {
        string memory json = vm.readFile("deployments/contracts.json");

        string[2] memory singletons = [
            ".LSP23LinkedContractsFactory",
            ".UniversalProfileInitPostDeploymentModule"
        ];

        string[3] memory implementations = [
            ".UniversalProfileInit",
            ".LSP6KeyManagerInit",
            ".LSP1UniversalReceiverDelegateUP"
        ];

        deployed = new address[](singletons.length + implementations.length);

        for (uint256 i = 0; i < singletons.length; i++) {
            console2.log("--- Singleton:", singletons[i]);
            deployed[i] = _deployContractFromArtifact(json, singletons[i]);
        }

        for (uint256 i = 0; i < implementations.length; i++) {
            console2.log(
                "--- Implementation:",
                implementations[i],
                TARGET_VERSION
            );
            deployed[singletons.length + i] = _deployContractFromArtifact(
                json,
                _findVersionKey(json, implementations[i], TARGET_VERSION)
            );
        }
    }

    /// @dev Returns the JSON path of the entry under `<contractKey>.versions[]`
    /// whose `version` field equals `version`. Reverts if not found, so we never
    /// silently deploy the wrong release.
    function _findVersionKey(
        string memory json,
        string memory contractKey,
        string memory version
    ) internal view returns (string memory) {
        for (uint256 i = 0; ; i++) {
            string memory entryKey = string.concat(
                contractKey,
                ".versions[",
                vmJson.toString(i),
                "]"
            );

            if (!vmJson.keyExistsJson(json, entryKey)) break;

            string memory entryVersion = vmJson.parseJsonString(
                json,
                string.concat(entryKey, ".version")
            );
            if (keccak256(bytes(entryVersion)) == keccak256(bytes(version))) {
                return entryKey;
            }
        }

        revert(
            string.concat(
                "Version ",
                version,
                " not found in contracts.json for ",
                contractKey
            )
        );
    }
}
