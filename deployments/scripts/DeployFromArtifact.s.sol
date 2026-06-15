// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {NickFactoryArtifactDeployer} from "./NickFactoryArtifactDeployer.sol";

/// @title Deterministic CREATE2 deployment of a single artifact entry.
///
/// @dev Environment variables:
/// - `ARTIFACT`: path to the JSON artifact (e.g. `deployments/contracts.json`)
/// - `ARTIFACT_KEY` (optional): JSON path prefix to the entry containing
///   `salt`, `creationBytecode` and `address`. Empty for a flat artifact.
///
/// Examples:
///   # Dummy POC contract (flat artifact)
///   ARTIFACT=deployments/scripts/artifacts/DummyPingRegistry.json \
///     FOUNDRY_PROFILE=deployments forge script deployments/scripts/DeployFromArtifact.s.sol \
///     --rpc-url <url> --broadcast
///
///   # UniversalProfileInit v0.14.0 straight from contracts.json
///   ARTIFACT=deployments/contracts.json \
///   ARTIFACT_KEY=".UniversalProfileInit.versions[1]" \
///     FOUNDRY_PROFILE=deployments forge script deployments/scripts/DeployFromArtifact.s.sol \
///     --rpc-url <url> --broadcast
contract DeployFromArtifactScript is NickFactoryArtifactDeployer {
    function run() public returns (address deployed) {
        string memory json = vm.readFile(vm.envString("ARTIFACT"));
        string memory key = vm.envOr("ARTIFACT_KEY", string(""));

        deployed = _deployEntry(json, key);
    }
}
