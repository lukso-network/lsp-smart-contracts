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
