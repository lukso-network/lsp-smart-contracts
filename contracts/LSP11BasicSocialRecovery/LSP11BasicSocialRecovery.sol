// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP11BasicSocialRecoveryCore} from "./LSP11BasicSocialRecoveryCore.sol";

/**
 * @title Implementation of LSP11 - Basic Social Recovery standard
 * @dev Sets permission for a controller address after a recovery process to interact with an ERC725
 * contract via the LSP6KeyManager
 */
contract LSP11BasicSocialRecovery is LSP11BasicSocialRecoveryCore {
    /**
     * @notice Sets the target and the owner addresses
     * @param _owner The owner of the LSP11 contract
     * @param target_ The address of the ER725 contract to recover
     */
    constructor(address _owner, address target_) {
        OwnableUnset._setOwner(_owner);
        _target = target_;
    }
}
