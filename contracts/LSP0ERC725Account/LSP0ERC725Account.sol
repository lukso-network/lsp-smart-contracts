// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

/**
 * @title Deployable Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 */
contract LSP0ERC725Account is LSP0ERC725AccountCore {
    /**
     * @notice Deploying a LSP0ERC725Account contract with owner set to address `initialOwner`.
     * @dev Set `initialOwner` as the contract owner. The `constructor` also allows funding the contract on deployment.
     * @param initialOwner The owner of the contract.
     *
     * @custom:events
     * - {ValueReceived} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     */
    constructor(address initialOwner) payable {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        OwnableUnset._setOwner(initialOwner);
    }
}
