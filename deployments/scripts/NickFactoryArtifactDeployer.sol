// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

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
    address internal constant NICK_FACTORY =
        0x4e59b44847b379578588920cA78FbF26c0B4956C;

    VmJsonCheats internal constant vmJson = VmJsonCheats(VM_ADDRESS);

    /// @dev Deploys the artifact entry at JSON path prefix `key` (empty string
    /// for a flat artifact). Idempotent: skips if code already exists at the
    /// predicted address. Reverts if the predicted CREATE2 address does not
    /// match the canonical `address` field of the entry.
    function _deployEntry(
        string memory json,
        string memory key
    ) internal returns (address deployed) {
        bytes32 salt = vmJson.parseJsonBytes32(
            json,
            string.concat(key, ".salt")
        );
        bytes memory creationBytecode = vmJson.parseJsonBytes(
            json,
            string.concat(key, ".creationBytecode")
        );
        address expected = vmJson.parseJsonAddress(
            json,
            string.concat(key, ".address")
        );

        require(
            NICK_FACTORY.code.length > 0,
            "Nick Factory not deployed on this chain. See DEPLOYMENT.md (Prerequisites) "
            "for how to deploy it via its presigned keyless transaction."
        );

        deployed = computeCreate2Address(
            salt,
            keccak256(creationBytecode),
            NICK_FACTORY
        );

        // Fail fast if the artifact no longer reproduces the canonical address
        // (corrupted bytecode, wrong salt, wrong entry...).
        require(
            deployed == expected,
            string.concat(
                "Predicted CREATE2 address does not match the canonical address in the artifact ",
                "(predicted: ",
                vmJson.toString(deployed),
                ", expected: ",
                vmJson.toString(expected),
                "). Refusing to deploy."
            )
        );

        if (deployed.code.length > 0) {
            console2.log("Already deployed, skipping:", deployed);
            return deployed;
        }

        vm.startBroadcast();
        (bool success, ) = NICK_FACTORY.call(
            abi.encodePacked(salt, creationBytecode)
        );
        vm.stopBroadcast();

        require(success, "NickFactory: deployment transaction failed");
        require(
            deployed.code.length > 0,
            "NickFactory: no code at predicted address after deployment"
        );

        console2.log("Deployed at:", deployed);
    }
}
