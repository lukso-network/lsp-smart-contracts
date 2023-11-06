// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "@erc725/smart-contracts/contracts/constants.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

import {
    LSP20EOACannotVerifyCall
} from "../../../contracts/LSP20CallVerification/LSP20Errors.sol";

contract LSP0Implementation is LSP0ERC725Account {
    constructor(address _addr) LSP0ERC725Account(_addr) {}

    function renounceOwnershipStartedAt() public view returns (uint256) {
        return _renounceOwnershipStartedAt;
    }
}

contract LSP0StorageUpdater {
    // _renounceOwnershipStartedAt is at slot 2 for LSP0ERC725Account
    bytes32[2] __gap;
    uint256 _renounceOwnershipStartedAt;

    function setRenounceOwnershipStartedAt(
        uint256 newRenounceOwnershipStartedAt
    ) external {
        _renounceOwnershipStartedAt = newRenounceOwnershipStartedAt;
    }
}

contract OwnershipAccepter {
    function acceptOwnership(address _account) public {
        LSP0Implementation(payable(_account)).acceptOwnership();
    }
}

contract TwoStepRenounceOwnershipTest is Test {
    LSP0Implementation account;
    OwnershipAccepter ownershipAccepter;

    function setUp() public {
        // Deploy LSP0 account with this address as owner
        account = new LSP0Implementation(address(this));
        ownershipAccepter = new OwnershipAccepter();
    }

    function testRenounceOwnershipVariableClearedAfterAcceptOwnership() public {
        // Call transferOwnership so we can check acceptOwnership behavior
        account.transferOwnership(address(ownershipAccepter));

        // Overwrite _renounceOwnershipAt using a delegatecall
        LSP0StorageUpdater implementation = new LSP0StorageUpdater();

        uint256 newRenounceOwnershipStartedAt = 10_000_000; // number of blocks

        account.execute(
            OPERATION_4_DELEGATECALL,
            address(implementation),
            0,
            abi.encodeWithSelector(
                LSP0StorageUpdater.setRenounceOwnershipStartedAt.selector,
                newRenounceOwnershipStartedAt
            )
        );

        // _renounceOwnershipAt is now set to this value
        assertEq(
            account.renounceOwnershipStartedAt(),
            newRenounceOwnershipStartedAt
        );

        // Calling LSP0's `acceptOwnership()` function that
        // should reset _renounceOwnershipAt variable
        ownershipAccepter.acceptOwnership(address(account));

        // Make sure the _renounceOwnershipAt is reset after acceptOwnership call
        assertEq(account.renounceOwnershipStartedAt(), 0);
    }
}
