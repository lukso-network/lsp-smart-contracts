// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";

/// @notice Base script for deterministic CREATE2 deployments via Nick's Factory.
/// @dev Calldata is `salt ++ creationBytecode`. See `deployments/README.md`.
abstract contract NickFactoryDeployScript is Script {
    address internal constant NICK_FACTORY =
        0x4e59b44847b379578588920cA78FbF26c0B4956C;

    bytes32 internal constant IMPLEMENTATION_SALT =
        0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed;

    function _deployViaNickFactory(
        bytes memory creationCode
    ) internal returns (address deployed) {
        deployed = computeCreate2Address(
            IMPLEMENTATION_SALT,
            keccak256(creationCode),
            NICK_FACTORY
        );

        if (deployed.code.length > 0) {
            return deployed;
        }

        bytes memory deploymentData = abi.encodePacked(
            IMPLEMENTATION_SALT,
            creationCode
        );

        (bool success, ) = NICK_FACTORY.call(deploymentData);
        require(success, "NickFactory: deployment failed");
        require(
            deployed.code.length > 0,
            "NickFactory: no code at predicted address"
        );
    }
}
