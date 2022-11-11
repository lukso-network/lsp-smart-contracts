// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// libraries
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// errors

/**
 * @dev reverts when the `byteCode` passed to the {deployCreate2} function is the EIP-1167 Minimal Proxy bytecode
 */
error MinimalProxiesDeploymentNotAllowed();

/**
 * @dev reverts when sending value to the {deployCreate2Proxy} function if the contract being created
 * is an uninitializable clone.
 */
error SendingValueNotAllowed();

/**
 * @dev UniversalFactory contract can be used to deploy CREATE2 contracts; normal contracts and minimal
 * proxies (EIP-1167) with the ability to deploy the same contract at the same address on different chains.
 * If the contract has a constructor, the arguments will be part of the byteCode
 * If the contract has an `initialize` function, the parameters of this function will be included in
 * the salt to ensure that the parameters of the contract should be the same on each chain.
 *
 * Security measures were taken to avoid deploying proxies from the `deployCreate2(..)` function
 * to prevent tricking the security mechanism for the salt.
 *
 * This contract should be deployed using Nick's Method.
 * More information: https://weka.medium.com/how-to-send-ether-to-11-440-people-187e332566b7
 */
contract UniversalFactory {
    using BytesLib for bytes;
    
    /**
     * @dev Emitted whenever a contract is created
     * @param contractCreated The address of the contract created
     * @param providedSalt The bytes32 salt provided by the user
     * @param clone The Boolean that specifies if the contract is a clone or not
     * @param initialCalldata The bytes provided as initializeCalldata
     */
    event ContractCreated(
        address indexed contractCreated,
        bytes32 indexed providedSalt,
        bool indexed clone,
        bytes initialCalldata
    );

    // The bytecode hash of EIP-1167 Minimal Proxy
    bytes32 private constant _MINIMAL_PROXY_BYTECODE_HASH_PT1 =
        0x72307939328b75c6e301a012c75e0a4e690a99036b95f6e6f4f1b5aba02a9ce4;

    bytes32 private constant _MINIMAL_PROXY_BYTECODE_HASH_PT2 =
        0x11a195f66c9175f46895bae2006d40848a680c7068b9fc4af248ff9a54a47e45;

    /**
     * @dev Throws if the `byteCode` passed to the function is the EIP-1167 Minimal Proxy bytecode
     */
    modifier notMinimalProxy(bytes memory byteCode) virtual {
        if (byteCode.length == 55) {
            if (
                keccak256(byteCode.slice(0, 20)) == _MINIMAL_PROXY_BYTECODE_HASH_PT1 &&
                keccak256(byteCode.slice(40, 15)) == _MINIMAL_PROXY_BYTECODE_HASH_PT2
            ) {
                revert MinimalProxiesDeploymentNotAllowed();
            }
        }
        _;
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via `CREATE2`. The address is
     * constructed using the parameters below. Any change in one of them will result in a new destination address.
     */
    function calculateAddress(
        bytes32 byteCodeHash,
        bytes32 providedSalt,
        bytes calldata initializeCallData
    ) public view returns (address) {
        bytes32 generatedSalt = _generateSalt(initializeCallData, providedSalt);
        return Create2.computeAddress(generatedSalt, byteCodeHash);
    }

    /**
     * @dev Returns the address of an EIP1167 proxy contract. The address is constructed using
     *  the parameters below. Any change in one of them will result in a new destination address.
     */
    function calculateProxyAddress(
        address baseContract,
        bytes32 providedSalt,
        bytes calldata initializeCallData
    ) public view returns (address) {
        bytes32 generatedSalt = _generateSalt(initializeCallData, providedSalt);
        return Clones.predictDeterministicAddress(baseContract, generatedSalt);
    }

    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract will be deployed
     * can be known in advance via {calculateAddress}. The salt is a combination between an initializable
     * boolean, `providedSalt` and the `initializeCallData` if the contract is initializable. This method allow users
     * to have the same contracts at the same address across different chains with the same parameters.
     *
     * Using the same `byteCode` and salt multiple time will revert, since
     * the contract cannot be deployed twice at the same address.
     *
     * Deploying a minimal proxy from this function will revert.
     */
    function deployCreate2(
        bytes memory byteCode,
        bytes32 providedSalt,
        bytes calldata initializeCallData
    ) public payable notMinimalProxy(byteCode) returns (address contractCreated) {
        bytes32 generatedSalt = _generateSalt(initializeCallData, providedSalt);

        if (initializeCallData.length == 0) {
            contractCreated = Create2.deploy(msg.value, generatedSalt, byteCode);
            emit ContractCreated(contractCreated, providedSalt, false, initializeCallData);
        } else {
            contractCreated = Create2.deploy(0, generatedSalt, byteCode);
            emit ContractCreated(contractCreated, providedSalt, false, initializeCallData);

            // solhint-disable avoid-low-level-calls
            (bool success, bytes memory returnData) = contractCreated.call{value: msg.value}(
                initializeCallData
            );
            Address.verifyCallResult(
                success,
                returnData,
                "UF: could not initialize the created contract"
            );
        }
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `baseContract`.
     * The address where the contract will be deployed can be known in advance via {calculateProxyAddress}.
     *
     * This function uses the CREATE2 opcode and a salt to deterministically deploy
     * the clone. The salt is a combination between an initializable boolean, `providedSalt`
     * and the `initializeCallData` if the contract is initializable. This method allow users
     * to have the same contracts at the same address across different chains with the same parameters.
     *
     * Using the same `baseContract` and salt multiple time will revert, since
     * the clones cannot be deployed twice at the same address.
     */
    function deployCreate2Proxy(
        address baseContract,
        bytes32 providedSalt,
        bytes calldata initializeCallData
    ) public payable returns (address proxy) {
        bytes32 generatedSalt = _generateSalt(initializeCallData, providedSalt);
        proxy = Clones.cloneDeterministic(baseContract, generatedSalt);
        emit ContractCreated(proxy, providedSalt, true, initializeCallData);

        if (initializeCallData.length == 0) {
            if (msg.value != 0) revert SendingValueNotAllowed();
        } else {
            // solhint-disable avoid-low-level-calls
            (bool success, bytes memory returnData) = proxy.call{value: msg.value}(
                initializeCallData
            );
            Address.verifyCallResult(
                success,
                returnData,
                "UF: could not initialize the created contract"
            );
        }
    }

    /** internal functions */

    /**
     * @dev Calculates the salt used to deploy the contract by hashing (Keccak256) the following parameters
     * as packed encoded respectively: an initializable boolean, the initializeCallData if and only if
     * the contract is initializable, and using the salt provided by the deployer.
     */
    function _generateSalt(bytes calldata initializeCallData, bytes32 providedSalt)
        internal
        pure
        returns (bytes32)
    {
        bool initializable = initializeCallData.length != 0;
        if (initializable) {
            return keccak256(abi.encodePacked(initializable, initializeCallData, providedSalt));
        } else {
            return keccak256(abi.encodePacked(initializable, providedSalt));
        }
    }
}
