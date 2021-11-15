// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// interfaces
import "./ILSP1UniversalReceiverDelegate.sol";
import "../LSP6KeyManager/ILSP6KeyManager.sol";

// libraries
import "@erc725/smart-contracts/contracts/utils/ERC725Utils.sol";

// constants
import "./LSP1Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

interface ILSPToken {
    function balanceOf(address _addr) external view returns (uint256);
}

/**
 * @title Core Implementation of contract writing the received LSP7 and LSP8 assets into your ERC725Account using
 *        the LSP5-ReceivedAsset standard and removing the sent assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
abstract contract LSP1UniversalReceiverDelegateCore is ILSP1UniversalReceiverDelegate, ERC165Storage {
    using ERC725Utils for IERC725Y;

    /* solhint-disable no-inline-assembly */

    /**
     * @dev allows to register arrayKeys and Map of incoming assets and remove them on balance = 0
     * @param sender token address
     * @param typeId token hooks
     * @param data concatenated data about token transfer
     * @return result the return value of keyManager's execute function
     */
    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) public override returns (bytes memory result) {
        address keyManagerAddress = ERC725Y(msg.sender).owner();
        bytes32 lsp5MapKey = _generateMapKey(abi.encodePacked(sender));

        // check if receiving tokens
        if (typeId == _LSP7TOKENSRECIPIENT_TYPE_ID || typeId == _LSP8TOKENSRECIPIENT_TYPE_ID) {
            bytes memory lsp5MapValue = IERC725Y(msg.sender).getDataSingle(lsp5MapKey);

            // Check if the Map is not registred
            if (lsp5MapValue.length != 12) {
                bytes memory payload = _addToken(lsp5MapKey, sender, typeId);
                result = ILSP6KeyManager(keyManagerAddress).execute(payload);
            }

            // check if sending tokens
        } else if (typeId == _LSP7TOKENSSENDER_TYPE_ID || typeId == _LSP8TOKENSSENDER_TYPE_ID) {
            // extracting the initial balance
            uint256 balance = ILSPToken(sender).balanceOf(msg.sender);
            uint256 amount;

            if (typeId == _LSP7TOKENSSENDER_TYPE_ID) {
                // extracting the amount of tokens sent
                assembly {
                    amount := mload(add(add(data, 0x20), 0x28))
                }
            } else {
                amount = 1; // amount sent in LSP8 is 1 (1 tokenId)
            }

            if ((balance - amount) == 0) {
                bytes memory payload = _removeToken(typeId, lsp5MapKey);
                result = ILSP6KeyManager(keyManagerAddress).execute(payload);
            }
        } else {
            return "";
        }
    }

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
    /* solhint-enable */
}
