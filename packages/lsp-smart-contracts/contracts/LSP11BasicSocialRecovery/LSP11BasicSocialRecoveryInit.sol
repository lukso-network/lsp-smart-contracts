// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {
    LSP11BasicSocialRecoveryInitAbstract
} from "./LSP11BasicSocialRecoveryInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of LSP11 - Basic Social Recovery standard
 * @dev Sets permission for a controller address after a recovery process to interact with an ERC725
 * contract via the LSP6KeyManager
 */
contract LSP11BasicSocialRecoveryInit is LSP11BasicSocialRecoveryInitAbstract {
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets the target and the owner addresses
     * @param _owner The owner of the LSP11 contract
     * @param target_ The address of the ER725 contract to recover
     */
    function initialize(
        address target_,
        address _owner
    ) public virtual initializer {
        LSP11BasicSocialRecoveryInitAbstract._initialize(target_, _owner);
    }
}
