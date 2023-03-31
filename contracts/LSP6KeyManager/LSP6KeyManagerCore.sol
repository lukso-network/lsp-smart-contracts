// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";
import {
    ILSP20CallVerification as ILSP20
} from "../LSP20CallVerification/ILSP20CallVerification.sol";

// modules
import {ILSP14Ownable2Step} from "../LSP14Ownable2Step/ILSP14Ownable2Step.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {LSP6SetDataModule} from "./LSP6Modules/LSP6SetDataModule.sol";
import {LSP6ExecuteModule} from "./LSP6Modules/LSP6ExecuteModule.sol";
import {LSP6OwnershipModule} from "./LSP6Modules/LSP6OwnershipModule.sol";

// libraries
import {GasUtils} from "../Utils/GasUtils.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP6Utils} from "./LSP6Utils.sol";
import {EIP191Signer} from "../Custom/EIP191Signer.sol";

// errors
import {
    BatchExecuteParamsLengthMismatch,
    BatchExecuteRelayCallParamsLengthMismatch,
    LSP6BatchExcessiveValueSent,
    LSP6BatchInsufficientValueSent,
    InvalidPayload,
    InvalidRelayNonce,
    NoPermissionsSet,
    InvalidERC725Function,
    NotAuthorised,
    CallerIsNotTheTarget,
    CannotSendValueToSetData
} from "./LSP6Errors.sol";

// constants
import {
    SETDATA_SELECTOR,
    SETDATA_ARRAY_SELECTOR,
    EXECUTE_SELECTOR,
    EXECUTE_ARRAY_SELECTOR
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_ERC1271,
    _ERC1271_MAGICVALUE,
    _ERC1271_FAILVALUE
} from "../LSP0ERC725Account/LSP0Constants.sol";
import {
    LSP6_VERSION,
    _INTERFACEID_LSP6,
    _PERMISSION_SIGN,
    _PERMISSION_REENTRANCY
} from "./LSP6Constants.sol";

/**
 * @title Core implementation of the LSP6 Key Manager standard.
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev This contract acts as a controller for an ERC725 Account.
 *      Permissions for controllers are stored in the ERC725Y storage of the ERC725 Account and can be updated using `setData(...)`.
 */
abstract contract LSP6KeyManagerCore is
    ERC165,
    ILSP6KeyManager,
    ILSP20,
    LSP6SetDataModule,
    LSP6ExecuteModule,
    LSP6OwnershipModule
{
    using LSP6Utils for *;
    using ECDSA for bytes32;
    using EIP191Signer for address;
    using BytesLib for bytes;

    address internal _target;

    // Variables, methods and modifier used for ReentrancyGuard are taken from the link below and modified accordingly.
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.8/contracts/security/ReentrancyGuard.sol
    bool private _reentrancyStatus;

    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    function target() public view returns (address) {
        return _target;
    }

    /**
     * @inheritdoc ILSP20
     */
    function lsp20VerifyCall(
        address caller,
        uint256 msgValue,
        bytes calldata data
    ) external returns (bytes4) {
        if (msg.sender != _target) revert CallerIsNotTheTarget(msg.sender);

        bool isSetData = false;
        if (bytes4(data) == SETDATA_SELECTOR || bytes4(data) == SETDATA_ARRAY_SELECTOR) {
            isSetData = true;
        }

        _nonReentrantBefore(isSetData, caller);

        _verifyPermissions(caller, msgValue, data);
        emit VerifiedCall(msg.sender, msgValue, bytes4(data));

        // if it's a setData call, do not invoke the `lsp20VerifyCallResult(..)` function
        return
            isSetData
                ? bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"00"))
                : bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"01"));
    }

    /**
     * @inheritdoc ILSP20
     */
    function lsp20VerifyCallResult(
        bytes32, /*callHash*/
        bytes memory /*result*/
    ) external returns (bytes4) {
        if (msg.sender != _target) revert CallerIsNotTheTarget(msg.sender);
        _nonReentrantAfter();
        return ILSP20.lsp20VerifyCallResult.selector;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP6 ||
            interfaceId == _INTERFACEID_ERC1271 ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function getNonce(address from, uint128 channelId) public view returns (uint256) {
        uint256 nonceInChannel = _nonceStore[from][channelId];
        return (uint256(channelId) << 128) | nonceInChannel;
    }

    /**
     * @inheritdoc IERC1271
     */
    function isValidSignature(bytes32 dataHash, bytes memory signature)
        public
        view
        returns (bytes4 magicValue)
    {
        address recoveredAddress = dataHash.recover(signature);

        return (
            ERC725Y(_target).getPermissionsFor(recoveredAddress).hasPermission(_PERMISSION_SIGN)
                ? _ERC1271_MAGICVALUE
                : _ERC1271_FAILVALUE
        );
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(bytes calldata payload) public payable virtual returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(uint256[] calldata values, bytes[] calldata payloads)
        public
        payable
        virtual
        returns (bytes[] memory)
    {
        if (values.length != payloads.length) {
            revert BatchExecuteParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ii = GasUtils.uncheckedIncrement(ii)) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _execute(values[ii], payloads[ii]);
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        bytes calldata payload
    ) public payable virtual returns (bytes memory) {
        return _executeRelayCall(signature, nonce, msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        bytes[] memory signatures,
        uint256[] calldata nonces,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) public payable virtual returns (bytes[] memory) {
        if (
            signatures.length != nonces.length ||
            nonces.length != values.length ||
            values.length != payloads.length
        ) {
            revert BatchExecuteRelayCallParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ii = GasUtils.uncheckedIncrement(ii)) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _executeRelayCall(signatures[ii], nonces[ii], values[ii], payloads[ii]);
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    function _execute(uint256 msgValue, bytes calldata payload)
        internal
        virtual
        returns (bytes memory)
    {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        bool isSetData;
        if (bytes4(payload) == SETDATA_SELECTOR || bytes4(payload) == SETDATA_ARRAY_SELECTOR) {
            isSetData = true;
        }

        _nonReentrantBefore(isSetData, msg.sender);

        _verifyPermissions(msg.sender, msgValue, payload);
        emit VerifiedCall(msg.sender, msgValue, bytes4(payload));

        bytes memory result = _executePayload(msgValue, payload);

        if (!isSetData) {
            _nonReentrantAfter();
        }

        return result;
    }

    function _executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        bytes memory encodedMessage = abi.encodePacked(
            LSP6_VERSION,
            block.chainid,
            nonce,
            msgValue,
            payload
        );

        address signer = address(this).toDataWithIntendedValidator(encodedMessage).recover(
            signature
        );

        bool isSetData;
        if (bytes4(payload) == SETDATA_SELECTOR || bytes4(payload) == SETDATA_ARRAY_SELECTOR) {
            isSetData = true;
        }

        _nonReentrantBefore(isSetData, signer);

        if (!_isValidNonce(signer, nonce)) {
            revert InvalidRelayNonce(signer, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        _verifyPermissions(signer, msgValue, payload);
        emit VerifiedCall(signer, msgValue, bytes4(payload));

        bytes memory result = _executePayload(msgValue, payload);

        if (!isSetData) {
            _nonReentrantAfter();
        }

        return result;
    }

    /**
     * @notice execute the `payload` passed to `execute(...)` or `executeRelayCall(...)`
     * @param payload the abi-encoded function call to execute on the target.
     * @return bytes the result from calling the target with `payload`
     */
    function _executePayload(uint256 msgValue, bytes calldata payload)
        internal
        virtual
        returns (bytes memory)
    {
        (bool success, bytes memory returnData) = _target.call{value: msgValue, gas: gasleft()}(
            payload
        );
        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: failed executing payload"
        );

        return result.length != 0 ? abi.decode(result, (bytes)) : result;
    }

    /**
     * @notice verify the nonce `_idx` for `_from` (obtained via `getNonce(...)`)
     * @dev "idx" is a 256bits (unsigned) integer, where:
     *          - the 128 leftmost bits = channelId
     *      and - the 128 rightmost bits = nonce within the channel
     * @param from caller address
     * @param idx (channel id + nonce within the channel)
     */
    function _isValidNonce(address from, uint256 idx) internal view virtual returns (bool) {
        // idx % (1 << 128) = nonce
        // (idx >> 128) = channel
        // equivalent to: return (nonce == _nonceStore[_from][channel]
        return (idx % (1 << 128)) == (_nonceStore[from][idx >> 128]);
    }

    /**
     * @dev verify if the `from` address is allowed to execute the `payload` on the `target`.
     * @param from either the caller of `execute(...)` or the signer of `executeRelayCall(...)`.
     * @param payload the payload to execute on the `target`.
     */
    function _verifyPermissions(
        address from,
        uint256 msgValue,
        bytes calldata payload
    ) internal view virtual {
        bytes32 permissions = ERC725Y(_target).getPermissionsFor(from);
        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        bytes4 erc725Function = bytes4(payload);

        // ERC725Y.setData(bytes32,bytes)
        if (erc725Function == SETDATA_SELECTOR) {
            if (msgValue != 0) revert CannotSendValueToSetData();
            (bytes32 inputKey, bytes memory inputValue) = abi.decode(payload[4:], (bytes32, bytes));

            LSP6SetDataModule._verifyCanSetData(_target, from, permissions, inputKey, inputValue);

            // ERC725Y.setData(bytes32[],bytes[])
        } else if (erc725Function == SETDATA_ARRAY_SELECTOR) {
            if (msgValue != 0) revert CannotSendValueToSetData();
            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi.decode(
                payload[4:],
                (bytes32[], bytes[])
            );

            LSP6SetDataModule._verifyCanSetData(_target, from, permissions, inputKeys, inputValues);

            // ERC725X.execute(uint256,address,uint256,bytes)
        } else if (erc725Function == EXECUTE_SELECTOR) {
            LSP6ExecuteModule._verifyCanExecute(_target, from, permissions, payload);

            // ERC725X.execute(uint256,address,uint256,bytes)
        } else if (erc725Function == EXECUTE_ARRAY_SELECTOR) {
            LSP6ExecuteModule._verifyCanBatchExecute(_target, from, permissions, payload);
        } else if (
            erc725Function == ILSP14Ownable2Step.transferOwnership.selector ||
            erc725Function == ILSP14Ownable2Step.acceptOwnership.selector
        ) {
            LSP6OwnershipModule._verifyOwnershipPermissions(from, permissions);
        } else {
            revert InvalidERC725Function(erc725Function);
        }
    }

    /**
     * @dev Initialise _reentrancyStatus to _NOT_ENTERED.
     */
    function _setupLSP6ReentrancyGuard() internal virtual {
        _reentrancyStatus = false;
    }

    /**
     * @dev Update the status from `_NON_ENTERED` to `_ENTERED` and checks if
     * the status is `_ENTERED` in order to revert the call unless the caller has the REENTRANCY permission
     * Used in the beginning of the `nonReentrant` modifier, before the method execution starts.
     */
    function _nonReentrantBefore(bool isSetData, address from) internal virtual {
        if (_reentrancyStatus) {
            // CHECK the caller has REENTRANCY permission
            _requirePermissions(
                from,
                ERC725Y(_target).getPermissionsFor(from),
                _PERMISSION_REENTRANCY
            );
        } else {
            if (!isSetData) {
                _reentrancyStatus = true;
            }
        }
    }

    /**
     * @dev Resets the status to `_NOT_ENTERED`
     * Used in the end of the `nonReentrant` modifier after the method execution is terminated
     */
    function _nonReentrantAfter() internal virtual {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyStatus = false;
    }

    /**
     * @dev revert if `controller`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure override(LSP6ExecuteModule, LSP6SetDataModule) {
        LSP6ExecuteModule._requirePermissions(controller, addressPermissions, permissionRequired);
    }
}
