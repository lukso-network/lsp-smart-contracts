// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {Version} from "./Version.sol";
import {UniversalProfileInitAbstract} from "./UniversalProfileInitAbstract.sol";

/**
 * @title Deployable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is UniversalProfileInitAbstract, Version {
    /**
     * @notice deploying a `UniversalProfileInit` base contract to be used behind proxy
     * @dev Locks the base contract on deployment, so that it cannot be initialized, owned and controlled by anyone after it has been deployed.
     * This is intended so that the sole purpose of this contract is to be used as a base contract behind a proxy.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a UniversalProfile contract with owner set to address `initialOwner`.
     *
     * @dev Set `initialOwner` as the contract owner and the `SupportedStandards:LSP3Profile` data key in the ERC725Y data key/value store.
     * - The `initialize(address)` function is payable and allows funding the contract on initialization.
     * - The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     *
     * @param initialOwner the owner of the contract
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when setting the {_LSP3_SUPPORTED_STANDARDS_KEY}.
     */
    function initialize(
        address initialOwner
    ) external payable virtual initializer {
        UniversalProfileInitAbstract._initialize(initialOwner);
    }
}
