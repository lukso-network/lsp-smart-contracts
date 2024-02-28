// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP0ERC725AccountCore
} from "@lukso/lsp0-contracts/contracts/LSP0ERC725AccountCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {
    LSP14Ownable2Step
} from "@lukso/lsp14-contracts/contracts/LSP14Ownable2Step.sol";

// constants
import {
    _TYPEID_LSP0_OwnershipTransferStarted
} from "@lukso/lsp0-contracts/contracts/LSP0Constants.sol";
import {
    _TYPEID_LSP9_OwnershipTransferStarted
} from "@lukso/lsp9-contracts/contracts/LSP9Constants.sol";
import {
    _TYPEID_LSP14_OwnershipTransferStarted
} from "@lukso/lsp14-contracts/contracts/LSP14Constants.sol";

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
