// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

bytes4 constant _INTERFACEID_CLAIM_OWNERSHIP = 0x9ab669ef;

interface ILSP14Ownable2Step {
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    event RenounceOwnershipInitiated();

    function pendingOwner() external view returns (address);

    function acceptOwnership() external;
}
