// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// Testing utilities
import "forge-std/Test.sol";
import {UniversalProfile} from "@lukso/universalprofile-contracts/contracts/UniversalProfile.sol";
import {LSP6KeyManager} from "@lukso/lsp6-contracts/contracts/LSP6KeyManager.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP14Ownable2Step as ILSP14} from "@lukso/lsp14-contracts/contracts/ILSP14Ownable2Step.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";
import {LSP6Utils} from "@lukso/lsp6-contracts/contracts/LSP6Utils.sol";

// constants
import "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import "@lukso/lsp6-contracts/contracts/LSP6Constants.sol";
import "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";

// errors
import {InvalidEncodedAllowedERC725YDataKeys} from "@lukso/lsp6-contracts/contracts/LSP6Errors.sol";

/// @dev Fuzzing tests to ensure that the expect revert errors from the Key Manager
/// are also caught via the `LSP20` verification functions
contract LSP20SetDataTest is Test {
    using BytesLib for bytes;

    UniversalProfile account;
    LSP6KeyManager keyManager;

    function setUp() public {
        account = new UniversalProfile(address(this));
        keyManager = new LSP6KeyManager(address(account));
    }

    // Test for `AddressPermissions:AllowedERC725YDataKeys:<controller>` == `[0x0000]
    /// forge-config: default.allow_internal_expect_revert = true
    function test_RevertWhenListOfAllowedERC725YDataKeyIs0x0000(
        bytes32 dataKey
    ) public {
        // dataKey cannot be LSP1, LSP6, or LSP17 data key
        vm.assume(bytes16(dataKey) != _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX);
        vm.assume(bytes6(dataKey) != _LSP6KEY_ADDRESSPERMISSIONS_PREFIX);
        vm.assume(bytes12(dataKey) != _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX);
        vm.assume(dataKey != _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        vm.assume(bytes12(dataKey) != _LSP17_EXTENSION_PREFIX);

        // bytes32 dataKey = bytes32(
        //     0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe
        // );

        // Give owner ability to transfer ownership
        bytes32 ownerDataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(address(this))
        );
        account.setData(ownerDataKey, bytes.concat(_PERMISSION_CHANGEOWNER));

        // Set permissions and allowed data keys for malicious address
        address malicious = vm.addr(1234);

        bytes32 permissionsDataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(malicious)
        );
        bytes32 allowedERC725YDataKeysDataKey = LSP2Utils
            .generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
                bytes20(malicious)
            );

        account.setData(
            permissionsDataKey,
            bytes.concat(_PERMISSION_SETDATA | _PERMISSION_CHANGEOWNER)
        );

        // set `0x0000` in the list of AllowedERC725YDataKeys of the controller
        // this correspond to a bytes[CompactBytesArray] with only one entry
        // where the length of this single `bytes` entry is `0`
        account.setData(allowedERC725YDataKeysDataKey, bytes.concat(bytes2(0)));

        // Setup KeyManager as the owner of the account
        account.transferOwnership(address(keyManager));

        vm.prank(address(this));
        keyManager.execute(bytes.concat(ILSP14.acceptOwnership.selector));

        assertEq(account.owner(), address(keyManager));

        // Verify malicious can set data for most data keys
        bytes memory callData = abi.encodeCall(
            IERC725Y.setData,
            (dataKey, hex"cafecafe")
        );

        bytes memory expectedError = abi.encodeWithSelector(
            InvalidEncodedAllowedERC725YDataKeys.selector,
            bytes.concat(bytes2(0)),
            "couldn't DECODE from storage"
        );

        vm.startPrank(malicious);

        // CHECK the LSP20 verification function reverts as well
        vm.expectRevert(expectedError);
        keyManager.lsp20VerifyCall(
            malicious,
            address(account),
            malicious,
            0,
            callData
        );

        // CHECK it reverts when calling directly the Universal Profile
        vm.expectRevert(expectedError);
        account.setData(dataKey, hex"cafecafe");

        vm.stopPrank();
    }

    // Test for
    //
    // ```
    // AddressPermissions:AllowedERC725YDataKeys:<controller> == [
    //     allowedDataKey1,
    //     allowedDataKey2,
    //     0x0000,
    //     allowedDataKey3,
    //     ...
    // ]
    /// forge-config: default.fuzz.runs = 200
    function test_RevertWhenListOfAllowedERC725YDataKeyContains0x0000(
        bytes[] memory dynamicAllowedERC725YDataKeys,
        bytes32 dataKey
    ) public {
        // we set below the 0x0000 value in the middle of the encoded list at index ii = 2
        // therefore we need at least 3 entries in the list
        vm.assume(
            dynamicAllowedERC725YDataKeys.length >= 3 &&
                dynamicAllowedERC725YDataKeys.length <= 10
        );

        // dataKey cannot be LSP1, LSP6, or LSP17 data key
        vm.assume(bytes16(dataKey) != _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX);
        vm.assume(bytes6(dataKey) != _LSP6KEY_ADDRESSPERMISSIONS_PREFIX);
        vm.assume(bytes12(dataKey) != _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX);
        vm.assume(dataKey != _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        vm.assume(bytes12(dataKey) != _LSP17_EXTENSION_PREFIX);

        // Exclude from fuzzer input `dataKey` that is not or does not start with the prefix
        // from the first and second entry in the Allowed ERC725Y Data Keys list
        for (uint256 ii = 0; ii < dynamicAllowedERC725YDataKeys.length; ii++) {
            bytes32 allowedDataKeyPadded = bytes32(
                dynamicAllowedERC725YDataKeys[ii]
            );
            vm.assume((allowedDataKeyPadded & dataKey) != allowedDataKeyPadded);
        }

        // Give owner ability to transfer ownership
        bytes32 ownerDataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(address(this))
        );
        account.setData(ownerDataKey, bytes.concat(_PERMISSION_CHANGEOWNER));

        // Set permissions and allowed data keys for malicious address
        address malicious = vm.addr(1234);

        bytes32 permissionsDataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(malicious)
        );
        bytes32 allowedERC725YDataKeysDataKey = LSP2Utils
            .generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
                bytes20(malicious)
            );

        account.setData(
            permissionsDataKey,
            bytes.concat(_PERMISSION_SETDATA | _PERMISSION_CHANGEOWNER)
        );

        // Goal: set a list of AllowedERC725YDataKeys for the controller
        // that includes one `0x0000` entry in the middle

        // 1. generate this malicious list
        bytes memory maliciousCompactBytesArrayOfAllowedERC725YDataKeys = "";

        for (uint256 ii = 0; ii < dynamicAllowedERC725YDataKeys.length; ii++) {
            // We ensure for this test that each data key is dynamic up to 32 bytes
            vm.assume(dynamicAllowedERC725YDataKeys[ii].length <= 32);

            uint16 dynamicDataKeyLength = uint16(
                dynamicAllowedERC725YDataKeys[ii].length
            );

            bytes memory dynamicDataKey = abi.encodePacked(
                dynamicDataKeyLength,
                dynamicAllowedERC725YDataKeys[ii]
            );

            // generate the CompactBytesArray of Allowed ERC725Y Data Keys
            // by recursively adding the entries

            // set one 0 length entry `0x0000` in the middle,
            // as shown in the comment above the function
            if (ii == 2) {
                maliciousCompactBytesArrayOfAllowedERC725YDataKeys = abi
                    .encodePacked(
                        maliciousCompactBytesArrayOfAllowedERC725YDataKeys,
                        hex"0000"
                    );
            } else {
                maliciousCompactBytesArrayOfAllowedERC725YDataKeys = abi
                    .encodePacked(
                        maliciousCompactBytesArrayOfAllowedERC725YDataKeys,
                        dynamicDataKey
                    );
            }
        }

        // Check that we do not have 0x
        vm.assume(
            maliciousCompactBytesArrayOfAllowedERC725YDataKeys.length > 0
        );

        // 2. set this list of malicious Allowed ERC725Y Data Keys
        account.setData(
            allowedERC725YDataKeysDataKey,
            maliciousCompactBytesArrayOfAllowedERC725YDataKeys
        );

        // Setup KeyManager as the owner of the account
        account.transferOwnership(address(keyManager));

        vm.prank(address(this));
        keyManager.execute(bytes.concat(ILSP14.acceptOwnership.selector));

        assertEq(account.owner(), address(keyManager));

        bytes memory callData = abi.encodeCall(
            IERC725Y.setData,
            (dataKey, hex"deadbeef")
        );

        vm.startPrank(malicious);

        bytes memory expectedError = abi.encodeWithSelector(
            InvalidEncodedAllowedERC725YDataKeys.selector,
            maliciousCompactBytesArrayOfAllowedERC725YDataKeys,
            "couldn't DECODE from storage"
        );

        // CHECK the LSP20 verification function reverts as well
        vm.expectRevert(expectedError);
        keyManager.lsp20VerifyCall(
            malicious,
            address(account),
            malicious,
            0,
            callData
        );

        // CHECK it reverts when calling directly the Universal Profile
        vm.expectRevert(expectedError);
        account.setData(dataKey, hex"deadbeef");

        vm.stopPrank();
    }
}
