// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {NickFactoryArtifactDeployer} from "./NickFactoryArtifactDeployer.sol";

/// @title Deterministic CREATE2 deployment of a single artifact entry.
///
/// @dev Environment variables:
/// - `CONTRACT_TO_DEPLOY`: contract identifier in `deployments/contracts.json`.
///   Use `<contract>` for flat entries and `<contract>-v<version>` for versioned
///   entries (e.g. `UniversalProfileInit-v0.14.0`).
contract DeployFromArtifactScript is NickFactoryArtifactDeployer {
    function run() public returns (address deployed) {
        string memory json = vm.readFile("deployments/contracts.json");
        string memory contractToDeploy = vm.envString("CONTRACT_TO_DEPLOY");
        string memory key = _resolveArtifactKey(json, contractToDeploy);

        deployed = _deployContractFromArtifact(json, key);
    }
}
