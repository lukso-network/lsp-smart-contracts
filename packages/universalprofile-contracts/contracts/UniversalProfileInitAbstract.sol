// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP0ERC725AccountInitAbstract
} from "@lukso/lsp0-contracts/contracts/LSP0ERC725AccountInitAbstract.sol";

// constants
import {
    _LSP3_SUPPORTED_STANDARDS_KEY,
    _LSP3_SUPPORTED_STANDARDS_VALUE
} from "@lukso/lsp3-contracts/contracts/LSP3Constants.sol";

/**
 * @title Inheritable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
abstract contract UniversalProfileInitAbstract is
    LSP0ERC725AccountInitAbstract
{
    /**
     * @dev Set `initialOwner` as the contract owner and the `SupportedStandards:LSP3Profile` data key in the ERC725Y data key/value store.
     * The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     *
     * @param initialOwner The owner of the contract.
     *
     * @custom:warning ERC725X & ERC725Y parent contracts are not initialised as they don't have non-zero initial state. If you decide to add non-zero initial state to any of those contracts, you must initialize them here.
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when setting the {_LSP3_SUPPORTED_STANDARDS_KEY}.
     */
    function _initialize(
        address initialOwner
    ) internal virtual override onlyInitializing {
        LSP0ERC725AccountInitAbstract._initialize(initialOwner);

        // set data key SupportedStandards:LSP3Profile
        _setData(
            _LSP3_SUPPORTED_STANDARDS_KEY,
            _LSP3_SUPPORTED_STANDARDS_VALUE
        );
    }
}
