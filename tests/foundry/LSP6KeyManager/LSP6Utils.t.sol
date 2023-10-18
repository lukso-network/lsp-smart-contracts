// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../../../contracts/LSP6KeyManager/LSP6Utils.sol";
import "../../../contracts/LSP6KeyManager/LSP6Constants.sol";

contract LSP6UtilsTests is Test {
    mapping(bytes32 => bool) selectedPermissions;

    function testIsCBAOfAllowedCallsWithValidAllowedCalls(
        uint8 numberOfAllowedCalls
    ) public view {
        // generate between 1 and 50 allowedCalls
        bytes memory allowedCalls = _generateAllowedCalls(
            (numberOfAllowedCalls % 50) + 1,
            28
        );

        assert(LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCalls(
        uint8 numberOfAllowedCalls
    ) public view {
        bytes memory allowedCalls = _generateAllowedCalls(
            (numberOfAllowedCalls % 50) + 1,
            numberOfAllowedCalls % 28
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCallsAtTheBeginning(
        uint8 numberOfAllowedCalls
    ) public view {
        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            numberOfAllowedCalls % 28
        );
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            invalidAllowedCall,
            validAllowedCall
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCallsInTheMiddle(
        uint8 numberOfAllowedCalls
    ) public view {
        bytes memory validAllowedCallBefore = _generateAllowedCalls(1, 28);
        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            numberOfAllowedCalls % 28
        );
        bytes memory validAllowedCallAfter = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            validAllowedCallBefore,
            invalidAllowedCall,
            validAllowedCallAfter
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithSmallerAllowedCallsAtTheEnd(
        uint8 numberOfAllowedCalls
    ) public view {
        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            numberOfAllowedCalls % 28
        );
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            validAllowedCall,
            invalidAllowedCall
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCall(
        uint8 numberOfAllowedCalls
    ) public view {
        // 251 = type(uint8).max - 4 (the 4 bytes of the callTypes)
        uint8 allowedCallLength = (numberOfAllowedCalls % (251 - 28)) + 29;
        if (allowedCallLength == 28) {
            allowedCallLength = allowedCallLength + 1;
        }

        bytes memory allowedCalls = _generateAllowedCalls(1, allowedCallLength);

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallAtTheBeginning(
        uint8 numberOfAllowedCalls
    ) public view {
        // 251 = type(uint8).max - 4 (the 4 bytes of the callTypes)
        uint8 allowedCallLength = (numberOfAllowedCalls % (251 - 28)) + 29;
        if (allowedCallLength == 28) {
            allowedCallLength = allowedCallLength + 1;
        }

        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            allowedCallLength
        );
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            invalidAllowedCall,
            validAllowedCall
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallInTheMiddle(
        uint8 numberOfAllowedCalls
    ) public view {
        // 251 = type(uint8).max - 4 (the 4 bytes of the callTypes)
        uint8 allowedCallLength = (numberOfAllowedCalls % (251 - 28)) + 29;
        if (allowedCallLength == 28) {
            allowedCallLength = allowedCallLength + 1;
        }

        bytes memory validAllowedCallBefore = _generateAllowedCalls(1, 28);
        bytes memory invalidAllowedCall = _generateAllowedCalls(
            1,
            allowedCallLength
        );
        bytes memory validAllowedCallAfter = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            validAllowedCallBefore,
            invalidAllowedCall,
            validAllowedCallAfter
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedCallsWithBiggerAllowedCallAtTheEnd(
        uint8 numberOfAllowedCalls
    ) public view {
        // 251 = type(uint8).max - 4 (the 4 bytes of the callTypes)
        uint8 allowedCallLength = (numberOfAllowedCalls % (251 - 28)) + 29;

        bytes memory allowedCallsEnd = _generateAllowedCalls(
            1,
            allowedCallLength
        );
        bytes memory validAllowedCall = _generateAllowedCalls(1, 28);
        bytes memory allowedCalls = abi.encodePacked(
            validAllowedCall,
            allowedCallsEnd
        );

        assert(!LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls));
    }

    function testIsCBAOfAllowedERC725YDataKeys(
        uint16 elementLength
    ) public view {
        uint8 numberBetween1and32 = uint8((elementLength % 31) + 1); // +1 to avoid having 0
        bytes memory allowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        assert(
            LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
    }

    function testIsCBAOfAllowedERC725YDataKeysForElementBiggerThan32ShouldReturnFalse(
        uint16 elementLength
    ) public view {
        uint8 numberOver32 = uint8((elementLength % 31) + 33);
        bytes memory allowedKeys = _generateElementCBA(
            numberOver32,
            numberOver32
        );
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
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
        bytes memory allowedKeys = abi.encodePacked(
            invalidAllowedKey,
            validAllowedKeys
        );
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidShorterCBAInTheMiddle(
        uint16 elementLength
    ) public view {
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
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidShorterCBAAtTheEnd(
        uint16 elementLength
    ) public view {
        uint8 numberBetween1and32 = uint8((elementLength % 32) + 1); // +1 to avoid having 0
        bytes memory validAllowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 - 1
        );
        bytes memory allowedKeys = abi.encodePacked(
            validAllowedKeys,
            invalidAllowedKey
        );
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
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
        bytes memory allowedKeys = abi.encodePacked(
            invalidAllowedKey,
            validAllowedKeys
        );
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidBiggerCBAInTheMiddle(
        uint16 elementLength
    ) public view {
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
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
    }

    function testIsCBAOfAllowedERC725YDataKeysWithInvalidBiggerCBAAtTheEnd(
        uint16 elementLength
    ) public view {
        uint8 numberBetween1and32 = uint8((elementLength % 31) + 1); // +1 to avoid having 0
        bytes memory validAllowedKeys = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32
        );
        bytes memory invalidAllowedKey = _generateElementCBA(
            numberBetween1and32,
            numberBetween1and32 + 1
        );
        bytes memory allowedKeys = abi.encodePacked(
            validAllowedKeys,
            invalidAllowedKey
        );
        assert(
            !LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedKeys)
        );
    }

    function _generateElementCBA(
        uint16 elementLength,
        uint16 officialElementLength
    ) internal view returns (bytes memory) {
        bytes memory elementBytes = _generateRandomBytes(elementLength);
        bytes2 elementLengthToBytes2 = bytes2(uint16(officialElementLength));
        bytes memory elementCBA = abi.encodePacked(
            elementLengthToBytes2,
            elementBytes
        );
        return elementCBA;
    }

    function testCombinePermissions(
        bytes32 firstPermission,
        bytes32 secondPermission,
        bytes32 thirdPermission,
        bytes32 fourthPermission
    ) public pure {
        bytes32 combinedPermissions = firstPermission |
            secondPermission |
            thirdPermission |
            fourthPermission;

        bytes32[] memory permissionsList = new bytes32[](4);
        permissionsList[0] = firstPermission;
        permissionsList[1] = secondPermission;
        permissionsList[2] = thirdPermission;
        permissionsList[3] = fourthPermission;

        assert(
            combinedPermissions == LSP6Utils.combinePermissions(permissionsList)
        );
    }

    function testCombinePermissionsWithSamePermissionListedTwice() public pure {
        bytes32[] memory permissionsList = new bytes32[](2);

        permissionsList[0] = _PERMISSION_STATICCALL;
        permissionsList[1] = _PERMISSION_STATICCALL;

        // CHECK that if the same permission is mentioned twice in the array param, it results
        // in the same permission and not something else
        assert(
            LSP6Utils.combinePermissions(permissionsList) ==
                _PERMISSION_STATICCALL
        );
    }

    function testCombinePermissionsWithMultiplePermissionListedMultipleTimes()
        public
        pure
    {
        bytes32[] memory permissionsList = new bytes32[](7);

        permissionsList[0] = _PERMISSION_STATICCALL;
        permissionsList[1] = _PERMISSION_STATICCALL;
        permissionsList[2] = _PERMISSION_TRANSFERVALUE;
        permissionsList[3] = _PERMISSION_TRANSFERVALUE;
        permissionsList[4] = _PERMISSION_TRANSFERVALUE;
        permissionsList[5] = _PERMISSION_SETDATA;
        permissionsList[6] = _PERMISSION_SIGN;

        bytes32 expectedResult = _PERMISSION_STATICCALL |
            _PERMISSION_TRANSFERVALUE |
            _PERMISSION_SETDATA |
            _PERMISSION_SIGN;

        assert(LSP6Utils.combinePermissions(permissionsList) == expectedResult);
    }

    function testHasPermissionShouldReturnTrueToAllRegularPermission(
        uint256 randomNumber
    ) public pure {
        // number between 1 and 17 (number of permissions with non regulars)
        uint8 numberOfPermissions = uint8((randomNumber % 18) + 1);

        bytes32[19] memory normalPermissions = [
            _PERMISSION_CHANGEOWNER,
            _PERMISSION_ADDCONTROLLER,
            _PERMISSION_EDITPERMISSIONS,
            _PERMISSION_ADDEXTENSIONS,
            _PERMISSION_CHANGEEXTENSIONS,
            _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE,
            _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE,
            _PERMISSION_SUPER_TRANSFERVALUE,
            _PERMISSION_TRANSFERVALUE,
            _PERMISSION_SUPER_CALL,
            _PERMISSION_CALL,
            _PERMISSION_SUPER_STATICCALL,
            _PERMISSION_STATICCALL,
            _PERMISSION_DEPLOY,
            _PERMISSION_SUPER_SETDATA,
            _PERMISSION_SETDATA,
            _PERMISSION_ENCRYPT,
            _PERMISSION_DECRYPT,
            _PERMISSION_SIGN
        ];

        bytes32[] memory dynamicPermissionsArray = new bytes32[](
            numberOfPermissions
        );

        for (uint256 i = 0; i < numberOfPermissions; i++) {
            dynamicPermissionsArray[i] = (normalPermissions[i]);
        }

        bytes32[] memory randomPermissionsPicked = _randomPermissions(
            dynamicPermissionsArray,
            numberOfPermissions
        );

        bytes32 combinedPermissions = LSP6Utils.combinePermissions(
            randomPermissionsPicked
        );

        assert(
            LSP6Utils.hasPermission(
                ALL_REGULAR_PERMISSIONS,
                combinedPermissions
            )
        );
    }

    function testHasPermissionShouldReturnFalseToAllRegularPermissionWithNonRegularPermission(
        uint256 randomNumber
    ) public {
        // number between 2 and 20 (number of permissions with non regulars)
        uint8 numberOfPermissions = uint8((randomNumber % 19) + 2);

        bytes32[19] memory normalPermissions = [
            _PERMISSION_CHANGEOWNER,
            _PERMISSION_ADDCONTROLLER,
            _PERMISSION_EDITPERMISSIONS,
            _PERMISSION_ADDEXTENSIONS,
            _PERMISSION_CHANGEEXTENSIONS,
            _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE,
            _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE,
            _PERMISSION_SUPER_TRANSFERVALUE,
            _PERMISSION_TRANSFERVALUE,
            _PERMISSION_SUPER_CALL,
            _PERMISSION_CALL,
            _PERMISSION_SUPER_STATICCALL,
            _PERMISSION_STATICCALL,
            _PERMISSION_DEPLOY,
            _PERMISSION_SUPER_SETDATA,
            _PERMISSION_SETDATA,
            _PERMISSION_ENCRYPT,
            _PERMISSION_DECRYPT,
            _PERMISSION_SIGN
        ];

        bytes32[] memory dynamicNormalPermissionsArray = new bytes32[](
            normalPermissions.length
        );

        for (uint256 i = 0; i < normalPermissions.length; i++) {
            dynamicNormalPermissionsArray[i] = (normalPermissions[i]);
        }

        bytes32[3] memory nonRegularPermissions = [
            _PERMISSION_REENTRANCY,
            _PERMISSION_DELEGATECALL,
            _PERMISSION_SUPER_DELEGATECALL
        ];

        bytes32[] memory dynamicNonRegularPermissionsArray = new bytes32[](
            nonRegularPermissions.length
        );

        for (uint256 i = 0; i < nonRegularPermissions.length; i++) {
            dynamicNonRegularPermissionsArray[i] = (nonRegularPermissions[i]);
        }

        bytes32[] memory randomPermissionsPicked = _randomMixPermissions(
            dynamicNormalPermissionsArray,
            dynamicNonRegularPermissionsArray,
            numberOfPermissions
        );

        bytes32 combinedPermissions = LSP6Utils.combinePermissions(
            randomPermissionsPicked
        );

        assert(
            !(
                LSP6Utils.hasPermission(
                    combinedPermissions,
                    ALL_REGULAR_PERMISSIONS
                )
            )
        );
    }

    function _randomPermissions(
        bytes32[] memory permissions,
        uint256 randomNumber
    ) internal pure returns (bytes32[] memory) {
        bytes32[] memory pickedPermissions = new bytes32[](randomNumber);

        bytes32[] memory availablePermissions = new bytes32[](
            permissions.length
        );
        for (uint256 i = 0; i < permissions.length; i++) {
            availablePermissions[i] = permissions[i];
        }

        uint256 numPermissions = randomNumber % (permissions.length + 1);

        for (uint256 i = 0; i < numPermissions; i++) {
            uint256 index = randomNumber % availablePermissions.length;
            pickedPermissions[i] = (availablePermissions[index]);
            delete availablePermissions[index];
            availablePermissions = new bytes32[](
                availablePermissions.length - 1
            );
        }
        return pickedPermissions;
    }

    // Returns an array of randomly selected permissions, including at least one non-regular permission.
    function _randomMixPermissions(
        bytes32[] memory normalPermissions,
        bytes32[] memory nonRegularPermissions,
        uint256 totalPermissions
    ) internal returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](totalPermissions);
        uint256 normalPermissionsCount = normalPermissions.length;
        uint256 nonRegularPermissionsCount = nonRegularPermissions.length;

        // Ensure at least one non-regular permission is included
        if (totalPermissions > 0 && nonRegularPermissionsCount > 0) {
            uint256 index = uint256(
                keccak256(abi.encodePacked(block.timestamp))
            ) % nonRegularPermissionsCount;
            result[0] = nonRegularPermissions[index];
            selectedPermissions[nonRegularPermissions[index]] = true;
        }

        uint256 count = 1;
        while (count < totalPermissions) {
            uint256 index = uint256(
                keccak256(abi.encodePacked(block.timestamp))
            ) % (normalPermissionsCount + nonRegularPermissionsCount);
            bytes32 selectedPermission;
            if (index < normalPermissionsCount) {
                selectedPermission = normalPermissions[index];
            } else {
                selectedPermission = nonRegularPermissions[
                    index - normalPermissionsCount
                ];
            }

            if (!selectedPermissions[selectedPermission]) {
                result[count] = selectedPermission;
                selectedPermissions[selectedPermission] = true;
            }
            count++;
        }
        return result;
    }

    function _generateAllowedCalls(
        uint8 numberOfAllowedCalls,
        uint8 allowedCallLength
    ) internal view returns (bytes memory) {
        bytes memory allowedCalls;
        for (uint8 i = 0; i < numberOfAllowedCalls; i++) {
            bytes4 callTypes = 0x000000ff;
            uint256 allowedCallLengthWithCallTypesLength = allowedCallLength +
                4;
            bytes memory allowedCall = _generateRandomBytes(allowedCallLength);
            bytes memory allowedCallallowedCalls = abi.encodePacked(
                bytes2(uint16(allowedCallLengthWithCallTypesLength)),
                callTypes,
                allowedCall
            );
            allowedCalls = abi.encodePacked(
                allowedCalls,
                allowedCallallowedCalls
            );
        }
        return allowedCalls;
    }

    function _generateRandomBytes(
        uint16 length
    ) internal view returns (bytes memory) {
        bytes memory bytesArray = new bytes(length);
        for (uint8 i = 0; i < length; i++) {
            bytesArray[i] = bytes1(
                uint8(
                    uint256(
                        keccak256(
                            abi.encodePacked(block.timestamp, block.difficulty)
                        )
                    ) % (i + 1)
                )
            );
        }
        return bytesArray;
    }
}
