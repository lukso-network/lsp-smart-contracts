// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {LSP11BasicSocialRecoveryInitAbstract} from "./LSP11BasicSocialRecoveryInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of LSP11 - Basic Social Recovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
contract LSP11BasicSocialRecoveryInit is LSP11BasicSocialRecoveryInitAbstract {
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initiate the contract with the address of the ERC725 contract and sets the owner
     * @param _account The address of the ER725 contract to recover and the owner of the contract
     */
    function initialize(address _account) public virtual initializer {
        LSP11BasicSocialRecoveryInitAbstract._initialize(_account);
    }
}
