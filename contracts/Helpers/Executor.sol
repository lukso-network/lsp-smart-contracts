// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../UniversalProfile.sol";
import "../LSP6KeyManager/LSP6KeyManager.sol";

contract Executor {
    uint256 internal constant _OPERATION_CALL = 0;

    // prettier-ignore
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
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        // keccak256('MyFirstKey')
        // prettier-ignore
        keys[0] = 0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5;
        values[0] = "Hello Lukso";

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.setData.selector,
            keys,
            values
        );

        return _keyManager.execute(erc725Payload);
    }

    function setComputedKey() public returns (bytes memory) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = keccak256(abi.encodePacked("MyFirstKey"));
        values[0] = abi.encodePacked("Hello Lukso");

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.setData.selector,
            keys,
            values
        );

        return _keyManager.execute(erc725Payload);
    }

    function setComputedKeyFromParams(bytes32 _key, bytes memory _value)
        public
        returns (bytes memory)
    {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = _key;
        values[0] = _value;

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.setData.selector,
            keys,
            values
        );

        return _keyManager.execute(erc725Payload);
    }

    function sendOneLyxHardcoded() public returns (bytes memory) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.execute.selector,
            _OPERATION_CALL,
            _DUMMY_RECIPIENT,
            amount,
            ""
        );

        return _keyManager.execute(erc725Payload);
    }

    function sendOneLyxToRecipient(address _recipient)
        public
        returns (bytes memory)
    {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.execute.selector,
            _OPERATION_CALL,
            _recipient,
            amount,
            ""
        );

        return _keyManager.execute(erc725Payload);
    }

    // raw / low-level calls
    // ----------------------

    function setHardcodedKeyRawCall() public returns (bool) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        // keccak256('MyFirstKey')
        // prettier-ignore
        keys[0] = 0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5;
        values[0] = "Hello Lukso";

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.setData.selector,
            keys,
            values
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _keyManager.execute.selector,
            erc725Payload
        );

        // solhint-disable avoid-low-level-calls
        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function setComputedKeyRawCall() public returns (bool) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = keccak256(abi.encodePacked("MyFirstKey"));
        values[0] = abi.encodePacked("Hello Lukso");

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.setData.selector,
            keys,
            values
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _keyManager.execute.selector,
            erc725Payload
        );

        // solhint-disable avoid-low-level-calls
        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function setComputedKeyFromParamsRawCall(bytes32 _key, bytes memory _value)
        public
        returns (bool)
    {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = _key;
        values[0] = _value;

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.setData.selector,
            keys,
            values
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _keyManager.execute.selector,
            erc725Payload
        );

        // solhint-disable avoid-low-level-calls
        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function sendOneLyxHardcodedRawCall() public returns (bool) {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.execute.selector,
            _OPERATION_CALL,
            _DUMMY_RECIPIENT,
            amount,
            ""
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _keyManager.execute.selector,
            erc725Payload
        );

        // solhint-disable avoid-low-level-calls
        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }

    function sendOneLyxToRecipientRawCall(address _recipient)
        public
        returns (bool)
    {
        uint256 amount = 1 ether;

        bytes memory erc725Payload = abi.encodeWithSelector(
            _universalProfile.execute.selector,
            _OPERATION_CALL,
            _recipient,
            amount,
            ""
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            _keyManager.execute.selector,
            erc725Payload
        );

        // solhint-disable avoid-low-level-calls
        (bool success, ) = address(_keyManager).call(keyManagerPayload);
        return success;
    }
}
