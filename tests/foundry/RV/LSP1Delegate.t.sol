// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import {LSP0ERC725Account} from "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import {
    LSP1UniversalReceiverDelegateUP
} from "../../../contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";
import {LSP2Utils} from "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6KeyManager} from "../../../contracts/LSP6KeyManager/LSP6KeyManager.sol";
import {LSP9Vault} from "../../../contracts/LSP9Vault/LSP9Vault.sol";

// constants
//import {_ERC1271_FAILVALUE} from "../../../contracts/LSP0ERC725Account/LSP0Constants.sol";
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX,
    _LSP5_RECEIVED_ASSETS_ARRAY_KEY
} from "../../../contracts/LSP5ReceivedAssets/LSP5Constants.sol";
import "../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import {
    _INTERFACEID_LSP7,
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT
} from "../../../contracts/LSP7DigitalAsset/LSP7Constants.sol";
import {
    _INTERFACEID_LSP8,
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT
} from "../../../contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import {
    _INTERFACEID_LSP9,
    _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
} from "../../../contracts/LSP9Vault/LSP9Constants.sol";
import {
    _LSP10_VAULTS_MAP_KEY_PREFIX,
    _LSP10_VAULTS_ARRAY_KEY
} from "../../../contracts/LSP10ReceivedVaults/LSP10Constants.sol";

uint256 constant MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
bytes32 constant ALL_PERMISSIONS = bytes32(MAX_UINT256);

contract MockTokenContract {
    uint256 mockBalance;

    constructor(uint256 balance) {
        mockBalance = balance;
    }

    function balanceOf(address) public view returns (uint256) {
        return mockBalance;
    }
}

contract LSP1DelegateTest is Test {
    /*
     * Helper functions for getting data.
     */

    function getPermissionsKey(address controller) private pure returns (bytes32) {
        return
            LSP2Utils.generateMappingWithGroupingKey(
                "AddressPermissions",
                "Permissions",
                controller
            );
    }

    function getUniversalReceiverDelegateKey() private pure returns (bytes32) {
        return _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY;
    }

    /*
     * Helper functions for setting data.
     */

    function setPermissions(
        LSP0ERC725Account account,
        address controller,
        bytes32 permissions
    ) private {
        bytes32 key = getPermissionsKey(controller);
        account.setData(key, abi.encodePacked(permissions));
    }

    function setDataViaKeyManager(
        LSP6KeyManager keyManager,
        bytes32 key,
        bytes memory value
    ) private {
        keyManager.execute(
            abi.encodeWithSelector(bytes4(keccak256("setData(bytes32,bytes)")), key, value)
        );
    }

    function setPermissionsViaKeyManager(
        LSP6KeyManager keyManager,
        address controller,
        bytes32 permissions
    ) private {
        bytes32 key = getPermissionsKey(controller);
        setDataViaKeyManager(keyManager, key, abi.encodePacked(permissions));
    }

    function setArrayLengthViaKeyManager(
        LSP6KeyManager keyManager,
        bytes32 arrayKey,
        uint256 length
    ) private {
        setDataViaKeyManager(keyManager, arrayKey, abi.encodePacked(length));
    }

    function setArrayElementViaKeyManager(
        LSP6KeyManager keyManager,
        bytes32 arrayKey,
        uint128 index,
        bytes memory element
    ) private {
        bytes32 key = LSP2Utils.generateArrayElementKeyAtIndex(arrayKey, index);

        setDataViaKeyManager(keyManager, key, element);
    }

    function setDelegateViaKeyManager(LSP6KeyManager keyManager, address delegate) private {
        bytes32 key = getUniversalReceiverDelegateKey();

        setDataViaKeyManager(keyManager, key, abi.encodePacked(delegate));
    }

    function getMappedVaultKey(address notifier) private pure returns (bytes32) {
        return LSP2Utils.generateMappingKey(_LSP10_VAULTS_MAP_KEY_PREFIX, bytes20(notifier));
    }

    function setMappedVaultViaKeyManager(
        LSP6KeyManager keyManager,
        uint64 index,
        address token
    ) private {
        bytes32 key = getMappedVaultKey(token);
        setDataViaKeyManager(keyManager, key, abi.encodePacked(_INTERFACEID_LSP9, bytes8(index)));
    }

    function setVaultArrayLengthViaKeyManager(LSP6KeyManager keyManager, uint256 length) private {
        setArrayLengthViaKeyManager(keyManager, _LSP10_VAULTS_ARRAY_KEY, length);
    }

    function setVaultViaKeyManager(
        LSP6KeyManager keyManager,
        uint128 index,
        address token
    ) private {
        setArrayElementViaKeyManager(
            keyManager,
            _LSP10_VAULTS_ARRAY_KEY,
            index,
            abi.encodePacked(token)
        );
    }

    function getMappedReceivedAssetKey(address notifier) private pure returns (bytes32) {
        return
            LSP2Utils.generateMappingKey(_LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX, bytes20(notifier));
    }

    function setMappedReceivedAssetViaKeyManager(
        LSP6KeyManager keyManager,
        bytes4 interfaceId,
        uint64 index,
        address token
    ) private {
        bytes32 key = getMappedReceivedAssetKey(token);

        setDataViaKeyManager(keyManager, key, abi.encodePacked(interfaceId, bytes8(index)));
    }

    function setAssetArrayLengthViaKeyManager(LSP6KeyManager keyManager, uint256 length) private {
        setArrayLengthViaKeyManager(keyManager, _LSP5_RECEIVED_ASSETS_ARRAY_KEY, length);
    }

    function setAssetViaKeyManager(
        LSP6KeyManager keyManager,
        uint128 index,
        address token
    ) private {
        setArrayElementViaKeyManager(
            keyManager,
            _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
            index,
            abi.encodePacked(token)
        );
    }

    function acceptOwnershipViaKeyManager(LSP0ERC725Account account, LSP6KeyManager keyManager)
        private
    {
        keyManager.execute(abi.encodeWithSelector(account.acceptOwnership.selector));
    }

    /**
     * - Creates account and key manager.
     * - Gives permissions to the creator and controller address.
     * - Transfers ownership to the key manager.
     */
    function initializeAccountAndKeyManager()
        private
        returns (LSP0ERC725Account account, LSP6KeyManager keyManager)
    {
        account = new LSP0ERC725Account(address(this));
        keyManager = new LSP6KeyManager(address(account));

        setPermissions(account, address(this), ALL_PERMISSIONS);

        account.transferOwnership(address(keyManager));

        // Requires _PERMISSION_CHANGEOWNER
        acceptOwnershipViaKeyManager(account, keyManager);
    }

    function initializeAsset(
        LSP6KeyManager keyManager,
        address owner,
        uint256 balance,
        bool isVault,
        bool isIdentifiable,
        bool isAlreadyRegistered,
        bool isSender
    ) private returns (address notifier, bytes32 typeId) {
        if (isVault) {
            LSP9Vault vault = new LSP9Vault(owner);

            notifier = address(vault);

            if (isAlreadyRegistered) {
                setVaultArrayLengthViaKeyManager(keyManager, 1);
                setVaultViaKeyManager(keyManager, 0, notifier);
                setMappedVaultViaKeyManager(keyManager, 0, notifier);
            }

            typeId = isSender
                ? _TYPEID_LSP9_OwnershipTransferred_SenderNotification
                : _TYPEID_LSP9_OwnershipTransferred_RecipientNotification;
        } else if (isIdentifiable) {
            MockTokenContract token = new MockTokenContract(balance);

            notifier = address(token);

            if (isAlreadyRegistered) {
                setAssetArrayLengthViaKeyManager(keyManager, 1);
                setAssetViaKeyManager(keyManager, 0, notifier);
                setMappedReceivedAssetViaKeyManager(keyManager, _INTERFACEID_LSP8, 0, notifier);
            }

            typeId = isSender ? _TYPEID_LSP8_TOKENSSENDER : _TYPEID_LSP8_TOKENSRECIPIENT;
        } else {
            MockTokenContract token = new MockTokenContract(balance);

            notifier = address(token);

            if (isAlreadyRegistered) {
                setAssetArrayLengthViaKeyManager(keyManager, 1);
                setAssetViaKeyManager(keyManager, 0, notifier);
                setMappedReceivedAssetViaKeyManager(keyManager, _INTERFACEID_LSP7, 0, notifier);
            }

            typeId = isSender ? _TYPEID_LSP7_TOKENSSENDER : _TYPEID_LSP7_TOKENSRECIPIENT;
        }
    }

    function testUniversalReceiverDelegateUP(
        address owner,
        uint256 balance,
        bool isVault,
        bool isIdentifiable,
        bool isAlreadyRegistered,
        bool isSender,
        bytes memory data
    ) public {
        vm.assume(owner > address(0x9));

        (LSP0ERC725Account account1, LSP6KeyManager keyManager1) = initializeAccountAndKeyManager();
        (LSP0ERC725Account account2, LSP6KeyManager keyManager2) = initializeAccountAndKeyManager();

        LSP1UniversalReceiverDelegateUP delegate = new LSP1UniversalReceiverDelegateUP();

        setDelegateViaKeyManager(keyManager1, address(delegate));
        setDelegateViaKeyManager(keyManager2, address(delegate));

        setPermissionsViaKeyManager(keyManager1, address(delegate), _PERMISSION_SUPER_SETDATA);

        // Delegate receives no permission on the second key manager,
        // therefore if it tries to access it the call will revert,
        // causing the test to fail.

        (address notifier, bytes32 typeId) = initializeAsset(
            keyManager1,
            owner,
            balance,
            isVault,
            isIdentifiable,
            isAlreadyRegistered,
            isSender
        );

        vm.prank(notifier);
        bytes memory result = account1.universalReceiver(typeId, data);

        if (!isSender && isAlreadyRegistered) {
            assertEq0(result, abi.encode("LSP1: asset received is already registered", ""));
        } else if (isSender && !isAlreadyRegistered) {
            assertEq0(result, abi.encode("LSP1: asset sent is not registered", ""));
        } else if (!isSender && !isVault && balance == 0) {
            assertEq0(result, abi.encode("LSP1: balance not updated", ""));
        } else if (isSender && !isVault && balance != 0) {
            assertEq0(result, abi.encode("LSP1: full balance is not sent", ""));
        } else {
            assertEq0(result, abi.encode("", ""));
        }
    }
}
