// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

// errors
import "./LSP14Errors.sol";

// constants
import {
    _TYPEID_LSP14_OwnershipTransferStarted,
    _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
} from "./LSP14Constants.sol";
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @title LSP14Ownable2Step
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi), Daniel Afteni (B00ste)
 * @dev This contract is a modified version of the OwnableUnset implementation, where transferring and renouncing ownership
 *      works as a 2 steps process. This can be used as a confirmation mechanism to prevent potential mistakes when
 *      transferring ownership of the contract, where the control of the contract could be lost forever.
 */
abstract contract LSP14Ownable2Step is OwnableUnset {
    /**
     * @dev The event is emitted whenever the `transferOwnership(..)`
     * 2-step process is started
     */
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The event is emitted whenever the `renounceOwnership(..)`
     * 2-step process is started
     */
    event RenounceOwnershipInitiated();

    /**
     * @dev The number of block that need to pass before one is able to
     *  confirm renouncing ownership
     */
    uint256 private constant _RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY = 100;

    /**
     * @dev The number of blocks during which one can renounce ownership
     */
    uint256 private constant _RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD = 100;

    /**
     * @dev The block number saved when initiating the process of
     * renouncing ownerhsip
     */
    uint256 private _renounceOwnershipStartedAt;

    /**
     * @dev The address that may use `acceptOwnership()`
     */
    address private _pendingOwner;

    // --- General Methods

    /**
     * @dev Returns the address of the current pending owner.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _transferOwnership(newOwner);
    }

    function acceptOwnership() public virtual {
        _acceptOwnership();
    }

    function renounceOwnership() public virtual override onlyOwner {
        _renounceOwnership();
    }

    // --- Internal methods

    /**
     * @dev Start the process of transferring ownership of the contract
     * and notify the receiver about it.
     */
    function _transferOwnership(address newOwner) internal virtual {
        if (newOwner == address(this)) revert CannotTransferOwnershipToSelf();
        _pendingOwner = newOwner;

        address currentOwner = owner();
        _notifyRecipient(newOwner, _TYPEID_LSP14_OwnershipTransferStarted);
        require(
            currentOwner == owner(),
            "LSP14: newOwner should accept owership in a separate transaction"
        );

        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /**
     * @dev Accept ownership of the contract and notifiy
     * previous owner and the new owner about the process.
     */
    function _acceptOwnership() internal virtual {
        require(msg.sender == pendingOwner(), "LSP14: caller is not the pendingOwner");

        address previousOwner = owner();
        _setOwner(_pendingOwner);
        delete _pendingOwner;

        _notifySender(previousOwner, _TYPEID_LSP14_OwnershipTransferred_SenderNotification);
        _notifyRecipient(msg.sender, _TYPEID_LSP14_OwnershipTransferred_RecipientNotification);
    }

    /**
     * @dev This method is used to initiate or confirm the process of
     * renouncing ownership.
     */
    function _renounceOwnership() internal virtual {
        uint256 currentBlock = block.number;
        uint256 confirmationPeriodStart = _renounceOwnershipStartedAt +
            _RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY;
        uint256 confirmationPeriodEnd = confirmationPeriodStart +
            _RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD;

        if (currentBlock > confirmationPeriodEnd) {
            _renounceOwnershipStartedAt = currentBlock;
            emit RenounceOwnershipInitiated();
            return;
        }

        if (currentBlock < confirmationPeriodStart) {
            revert NotInRenounceOwnershipInterval(confirmationPeriodStart, confirmationPeriodEnd);
        }

        _setOwner(address(0));
        delete _renounceOwnershipStartedAt;
        delete _pendingOwner;
    }

    // --- URD Hooks

    /**
     * @dev Calls the universalReceiver function of the sender if supports LSP1 InterfaceId
     */
    function _notifySender(address sender, bytes32 typeId) internal virtual {
        if (ERC165Checker.supportsERC165Interface(sender, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(sender).universalReceiver(typeId, "");
        }
    }

    /**
     * @dev Calls the universalReceiver function of the owner if supports LSP1 InterfaceId
     */
    function _notifyRecipient(address receiver, bytes32 typeId) internal virtual {
        if (ERC165Checker.supportsERC165Interface(receiver, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(receiver).universalReceiver(typeId, "");
        }
    }
}
