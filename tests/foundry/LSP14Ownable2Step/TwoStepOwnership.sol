// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "@erc725/smart-contracts/contracts/constants.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

import {
    LSP14MustAcceptOwnershipInSeparateTransaction
} from "../../../contracts/LSP14Ownable2Step/LSP14Errors.sol";

contract Implementation is LSP0ERC725Account {
    constructor() LSP0ERC725Account(msg.sender) {}

    function setOwner(address newOwner) external {
        _setOwner(newOwner);
    }
}

contract MaliciousReceiver {
    LSP0ERC725Account account;
    bool universalReceiverDisabled;

    constructor(LSP0ERC725Account _account) {
        account = _account;
    }

    function universalReceiver(
        bytes32,
        bytes calldata
    ) external returns (bytes memory) {
        // Disable universalReceiver()
        universalReceiverDisabled = true;

        // Cache owner for later use
        address owner = account.owner();

        // Call acceptOwnership() to become the owner
        account.acceptOwnership();

        // and then steal all ether in contract
        // and set back the owner to the original value

        // Transfer all LYX balance to this contract
        account.execute(
            OPERATION_0_CALL,
            address(this),
            address(this).balance,
            ""
        );

        // Overwrite _owner with the previous owner using delegatecall
        Implementation implementation = new Implementation();
        account.execute(
            OPERATION_4_DELEGATECALL,
            address(implementation),
            0,
            abi.encodeWithSelector(Implementation.setOwner.selector, owner)
        );

        return "";
    }

    function supportsInterface(bytes4) external view returns (bool) {
        return !universalReceiverDisabled;
    }

    receive() external payable {}
}

contract TwoStepOwnershipTest is Test {
    LSP0ERC725Account account;

    function setUp() public {
        // Deploy LSP0 account with address(this) as owner and give it some LYX
        account = new LSP0ERC725Account(address(this));
        deal(address(account), 10 ether);
    }

    function testCannotAcceptOwnershipInSameTransaction() public {
        // Attacker deploys malicious receiver contract
        MaliciousReceiver maliciousReceiver = new MaliciousReceiver(account);

        // Victim calls transferOwnership() for malicious receiver
        vm.expectRevert(LSP14MustAcceptOwnershipInSeparateTransaction.selector);
        account.transferOwnership(address(maliciousReceiver));
    }
}
