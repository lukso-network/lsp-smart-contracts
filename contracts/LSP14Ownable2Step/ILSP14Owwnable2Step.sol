// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

bytes4 constant _INTERFACEID_CLAIM_OWNERSHIP = 0xa375e9c6;

interface ILSP14Owwnable2Step {
    event RenounceOwnershipInitiated();

    function pendingOwner() external view returns (address);

    function claimOwnership() external;
}
