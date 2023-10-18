// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "@erc725/smart-contracts/contracts/constants.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

import {
    LSP20EOACannotVerifyCall
} from "../../../contracts/LSP20CallVerification/LSP20Errors.sol";

contract Implementation {
    // _pendingOwner is at slot 3 for LSP0ERC725Account
    bytes32[3] __gap;
    address _pendingOwner;

    function setPendingOwner(address newPendingOwner) external {
        _pendingOwner = newPendingOwner;
    }
}

contract TwoStepRenounceOwnershipTest is Test {
    LSP0ERC725Account account;

    function setUp() public {
        // Deploy LSP0 account with this address as owner
        account = new LSP0ERC725Account(address(this));
    }

    function testCannotRegainOwnershipAfterRenounce() public {
        // Call renounceOwnership() to initiate the process
        account.renounceOwnership();

        // Overwrite _pendingOwner using a delegatecall
        Implementation implementation = new Implementation();
        account.execute(
            OPERATION_4_DELEGATECALL,
            address(implementation),
            0,
            abi.encodeWithSelector(
                Implementation.setPendingOwner.selector,
                address(this)
            )
        );

        // _pendingOwner is now set to this address
        assertEq(account.pendingOwner(), address(this));

        // Call renounceOwnership() again to renounce ownership
        vm.roll(block.number + 200);
        account.renounceOwnership();

        // Owner is now set to address(0)
        assertEq(account.owner(), address(0));

        // Call acceptOwnership() to regain ownership should fail
        // as pendingOwner should be deleted on the second call of renounceOwnership again
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP20EOACannotVerifyCall.selector,
                address(0)
            )
        );
        account.acceptOwnership();
    }
}
