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
     * @inheritdoc OwnableUnset
     * event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
     */

    /**
     * @dev emitted when starting the `renounceOwnership(..)` 2-step process.
     */
    event RenounceOwnershipStarted();

    /**
     * @dev emitted when the ownership of the contract has been renounced.
     */
    event OwnershipRenounced();

    /**
     * @inheritdoc OwnableUnset
     * function owner() external view returns (address);
     */

    /**
     * @dev The address that ownership of the contract is transferred to.
     * This address may use `acceptOwnership()` to gain ownership of the contract.
     */
    function pendingOwner() external view returns (address);

    /**
     * @dev Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner.
     *
     * If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that
     * ownership has been transferred to them by calling the `universalReceiver(...)` function on the `newOwner` contract.
     *
     * @param newOwner the address of the new owner.
     *
     * Requirements:
     * - `newOwner` MUST NOT accept ownership of the contract in the same transaction.
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Transfer ownership of the contract from the current `owner()` to the `pendingOwner()`.
     *
     * Once this function is called:
     * - the current `owner()` will loose access to the functions restricted to the `owner()` only.
     * - the `pendingOwner()` will gain access to the functions restricted to the `owner()` only.
     *
     * Requirements:
     * - MUST be called by the pendingOwner.
     */
    function acceptOwnership() external;

    /**
     * @dev Renounce ownership of the contract in a 2-step process.
     *
     * 1. the first call will initiate the process of renouncing ownership.
     * 2. the second is used as a confirmation and will leave the contract without an owner.
     *
     * WARNING: once ownership of the contract has been renounced, any functions
     * that are restricted to be called by the owner will be permanently inaccessible,
     * making these functions not callable anymore and unusable.
     */
    function renounceOwnership() external;
}
