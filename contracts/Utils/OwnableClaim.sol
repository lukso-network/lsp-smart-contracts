// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {IOwnableClaim} from "./IOwnableClaim.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/utils/OwnableUnset.sol";

abstract contract OwnableClaim is IOwnableClaim, OwnableUnset {
    address public override pendingOwner;

    function claimOwnership() public virtual override {
        require(msg.sender == pendingOwner, "OwnableClaim: caller is not the pendingOwner");

        // TODO: the function _setOwner(...) cannot be called as it is marked as private
        // _setOwner(pendingOwner);
    }
}
