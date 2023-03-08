// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP14Ownable2Step} from "./ILSP14Ownable2Step.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// libraries
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";

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
abstract contract LSP14Ownable2Step is ILSP14Ownable2Step, OwnableUnset {
    using LSP1Utils for address;

    /**
     * @dev The number of block that MUST pass before one is able to
     *  confirm renouncing ownership
     */
    uint256 public constant RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY = 100;

    /**
     * @dev The number of blocks during which one can renounce ownership
     */
    uint256 public constant RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD = 100;

    /**
     * @dev The block number saved when initiating the process of renouncing ownerhsip
     */
    uint256 private _renounceOwnershipStartedAt;

    /**
     * @dev see `pendingOwner()`
     */
    address private _pendingOwner;

    /**
     * @inheritdoc ILSP14Ownable2Step
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     */
    function transferOwnership(address newOwner)
        public
        virtual
        override(OwnableUnset, ILSP14Ownable2Step)
        onlyOwner
    {
        _transferOwnership(newOwner);

        address currentOwner = owner();
        emit OwnershipTransferStarted(currentOwner, newOwner);

        newOwner.tryNotifyUniversalReceiver(_TYPEID_LSP14_OwnershipTransferStarted, "");
        require(
            currentOwner == owner(),
            "LSP14: newOwner MUST accept ownership in a separate transaction"
        );
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     */
    function acceptOwnership() public virtual {
        address previousOwner = owner();

        _acceptOwnership();

        previousOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
            ""
        );

        msg.sender.tryNotifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferred_RecipientNotification,
            ""
        );
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     */
    function renounceOwnership()
        public
        virtual
        override(OwnableUnset, ILSP14Ownable2Step)
        onlyOwner
    {
        _renounceOwnership();
    }

    // --- Internal methods

    /**
     * @dev set the pending owner of the contract and cancel any renounce ownership
     * process that was previously started.
     *
     * @param newOwner The address of the new pending owner.
     *
     * Requirements:
     * - `newOwner` cannot be the address of the contract itself.
     */
    function _transferOwnership(address newOwner) internal virtual {
        if (newOwner == address(this)) revert CannotTransferOwnershipToSelf();

        _pendingOwner = newOwner;
        delete _renounceOwnershipStartedAt;
    }

    /**
     * @dev set the pending owner of the contract as the new owner.
     */
    function _acceptOwnership() internal virtual {
        require(msg.sender == pendingOwner(), "LSP14: caller is not the pendingOwner");

        _setOwner(msg.sender);
        delete _pendingOwner;
    }

    /**
     * @dev initiate or confirm the process of renouncing ownership
     * after a specific delay of blocks have passed.
     */
    function _renounceOwnership() internal virtual {
        uint256 currentBlock = block.number;
        uint256 confirmationPeriodStart = _renounceOwnershipStartedAt +
            RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY;
        uint256 confirmationPeriodEnd = confirmationPeriodStart +
            RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD;

        if (currentBlock > confirmationPeriodEnd) {
            _renounceOwnershipStartedAt = currentBlock;
            delete _pendingOwner;
            emit RenounceOwnershipStarted();
            return;
        }

        if (currentBlock < confirmationPeriodStart) {
            revert NotInRenounceOwnershipInterval(confirmationPeriodStart, confirmationPeriodEnd);
        }

        _setOwner(address(0));
        delete _renounceOwnershipStartedAt;
        delete _pendingOwner;
        emit OwnershipRenounced();
    }
}
