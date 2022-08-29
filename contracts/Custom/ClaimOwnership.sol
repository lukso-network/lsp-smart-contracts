// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This contract is a modified version of the OwnableUnset implementation, where we transfer Ownership as a 2 step
// process, this allows to prevent for mistakes during ownership transfer,and so prevent control of a contract from
// potentially being lost forever.

// interfaces
import {IClaimOwnership} from "./IClaimOwnership.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

abstract contract ClaimOwnership is IClaimOwnership, OwnableUnset {
    /**
     * @dev The block number saved in the first step for
     * renouncing ownership of the contract
     */
    uint256 private _lastRenounceOwnershipBlock;
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
        require(msg.sender == pendingOwner, "OwnableClaim: caller is not the pendingOwner");
        _setOwner(pendingOwner);
        pendingOwner = address(0);
    }

    function _transferOwnership(address newOwner) internal virtual {
        pendingOwner = newOwner;
    }

    /**
     * @dev Save the block number for the first step if `_lastRenounceOwnershipBlock`
     * is more than 100 block back. And execute `renounceOwnership` otherwise.
     * 
     */
    function _renounceOwnership()
        internal
        virtual
    {
        if (_lastRenounceOwnershipBlock + 100 >= block.number) {
            _setOwner(address(0));
        }
        else {
            _lastRenounceOwnershipBlock = block.number;
        }
    }
    
}
