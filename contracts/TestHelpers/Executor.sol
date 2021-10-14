// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../UniversalProfileCore.sol";
import "../KeyManager/KeyManager.sol";

contract Executor {

    KeyManager keyManager;

    constructor(address _keyManager) {
        keyManager = KeyManager(_keyManager);
    }

    function setHardcodedKey() public returns (bool) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        // keccak256('MyFirstKey')
        keys[0] = 0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5;
        values[0] = 'Hello Lukso';

        bytes memory erc725Payload = abi.encodeWithSelector(
            UniversalProfileCore.setData.selector,
            keys,
            values
        );

        return keyManager.execute(erc725Payload);
    }

    // setHardcodedKey (raw / low-level call)
    function setHardcodedKeyRawCall() public returns (bool) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        // keccak256('MyFirstKey')
        keys[0] = 0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5;
        values[0] = 'Hello Lukso';

        bytes memory erc725Payload = abi.encodeWithSelector(
            UniversalProfileCore.setData.selector,
            keys,
            values
        );

        bytes memory keyManagerPayload = abi.encodeWithSelector(
            keyManager.execute.selector,
            erc725Payload
        );

        (bool success, ) = address(keyManager).call(keyManagerPayload);
        return success;
    }

    // set computed keys
    function setComputedKey() public returns (bool) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = keccak256(abi.encodePacked('MyFirstKey'));
        values[0] = abi.encodePacked('Hello Lukso');

        bytes memory erc725Payload = abi.encodeWithSelector(
            UniversalProfileCore.setData.selector,
            keys,
            values
        );

        return keyManager.execute(erc725Payload);
    }

    // set computed keys (raw call)

    // set computed keys (as params)
    function setComputedKeyFromParams(bytes32 _key, bytes memory _value) public returns (bool) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = keccak256(abi.encodePacked('MyFirstKey'));
        values[0] = abi.encodePacked(_value);

        bytes memory erc725Payload = abi.encodeWithSelector(
            UniversalProfileCore.setData.selector,
            keys,
            values
        );

        return keyManager.execute(erc725Payload);
    }

    // set computed keys (as params) (raw call)
}