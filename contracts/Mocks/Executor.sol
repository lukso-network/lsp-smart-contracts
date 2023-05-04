// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

// modules
import {UniversalProfile} from "../UniversalProfile.sol";
import {LSP6KeyManager} from "../LSP6KeyManager/LSP6KeyManager.sol";

// constants
import {
    SETDATA_SELECTOR,
    EXECUTE_SELECTOR,
    OPERATION_0_CALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import {_LSP6_EXECUTE_SELECTOR} from "../LSP6KeyManager/LSP6Constants.sol";

contract Executor {
    address internal constant _DUMMY_RECIPIENT = 0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe;

    LSP6KeyManager private _keyManager;
    UniversalProfile private _universalProfile;

    // payable modifier is required as _account is non-payable by default
    // but UniversalProfile has a payable fallback function
    constructor(address payable account_, address keyManager_) {
        _universalProfile = UniversalProfile(account_);
        _keyManager = LSP6KeyManager(keyManager_);
    }

    // contract calls
    // -----------

    function setHardcodedKey() public returns (bytes memory) {
        bytes32 key = 0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1;
        bytes memory value = "Some value";

        bytes memory erc725Payload = abi.encodeWithSelector(SETDATA_SELECTOR, key, value);

        return _keyManager.execute(erc725Payload);
    }

    function setComputedKey() public returns (bytes memory) {
        bytes32 key = keccak256(abi.encodePacked("Some Key"));
        bytes memory value = abi.encodePacked("Some value");

        bytes memory erc725Payload = abi.encodeWithSelector(SETDATA_SELECTOR, key, value);

        return _keyManager.execute(erc725Payload);
    }

    function setComputedKeyFromParams(bytes32 _key, bytes memory _value)
        public
        returns (bytes memory)
    {
        bytes memory erc725Payload = abi.encodeWithSelector(SETDATA_SELECTOR, _key, _value);

        return _keyManager.execute(erc725Payload);
    }

    function sendOneLyxHardcoded() public returns (bytes memory) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            EXECUTE_SELECTOR,
            OPERATION_0_CALL,
            _DUMMY_RECIPIENT,
            amount,
            ""
        );

        return _keyManager.execute(erc725Payload);
    }

    function sendOneLyxToRecipient(address _recipient) public returns (bytes memory) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            EXECUTE_SELECTOR,
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

        bytes memory erc725Payload = abi.encodeWithSelector(SETDATA_SELECTOR, key, value);

        console.log("gas left %s", gasleft());

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _LSP6_EXECUTE_SELECTOR,
            erc725Payload
        );

        console.log("gas left %s", gasleft());

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function setComputedKeyRawCall() public returns (bool) {
        bytes32 key = keccak256(abi.encodePacked("Some Key"));
        bytes memory value = abi.encodePacked("Some value");

        bytes memory erc725Payload = abi.encodeWithSelector(SETDATA_SELECTOR, key, value);

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _LSP6_EXECUTE_SELECTOR,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function setComputedKeyFromParamsRawCall(bytes32 _key, bytes memory _value)
        public
        returns (bool)
    {
        bytes memory erc725Payload = abi.encodeWithSelector(SETDATA_SELECTOR, _key, _value);

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _LSP6_EXECUTE_SELECTOR,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function sendOneLyxHardcodedRawCall() public returns (bool) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            EXECUTE_SELECTOR,
            OPERATION_0_CALL,
            _DUMMY_RECIPIENT,
            amount,
            ""
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _LSP6_EXECUTE_SELECTOR,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function sendOneLyxToRecipientRawCall(address _recipient) public returns (bool) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            EXECUTE_SELECTOR,
            OPERATION_0_CALL,
            _recipient,
            amount,
            ""
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _LSP6_EXECUTE_SELECTOR,
            erc725Payload
        );

        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }
}
