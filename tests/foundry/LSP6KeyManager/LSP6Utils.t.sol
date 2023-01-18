// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../../../contracts/LSP6KeyManager/LSP6Utils.sol";

contract LSP6UtilsTests is Test {
    function testIsCBAOfAllowedCallsWithValidAllowedCalls(uint8 numberOfAllowedCalls) public view {
        bytes memory allowedCalls = _generateAllowedCalls(numberOfAllowedCalls % 50, 28);

        assert(LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCalls(uint8 numberOfAllowedCalls)
        public
        view
    {
        bytes memory allowedCalls = _generateAllowedCalls(
            numberOfAllowedCalls % 50,
            numberOfAllowedCalls % 28
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCallsAtTheBeginning(
        uint8 numberOfAllowedCalls
    ) public view {
        bytes memory invalidAllowedCall = _generateAllowedCalls(1, numberOfAllowedCalls % 28);
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(invalidAllowedCall, validAllowedCall);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCallsInTheMiddle(uint8 numberOfAllowedCalls)
        public
        view
    {
        bytes memory validAllowedCallBefore = _generateAllowedCalls(1, 28);
        bytes memory invalidAllowedCall = _generateAllowedCalls(1, numberOfAllowedCalls % 28);
        bytes memory validAllowedCallAfter = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            validAllowedCallBefore,
            invalidAllowedCall,
            validAllowedCallAfter
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCallsAtTheEnd(uint8 numberOfAllowedCalls)
        public
        view
    {
        bytes memory invalidAllowedCall = _generateAllowedCalls(1, numberOfAllowedCalls % 28);
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(validAllowedCall, invalidAllowedCall);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCall(uint8 numberOfAllowedCalls) public view {
        uint8 allowedCallLength = (numberOfAllowedCalls % uint8(type(uint8).max)) + 29;
        bytes memory allowedCalls = _generateAllowedCalls(
            numberOfAllowedCalls % 50,
            numberOfAllowedCalls % allowedCallLength
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallAtTheBeginning(uint8 numberOfAllowedCalls)
        public
        view
    {
        uint8 allowedCallLength = (numberOfAllowedCalls % uint8(type(uint8).max)) + 29;

        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            numberOfAllowedCalls % allowedCallLength
        );
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(invalidAllowedCall, validAllowedCall);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallInTheMiddle(uint8 numberOfAllowedCalls)
        public
        view
    {
        uint8 allowedCallLength = (numberOfAllowedCalls % uint8(type(uint8).max)) + 29;

        bytes memory validAllowedCallBefore = _generateAllowedCalls(1, 28);
        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            numberOfAllowedCalls % allowedCallLength
        );
        bytes memory validAllowedCallAfter = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            validAllowedCallBefore,
            invalidAllowedCall,
            validAllowedCallAfter
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallAtTheEnd(uint8 numberOfAllowedCalls)
        public
        view
    {
        uint8 allowedCallLength = (numberOfAllowedCalls % uint8(type(uint8).max)) + 29;

        bytes memory allowedCallsEnd = _generateAllowedCalls(
            1,
            numberOfAllowedCalls % allowedCallLength
        );
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(validAllowedCall, allowedCallsEnd);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function _generateAllowedCalls(uint8 numberOfAllowedCalls, uint8 allowedCallLength)
        internal
        view
        returns (bytes memory)
    {
        bytes memory allowedCalls;
        for (uint8 i = 0; i < numberOfAllowedCalls; i++) {
            bytes memory allowedCall = _generateRandomBytes(allowedCallLength);
            bytes memory allowedCallallowedCall = abi.encodePacked(
                bytes2(uint16(allowedCallLength)),
                allowedCall
            );
            allowedCalls = abi.encodePacked(allowedCalls, allowedCallallowedCall);
        }
        return allowedCalls;
    }

    function _generateRandomBytes(uint8 length) internal view returns (bytes memory) {
        bytes memory bytesArray = new bytes(length);
        for (uint8 i = 0; i < length; i++) {
            bytesArray[i] = bytes1(
                uint8(
                    uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) %
                        (i + 1)
                )
            );
        }
        return bytesArray;
    }
}
