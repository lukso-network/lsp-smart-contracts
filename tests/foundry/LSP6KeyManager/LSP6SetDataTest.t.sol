// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "forge-std/Test.sol";
import "../../../contracts/UniversalProfile.sol";
import "../../../contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";
import "../../../contracts/LSP6KeyManager/LSP6KeyManager.sol";
import "../../../contracts/LSP14Ownable2Step/ILSP14Ownable2Step.sol";
import "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {
    LSP2Utils
} from "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6Utils} from "../../../contracts/LSP6KeyManager/LSP6Utils.sol";

import "../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import "../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import "../../../contracts/LSP17ContractExtension/LSP17Constants.sol";

contract LSP6SetDataTest is Test {
    using BytesLib for bytes;

    UniversalProfile universalProfile;
    LSP1UniversalReceiverDelegateUP LSP1Delegate;
    LSP6KeyManager keyManager;

    function setUp() public {
        universalProfile = new UniversalProfile(address(this));
        keyManager = new LSP6KeyManager(address(universalProfile));
        LSP1Delegate = new LSP1UniversalReceiverDelegateUP();
        universalProfile.setData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY,
            bytes.concat(bytes20(address(LSP1Delegate)))
        );
    }

    // Test for `AddressPermissions:AllowedERC725YDataKeys:<controller>` == `[0x0000]
    function testFail_RevertWhenListOfAllowedERC725YDataKeyIs0x0000(
        bytes32 dataKey,
        bytes memory dataValue
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
        universalProfile.setData(
            ownerDataKey,
            bytes.concat(_PERMISSION_CHANGEOWNER)
        );

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

        universalProfile.setData(
            permissionsDataKey,
            bytes.concat(_PERMISSION_SETDATA | _PERMISSION_CHANGEOWNER)
        );

        // set `0x0000` in the list of AllowedERC725YDataKeys of the controller
        // this correspond to a bytes[CompactBytesArray] with only one entry
        // where the length of this single `bytes` entry is `0`
        universalProfile.setData(
            allowedERC725YDataKeysDataKey,
            bytes.concat(bytes2(0))
        );

        // Setup KeyManager as the owner of the universalProfile
        universalProfile.transferOwnership(address(keyManager));
        bytes memory payload = abi.encodeWithSelector(
            ILSP14Ownable2Step.acceptOwnership.selector,
            ""
        );
        keyManager.execute(payload);
        assert(universalProfile.owner() == address(keyManager));

        // Verify malicious can set data for most data keys
        bytes memory functionArgs = abi.encode(dataKey, dataValue);
        bytes memory callData = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            functionArgs
        );

        // CHECK it reverts when calling via the Key Manager
        keyManager.execute(callData);

        // CHECK the LSP20 verification function reverts as well
        keyManager.lsp20VerifyCall(
            malicious,
            address(universalProfile),
            malicious,
            0,
            functionArgs
        );

        // CHECK it reverts when calling directly the Universal Profile
        universalProfile.setData(dataKey, dataValue);
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
    function testFail_RevertWhenListOfAllowedERC725YDataKeyContains0x0000(
        bytes[] memory dynamicAllowedERC725YDataKeys,
        bytes32 dataKey,
        bytes memory dataValue
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
        universalProfile.setData(
            ownerDataKey,
            bytes.concat(_PERMISSION_CHANGEOWNER)
        );

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

        universalProfile.setData(
            permissionsDataKey,
            bytes.concat(_PERMISSION_SETDATA | _PERMISSION_CHANGEOWNER)
        );

        // Goal: set a list of AllowedERC725YDataKeys for the controller
        // that includes one `0x0000` entry in the middle

        // 1. generate this malicious list
        bytes memory maliciousCompactBytesArrayOfAllowedERC725YDataKeys = "";

        for (uint256 ii = 0; ii < dynamicAllowedERC725YDataKeys.length; ii++) {
            // We ensure for this test that each data key is dynamic up to 32 bytes
            assert(dynamicAllowedERC725YDataKeys[ii].length <= 32);

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

        // 2. set this list of malicious Allowed ERC725Y Data Keys
        universalProfile.setData(
            allowedERC725YDataKeysDataKey,
            maliciousCompactBytesArrayOfAllowedERC725YDataKeys
        );

        // Setup KeyManager as the owner of the universalProfile
        universalProfile.transferOwnership(address(keyManager));
        bytes memory payload = abi.encodeWithSelector(
            ILSP14Ownable2Step.acceptOwnership.selector,
            ""
        );
        keyManager.execute(payload);
        assert(universalProfile.owner() == address(keyManager));

        // Verify malicious can set data for most data keys
        bytes memory functionArgs = abi.encode(dataKey, dataValue);
        bytes memory callData = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            functionArgs
        );

        // CHECK it reverts when calling via the Key Manager
        keyManager.execute(callData);

        // CHECK the LSP20 verification function reverts as well
        keyManager.lsp20VerifyCall(
            malicious,
            address(universalProfile),
            malicious,
            0,
            functionArgs
        );

        // CHECK it reverts when calling directly the Universal Profile
        universalProfile.setData(dataKey, dataValue);
    }
}
