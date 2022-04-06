// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@erc725/smart-contracts/contracts/utils/ErrorHandlerLib.sol";

contract ProxyFactory {
    // Events
    event ContractCreated(address implementation, address contractCreated);
    event ContractCreated2(
        address implementation,
        bytes32 salt,
        address contractCreated
    );

    // Public functions

    /**
     * @dev Deploys and intitialize a proxy using create
     */
    function createProxyWithInitialize(
        address implementation,
        bytes memory data
    ) public payable returns (address) {
        address proxyContract = Clones.clone(implementation);
        (bool success, bytes memory result) = proxyContract.call{
            value: msg.value
        }(data);
        if (!success) {
            ErrorHandlerLib.revertWithParsedError(result);
        }
        emit ContractCreated(implementation, proxyContract);
        return proxyContract;
    }

    /**
     * @dev Deploys and intitialize a proxy using create2
     */
    function create2ProxyWithInitialize(
        address implementation,
        bytes32 salt,
        bytes memory data
    ) public payable returns (address) {
        address proxyContract = Clones.cloneDeterministic(implementation, salt);
        (bool success, bytes memory result) = proxyContract.call{
            value: msg.value
        }(data);
        if (!success) {
            ErrorHandlerLib.revertWithParsedError(result);
        }
        emit ContractCreated2(implementation, salt, proxyContract);
        return proxyContract;
    }

    /**
     * @dev Predicts the address of the proxy if deployed from the deployer address
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt,
        address deployer
    ) public pure returns (address predicted) {
        return predictDeterministicAddress(implementation, salt, deployer);
    }

    /**
     * @dev Predicts the address of the proxy if deployed from this address
     */
    function predictDeterministicAddress(address implementation, bytes32 salt)
        public
        pure
        returns (address predicted)
    {
        return predictDeterministicAddress(implementation, salt);
    }
}
