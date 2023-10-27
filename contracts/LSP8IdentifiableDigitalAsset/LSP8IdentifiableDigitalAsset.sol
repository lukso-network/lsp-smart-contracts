// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {
    LSP8IdentifiableDigitalAssetCore
} from "./LSP8IdentifiableDigitalAssetCore.sol";
import {
    LSP4DigitalAssetMetadata
} from "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol";

import {LSP17Extendable} from "../LSP17ContractExtension/LSP17Extendable.sol";

// libraries
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import {_INTERFACEID_LSP8, _LSP8_TOKENID_TYPE_KEY} from "./LSP8Constants.sol";

// errors
import {
    LSP8TokenContractCannotHoldValue,
    LSP8TokenIdTypeNotEditable
} from "./LSP8Errors.sol";

import {
    _LSP17_EXTENSION_PREFIX
} from "../LSP17ContractExtension/LSP17Constants.sol";

// errors

import {
    NoExtensionFoundForFunctionSelector,
    InvalidFunctionSelector,
    InvalidExtensionAddress
} from "../LSP17ContractExtension/LSP17Errors.sol";

/**
 * @title Implementation of a LSP8 Identifiable Digital Asset, a contract that represents a non-fungible token.
 * @author Matthew Stevens
 *
 * @dev Standard implementation contract of the LSP8 standard.
 *
 * Minting and transferring are done by providing a unique `tokenId`.
 * This implementation is agnostic to the way tokens are created.
 * A supply mechanism has to be added in a derived contract using {_mint}
 * For a generic mechanism, see {LSP7Mintable}.
 */
abstract contract LSP8IdentifiableDigitalAsset is
    LSP4DigitalAssetMetadata,
    LSP8IdentifiableDigitalAssetCore,
    LSP17Extendable
{
    /**
     * @notice Deploying a LSP8IdentifiableDigitalAsset with name `name_`, symbol `symbol_`, owned by address `newOwner_`
     * with tokenId type `tokenIdType_`.
     *
     * @dev Deploy a `LSP8IdentifiableDigitalAsset` contract and set the tokenId type inside the ERC725Y storage of the contract.
     * This will also set the token `name_` and `symbol_` under the ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol`.
     *
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param tokenIdType_ The type of tokenIds (= NFTs) that this contract will create.
     * Available options are: NUMBER = `0`; STRING = `1`; UNIQUE_ID = `2`; HASH = `3`; ADDRESS = `4`.
     *
     * @custom:warning Make sure the tokenId type provided on deployment is correct, as it can only be set once
     * and cannot be changed in the ERC725Y storage after the contract has been deployed.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_) {
        LSP4DigitalAssetMetadata._setData(
            _LSP8_TOKENID_TYPE_KEY,
            abi.encode(tokenIdType_)
        );
    }

    // fallback function

    /**
     * @notice The `fallback` function was called with the following amount of native tokens: `msg.value`; and the following calldata: `callData`.
     *
     * @dev Achieves the goal of [LSP-17-ContractExtension] standard by extending the contract to handle calls of functions that do not exist natively,
     * forwarding the function call to the extension address mapped to the function being called.
     *
     * This function is executed when:
     *    - Sending data of length less than 4 bytes to the contract.
     *    - The first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     *    - Receiving native tokens
     *
     * 1. If the data is equal or longer than 4 bytes, the [ERC-725Y] storage is queried with the following data key: [_LSP17_EXTENSION_PREFIX] + `bytes4(msg.sig)` (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *   - If there is no address stored under the following data key, revert with {NoExtensionFoundForFunctionSelector(bytes4)}. The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under. This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.
     *
     *   - If there is an address, forward the `msg.data` to the extension using the CALL opcode, appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`). Return what the calls returns, or revert if the call failed.
     *
     * 2. If the data sent to this function is of length less than 4 bytes (not a function selector), revert.
     */
    // solhint-disable-next-line no-complex-fallback
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        if (msg.data.length < 4) {
            revert InvalidFunctionSelector(callData);
        }
        return _fallbackLSP17Extendable(callData);
    }

    /**
     * @dev Reverts whenever someone tries to send native tokens to a LSP8 contract.
     * @notice LSP8 contract cannot receive native tokens.
     */
    receive() external payable virtual {
        // revert on empty calls with no value
        if (msg.value == 0) {
            revert InvalidFunctionSelector(hex"00000000");
        }

        revert LSP8TokenContractCannotHoldValue();
    }

    /**
     * @dev Forwards the call with the received value to an extension mapped to a function selector.
     *
     * Calls {_getExtensionAndForwardValue} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the address(0) will be returned.
     * We will always forward the value to the extension, as the LSP8 contract is not supposed to hold any native tokens.
     *
     * Reverts if there is no extension for the function being called.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * CALL opcode, passing the {msg.data} appended with the 20 bytes of the {msg.sender} and
     * 32 bytes of the {msg.value}
     *
     * @custom:info The LSP8 Token contract should not hold any native tokens. Any native tokens received by the contract
     * will be forwarded to the extension address mapped to the selector from `msg.sig`.
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        (address extension, ) = _getExtensionAndForwardValue(msg.sig);

        // if no extension was found, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call{value: msg.value}(
            abi.encodePacked(callData, msg.sender, msg.value)
        );

        if (success) {
            return result;
        } else {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }

    /**
     * @dev Returns the extension address stored under the following data key:
     * - {_LSP17_EXTENSION_PREFIX} + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).
     * - If no extension is stored, returns the address(0).
     */
    function _getExtensionAndForwardValue(
        bytes4 functionSelector
    ) internal view virtual override returns (address, bool) {
        // Generate the data key relevant for the functionSelector being called
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension stored under the generated data key
        bytes memory extensionAddress = ERC725YCore._getData(
            mappedExtensionDataKey
        );
        if (extensionAddress.length != 20 && extensionAddress.length != 0)
            revert InvalidExtensionAddress(extensionAddress);

        return (address(bytes20(extensionAddress)), true);
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, ERC725YCore, LSP17Extendable)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP8 ||
            super.supportsInterface(interfaceId) ||
            LSP17Extendable._supportsInterfaceInERC165Extension(interfaceId);
    }

    /**
     * @inheritdoc LSP4DigitalAssetMetadata
     * @dev The ERC725Y data key `_LSP8_TOKENID_TYPE_KEY` cannot be changed
     * once the identifiable digital asset contract has been deployed.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        if (dataKey == _LSP8_TOKENID_TYPE_KEY) {
            revert LSP8TokenIdTypeNotEditable();
        }
        LSP4DigitalAssetMetadata._setData(dataKey, dataValue);
    }
}
