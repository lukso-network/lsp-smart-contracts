// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title Interface of the LSP14 - Ownable 2-step standard, an extension of the [EIP173] (Ownable) standard with 2-step process to transfer or renounce ownership.
 */
interface ILSP14Ownable2Step {
    /**
     * @dev Emitted when {transferOwnership(..)} was called and the first step of transferring ownership completed successfully which leads to {pendingOwner} being updated.
     * @notice The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.
     * @param previousOwner The address of the previous owner.
     * @param newOwner The address of the new owner.
     */
    event OwnershipTransferStarted(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @inheritdoc OwnableUnset
     * event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
     */

    /**
     * @dev Emitted when starting the {renounceOwnership(..)} 2-step process.
     * @notice Ownership renouncement initiated.
     */
    event RenounceOwnershipStarted();

    /**
     * @dev Emitted when the ownership of the contract has been renounced.
     * @notice Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.
     */
    event OwnershipRenounced();

    /**
     * @inheritdoc OwnableUnset
     * function {owner()} external view returns (address);
     */

    /**
     * @dev The address that ownership of the contract is transferred to.
     * This address may use {acceptOwnership()} to gain ownership of the contract.
     */
    function pendingOwner() external view returns (address);

    /**
     * @dev Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner.
     *
     * If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.
     *
     * @notice Transfer ownership initiated by `newOwner`.
     *
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}.
     *
     * Once this function is called:
     * - The current {owner()} will lose access to the functions restricted to the {owner()} only.
     * - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.
     *
     * @notice `msg.sender` is accepting ownership of contract: `address(this)`.
     */
    function acceptOwnership() external;

    /**
     * @dev Renounce ownership of the contract in a 2-step process.
     *
     * 1. The first call will initiate the process of renouncing ownership.
     * 2. The second call is used as a confirmation and will leave the contract without an owner.
     *
     * @notice `msg.sender` is renouncing ownership of contract `address(this)`.
     */
    function renounceOwnership() external;
}
