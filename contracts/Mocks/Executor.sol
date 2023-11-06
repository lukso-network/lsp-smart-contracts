// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager} from "../LSP6KeyManager/ILSP6KeyManager.sol";

// modules
import {UniversalProfile} from "../UniversalProfile.sol";
import {LSP6KeyManager} from "../LSP6KeyManager/LSP6KeyManager.sol";

// constants
import {
    OPERATION_0_CALL
} from "@erc725/smart-contracts/contracts/constants.sol";

contract Executor {
    address internal constant _DUMMY_RECIPIENT =
        0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe;

    LSP6KeyManager private _keyManager;
    UniversalProfile private _universalProfile;

    constructor(UniversalProfile account_, address keyManager_) {
        _universalProfile = account_;
        _keyManager = LSP6KeyManager(keyManager_);
    }

    // contract calls
    // -----------

    function setHardcodedKey() public returns (bytes memory) {
        bytes32 key = 0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1;
        bytes memory value = "Some value";

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            key,
            value
        );

        return _keyManager.execute(erc725Payload);
    }

    function setComputedKey() public returns (bytes memory) {
        bytes32 key = keccak256(abi.encodePacked("Some Key"));
        bytes memory value = abi.encodePacked("Some value");

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            key,
            value
        );

        return _keyManager.execute(erc725Payload);
    }

    function setComputedKeyFromParams(
        bytes32 _key,
        bytes memory _value
    ) public returns (bytes memory) {
        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            _key,
            _value
        );

        return _keyManager.execute(erc725Payload);
    }

    function sendOneLyxHardcoded() public returns (bytes memory) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725X.execute.selector,
            OPERATION_0_CALL,
            _DUMMY_RECIPIENT,
            amount,
            ""
        );

        return _keyManager.execute(erc725Payload);
    }

    function sendOneLyxToRecipient(
        address _recipient
    ) public returns (bytes memory) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725X.execute.selector,
            OPERATION_0_CALL,
            _recipient,
            amount,
            ""
        );

        return _keyManager.execute(erc725Payload);
    }

    // raw / low-level calls
    // ----------------------

    function setHardcodedKeyRawCall() public returns (bool) {
        bytes32 key = 0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1;
        bytes memory value = "Some value";

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            key,
            value
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            ILSP6KeyManager.execute.selector,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function setComputedKeyRawCall() public returns (bool) {
        bytes32 key = keccak256(abi.encodePacked("Some Key"));
        bytes memory value = abi.encodePacked("Some value");

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            key,
            value
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            ILSP6KeyManager.execute.selector,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function setComputedKeyFromParamsRawCall(
        bytes32 _key,
        bytes memory _value
    ) public returns (bool) {
        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            _key,
            _value
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            ILSP6KeyManager.execute.selector,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function sendOneLyxHardcodedRawCall() public returns (bool) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725X.execute.selector,
            OPERATION_0_CALL,
            _DUMMY_RECIPIENT,
            amount,
            ""
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            ILSP6KeyManager.execute.selector,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function sendOneLyxToRecipientRawCall(
        address _recipient
    ) public returns (bool) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            IERC725X.execute.selector,
            OPERATION_0_CALL,
            _recipient,
            amount,
            ""
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            ILSP6KeyManager.execute.selector,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }
}
