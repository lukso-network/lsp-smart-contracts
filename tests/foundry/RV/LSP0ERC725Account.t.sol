// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "./Constants.sol";
import {LSP0ERC725Account} from "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

// errors
import {
    CannotTransferOwnershipToSelf,
    NotInRenounceOwnershipInterval
} from "../../../contracts/LSP14Ownable2Step/LSP14Errors.sol";

// constants
import {
    _INTERFACEID_LSP0,
    _INTERFACEID_ERC1271,
    _ERC1271_FAILVALUE
} from "../../../contracts/LSP0ERC725Account/LSP0Constants.sol";
import {_INTERFACEID_LSP1} from "../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP14} from "../../../contracts/LSP14Ownable2Step/LSP14Constants.sol";
import {
    _INTERFACEID_LSP17_EXTENDABLE
} from "../../../contracts/LSP17ContractExtension/LSP17Constants.sol";
import {
    _INTERFACEID_ERC725X,
    _INTERFACEID_ERC725Y
} from "@erc725/smart-contracts/contracts/constants.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract LSP0ERC725AccountTest is Test {
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event RenounceOwnershipStarted();
    event OwnershipRenounced();
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    LSP0ERC725Account account;

    function initialize(address owner) public {
        account = new LSP0ERC725Account(owner);
    }

    /**
     * Test that supportsInterface does not revert.
     */
    function testSupportsInterface(address owner, bytes4 interfaceId) public {
        initialize(owner);

        account.supportsInterface(interfaceId);
    }

    /**
     * Test that supportsInterface returns true for all the relevant interfaces.
     */
    function testSupportsAllInterfaces(address owner) public {
        initialize(owner);

        assertTrue(account.supportsInterface(_INTERFACEID_ERC1271));
        assertTrue(account.supportsInterface(_INTERFACEID_LSP0));
        assertTrue(account.supportsInterface(_INTERFACEID_LSP1));
        assertTrue(account.supportsInterface(_INTERFACEID_LSP14));
        assertTrue(account.supportsInterface(_INTERFACEID_LSP17_EXTENDABLE));
        assertTrue(account.supportsInterface(_INTERFACEID_ERC725X));
        assertTrue(account.supportsInterface(_INTERFACEID_ERC725Y));
        assertTrue(account.supportsInterface(type(IERC165).interfaceId));
    }

    /**
     * Test that supportsInterface returns false for other interfaces.
     */
    function testDoesNotSupportInterface(address owner, bytes4 interfaceId) public {
        vm.assume(interfaceId != _INTERFACEID_ERC1271);
        vm.assume(interfaceId != _INTERFACEID_LSP0);
        vm.assume(interfaceId != _INTERFACEID_LSP1);
        vm.assume(interfaceId != _INTERFACEID_LSP14);
        vm.assume(interfaceId != _INTERFACEID_LSP17_EXTENDABLE);
        vm.assume(interfaceId != _INTERFACEID_ERC725X);
        vm.assume(interfaceId != _INTERFACEID_ERC725Y);
        vm.assume(interfaceId != type(IERC165).interfaceId);

        initialize(owner);

        bool returnValue = account.supportsInterface(interfaceId);

        assertFalse(returnValue);
    }

    /**
     * Test that testIsValidSignature approves a valid signature by the owner.
     */
    function testIsValidSignature(uint256 privateKey, bytes32 dataHash) public {
        vm.assume(privateKey != 0);
        vm.assume(privateKey < SECP256K1_CURVE_ORDER);

        address owner = vm.addr(privateKey);

        initialize(owner);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, dataHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes4 magicValue = account.isValidSignature(dataHash, signature);

        assertEq(magicValue, _INTERFACEID_ERC1271);
    }

    /**
     * Test that testIsValidSignature rejects anyone else's signature.
     */
    function testIsValidSignatureNotOwner(
        address owner,
        uint256 privateKey,
        bytes32 dataHash
    ) public {
        vm.assume(privateKey != 0);
        vm.assume(privateKey < SECP256K1_CURVE_ORDER);

        address notOwner = vm.addr(privateKey);
        vm.assume(notOwner != owner);

        initialize(owner);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, dataHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes4 magicValue = account.isValidSignature(dataHash, signature);

        assertEq(magicValue, _ERC1271_FAILVALUE);
    }

    /**
     * Test that testIsValidSignature rejects signatures on the wrong data.
     */
    function testIsValidSignatureWrongData(
        uint256 privateKey,
        bytes32 dataHash,
        bytes32 wrongDataHash
    ) public {
        vm.assume(privateKey != 0);
        vm.assume(privateKey < SECP256K1_CURVE_ORDER);
        vm.assume(dataHash != wrongDataHash);

        address owner = vm.addr(privateKey);

        initialize(owner);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, wrongDataHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes4 magicValue = account.isValidSignature(dataHash, signature);

        assertEq(magicValue, _ERC1271_FAILVALUE);
    }

    /**
     * Test that transferOwnership sets the pendingOwner.
     */
    function testTransferOwnership(address owner, address newOwner) public {
        // Avoid precompiled contracts, which trigger undefined behavior
        vm.assume(newOwner > address(0x9));

        initialize(owner);

        vm.assume(newOwner != address(account));

        vm.prank(owner);

        vm.expectEmit(true, true, false, true, address(account));
        emit OwnershipTransferStarted(owner, newOwner);

        account.transferOwnership(newOwner);

        assertEq(account.owner(), owner);
        assertEq(account.pendingOwner(), newOwner);
    }

    /**
     * Test that transferOwnership can only be called by the current owner.
     */
    function testCannotTransferOwnershipNotOwner(
        address owner,
        address notOwner,
        address newOwner
    ) public {
        vm.assume(owner != notOwner);

        initialize(owner);

        vm.prank(notOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        account.transferOwnership(newOwner);
    }

    /**
     * Test that ownership cannot be transfered to the account itself.
     */
    function testCannotTransferOwnershipToItself(address owner) public {
        initialize(owner);

        vm.prank(owner);
        vm.expectRevert(CannotTransferOwnershipToSelf.selector);
        account.transferOwnership(address(account));
    }

    /**
     * Test that accepting ownership sets the owner correctly.
     */
    function testAcceptOwnership(address owner, address newOwner) public {
        // Avoid precompiled contracts, which trigger undefined behavior
        vm.assume(owner > address(0x9));

        testTransferOwnership(owner, newOwner);

        vm.prank(newOwner);

        if (owner != newOwner) {
            vm.expectEmit(true, true, false, true, address(account));
            emit OwnershipTransferred(owner, newOwner);
        }

        account.acceptOwnership();

        assertEq(account.owner(), newOwner);
        assertEq(account.pendingOwner(), address(0));
    }

    /**
     * Tests that only the pendingOwner can accept ownership.
     */
    function testCannotAcceptOwnershipNotOwner(
        address owner,
        address newOwner,
        address caller
    ) public {
        vm.assume(newOwner != caller);

        testTransferOwnership(owner, newOwner);

        vm.prank(caller);
        vm.expectRevert("LSP14: caller is not the pendingOwner");
        account.acceptOwnership();
    }

    /**
     * Test that renounceOwnership doesn't complete in one step.
     */
    function testRenounceOwnershipStart(address owner, uint256 blockNumber)
        public
        returns (uint256 blockNumberStart)
    {
        initialize(owner);

        blockNumberStart = bound(
            blockNumber,
            201,
            MAX_UINT256 - 201 // upper bound to avoid overflows in other tests
        );

        vm.prank(owner);
        vm.roll(blockNumberStart);

        vm.expectEmit(false, false, false, true, address(account));
        emit RenounceOwnershipStarted();

        account.renounceOwnership(); // starts countdown

        assertEq(account.owner(), owner); // owner doesn't change
    }

    /**
     * Test that renounceOwnership can be confirmed between 100 and 200 blocks.
     */
    function testRenounceOwnershipConfirm(
        address owner,
        uint256 blockNumber1,
        uint256 blockNumber2
    ) public {
        uint256 blockNumberStart = testRenounceOwnershipStart(owner, blockNumber1);

        uint256 blockNumberConfirm = bound(
            blockNumber2,
            blockNumberStart + 100,
            blockNumberStart + 200
        );

        vm.prank(owner);
        vm.roll(blockNumberConfirm);

        if (owner != address(0)) {
            vm.expectEmit(true, true, false, true, address(account));
            emit OwnershipTransferred(owner, address(0));
        }

        vm.expectEmit(false, false, false, true, address(account));
        emit OwnershipRenounced();

        account.renounceOwnership(); // ownership renounced

        assertEq(account.owner(), address(0));
    }

    /**
     * Test that renounceOwnership restarts after 200 blocks.
     */
    function testRenounceOwnershipRestart(
        address owner,
        uint256 blockNumber1,
        uint256 blockNumber2
    ) public {
        uint256 blockNumberStart = testRenounceOwnershipStart(owner, blockNumber1);

        uint256 blockNumberRestart = bound(blockNumber2, blockNumberStart + 201, MAX_UINT256);

        vm.prank(owner);
        vm.roll(blockNumberRestart);

        vm.expectEmit(false, false, false, true, address(account));
        emit RenounceOwnershipStarted();

        account.renounceOwnership(); // restarts countdown

        assertEq(account.owner(), owner); // owner doesn't change
    }

    /**
     * Test that renounceOwnership reverts before 100 blocks.
     */
    function testCannotRenounceOwnershipBefore100Blocks(
        address owner,
        uint256 blockNumber1,
        uint256 blockNumber2
    ) public {
        uint256 blockNumberStart = testRenounceOwnershipStart(owner, blockNumber1);

        uint256 blockNumberRevert = bound(blockNumber2, 0, blockNumberStart + 99);

        vm.prank(owner);
        vm.roll(blockNumberRevert);
        vm.expectRevert(
            abi.encodeWithSelector(
                NotInRenounceOwnershipInterval.selector,
                blockNumberStart + 100,
                blockNumberStart + 200
            )
        );

        account.renounceOwnership();
    }

    /**
     * Test that only the owner can call renounceOwnership.
     */
    function testCannotRenounceOwnershipNotOwner(
        address owner,
        address notOwner,
        uint256 blockNumber
    ) public {
        vm.assume(owner != notOwner);
        vm.assume(blockNumber > 200);

        initialize(owner);

        vm.roll(blockNumber);
        vm.prank(notOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        account.renounceOwnership();
    }

    /**
     * Test that universalReceiver does not revert.
     */
    function testUniversalReceiver(
        address owner,
        bytes32 typeId,
        bytes calldata data,
        uint256 msgValue
    ) public {
        initialize(owner);
        vm.deal(address(this), msgValue);
        account.universalReceiver{value: msgValue}(typeId, data);
    }
}
