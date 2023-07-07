// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {LSP6KeyManagerInitAbstract} from "./LSP6KeyManagerInitAbstract.sol";

/**
 * @title Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
contract LSP6KeyManagerInit is LSP6KeyManagerInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Deploying a LSP6KeyManager linked to contract at address `target_`.
     * @dev Deploy a Key Manager and set the `target_` address in the contract storage,
     * making this Key Manager linked to this `target_` contract.
     *
     * @param target_ The address of the contract to control and forward calldata payloads to.
     */
    function initialize(address target_) external virtual initializer {
        LSP6KeyManagerInitAbstract._initialize(target_);
    }
}
