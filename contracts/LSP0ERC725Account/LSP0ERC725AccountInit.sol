// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {Version} from "../Version.sol";
import {
    LSP0ERC725AccountInitAbstract
} from "./LSP0ERC725AccountInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 *
 * @dev A smart contract account including basic functionalities such as:
 * - Detecting supported standards using [ERC-165]
 * - Executing several operation on other addresses including creating contracts using [ERC-725X]
 * - A generic data key-value store using [ERC-725Y]
 * - Validating signatures using [ERC-1271]
 * - Receiving notification and react on them using [LSP-1-UniversalReceiver]
 * - Safer ownership management through 2-steps transfer using [LSP-14-Ownable2Step]
 * - Extending the account with new functions and interfaceIds of future standards using [LSP-17-ContractExtension]
 * - Verifying calls on the owner to make it easier to interact with the account directly using [LSP-20-CallVerification]
 */
contract LSP0ERC725AccountInit is LSP0ERC725AccountInitAbstract, Version {
    /**
     * @notice deploying a `LSP0ERC725AccountInit` base contract to be used behind proxy
     * @dev Locks the base contract on deployment, so that it cannot be initialized, owned and controlled by anyone after it has been deployed. This is intended so that the sole purpose of this contract is to be used as a base contract behind a proxy.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a LSP0ERC725Account contract with owner set to address `initialOwner`.
     *
     * @dev Set `initialOwner` as the contract owner. The `initialize(address)` also allows funding the contract on deployment.
     *
     * @param initialOwner The owner of the contract.
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     */
    function initialize(
        address initialOwner
    ) external payable virtual initializer {
        LSP0ERC725AccountInitAbstract._initialize(initialOwner);
    }
}
