// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

bytes4 constant _INTERFACEID_CLAIM_OWNERSHIP = 0xad7dd9b0;

interface IClaimOwnership {
    function pendingOwner() external view returns (address);

    function claimOwnership() external;
}
