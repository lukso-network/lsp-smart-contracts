// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

import "../LSP0ERC725Account/LSP0ERC725AccountBisCore.sol";
import {LSP1Utils} from "./LSP1Utils.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {UtilsLib} from "../Utils/UtilsLib.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./ILSP1UniversalReceiverDelegate.sol";
import {_INTERFACEID_LSP1_DELEGATE} from "./LSP1Constants.sol";

import {_TYPEID_LSP7_TOKENSSENDER, _TYPEID_LSP7_TOKENSRECIPIENT} from "../LSP7DigitalAsset/LSP7Constants.sol";
import {_TYPEID_LSP8_TOKENSSENDER, _TYPEID_LSP8_TOKENSRECIPIENT} from "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import {_TYPEID_LSP9_VAULTSENDER, _TYPEID_LSP9_VAULTRECIPIENT} from "../LSP9Vault/LSP9Constants.sol";
contract UniversalReceiverDelegateUP is ILSP1UniversalReceiverDelegate, ERC165, LSP0ERC725AccountBisCore {

    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) public virtual override returns (bytes memory result) {
        if (
            typeId == _TYPEID_LSP7_TOKENSSENDER ||
            typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP8_TOKENSSENDER ||
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP9_VAULTSENDER ||
            typeId == _TYPEID_LSP9_VAULTRECIPIENT
        ) {
            result = _tokenAndVaultHandling(sender, typeId);            
        }
    }

    function _tokenAndVaultHandling(address _sender, bytes32 _typeId) internal returns (bytes memory result_) {
        // 1. get transfer details using LSP1Utils
        (
            bool senderHook,
            bytes32 arrayKey,
            bytes12 mapPrefix,
            bytes4 interfaceId
        ) = LSP1Utils.getTransferDetails(_typeId);

        // 2. create the map key with LSP2Utils 
        bytes32 mapKey = LSP2Utils.generateBytes20MappingWithGroupingKey(
            mapPrefix,
            bytes20(_sender)
        );
        // + retrieve the map value from the ERC725Y key-value store
        bytes memory mapValue = _getData(mapKey);

        // 3. if it's not the sender hook
        if (!senderHook) {
            // if the map is already set, then do nothing
            if (bytes12(mapValue) != bytes12(0)) return "";

            _addMapAndArrayKeys(arrayKey, mapKey, _sender, interfaceId);

        // 4. if it's the sender hook
        } else if (senderHook) {
            // if there is no map for the asset to remove, then do nothing
            if (bytes12(mapValue) == bytes12(0)) return "";

            _removeMapAndArrayKeys(arrayKey, mapPrefix, mapKey);
        }
    }

    function _addMapAndArrayKeys(bytes32 arrayKey, bytes32 mapKey, address _sender, bytes4 interfaceId) internal returns (bytes memory) {
            // bytes32[] memory keys = new bytes32[](3);
            // bytes[] memory values = new bytes[](3);

            bytes memory rawArrayLength = _getData(arrayKey);

            // keys[0] = arrayKey;
            // keys[2] = mapKey;

            // values[1] = UtilsLib.addressToBytes(_sender);

            if (rawArrayLength.length != 32) {
                // keys[1] = LSP2Utils.generateArrayKeyAtIndex(arrayKey, 0);
                bytes32 arrayIndexKey = LSP2Utils.generateArrayKeyAtIndex(arrayKey, 0);
                store[arrayIndexKey] = UtilsLib.addressToBytes(_sender);

                // values[0] = UtilsLib.uint256ToBytes(1);
                store[arrayKey] = UtilsLib.uint256ToBytes(1);

                // values[2] = bytes.concat(bytes8(0), interfaceId);
                store[mapKey] = bytes.concat(bytes8(0), interfaceId);
                

            } else if (rawArrayLength.length == 32) {
                uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
                uint256 newArrayLength = arrayLength + 1;

                // keys[1] = LSP2Utils.generateArrayKeyAtIndex(
                //     arrayKey,
                //     newArrayLength - 1
                // );
                bytes32 arrayIndexKey = LSP2Utils.generateArrayKeyAtIndex(
                    arrayKey,
                    newArrayLength - 1
                );
                store[arrayIndexKey] = UtilsLib.addressToBytes(_sender);

                // values[0] = UtilsLib.uint256ToBytes(newArrayLength);
                store[arrayKey] = UtilsLib.uint256ToBytes(newArrayLength);
                
                // values[2] = bytes.concat(bytes8(uint64(arrayLength)), interfaceId);
                store[mapKey] = bytes.concat(bytes8(uint64(arrayLength)), interfaceId);
            }

            // store[keys[0]] = values[0];
            // store[keys[1]] = values[1];
            // store[keys[2]] = values[2];
    }

    function _removeMapAndArrayKeys(bytes32 arrayKey, bytes12 mapPrefix, bytes32 mapKey) internal returns (bytes memory) {
            // extractIndexFromMap
            bytes memory mapValue = _getData(mapKey);
            bytes memory val = BytesLib.slice(mapValue, 0, 8);
            uint64 index = BytesLib.toUint64(val, 0);

            // removeMapAndArrayKey
            bytes32 arrayKeyToRemove = LSP2Utils.generateArrayKeyAtIndex(
                arrayKey,
                index
            );

            bytes memory rawArrayLength = _getData(arrayKey);

            uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
            uint256 newLength = arrayLength - 1;

            if (index == (arrayLength - 1)) {
                // bytes32[] memory keys = new bytes32[](3);
                // bytes[] memory values = new bytes[](3);

                // keys[0] = arrayKey;
                // values[0] = UtilsLib.uint256ToBytes(newLength);

                store[arrayKey] = UtilsLib.uint256ToBytes(newLength);

                // keys[1] = mapKey;
                // values[1] = "";

                delete store[mapKey];

                // keys[2] = arrayKeyToRemove;
                // values[2] = "";

                delete store[arrayKeyToRemove];

                // setData(keys, values);
            } else {
                // bytes32[] memory keys = new bytes32[](5);
                // bytes[] memory values = new bytes[](5);

                // keys[0] = arrayKey;
                // values[0] = UtilsLib.uint256ToBytes(newLength);

                store[arrayKey] = UtilsLib.uint256ToBytes(newLength);

                // keys[1] = mapKey;
                // values[1] = "";

                delete store[mapKey];
                
                bytes32 lastKey = LSP2Utils.generateArrayKeyAtIndex(
                    arrayKey,
                    newLength
                );
                
                bytes memory lastKeyValue = _getData(lastKey);
                
                bytes32 mapOfLastkey = LSP2Utils
                    .generateBytes20MappingWithGroupingKey(
                        mapPrefix,
                        bytes20(lastKeyValue)
                );

                bytes memory mapValueOfLastkey = _getData(mapOfLastkey);
                bytes memory appendix = BytesLib.slice(mapValueOfLastkey, 8, 4);

                // keys[2] = arrayKeyToRemove;
                // values[2] = lastKeyValue;

                store[arrayKeyToRemove] = lastKeyValue;

                // keys[3] = lastKey;
                // values[3] = "";

                delete store[lastKey];

                // keys[4] = mapOfLastkey;
                // values[4] = bytes.concat(bytes8(index), appendix);

                store[mapOfLastkey] = bytes.concat(bytes8(index), appendix);
            }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, ERC165Storage)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP1_DELEGATE ||
            super.supportsInterface(interfaceId);
    }
}