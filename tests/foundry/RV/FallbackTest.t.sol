// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "forge-std/Test.sol";
import "./Constants.sol";
import {LSP0ERC725Account} from "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import {LSP2Utils} from "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP17Extendable} from "../../../contracts/LSP17ContractExtension/LSP17Extendable.sol";

// constants
import {
    _LSP17_EXTENSION_PREFIX
} from "../../../contracts/LSP17ContractExtension/LSP17Constants.sol";

contract FallbackTest is Test {
    event ValueReceived(address indexed sender, uint256 indexed value);

    LSP0ERC725Account account;

    function getExtension(bytes4 selector) private pure returns (bytes32) {
        return LSP2Utils.generateMappingKey(_LSP17_EXTENSION_PREFIX, selector);
    }

    function setExtension(bytes4 selector, address extension) private {
        bytes32 key = getExtension(selector);
        account.setData(key, abi.encodePacked(extension));
    }

    function getSelector(string memory func) private pure returns (bytes4) {
        return bytes4(keccak256(bytes(func)));
    }

    function setSelector(bytes4 selector) private returns (bytes4) {
        vm.assume(
            selector != 0 &&
                // getData && setData
                selector != 0x7f23690c &&
                selector != 0x4e3e6e9c &&
                selector != 0x54f6127f &&
                selector != 0x14a6e293 &&
                // execute
                selector != 0x44c028fe &&
                selector != 0x13ced88d &&
                selector != account.supportsInterface.selector &&
                selector != account.isValidSignature.selector &&
                selector != account.universalReceiver.selector &&
                selector != account.transferOwnership.selector &&
                selector != account.renounceOwnership.selector &&
                selector != account.acceptOwnership.selector &&
                selector != account.owner.selector &&
                selector != account.pendingOwner.selector &&
                // renounceOwnership constants
                selector != 0xead3fbdf &&
                selector != 0x01bfba61
        );

        return selector;
    }

    function initialize(address owner) public {
        account = new LSP0ERC725Account(owner);
    }

    function initializeWithExtension(
        address owner,
        address extension,
        bytes4 selector
    ) public {
        account = new LSP0ERC725Account(owner);

        bytes4 functionSelect = setSelector(selector);

        vm.assume(owner != extension);
        vm.assume(extension != address(0));
        vm.assume(extension > address(0x9));
        vm.assume(extension != address(this));
        vm.assume(extension != address(vm));

        vm.startPrank(owner);
        setExtension(functionSelect, extension);
        vm.stopPrank();
    }

    /**
     * Fallback behavior works as intended, forwarding the call to the extension with calldata appended.
     */

    /**
     * Test that correct calldata appended when forwarding call to the extension.
     */
    function testCallExtension(
        address owner,
        address msgSender,
        address extension,
        uint256 msgValue,
        bytes4 selector,
        bytes32 typeId,
        bytes32 receivedData
    ) public {
        vm.assume(owner != msgSender);
        vm.assume(extension != msgSender);
        vm.assume(msgValue != 0);
        vm.deal(msgSender, msgValue);

        bytes memory callData = abi.encodePacked(
            abi.encodeWithSelector(selector, typeId, receivedData),
            msgSender,
            msgValue
        );

        initializeWithExtension(owner, extension, selector);

        vm.startPrank(msgSender);

        vm.expectEmit(true, true, false, true);
        emit ValueReceived(msgSender, msgValue);

        vm.expectCall(extension, callData);
        (bool success, ) = address(account).call{value: msgValue}(
            abi.encodeWithSelector(selector, typeId, receivedData)
        );
        vm.stopPrank();

        assertTrue(success);
    }

    /**
     * Test that fallback() does not revert, when calling the contract with empty calldata.
     */
    function testFallbackNoData(address owner, address notOwner) public {
        vm.assume(owner != notOwner);

        initialize(owner);

        vm.startPrank(notOwner);
        (bool success, ) = address(account).call("");
        vm.stopPrank();

        assertTrue(success);
    }

    /**
     * Test that fallback() does not revert, when calling the contract with calldata
     */

    /* When extension is not set. */
    function testFallbackWithCallDataNoExtensionSet(
        address owner,
        address notOwner,
        bytes4 selector,
        bytes32 typeId,
        bytes32 receivedData
    ) public {
        bytes4 functionSelector = setSelector(selector);
        vm.assume(owner != notOwner);

        initialize(owner);

        vm.startPrank(notOwner);
        (bool success, ) = address(account).call(
            abi.encodeWithSelector(functionSelector, typeId, receivedData)
        );
        vm.stopPrank();

        assertTrue(!success);
    }

    function testFallbackWithGraffiti(
        address owner,
        address notOwner,
        bytes memory data
    ) public {
        vm.assume(owner != notOwner);
        bytes4 functionSelector = bytes4(0);

        initialize(owner);

        vm.startPrank(notOwner);
        (bool success, ) = address(account).call(abi.encodeWithSelector(functionSelector, data));
        vm.stopPrank();

        assertTrue(success);
    }

    /* When extension is set. */
    function testFallbackWithExtension(
        address owner,
        address notOwner,
        address extension,
        bytes4 selector,
        bytes32 typeId,
        bytes32 receivedData
    ) public {
        vm.assume(owner != notOwner);

        initializeWithExtension(owner, extension, selector);

        vm.startPrank(notOwner);
        (bool success, ) = address(account).call(
            abi.encodeWithSelector(selector, typeId, receivedData)
        );
        vm.stopPrank();

        assertTrue(success);
    }

    /**
     * Test that when calling the contract with sending value, emit ValueReceived.
     */
    function testEmitEventNoData(
        address owner,
        address msgSender,
        uint256 msgValue,
        address extension,
        bytes4 selector
    ) public {
        vm.assume(owner != msgSender);
        vm.assume(msgValue != 0);

        /* When extension is not set. */
        initialize(owner);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        vm.expectEmit(true, true, false, true);
        emit ValueReceived(msgSender, msgValue);
        (bool success1, ) = address(account).call{value: msgValue}("");
        vm.stopPrank();

        /* When extension is set. */
        initializeWithExtension(owner, extension, selector);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        vm.expectEmit(true, true, false, true);
        emit ValueReceived(msgSender, msgValue);
        (bool success2, ) = address(account).call{value: msgValue}("");
        vm.stopPrank();

        assertTrue(success1);
        assertTrue(success2);
    }

    function testEmitEventWithData(
        address owner,
        address msgSender,
        uint256 msgValue,
        address extension,
        bytes4 selector,
        bytes32 typeId,
        bytes32 receivedData
    ) public {
        bytes4 functionSelector = setSelector(selector);
        vm.assume(owner != msgSender);
        vm.assume(msgValue != 0);

        /* When extension is not set. */
        initialize(owner);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        vm.expectEmit(true, true, false, true);
        emit ValueReceived(msgSender, msgValue);
        (bool success1, ) = address(account).call{value: msgValue}(
            abi.encodeWithSelector(functionSelector, typeId, receivedData)
        );
        vm.stopPrank();

        /* When extension is set. */
        initializeWithExtension(owner, extension, selector);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        vm.expectEmit(true, true, false, true);
        emit ValueReceived(msgSender, msgValue);
        (bool success2, ) = address(account).call{value: msgValue}(
            abi.encodeWithSelector(selector, typeId, receivedData)
        );
        vm.stopPrank();

        assertTrue(!success1);
        assertTrue(success2);
    }

    /**
     * Test that when calling the contract without sending value, no emit ValueReceived.
     * The two tests should fail.
     */
    function testEmitEventNoDataFail(
        address owner,
        address msgSender,
        uint256 msgValue,
        address extension,
        bytes4 selector
    ) public {
        vm.assume(owner != msgSender);
        vm.assume(msgValue != 0);

        /* When extension is not set. */
        initialize(owner);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        //vm.expectEmit(true, true, false, true);
        //emit ValueReceived(msgSender, msgValue);
        (bool success1, ) = address(account).call("");
        vm.stopPrank();

        /*  When extension is set. */
        initializeWithExtension(owner, extension, selector);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        //vm.expectEmit(true, true, false, true);
        //emit ValueReceived(msgSender, msgValue);
        (bool success2, ) = address(account).call("");
        vm.stopPrank();

        assertTrue(success1);
        assertTrue(success2);
    }

    function testEmitEventWithDataFail(
        address owner,
        address msgSender,
        uint256 msgValue,
        address extension,
        bytes4 selector,
        bytes32 typeId,
        bytes32 receivedData
    ) public {
        bytes4 functionSelector = setSelector(selector);
        vm.assume(owner != msgSender);
        vm.assume(msgValue != 0);

        /* When extension is not set. */
        initialize(owner);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        //vm.expectEmit(true, true, false, true);
        //emit ValueReceived(msgSender, msgValue);
        (bool success1, ) = address(account).call(
            abi.encodeWithSelector(functionSelector, typeId, receivedData)
        );
        vm.stopPrank();

        /*  When extension is set. */
        initializeWithExtension(owner, extension, selector);
        vm.deal(msgSender, msgValue);

        vm.startPrank(msgSender);
        //vm.expectEmit(true, true, false, true);
        //emit ValueReceived(msgSender, msgValue);
        (bool success2, ) = address(account).call(
            abi.encodeWithSelector(selector, typeId, receivedData)
        );
        vm.stopPrank();

        assertTrue(!success1);
        assertTrue(success2);
    }
}
