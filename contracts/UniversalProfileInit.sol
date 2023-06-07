// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {UniversalProfileInitAbstract} from "./UniversalProfileInitAbstract.sol";

/**
 * @title Deployable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is UniversalProfileInitAbstract {
    /**
     * @notice deploying a `UniversalProfileInit` base contract to be used behind proxy
     * @dev Locks the base contract on deployment, so that it cannot be initialized, owned and controlled by anyone
     * after it has been deployed. This is intended so that the sole purpose of this contract is to be used as a base
     * contract behind a proxy.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing the contract owner to: `initialOwner`
     * @dev Set `initialOwner` as the contract owner and set the `SupportedStandards:LSP3UniversalProfile` data key in the ERC725Y data key/value store.
     * The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     * The `initialize(address)` function also allows funding the contract on initialization.
     *
     * Emitted Events:
     * - ValueReceived: when the contract is funded on initialization.
     *
     * @param initialOwner the owner of the contract
     */
    function initialize(address initialOwner) external payable virtual initializer {
        UniversalProfileInitAbstract._initialize(initialOwner);
    }
}
