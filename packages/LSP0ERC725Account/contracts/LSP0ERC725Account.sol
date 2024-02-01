// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {Version} from "./Version.sol";
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

// constants
import {_TYPEID_LSP0_VALUE_RECEIVED} from "./LSP0Constants.sol";

/**
 * @title Deployable Implementation of [LSP-0-ERC725Account] Standard.
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
contract LSP0ERC725Account is LSP0ERC725AccountCore, Version {
    /**
     * @notice Deploying a LSP0ERC725Account contract with owner set to address `initialOwner`.
     *
     * @dev Set `initialOwner` as the contract owner.
     * - The `constructor` also allows funding the contract on deployment.
     * - The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     *
     * @param initialOwner The owner of the contract.
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     */
    constructor(address initialOwner) payable {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP0_VALUE_RECEIVED,
                "",
                ""
            );
        }

        OwnableUnset._setOwner(initialOwner);
    }
}
