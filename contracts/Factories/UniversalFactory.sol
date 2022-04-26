`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// libraries
import "@erc725/smart-contracts/contracts/utils/ErrorHandlerLib.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

/**
 * @dev UniversalFactory contract can be used to deploy create2 contracts; normal contracts and minimal
 * proxies (EIP-1167) with the ability to deploy the same contract at the same address on different chains.
 * If the contract has a constructor, the arguments will be part of the byteCode
 * If the contract has an `initialize` function, we need to include the parameters of this function in
 * the salt to ensure that the parameters of the contract should be the same on each chain.
 *
 * Security measures were taken to avoid deploying proxies from the `deployCreate2(..)` function
 * to prevent the problem mentioned above.
 *
 * This contract should be deployed using Nick's Method.
 * More information: https://weka.medium.com/how-to-send-ether-to-11-440-people-187e332566b7
 */
contract UniversalFactory {
    using BytesLib for bytes;

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
                revert("Minimal Proxies deployment not allowed");
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
        bool initializable,
        bytes memory initializeCalldata,
        bytes32 salt
    ) public view returns (address contractToCreate) {
        bytes32 salt = _calculateSalt(initializable, initializeCalldata, salt);
        contractToCreate = Create2.computeAddress(salt, byteCodeHash);
    }

    /**
     * @dev Returns the address of an EIP1167 proxy contract. The address is constructed using
     *  the parameters below. Any change in one of them will result in a new destination address.
     */
    function calculateProxyAddress(
        address baseContract,
        bool initializable,
        bytes memory initializeCalldata,
        bytes32 salt
    ) public view returns (address proxy) {
        bytes32 salt = _calculateSalt(initializable, initializeCalldata, salt);
        proxy = Clones.predictDeterministicAddress(baseContract, salt);
    }

    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract will be deployed
     * can be known in advance via {calculateAddress}. The salt is a combination between the `initializable`,
     * `salt` and the `initializeCalldata` if the contract is initializable. This method allow users
     * to have the same contracts at the same address across different chains with the same parameters.
     *
     * Using the same `byteCode` and salt multiple time will revert, since
     * the contract cannot be deployed twice at the same address.
     *
     * Deploying a minimal proxy from this function will revert.
     */
    function deployCreate2(
        bytes memory byteCode,
    bytes32 salt,
        bytes memory initializeCalldata,
    ) public payable notMinimalProxy(byteCode) returns (address contractCreated) {
        bytes32 salt = _calculateSalt(initializable, initializeCalldata, salt);
            contractCreated = Create2.deploy(msg.value, salt, byteCode);
        if (initializable) {

            (bool success, bytes memory returnedData) = contractCreated.call(initializeCalldata);
            if (!success) ErrorHandlerLib.revertWithParsedError(returnedData);
        } else {
            contractCreated = Create2.deploy(msg.value, salt, byteCode);
        }
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `baseContract`.
     * The address where the contract will be deployed can be known in advance via {calculateProxyAddress}.
     *
     * This function uses the create2 opcode and a salt to deterministically deploy
     * the clone. The salt is a combination between the `initializable`, `salt`
     * and the `initializeCalldata` if the contract is initializable. This method allow users
     * to have the same contracts at the same address across different chains with the same parameters.
     *
     * Using the same `baseContract` and salt multiple time will revert, since
     * the clones cannot be deployed twice at the same address.
     */
    function deployCreate2Proxy(
        address baseContract,
        bool initializable,
        bytes memory initializeCalldata,
        bytes32 salt
    ) public payable returns (address proxy) {
        bytes32 salt = _calculateSalt(initializable, initializeCalldata, salt);
        if (initializable) {
            proxy = Clones.cloneDeterministic(baseContract, salt);

            (bool success, bytes memory returnedData) = proxy.call{value: msg.value}(initializeCalldata);
            if (!success) ErrorHandlerLib.revertWithParsedError(returnedData);
        } else {
            proxy = Clones.cloneDeterministic(baseContract, salt);
        }
    }

    /** internal functions */

    /**
     * @dev Calculates the salt depending on the given parameters
     */
    function _calculateSalt(
        bool initializable,
        bytes memory initializeCalldata,
        bytes32 salt
    ) internal pure returns (bytes32 salt) {
        if (initializable) {
            salt = keccak256(abi.encodePacked(initializable, initializeCalldata, salt));
        } else {
            salt = keccak256(abi.encodePacked(initializable, salt));
        }
    }
}
