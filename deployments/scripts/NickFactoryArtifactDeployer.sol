// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

// Constants
import {
    NICK_FACTORY_ADDRESS,
    NICK_FACTORY_BYTECODE
} from "./NickFactoryConstants.sol";

/// @dev Typed JSON cheatcodes implemented by the forge binary but missing from
/// the (older) vendored forge-std Vm interface in `lib/forge-std`.
interface VmJsonCheats {
    function parseJsonBytes32(
        string calldata json,
        string calldata key
    ) external pure returns (bytes32);

    function parseJsonBytes(
        string calldata json,
        string calldata key
    ) external pure returns (bytes memory);

    function parseJsonAddress(
        string calldata json,
        string calldata key
    ) external pure returns (address);

    function parseJsonString(
        string calldata json,
        string calldata key
    ) external pure returns (string memory);

    function keyExistsJson(
        string calldata json,
        string calldata key
    ) external view returns (bool);

    function toString(uint256 value) external pure returns (string memory);

    function toString(address value) external pure returns (string memory);
}

/// @title Shared logic for deterministic CREATE2 deployments from archived bytecode.
///
/// @notice Deploys contracts via the Nick Factory using the raw creation
/// bytecode stored in a JSON artifact (`salt`, `creationBytecode`, `address`
/// fields). No compilation of the target contract is involved, which
/// guarantees byte-identical deployments (and therefore identical addresses)
/// on every chain, regardless of the local toolchain.
abstract contract NickFactoryArtifactDeployer is Script {
    VmJsonCheats internal constant vmJson = VmJsonCheats(VM_ADDRESS);

    function _extractFromArtifact(
        string memory json,
        string memory key
    )
        internal
        view
        returns (
            bytes32 salt,
            bytes memory creationBytecode,
            bytes memory runtimeBytecode,
            address expectedAddress
        )
    {
        console2.log(
            unicode"🔍 Extracting deployment parameters from artifact..."
        );

        salt = vmJson.parseJsonBytes32(json, string.concat(key, ".salt"));

        creationBytecode = vmJson.parseJsonBytes(
            json,
            string.concat(key, ".creationBytecode")
        );

        runtimeBytecode = vmJson.parseJsonBytes(
            json,
            string.concat(key, ".bytecode")
        );

        expectedAddress = vmJson.parseJsonAddress(
            json,
            string.concat(key, ".address")
        );
    }

    function _checkNickFactoryDeployed() internal view {
        console2.log(
            unicode"🏭 Checking if Nick Factory is deployed on the target chain..."
        );

        require(
            NICK_FACTORY_ADDRESS.code.length > 0,
            string.concat(
                unicode"❌ Nick Factory not deployed on this chain. See DEPLOYMENT.md (Prerequisites) ",
                "for how to deploy it via its presigned keyless transaction."
            )
        );

        require(
            keccak256(NICK_FACTORY_ADDRESS.code) ==
                keccak256(NICK_FACTORY_BYTECODE),
            unicode"⚠️ Nick Factory bytecode mismatch! Aborting deployment."
        );

        console2.log(unicode"✅ Nick Factory is deployed on the target chain.");
    }

    function _checkExpectedAddressAfterDeployment(
        bytes32 salt,
        bytes memory creationBytecode,
        address expectedAddress
    ) internal view {
        console2.log(
            unicode"🔍 Checking if we will obtain the expected address after deployment..."
        );

        address deployed = computeCreate2Address(
            salt,
            keccak256(creationBytecode),
            NICK_FACTORY_ADDRESS
        );

        // Fail fast if the artifact no longer reproduces the canonical address
        // (corrupted bytecode, wrong salt, wrong entry...).
        require(
            deployed == expectedAddress,
            string.concat(
                unicode"❌ Predicted CREATE2 address does not match the canonical address in the artifact ",
                "(predicted: ",
                vmJson.toString(deployed),
                ", expected: ",
                vmJson.toString(expectedAddress),
                "). Refusing to deploy."
            )
        );

        console2.log(
            unicode"✅ Predicted CREATE2 address matches the canonical address in the artifact."
        );
    }

    function _checkIfAlreadyDeployed(
        address deployed,
        bytes memory expectedBytecode
    ) internal view returns (bool isAlreadyDeployed) {
        if (deployed.code.length == 0) {
            return false;
        }

        if (keccak256(deployed.code) != keccak256(expectedBytecode)) {
            revert(
                string.concat(
                    unicode"❌ Aborting deployment... Contract already deployed at address",
                    vmJson.toString(deployed),
                    " but bytecode on-chain mismatch with expected bytecode."
                )
            );
        }

        return true;
    }

    /// @dev Deploys the artifact entry at JSON path prefix `key` (empty string
    /// for a flat artifact).
    /// - Idempotent: skips if code already exists at the predicted address.
    /// - Reverts if the predicted CREATE2 address does not match the canonical `address` field of the entry.
    /// - Reverts if the contract is already deployed at the predicted address but with a different bytecode.
    /// - Skips deployment if the contract is already deployed at the predicted address and with the expected bytecode.
    function _deployContractFromArtifact(
        string memory json,
        string memory key
    ) internal returns (address deployed) {
        // Extra artifact deployment parameters
        (
            bytes32 salt,
            bytes memory creationBytecode,
            bytes memory runtimeBytecode,
            address expectedAddress
        ) = _extractFromArtifact(json, key);

        // CHECK if Nick Factory is deployed on the target chain
        _checkNickFactoryDeployed();

        // CHECK if we will obtain the expected address after deployment
        _checkExpectedAddressAfterDeployment(
            salt,
            creationBytecode,
            expectedAddress
        );

        bool isAlreadyDeployed = _checkIfAlreadyDeployed(
            deployed,
            runtimeBytecode
        );
        if (isAlreadyDeployed) {
            console2.log(
                unicode"☑️ Contract already deployed, skipping:",
                deployed
            );
            return deployed;
        }

        // finally start the broadcast to deploy
        vm.startBroadcast();
        (bool success, ) = NICK_FACTORY_ADDRESS.call(
            abi.encodePacked(salt, creationBytecode)
        );
        vm.stopBroadcast();

        require(
            success,
            unicode"❌ NickFactory: deployment transaction failed"
        );
        require(
            deployed.code.length > 0,
            unicode"❌ NickFactory: no code at predicted address after deployment"
        );

        // TODO: add contract name extracted from JSON artifact
        console2.log("Successfully deployed at:", deployed);
    }
}
