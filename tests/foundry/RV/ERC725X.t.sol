// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "./Constants.sol";
import {LSP0ERC725Account} from "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import {
    OPERATION_0_CALL,
    OPERATION_4_DELEGATECALL,
    OPERATION_3_STATICCALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    ERC725X_MsgValueDisallowedInDelegateCall,
    ERC725X_MsgValueDisallowedInStaticCall,
    ERC725X_InsufficientBalance,
    ERC725X_UnknownOperationType
} from "@erc725/smart-contracts/contracts/errors.sol";

contract ERC725XTest is Test {
    LSP0ERC725Account account;

    function initialize(address owner) public {
        account = new LSP0ERC725Account(owner);
    }

    function testCannotExecuteIfNotOwner(
        address owner,
        uint256 operation,
        address to,
        uint256 value,
        bytes memory data,
        address caller
    ) public {
        vm.assume(caller != owner);

        initialize(owner);

        vm.assume(caller != address(account));

        vm.prank(caller);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));

        account.execute(operation, to, value, data);
    }

    function testCannotExecuteWithInsufficientBalance(
        address owner,
        uint256 operationUnbounded,
        address to,
        uint256 value,
        bytes memory data
    ) public {
        vm.assume(value != 0);

        uint256 operation = bound(operationUnbounded, OPERATION_0_CALL, OPERATION_4_DELEGATECALL);

        // CREATE2 operation cannot be called with empty data,
        // otherwise ERC725X reverts before checking balance
        vm.assume(operation != OPERATION_2_CREATE2 || data.length > 32);

        initialize(owner);

        // Recipient address must be empty for CREATE operations,
        // otherwise ERC725X reverts before checking balance
        if (operation == OPERATION_1_CREATE || operation == OPERATION_2_CREATE2) {
            to = address(0);
        }

        vm.prank(owner);

        if (operation == OPERATION_2_CREATE2) {
            // Since CREATE2 uses an OpenZeppeling library,
            // error message is different
            vm.expectRevert("Create2: insufficient balance");
        } else if (operation == OPERATION_3_STATICCALL) {
            vm.expectRevert(ERC725X_MsgValueDisallowedInStaticCall.selector);
        } else if (operation == OPERATION_4_DELEGATECALL) {
            vm.expectRevert(ERC725X_MsgValueDisallowedInDelegateCall.selector);
        } else {
            vm.expectRevert(abi.encodeWithSelector(ERC725X_InsufficientBalance.selector, 0, value));
        }

        account.execute(operation, to, value, data);
    }

    function testCannotExecuteUnknownOperation(
        address owner,
        uint256 operation,
        address to,
        uint256 value,
        bytes memory data
    ) public {
        vm.assume(operation != OPERATION_0_CALL);
        vm.assume(operation != OPERATION_3_STATICCALL);
        vm.assume(operation != OPERATION_4_DELEGATECALL);
        vm.assume(operation != OPERATION_1_CREATE);
        vm.assume(operation != OPERATION_2_CREATE2);

        initialize(owner);

        vm.deal(owner, value);
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ERC725X_UnknownOperationType.selector, operation));

        account.execute{value: value}(operation, to, value, data);
    }
}
