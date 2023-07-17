// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP0ERC725AccountInitAbstract
} from "./LSP0ERC725AccountInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 */
contract LSP0ERC725AccountInit is LSP0ERC725AccountInitAbstract {
    /**
     * @notice deploying a `LSP0ERC725AccountInit` base contract to be used behind proxy
     * @dev Locks the base contract on deployment, so that it cannot be initialized, owned and controlled by anyone
     * after it has been deployed. This is intended so that the sole purpose of this contract is to be used as a base
     * contract behind a proxy.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing the contract owner to: `initialOwner`
     * @dev Set `initialOwner` as the contract owner.
     * The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     * The `initialize(address)` function also allows funding the contract on initialization.
     *
     * Emitted Events:
     * - ValueReceived: when the contract is funded on initialization.
     *
     * @param initialOwner the owner of the contract
     */
    function initialize(
        address initialOwner
    ) external payable virtual initializer {
        LSP0ERC725AccountInitAbstract._initialize(initialOwner);
    }
}
