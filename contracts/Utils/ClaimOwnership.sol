// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {IClaimOwnership} from "./IClaimOwnership.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/utils/OwnableUnset.sol";

abstract contract ClaimOwnership is IClaimOwnership, OwnableUnset {
    address public override pendingOwner;

    function claimOwnership() public virtual override {
        require(msg.sender == pendingOwner, "OwnableClaim: caller is not the pendingOwner");

        // TODO: the function _setOwner(...) cannot be called as it is marked as private
        // _setOwner(pendingOwner);
    }

    function transferOwnership(address _newOwner) public virtual override(OwnableUnset) onlyOwner {
        pendingOwner = _newOwner;
    }
}
