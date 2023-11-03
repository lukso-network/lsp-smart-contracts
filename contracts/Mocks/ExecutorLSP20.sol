// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// modules
import {UniversalProfile} from "../UniversalProfile.sol";

// constants
import {
    OPERATION_0_CALL
} from "@erc725/smart-contracts/contracts/constants.sol";

contract ExecutorLSP20 {
    address internal constant _DUMMY_RECIPIENT =
        0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe;

    UniversalProfile private _universalProfile;

    constructor(UniversalProfile account_) {
        _universalProfile = account_;
    }

    // contract calls
    // -----------

    function setHardcodedKey() public returns (bytes memory) {
        bytes32 key = 0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1;
        bytes memory value = "Some value";

        _universalProfile.setData(key, value);
        return "";
    }

    function setComputedKey() public returns (bytes memory) {
        bytes32 key = keccak256(abi.encodePacked("Some Key"));
        bytes memory value = abi.encodePacked("Some value");

        _universalProfile.setData(key, value);
        return "";
    }

    function setComputedKeyFromParams(
        bytes32 _key,
        bytes memory _value
    ) public returns (bytes memory) {
        _universalProfile.setData(_key, _value);
        return "";
    }

    function sendOneLyxHardcoded() public returns (bytes memory) {
        uint256 amount = 1 ether;

        return
            _universalProfile.execute(
                OPERATION_0_CALL,
                _DUMMY_RECIPIENT,
                amount,
                ""
            );
    }

    function sendOneLyxToRecipient(
        address _recipient
    ) public returns (bytes memory) {
        uint256 amount = 1 ether;

        return
            _universalProfile.execute(OPERATION_0_CALL, _recipient, amount, "");
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

        (bool success, ) = address(_universalProfile).call(erc725Payload);
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

        (bool success, ) = address(_universalProfile).call(erc725Payload);
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

        (bool success, ) = address(_universalProfile).call(erc725Payload);
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

        (bool success, ) = address(_universalProfile).call(erc725Payload);
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

        (bool success, ) = address(_universalProfile).call(erc725Payload);
        return success;
    }
}
