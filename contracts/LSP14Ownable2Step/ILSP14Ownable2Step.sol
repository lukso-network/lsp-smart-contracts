// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Extended version of Ownable (EIP173) in which, transferring or renouncing ownership
 * of the contract works in 2 steps.
 */
interface ILSP14Ownable2Step {
    /**
     * @dev emitted when starting the `transferOwnership(..)` 2-step process.
     */
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev emitted when the ownership of the contract has been transferred.
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev emitted when starting the `renounceOwnership(..)` 2-step process.
     */
    event RenounceOwnershipInitiated();

    /**
     * @dev emitted when the ownership of the contract has been renounced.
     */
    event OwnershipRenounced();

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() external view returns (address);

    /**
     * @dev Returns the address of the current pending owner.
     */
    function pendingOwner() external view returns (address);

    /**
     * @dev Initiate the process of transferring ownership of the contract by setting the pending owner.
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Complete the process of transferring ownership. MUST be called by the pendingOwner.
     */
    function acceptOwnership() external;

    /**
     * @dev Initiate the process of renouncing ownerhsip on the first call and confirm the renouncement of the ownership on the second call.
     */
    function renounceOwnership() external;
}
