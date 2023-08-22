// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

/**
 * @title Inheritable Proxy Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 */
abstract contract LSP0ERC725AccountInitAbstract is
    Initializable,
    LSP0ERC725AccountCore
{
    /**
     * @dev Set `initialOwner` as the contract owner. ERC725X & ERC725Y parent contracts
     * are not initialised as they don't have non-zero initial state.
     * If you decide to add non-zero initial state to any of those
     * contracts, you MUST initialize them here
     *
     * Emitted Events:
     * - ValueReceived: if the transaction that triggered this internal `_initialize` function contained some `msg.value`.
     *
     * @param initialOwner the owner of the contract
     */
    function _initialize(
        address initialOwner
    ) internal virtual onlyInitializing {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }
        OwnableUnset._setOwner(initialOwner);
    }
}
