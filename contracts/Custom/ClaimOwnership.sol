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
    address public override pendingOwner;

    function claimOwnership() public virtual override {
        require(msg.sender == pendingOwner, "OwnableClaim: caller is not the pendingOwner");

        _setOwner(pendingOwner);
        pendingOwner = address(0);
    }

    function transferOwnership(address _newOwner) public virtual override onlyOwner {
        _transferOwnership(_newOwner);
    }

    function _transferOwnership(address _newOwner) internal virtual {
        pendingOwner = _newOwner;
    }
}
