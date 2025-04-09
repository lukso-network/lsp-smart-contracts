// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "forge-std/Test.sol";
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {LSP6KeyManager} from "../contracts/LSP6KeyManager.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";
import {LSP6Utils} from "../contracts/LSP6Utils.sol";

// constants
import "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import "../contracts/LSP6Constants.sol";
import "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";

// errors
import {
    InvalidEncodedAllowedERC725YDataKeys
} from "../contracts/LSP6Errors.sol";

contract LSP6SetDataTest is Test {
    using BytesLib for bytes;

    ERC725 account;
    LSP6KeyManager keyManager;

    function setUp() public {
        account = new ERC725(address(this));
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
        vm.assume(bytes12(dataKey) != _LSP17_EXTENSION_PREFIX);

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
        assertEq(account.owner(), address(keyManager));

        // Verify malicious can set data for most data keys
        bytes memory functionArgs = abi.encode(dataKey, hex"cafecafe");
        bytes memory callData = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            functionArgs
        );

        vm.startPrank(malicious);

        // CHECK it reverts when calling via the Key Manager
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidEncodedAllowedERC725YDataKeys.selector,
                bytes.concat(bytes2(0)),
                "couldn't DECODE from storage"
            )
        );
        keyManager.execute(callData);

        // // CHECK the LSP20 verification function reverts as well
        // vm.expectRevert();
        // keyManager.lsp20VerifyCall(
        //     malicious,
        //     address(account),
        //     malicious,
        //     0,
        //     functionArgs
        // );

        // // CHECK it reverts when calling directly the Universal Profile
        // vm.expectRevert();
        // account.setData(dataKey, dataValue);

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
        bytes32 dataKey,
        bytes memory dataValue
    ) public {
        // we set below the 0x0000 value in the middle of the encoded list at index ii = 2
        // therefore we need at least 3 entries in the list
        vm.assume(dynamicAllowedERC725YDataKeys.length >= 3);

        // dataKey cannot be LSP1, LSP6, or LSP17 data key
        vm.assume(bytes16(dataKey) != _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX);
        vm.assume(bytes6(dataKey) != _LSP6KEY_ADDRESSPERMISSIONS_PREFIX);
        vm.assume(bytes12(dataKey) != _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX);
        vm.assume(bytes12(dataKey) != _LSP17_EXTENSION_PREFIX);

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
        assertEq(account.owner(), address(keyManager));

        // Verify malicious address cannot set data for most data keys
        bytes memory functionArgs = abi.encode(dataKey, dataValue);
        bytes memory callData = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            functionArgs
        );

        vm.startPrank(malicious);

        // CHECK it reverts when calling via the Key Manager
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidEncodedAllowedERC725YDataKeys.selector,
                maliciousCompactBytesArrayOfAllowedERC725YDataKeys,
                "couldn't DECODE from storage"
            )
        );
        keyManager.execute(callData);

        // TODO: decide what to do with these functions and where to put them
        // CHECK the LSP20 verification function reverts as well
        // vm.expectRevert();
        // keyManager.lsp20VerifyCall(
        //     malicious,
        //     address(account),
        //     malicious,
        //     0,
        //     functionArgs
        // );

        // CHECK it reverts when calling directly the Universal Profile
        // account.setData(dataKey, dataValue);

        vm.stopPrank();
    }
}
