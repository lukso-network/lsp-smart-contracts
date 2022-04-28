// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOwnableClaim {
    function pendingOwner() external view returns (address);

    function claimOwnership() external;
}
