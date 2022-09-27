// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {LSP0ERC725AccountCore} from "../LSP0ERC725Account/LSP0ERC725AccountCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import "../LSP14Ownable2Step/LSP14Constants.sol";

contract UPWithInstantAcceptOwnership is LSP0ERC725AccountCore {
    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) payable {
        OwnableUnset._setOwner(newOwner);
    }

    function universalReceiver(bytes32 typeId, bytes calldata receivedData)
        public
        payable
        virtual
        override
        returns (bytes memory returnedValue)
    {
        if (typeId == _TYPEID_LSP14_OwnershipTransferStarted) {
            LSP14Ownable2Step(msg.sender).acceptOwnership();
        }
        super.universalReceiver(typeId, receivedData);
    }
}
