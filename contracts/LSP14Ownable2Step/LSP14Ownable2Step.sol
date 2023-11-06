// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP14Ownable2Step} from "./ILSP14Ownable2Step.sol";

// modules
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

// libraries
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";

// errors
import {
    LSP14CallerNotPendingOwner,
    LSP14MustAcceptOwnershipInSeparateTransaction,
    LSP14CannotTransferOwnershipToSelf,
    LSP14NotInRenounceOwnershipInterval
} from "./LSP14Errors.sol";

// constants
import {
    _TYPEID_LSP14_OwnershipTransferStarted,
    _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
} from "./LSP14Constants.sol";

/**
 * @title LSP14Ownable2Step
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi), Daniel Afteni (B00ste)
 * @dev This contract is a modified version of the [`OwnableUnset.sol`] implementation, where transferring and renouncing ownership works as a 2-step process. This can be used as a confirmation mechanism to prevent potential mistakes when transferring ownership of the contract, where the control of the contract could be lost forever. (_e.g: providing the wrong address as a parameter to the function, transferring ownership to an EOA for which the user lost its private key, etc..._)
 */
abstract contract LSP14Ownable2Step is ILSP14Ownable2Step, OwnableUnset {
    using LSP1Utils for address;

    /**
     * @dev The number of block that MUST pass before one is able to confirm renouncing ownership.
     * @return Number of blocks.
     */
    uint256 public constant RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY = 200;

    /**
     * @dev The number of blocks during which one can renounce ownership.
     * @return Number of blocks.
     */
    uint256 public constant RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD = 200;

    /**
     * @dev The block number saved when initiating the process of renouncing ownerhsip.
     */
    uint256 internal _renounceOwnershipStartedAt;

    /**
     * @dev see {pendingOwner()}
     */
    address internal _pendingOwner;

    /**
     * @dev The boolean that indicates whether the contract is in an active ownership transfer phase
     */
    bool internal _inTransferOwnership;

    /**
     * @dev reverts when {_inTransferOwnership} variable is true
     */
    modifier notInTransferOwnership() virtual {
        if (_inTransferOwnership) {
            revert LSP14MustAcceptOwnershipInSeparateTransaction();
        }
        _;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:info If no ownership transfer is in progress, the pendingOwner will be `address(0).`.
     */
    function pendingOwner() public view virtual override returns (address) {
        return _pendingOwner;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:requirements `newOwner` cannot accept ownership of the contract in the same transaction. (For instance, via a callback from its {universalReceiver(...)} function).
     */
    function transferOwnership(
        address newOwner
    ) public virtual override(OwnableUnset, ILSP14Ownable2Step) onlyOwner {
        // set the transfer ownership lock
        _inTransferOwnership = true;

        _transferOwnership(newOwner);

        address currentOwner = owner();
        emit OwnershipTransferStarted(currentOwner, newOwner);

        newOwner.notifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferStarted,
            abi.encode(currentOwner, newOwner)
        );

        // reset the transfer ownership lock
        _inTransferOwnership = false;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:requirements This function can only be called by the {pendingOwner()}.
     */
    function acceptOwnership() public virtual override notInTransferOwnership {
        address previousOwner = owner();

        _acceptOwnership();

        previousOwner.notifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
            abi.encode(previousOwner, msg.sender)
        );

        msg.sender.notifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferred_RecipientNotification,
            abi.encode(previousOwner, msg.sender)
        );
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any function that is restricted to be called only by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     */
    function renounceOwnership()
        public
        virtual
        override(OwnableUnset, ILSP14Ownable2Step)
        onlyOwner
    {
        address previousOwner = owner();
        _renounceOwnership();

        if (owner() == address(0)) {
            previousOwner.notifyUniversalReceiver(
                _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
                abi.encode(previousOwner, address(0))
            );
        }
    }

    // --- Internal methods

    /**
     * @dev Set the pending owner of the contract and cancel any renounce ownership process that was previously started.
     *
     * @param newOwner The address of the new pending owner.
     *
     * @custom:requirements `newOwner` cannot be the address of the contract itself.
     */
    function _transferOwnership(address newOwner) internal virtual {
        if (newOwner == address(this))
            revert LSP14CannotTransferOwnershipToSelf();

        _pendingOwner = newOwner;
        delete _renounceOwnershipStartedAt;
    }

    /**
     * @dev Set the pending owner of the contract as the new owner.
     */
    function _acceptOwnership() internal virtual {
        if (msg.sender != pendingOwner())
            revert LSP14CallerNotPendingOwner(msg.sender);

        _setOwner(msg.sender);
        delete _pendingOwner;
        delete _renounceOwnershipStartedAt;
    }

    /**
     * @dev Initiate or confirm the process of renouncing ownership after a specific delay of blocks have passed.
     */
    function _renounceOwnership() internal virtual {
        uint256 currentBlock = block.number;
        uint256 confirmationPeriodStart = _renounceOwnershipStartedAt +
            RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY;
        uint256 confirmationPeriodEnd = confirmationPeriodStart +
            RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD;

        // On the creation of a new network, `currentBlock` will be smaller than `confirmationPeriodEnd`,
        // `_renounceOwnershipStartedAt == 0` will indicate that a renounceOwnership call is happening for the first time
        if (
            currentBlock > confirmationPeriodEnd ||
            _renounceOwnershipStartedAt == 0
        ) {
            _renounceOwnershipStartedAt = currentBlock;
            delete _pendingOwner;
            emit RenounceOwnershipStarted();
            return;
        }

        if (currentBlock < confirmationPeriodStart) {
            revert LSP14NotInRenounceOwnershipInterval(
                confirmationPeriodStart,
                confirmationPeriodEnd
            );
        }

        _setOwner(address(0));
        delete _renounceOwnershipStartedAt;
        delete _pendingOwner;
        emit OwnershipRenounced();
    }
}
