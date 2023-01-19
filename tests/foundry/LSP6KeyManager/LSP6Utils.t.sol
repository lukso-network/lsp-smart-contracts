// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../../../contracts/LSP6KeyManager/LSP6Utils.sol";

contract LSP6UtilsTests is Test {
    function testIsCBAOfAllowedCallsWithValidAllowedCalls(uint8 numberOfAllowedCalls) public view {
        // generate between 1 and 50 allowedCalls
        bytes memory allowedCalls = _generateAllowedCalls((numberOfAllowedCalls % 50) + 1, 28);

        assert(LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCalls(uint8 numberOfAllowedCalls)
        public
        view
    {
        bytes memory allowedCalls = _generateAllowedCalls(
            (numberOfAllowedCalls % 50) + 1,
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
        uint8 allowedCallLength = (numberOfAllowedCalls % (255 - 28)) + 29;
        if (allowedCallLength == 28) {
            allowedCallLength = allowedCallLength + 1;
        }

        bytes memory allowedCalls = _generateAllowedCalls(1, allowedCallLength);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallAtTheBeginning(uint8 numberOfAllowedCalls)
        public
        view
    {
        uint8 allowedCallLength = (numberOfAllowedCalls % (255 - 28)) + 29;
        if (allowedCallLength == 28) {
            allowedCallLength = allowedCallLength + 1;
        }

        bytes memory invalidAllowedCall = _generateAllowedCalls(1, allowedCallLength);
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(invalidAllowedCall, validAllowedCall);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallInTheMiddle(uint8 numberOfAllowedCalls)
        public
        view
    {
        uint8 allowedCallLength = (numberOfAllowedCalls % (255 - 28)) + 29;
        if (allowedCallLength == 28) {
            allowedCallLength = allowedCallLength + 1;
        }

        bytes memory validAllowedCallBefore = _generateAllowedCalls(1, 28);
        bytes memory invalidAllowedCall = _generateAllowedCalls(1, allowedCallLength);
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
        uint8 allowedCallLength = (numberOfAllowedCalls % (255 - 28)) + 29;

        bytes memory allowedCallsEnd = _generateAllowedCalls(1, allowedCallLength);
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(validAllowedCall, allowedCallsEnd);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedERC725YDataKeys(uint16 elementLength) public view {
        uint8 numberBetween1and32 = uint8((elementLength % 31) + 1); // +1 to avoid having 0
        bytes memory allowedKeys = _generateElementCBA(numberBetween1and32, numberBetween1and32);
        assert(LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysForElementBiggerThan32ShouldReturnFalse(
        uint16 elementLength
    ) public view {
        uint8 numberOver32 = uint8((elementLength % 31) + 33);
        bytes memory allowedKeys = _generateElementCBA(numberOver32, numberOver32);
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidShorterCBAAtTheBeginning(
        uint16 elementLength
    ) public view {
        uint8 numberBetween1and32 = uint8((elementLength % 32) + 1); // +1 to avoid having 0
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 - 1
        );
        bytes memory validAllowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory allowedKeys = abi.encodePacked(invalidAllowedKey, validAllowedKeys);
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidShorterCBAInTheMiddle(uint16 elementLength)
        public
        view
    {
        uint8 numberBetween1and32 = uint8((elementLength % 32) + 1); // +1 to avoid having 0
        bytes memory validAllowedKeysBefore = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 - 1
        );
        bytes memory validAllowedKeysAfter = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory allowedKeys = abi.encodePacked(
            validAllowedKeysBefore,
            invalidAllowedKey,
            validAllowedKeysAfter
        );
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidShorterCBAAtTheEnd(uint16 elementLength)
        public
        view
    {
        uint8 numberBetween1and32 = uint8((elementLength % 32) + 1); // +1 to avoid having 0
        bytes memory validAllowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 - 1
        );
        bytes memory allowedKeys = abi.encodePacked(validAllowedKeys, invalidAllowedKey);
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidBiggerCBAAtTheBeginning(
        uint16 elementLength
    ) public view {
        uint8 numberBetween1and32 = uint8((elementLength % 31) + 1); // +1 to avoid having 0
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 + 1
        );
        bytes memory validAllowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory allowedKeys = abi.encodePacked(invalidAllowedKey, validAllowedKeys);
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidBiggerCBAInTheMiddle(uint16 elementLength)
        public
        view
    {
        uint8 numberBetween1and32 = uint8((elementLength % 31) + 1); // +1 to avoid having 0
        bytes memory validAllowedKeysBefore = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 + 1
        );
        bytes memory validAllowedKeysAfter = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory allowedKeys = abi.encodePacked(
            validAllowedKeysBefore,
            invalidAllowedKey,
            validAllowedKeysAfter
        );
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidBiggerCBAAtTheEnd(uint16 elementLength)
        public
        view
    {
        uint8 numberBetween1and32 = uint8((elementLength % 31) + 1); // +1 to avoid having 0
        bytes memory validAllowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 + 1
        );
        bytes memory allowedKeys = abi.encodePacked(validAllowedKeys, invalidAllowedKey);
        assert(!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys));
    }

    function _generateElementCBA(uint16 elementLength, uint16 officialElementLength)
        internal
        view
        returns (bytes memory)
    {
        bytes memory elementBytes = _generateRandomBytes(elementLength);
        bytes2 elementLengthToBytes2 = bytes2(uint16(officialElementLength));
        bytes memory elementCBA = abi.encodePacked(elementLengthToBytes2, elementBytes);
        return elementCBA;
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

    function _generateRandomBytes(uint16 length) internal view returns (bytes memory) {
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
