// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";
import "../../../LSP6KeyManager/LSP6KeyManager.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// interfaces
import "../../../LSP6KeyManager/ILSP6KeyManager.sol";
import "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// libraries
import "../../../Utils/ERC725Utils.sol";
import "../../../LSP5ReceivedAssets/LSP5Utils.sol";

import "../../../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import "../../LSP1Constants.sol";
import "../../../LSP5ReceivedAssets/LSP5Constants.sol";

import "../../../LSP10ReceivedVaults/LSP10Constants.sol";
import "../../../LSP6KeyManager/LSP6Constants.sol";
import "../../../LSP7DigitalAsset/LSP7Constants.sol";
import "../../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../../../LSP9Vault/LSP9Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets and vaults
 */
abstract contract TokenAndVaultHandlingContract {
    using ERC725Utils for IERC725Y;

    function _tokenAndVaultHandling(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) internal returns (bytes memory result) {
        address keyManagerAddress = ERC725Y(msg.sender).owner();
        _profileChecker(keyManagerAddress);

        if (
            ERC165Checker.supportsInterface(
                keyManagerAddress,
                _INTERFACEID_LSP6
            )
        ) {
            (
                bytes32 arrayKey,
                bytes12 mapPrefix,
                bytes4 interfaceID
            ) = _getTransferData(typeId);

            bytes32 mapKey = LSP2Utils.generateBytes20MappingWithGroupingKey(
                mapPrefix,
                bytes20(sender)
            );

            bytes memory mapValue = IERC725Y(msg.sender).getDataSingle(mapKey);

            if (
                typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
                typeId == _TYPEID_LSP8_TOKENSRECIPIENT ||
                typeId == _TYPEID_LSP9_VAULTRECIPIENT
            ) {
                if (bytes12(mapValue) == bytes12(0)) {
                    (bytes32[] memory keys, bytes[] memory values) = LSP5Utils
                        .addMapAndArrayKey(
                            IERC725Y(msg.sender),
                            arrayKey,
                            mapKey,
                            sender,
                            interfaceID
                        );

                    result = _executeViaKeyManager(
                        ILSP6KeyManager(keyManagerAddress),
                        keys,
                        values
                    );
                }
            } else if (
                typeId == _TYPEID_LSP7_TOKENSSENDER ||
                typeId == _TYPEID_LSP8_TOKENSSENDER ||
                typeId == _TYPEID_LSP9_VAULTSENDER
            ) {
                if (bytes12(mapValue) != bytes12(0)) {
                    if (typeId == _TYPEID_LSP9_VAULTSENDER) {
                        (
                            bytes32[] memory keys,
                            bytes[] memory values
                        ) = LSP5Utils.removeMapAndArrayKey(
                                IERC725Y(msg.sender),
                                arrayKey,
                                mapPrefix,
                                mapKey
                            );

                        result = _executeViaKeyManager(
                            ILSP6KeyManager(keyManagerAddress),
                            keys,
                            values
                        );
                    } else if (
                        typeId == _TYPEID_LSP7_TOKENSSENDER ||
                        typeId == _TYPEID_LSP8_TOKENSSENDER
                    ) {
                        uint256 balance = ILSP7DigitalAsset(sender).balanceOf(
                            msg.sender
                        );
                        if ((balance - _tokenAmount(typeId, data)) == 0) {
                            (
                                bytes32[] memory keys,
                                bytes[] memory values
                            ) = LSP5Utils.removeMapAndArrayKey(
                                    IERC725Y(msg.sender),
                                    arrayKey,
                                    mapPrefix,
                                    mapKey
                                );

                            result = _executeViaKeyManager(
                                ILSP6KeyManager(keyManagerAddress),
                                keys,
                                values
                            );
                        }
                    }
                }
            }
        }
    }

    // helper functions

    function _getTransferData(bytes32 _typeId)
        private
        pure
        returns (
            bytes32 _arrayKey,
            bytes12 _mapPrefix,
            bytes4 _interfaceID
        )
    {
        if (
            _typeId == _TYPEID_LSP7_TOKENSSENDER ||
            _typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
            _typeId == _TYPEID_LSP8_TOKENSSENDER ||
            _typeId == _TYPEID_LSP8_TOKENSRECIPIENT
        ) {
            _arrayKey = _LSP5_RECEIVED_ASSETS_ARRAY_KEY;
            _mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            if (
                _typeId == _TYPEID_LSP7_TOKENSSENDER ||
                _typeId == _TYPEID_LSP7_TOKENSRECIPIENT
            ) {
                _interfaceID = _INTERFACEID_LSP7;
            } else {
                _interfaceID = _INTERFACEID_LSP8;
            }
        } else if (
            _typeId == _TYPEID_LSP9_VAULTSENDER ||
            _typeId == _TYPEID_LSP9_VAULTRECIPIENT
        ) {
            _arrayKey = _LSP10_VAULTS_ARRAY_KEY;
            _mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            _interfaceID = _INTERFACEID_LSP9;
        }
    }

    function _executeViaKeyManager(
        ILSP6KeyManager _keyManagerAdd,
        bytes32[] memory _keys,
        bytes[] memory _values
    ) private returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            _keys,
            _values
        );
        result = ILSP6KeyManager(_keyManagerAdd).execute(payload);
    }

    function _tokenAmount(bytes32 _typeId, bytes memory _data)
        private
        pure
        returns (uint256 amount)
    {
        if (_typeId == _TYPEID_LSP7_TOKENSSENDER) {
            /* solhint-disable */
            assembly {
                amount := mload(add(add(_data, 0x20), 0x28))
            }
            /* solhint-enable */
        } else {
            amount = 1;
        }
    }

    function _profileChecker(address keyManagerAddress) private {
        address profileAddress = address(
            LSP6KeyManager(keyManagerAddress).account()
        );
        require(
            profileAddress == msg.sender,
            "Security: The called Key Manager belongs to a different account"
        );
    }
}
