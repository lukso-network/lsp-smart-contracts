// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Modified version of OwnableUnset contract in which, tarnsferring or renouncing ownership
 * of the contract works in 2 steps.
 */
interface ILSP14Ownable2Step {
    /**
     * @dev emitted whenever the `transferOwnership(..)` 2-step process is started
     */
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev emitted whenever the `renounceOwnership(..)` 2-step process is started
     */
    event RenounceOwnershipInitiated();

    /**
     * @dev emitted when ownership of the contract has been renounced
     */
    event OwnershipRenounced();

    /**
     * @dev Returns the address of the current pending owner
     */
    function pendingOwner() external view returns (address);

    /**
     * @dev Initiate the process of transferring ownership of the contract
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Initiate the process of accepting ownership of the contract
     */
    function acceptOwnership() external;

    /**
     * @dev Initiate the process of renouncing ownerhsip or confirm the renouncement of the contract
     */
    function renounceOwnership() external;
}
