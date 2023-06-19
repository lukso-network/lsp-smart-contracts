// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title Interface of the LSP14 - Ownable 2-step standard, an extension of the EIP173 (Ownable) standard with 2-step process to transfer or renounce ownership.
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
     * This address may use {acceptOwnership()} to gain ownership of the contract.
     *
     * @custom:info If no ownership transfer is in progress, the pendingOwner will be `address(0)`.
     */
    function pendingOwner() external view returns (address);

    /**
     * @dev Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner.
     *
     * If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that
     * ownership has been transferred to them by calling the {`universalReceiver()`} function on the `newOwner` contract.
     *
     * @param newOwner the address of the new owner.
     *
     * @custom:requirements `newOwner` MUST NOT accept ownership of the contract in the same transaction.
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Transfer ownership of the contract from the current {`owner()`} to the {`pendingOwner()`}.
     *
     * Once this function is called:
     * - the current {`owner()`} will loose access to the functions restricted to the {`owner()`} only.
     * - the {`pendingOwner()`} will gain access to the functions restricted to the {`owner()`} only.
     *
     * @custom:requirements
     * - MUST be called by the {`pendingOwner`}.
     */
    function acceptOwnership() external;

    /**
     * @dev Renounce ownership of the contract in a two step process.
     *
     * 1. the first call will initiate the process of renouncing ownership.
     * 2. the second is used as a confirmation and will leave the contract without an owner.
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     */
    function renounceOwnership() external;
}
