// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "../LSP1-UniversalReceiver/ILSP1_UniversalReceiverDelegate.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "../../submodules/ERC725/implementations/contracts/Utils/ERC725Utils.sol";
import "../LSP6-KeyManager/ILSP6_KeyManager.sol";
import "./IERC173.sol";

interface ILSPToken {
    function balanceOf(address _addr) external view returns (uint256);
}

abstract contract UniversalReceiverDelegateCore is ILSP1Delegate, ERC165Storage {
    using ERC725Utils for IERC725Y;

    bytes4 internal constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    bytes32 internal constant _LSP7TOKENSSENDER_TYPE_ID =
        0x40b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e9; // keccak256("LSP7TokensSender")

    bytes32 internal constant _LSP7TOKENSRECIPIENT_TYPE_ID =
        0xdbe2c314e1aee2970c72666f2ebe8933a8575263ea71e5ff6a9178e95d47a26f; // keccak256("LSP7TokensRecipient")

    bytes32 internal constant _LSP8TOKENSSENDER_TYPE_ID =
        0x3724c94f0815e936299cca424da4140752198e0beb7931a6e0925d11bc97544c; // keccak256("LSP8TokensSender")

    bytes32 internal constant _LSP8TOKENSRECIPIENT_TYPE_ID =
        0xc7a120a42b6057a0cbed111fbbfbd52fcd96748c04394f77fc2c3adbe0391e01; // keccak256("LSP8TokensRecipient")

    bytes32 internal constant _LSP5_ASSET_MAP_HASH =
        0x812c4334633eb816c80deebfa5fb7d2509eb438ca1b6418106442cb5ccc62f6c; // keccak256("LSP5ReceivedAssetsMap")

    bytes32 internal constant _LSP5_ARRAY_KEY =
        0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b; // keccak256("LSP5ReceivedAssets[]")

    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) public override returns (bytes memory result) {
        // extracting KeyManager address
        address keyManagerAddress = IERC173(msg.sender).owner();
        bytes32 lsp5MapKey = _generateMapKey(abi.encodePacked(sender));

        // check if receiving tokens
        if (typeId == _LSP7TOKENSRECIPIENT_TYPE_ID || typeId == _LSP8TOKENSRECIPIENT_TYPE_ID) {
            bytes memory lsp5MapValue = IERC725Y(msg.sender).getDataSingle(lsp5MapKey);
            // Check if the Map is not registred
            if (lsp5MapValue.length != 12) {
                bytes memory payload = _addToken(lsp5MapKey, sender, typeId);
                result = ILSP6(keyManagerAddress).execute(payload);
            }

            // check if sending tokens
        } else if (typeId == _LSP7TOKENSSENDER_TYPE_ID || typeId == _LSP8TOKENSSENDER_TYPE_ID) {
            uint256 balance = ILSPToken(sender).balanceOf(msg.sender);
            uint256 amount;
            /* solhint-disable no-inline-assembly */
            if (typeId == _LSP7TOKENSSENDER_TYPE_ID) {
                // extracting the amount of tokens to send
                assembly {
                    amount := mload(add(add(data, 0x20), 0x28)) // 40 = 0x28 in hex
                }
                // amount to send in LSP8 is 1 (1 tokenId)
            } else {
                amount = 1;
            }
            if ((balance - amount) == 0) {
                bytes memory payload = _removeToken(typeId, lsp5MapKey);
                result = ILSP6(keyManagerAddress).execute(payload);
            }
        } else {
            return "";
        }
    } /* solhint-enable */

    // internal functions

    function _addToken(
        bytes32 _lsp5MapKey,
        address _sender,
        bytes32 _typeId
    ) internal view returns (bytes memory payload) {
        bytes32[] memory keys = new bytes32[](3);
        bytes[] memory values = new bytes[](3);
        bytes memory arrayLength = IERC725Y(msg.sender).getDataSingle(_LSP5_ARRAY_KEY);

        keys[0] = _LSP5_ARRAY_KEY;
        keys[2] = _lsp5MapKey;

        values[1] = abi.encodePacked(_sender);

        // check if the array length is not set before
        if (arrayLength.length != 32) {
            keys[1] = _generateArrayKeyAtIndex(0);

            values[0] = abi.encodePacked(uint256(1));
            values[2] = abi.encodePacked(bytes8(0), _getInterfaceIdFor(_typeId));

            // check if the array length is set before
        } else if (arrayLength.length == 32) {
            uint256 lengthOfLSP5Array = abi.decode(arrayLength, (uint256));
            uint256 newLengthOfLSP5Array = lengthOfLSP5Array + 1;

            keys[1] = _generateArrayKeyAtIndex(newLengthOfLSP5Array - 1);

            values[0] = abi.encodePacked(newLengthOfLSP5Array);
            values[2] = abi.encodePacked(
                bytes8(uint64(lengthOfLSP5Array)),
                _getInterfaceIdFor(_typeId)
            );
        }
        // returns payload to execute
        payload = _setDataPayload(keys, values);
    }

    function _removeToken(bytes32 _typeId, bytes32 _mapKeyToRemove)
        internal
        view
        returns (bytes memory payload)
    {
        bytes32[] memory keys = new bytes32[](5);
        bytes[] memory values = new bytes[](5);
        uint64 index = _extractIndexFromMap(_mapKeyToRemove);
        bytes32 arrayKeyToRemove = _generateArrayKeyAtIndex(index);

        bytes memory arrayLength = IERC725Y(msg.sender).getDataSingle(_LSP5_ARRAY_KEY);
        uint256 oldLengthOfLSP5Array = abi.decode(arrayLength, (uint256));
        uint256 newLength = oldLengthOfLSP5Array - 1; // newLength is equal to the index of the last ArrayKey

        // update the length of the array
        keys[0] = _LSP5_ARRAY_KEY;
        values[0] = abi.encodePacked(newLength);

        // deleting the map of the ArrayKey to remove
        keys[1] = _mapKeyToRemove;
        values[1] = "";

        // if the keyToRemove is the last Key in the Array
        if (index == (oldLengthOfLSP5Array - 1)) {
            keys[2] = arrayKeyToRemove;
            values[2] = "";
            // if its not then swap the KeyToRemove with lastKey in the Array
        } else {
            bytes32 lastKey = _generateArrayKeyAtIndex(newLength);
            bytes memory lastKeyValue = IERC725Y(msg.sender).getDataSingle(lastKey);

            keys[2] = arrayKeyToRemove;
            values[2] = lastKeyValue;

            keys[3] = lastKey;
            values[3] = "";

            keys[4] = _generateMapKey(lastKeyValue);
            values[4] = abi.encodePacked(bytes8(index), _getInterfaceIdFor(_typeId));
        }
        // returns payload to execute
        payload = _setDataPayload(keys, values);
    }

    // helper functions

    function _generateBytes32Key(bytes memory _rawKey) internal pure returns (bytes32) {
        bytes32 key;
        /* solhint-disable */
        assembly {
            key := mload(add(_rawKey, 32))
        }
        /* solhint-enable */
        return key;
    }

    function _generateMapKey(bytes memory _sender) internal pure returns (bytes32) {
        bytes memory lsp5AssetMap = abi.encodePacked(
            bytes8(_LSP5_ASSET_MAP_HASH),
            bytes4(0),
            _sender
        );
        return _generateBytes32Key(lsp5AssetMap);
    }

    function _generateArrayKeyAtIndex(uint256 index) internal pure returns (bytes32) {
        bytes memory lsp5ArrayItem = abi.encodePacked(
            bytes16(_LSP5_ARRAY_KEY),
            bytes16(uint128(index))
        );
        return _generateBytes32Key(lsp5ArrayItem);
    }

    function _extractIndexFromMap(bytes32 _lsp5MapKey) internal view returns (uint64) {
        bytes memory indexInBytes = IERC725Y(msg.sender).getDataSingle(_lsp5MapKey);
        bytes8 indexKey;
        /* solhint-disable */
        assembly {
            indexKey := mload(add(indexInBytes, 32))
        }
        /* solhint-enable */
        return uint64(indexKey);
    }

    function _setDataPayload(bytes32[] memory _keys, bytes[] memory _values)
        internal
        pure
        returns (bytes memory _payload)
    {
        _payload = abi.encodeWithSelector(IERC725Y.setData.selector, _keys, _values);
    }

    function _getInterfaceIdFor(bytes32 _typeId) internal pure returns (bytes4) {
        if (_typeId == _LSP7TOKENSSENDER_TYPE_ID || _typeId == _LSP7TOKENSRECIPIENT_TYPE_ID) {
            return 0xe33f65c3;
        } else {
            return 0x49399145;
        }
    }
}
