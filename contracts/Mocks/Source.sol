// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import {TargetContract} from "./TargetContract.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

contract Source {
    address private _target;

    constructor(address target_) {
        _target = target_;
    }

    function doFunctionCall() public {
        TargetContract(_target).setNumber(42);
    }

    function doLowLevelCallWithParam(bytes calldata callData) public returns (bool) {
        (bool success, ) = _target.call(callData);
        return success;
    }

    function doLowLevelCallAbiEncodeWithSelector() public returns (bool) {
        bytes memory payload = abi.encodeWithSelector(TargetContract.setNumber.selector, 55);

        (bool success, ) = _target.call(payload);

        return success;
    }
}

contract SourceERC725 {
    address private _erc725Contract;

    function setERC725Contract(address erc725Contract) public {
        _erc725Contract = erc725Contract;
    }

    function setDataFunctionCall() public {
        bytes32 key = 0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1;
        bytes memory value = "Some value with function call";

        IERC725Y(_erc725Contract).setData(key, value);
    }

    function setDataLowLevelCallWithCalldataParam(bytes calldata setDataPayload)
        public
        returns (bool)
    {
        (bool success, ) = _erc725Contract.call(setDataPayload);
        return success;
    }

    function setDataLowLevelCallWithCalldataAndAddressParams(
        address target,
        bytes calldata setDataPayload
    ) public returns (bool) {
        (bool success, ) = target.call(setDataPayload);
        return success;
    }

    function setDataLowLevelCall() public returns (bool) {
        bytes32 key = 0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1;
        bytes memory value = "Some value with low level call through `abi.encodeWithSelector`";

        bytes memory setDataPayload = abi.encodeWithSelector(IERC725Y.setData.selector, key, value);

        (bool success, ) = _erc725Contract.call(setDataPayload);

        // console.log("breakpoint to debug");

        return success;
    }
}
