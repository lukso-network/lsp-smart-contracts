// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP0ERC725AccountCore
} from "../LSP0ERC725Account/LSP0ERC725AccountCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import {
    _TYPEID_LSP0_OwnershipTransferStarted
} from "../LSP0ERC725Account/LSP0Constants.sol";
import {
    _TYPEID_LSP9_OwnershipTransferStarted
} from "../LSP9Vault/LSP9Constants.sol";
import {
    _TYPEID_LSP14_OwnershipTransferStarted
} from "../LSP14Ownable2Step/LSP14Constants.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract UPWithInstantAcceptOwnership is LSP0ERC725AccountCore {
    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) payable {
        OwnableUnset._setOwner(newOwner);
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory receivedData
    ) public payable virtual override returns (bytes memory) {
        if (
            typeId == _TYPEID_LSP0_OwnershipTransferStarted ||
            typeId == _TYPEID_LSP9_OwnershipTransferStarted ||
            typeId == _TYPEID_LSP14_OwnershipTransferStarted
        ) {
            LSP14Ownable2Step(msg.sender).acceptOwnership();
        }
        return super.universalReceiver(typeId, receivedData);
    }
}
