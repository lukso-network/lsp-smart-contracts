// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// modules
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {LSP6SetDataModule} from "./LSP6Modules/LSP6SetDataModule.sol";
import {LSP6ExecuteModule} from "./LSP6Modules/LSP6ExecuteModule.sol";
import {LSP6OwnershipModule} from "./LSP6Modules/LSP6OwnershipModule.sol";

// libraries
import {GasLib} from "../Utils/GasLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP6Utils} from "./LSP6Utils.sol";
import {EIP191Signer} from "../Custom/EIP191Signer.sol";

// errors
import "./LSP6Errors.sol";

// constants
import "./LSP6Constants.sol";
import {
    SETDATA_SELECTOR,
    SETDATA_ARRAY_SELECTOR,
    EXECUTE_SELECTOR
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_ERC1271,
    _ERC1271_MAGICVALUE,
    _ERC1271_FAILVALUE
} from "../LSP0ERC725Account/LSP0Constants.sol";

/**
 * @title Core implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerCore is
    ERC165,
    ILSP6KeyManager,
    LSP6SetDataModule,
    LSP6ExecuteModule,
    LSP6OwnershipModule
{
    using LSP6Utils for *;
    using ECDSA for bytes32;
    using EIP191Signer for address;

    address public target;
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    // Variables, methods and modifier which are used for ReentrancyGuard
    // are taken from the link below and modified according to our needs.
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.8/contracts/security/ReentrancyGuard.sol
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _reentrancyStatus;

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
            ERC725Y(target).getPermissionsFor(recoveredAddress).hasPermission(_PERMISSION_SIGN)
                ? _ERC1271_MAGICVALUE
                : _ERC1271_FAILVALUE
        );
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(bytes calldata payload) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(uint256[] calldata values, bytes[] calldata payloads)
        public
        payable
        returns (bytes[] memory)
    {
        if (values.length != payloads.length) {
            revert BatchExecuteParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ii = GasLib.uncheckedIncrement(ii)) {
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
    ) public payable returns (bytes memory) {
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
    ) public payable returns (bytes[] memory) {
        if (
            signatures.length != nonces.length ||
            nonces.length != values.length ||
            values.length != payloads.length
        ) {
            revert BatchExecuteRelayCallParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ii = GasLib.uncheckedIncrement(ii)) {
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

    function _execute(uint256 msgValue, bytes calldata payload) internal returns (bytes memory) {
        _nonReentrantBefore(msg.sender);
        _verifyPermissions(msg.sender, payload);
        bytes memory result = _executePayload(msgValue, payload);
        _nonReentrantAfter();
        return result;
    }

    function _executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 msgValue,
        bytes calldata payload
    ) internal returns (bytes memory) {
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

        _nonReentrantBefore(signer);

        if (!_isValidNonce(signer, nonce)) {
            revert InvalidRelayNonce(signer, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        _verifyPermissions(signer, payload);

        bytes memory result = _executePayload(msgValue, payload);

        _nonReentrantAfter();

        return result;
    }

    /**
     * @notice execute the received payload (obtained via `execute(...)` and `executeRelayCall(...)`)
     *
     * @param payload the payload to execute
     * @return bytes the result from calling the target with `_payload`
     */
    function _executePayload(uint256 msgValue, bytes calldata payload)
        internal
        returns (bytes memory)
    {
        emit Executed(bytes4(payload), msgValue);

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = target.call{value: msgValue, gas: gasleft()}(
            payload
        );
        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: Unknown Error occured when calling the linked target contract"
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
    function _isValidNonce(address from, uint256 idx) internal view returns (bool) {
        // idx % (1 << 128) = nonce
        // (idx >> 128) = channel
        // equivalent to: return (nonce == _nonceStore[_from][channel]
        return (idx % (1 << 128)) == (_nonceStore[from][idx >> 128]);
    }

    /**
     * @dev verify the permissions of the _from address that want to interact with the `target`
     * @param from the address making the request
     * @param payload the payload that will be run on `target`
     */
    function _verifyPermissions(address from, bytes calldata payload) internal view virtual {
        bytes4 erc725Function = bytes4(payload);

        // get the permissions of the caller
        bytes32 permissions = ERC725Y(target).getPermissionsFor(from);

        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        if (erc725Function == SETDATA_SELECTOR) {
            _verifySetDataPermissions(target, from, permissions, payload);
        } else if (erc725Function == SETDATA_ARRAY_SELECTOR) {
            _verifySetDataPermissions(target, from, permissions, payload);
        } else if (erc725Function == EXECUTE_SELECTOR) {
            _verifyExecutePermissions(target, from, permissions, payload);
        } else if (
            erc725Function == LSP14Ownable2Step.transferOwnership.selector ||
            erc725Function == LSP14Ownable2Step.acceptOwnership.selector
        ) {
            _verifyOwnershipPermissions(from, permissions, payload);
        } else {
            revert InvalidERC725Function(erc725Function);
        }
    }

    /**
     * @dev Initialise _reentrancyStatus to _NOT_ENTERED.
     */
    function _setupLSP6ReentrancyGuard() internal {
        _reentrancyStatus = _NOT_ENTERED;
    }

    /**
     * @dev Update the status from `_NON_ENTERED` to `_ENTERED` and checks if
     * the status is `_ENTERED` in order to revert the call unless the caller has the REENTRANCY permission
     * Used in the beginning of the `nonReentrant` modifier, before the method execution starts
     */
    function _nonReentrantBefore(address from) private {
        if (_reentrancyStatus == _ENTERED) {
            // CHECK the caller has REENTRANCY permission
            bytes32 callerPermissions = ERC725Y(target).getPermissionsFor(from);
            _requirePermissions(from, callerPermissions, _PERMISSION_REENTRANCY);
        } else {
            _reentrancyStatus = _ENTERED;
        }
    }

    /**
     * @dev Resets the status to `_NOT_ENTERED`
     * Used in the end of the `nonReentrant` modifier after the method execution is terminated
     */
    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyStatus = _NOT_ENTERED;
    }

    /**
     * @dev revert if `from`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param from the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address from,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure override(LSP6SetDataModule, LSP6ExecuteModule, LSP6OwnershipModule) {
        if (!addressPermissions.hasPermission(permissionRequired)) {
            string memory permissionErrorString = permissionRequired.getPermissionName();
            revert NotAuthorised(from, permissionErrorString);
        }
    }
}
