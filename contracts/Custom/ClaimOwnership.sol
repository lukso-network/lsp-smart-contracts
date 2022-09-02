// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This contract is a modified version of the OwnableUnset implementation, where we transfer Ownership as a 2 step
// process, this allows to prevent for mistakes during ownership transfer,and so prevent control of a contract from
// potentially being lost forever.

// interfaces
import {IClaimOwnership} from "./IClaimOwnership.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

error NotInRenounceOwnershipInterval(uint256 renounceOwnershipStart, uint256 renounceOwnershipEnd);

/**
 * @dev reverts when trying to transfer ownership to the address(this)
 */
error CannotTransferOwnershipToSelf();

abstract contract ClaimOwnership is IClaimOwnership, OwnableUnset {

    uint256 private constant _RENOUNCE_OWNERSHIP_DELAY = 100;

    uint256 private constant _RENOUNCE_OWNERSHIP_PERIOD = 100;

    /**
     * @dev The block number saved in the first step for
     * renouncing ownership of the contract
     */
    uint256 private _renounceOwnershipStartedAt;

    /**
     * @dev The address that may use `claimOwnership()`
     */
    address public override pendingOwner;

    function claimOwnership() public virtual override {
        _claimOwnership();
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _transferOwnership(newOwner);
    }

    function renounceOwnership() public virtual override onlyOwner {
        _renounceOwnership();
    }

    function _claimOwnership() internal virtual {
        require(msg.sender == pendingOwner, "ClaimOwnership: caller is not the pendingOwner");
        _setOwner(pendingOwner);
        pendingOwner = address(0);
    }

    function _transferOwnership(address newOwner) internal virtual {
        if (newOwner == address(this)) revert CannotTransferOwnershipToSelf();
        pendingOwner = newOwner;
    }

    /**
     * @dev Save the block number for the first step if `_lastRenounceOwnershipBlock`
     * is more than 200 block back.
     * Execute `renounceOwnership` if the `_lastRenounceOwnershipBlock`
     * is less than 200 blocks back and more than 100 blocks.
     */
    function _renounceOwnership() internal virtual {
        // TO renounce ownership of the contract, we need to instantiate a renounce ownership process
        uint256 currentBlock = block.number;
        uint256 confirmationPeriodStart = _renounceOwnershipStartedAt + _RENOUNCE_OWNERSHIP_DELAY;
        uint256 confirmationPeriodEnd = confirmationPeriodStart + _RENOUNCE_OWNERSHIP_PERIOD;

        // if we second call happen "too late", we start the process again
        if (currentBlock > confirmationPeriodEnd) {
            _renounceOwnershipStartedAt = currentBlock;
            emit RenounceOwnershipInitiated();
            return;
        }

        // if we second call happen "too early", we revert
        if (currentBlock < confirmationPeriodStart) {
            revert NotInRenounceOwnershipInterval(confirmationPeriodStart, confirmationPeriodEnd);
        }

        _setOwner(address(0));
        delete _renounceOwnershipStartedAt;
    }
}
