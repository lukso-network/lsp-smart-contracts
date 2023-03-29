// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "./Constants.sol";
import {LSP0ERC725Account} from "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract ERC725YTest is Test {
    LSP0ERC725Account account;

    function initialize(address owner) public {
        account = new LSP0ERC725Account(owner);
    }

    /**
     * Test that getData called with a single key does not revert.
     */
    function testGetData1(address owner, bytes32 dataKey) public {
        initialize(owner);

        account.getData(dataKey);
    }

    /**
     * Test that setData called with a single key and value does not revert.
     */
    function testSetData1(
        address owner,
        bytes32 dataKey,
        bytes memory dataValue
    ) public {
        initialize(owner);

        vm.prank(owner);
        account.setData(dataKey, dataValue);
    }

    /**
     * Test that setData can only be called by the owner.
     */
    function testSetData1NotOwner(
        address owner,
        address notOwner,
        bytes32 dataKey,
        bytes memory dataValue
    ) public {
        vm.assume(owner != notOwner);

        initialize(owner);

        vm.assume(notOwner != address(account));

        vm.prank(notOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        account.setData(dataKey, dataValue);
    }

    /**
     * Test that getData returns the correct value for each key.
     */
    function testGetData(address owner, bytes32[] memory dataKeys) public {
        initialize(owner);

        bytes[] memory dataValue = account.getData(dataKeys);

        for (uint256 i = 0; i < dataKeys.length; ++i) {
            assertEq(dataValue[i], account.getData(dataKeys[i]));
        }
    }

    /**
     * Returns an array with the first n elements.
     */
    function _shortenBytes32Array(bytes32[] memory array, uint256 n)
        private
        pure
        returns (bytes32[] memory)
    {
        if (array.length <= n) return array;

        bytes32[] memory shortArray = new bytes32[](n);

        for (uint256 i = 0; i < n; ++i) {
            shortArray[i] = array[i];
        }

        return shortArray;
    }

    /**
     * Returns an array with the first n elements.
     */
    function _shortenBytesArray(bytes[] memory array, uint256 n)
        private
        pure
        returns (bytes[] memory)
    {
        if (array.length <= n) return array;

        bytes[] memory shortArray = new bytes[](n);

        for (uint256 i = 0; i < n; ++i) {
            shortArray[i] = array[i];
        }

        return shortArray;
    }

    /**
     * Test that setData called with multiple keys and values does not revert.
     */
    function testSetData(
        address owner,
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public {
        initialize(owner);

        uint256 minLength = dataKeys.length < dataValues.length
            ? dataKeys.length
            : dataValues.length;

        // Ensure that the number of keys and values are the same
        bytes32[] memory shortKeys = _shortenBytes32Array(dataKeys, minLength);
        bytes[] memory shortValues = _shortenBytesArray(dataValues, minLength);

        vm.prank(owner);
        account.setData(shortKeys, shortValues);
    }

    /**
     * Test that setting and then getting a key returns the same data.
     */
    function testSetGet(
        address owner,
        bytes32 dataKey,
        bytes memory dataValue
    ) public {
        initialize(owner);

        vm.startPrank(owner);
        account.setData(dataKey, dataValue);
        vm.stopPrank();

        bytes memory retrieved = account.getData(dataKey);

        assertEq(retrieved, dataValue);
    }

    /**
     * testSetGet for a specific number of bytes
     */

    function testSetGetNoBytes(address owner, bytes32 dataKey) public {
        testSetGet(owner, dataKey, "");
    }
}
