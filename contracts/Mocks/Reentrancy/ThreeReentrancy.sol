// solhint-disable one-contract-per-file
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";

/**
 * The purpose of these contracts is to perform tests on chained reentrancy scenarios
 * that involve interacting with the UniversalProfile through its owner (LSP6KeyManager)
 * or by directly using the LSP20 method.
 */

/**
 * @dev contract used for testing.
 */
contract FirstToCallLSP20 {
    address public universalProfile;
    SecondToCallLSP20 private _secondToCall;

    constructor(address _universalProfile, address secondToCall_) {
        universalProfile = _universalProfile;
        _secondToCall = SecondToCallLSP20(secondToCall_);
    }

    function firstTarget() public {
        // Calling execute function
        IERC725X(universalProfile).execute(0, address(0), 0, hex"aabbccdd");

        // Calling secondTarget function
        _secondToCall.secondTarget();
    }
}

/**
 * @dev contract used for testing
 */
contract SecondToCallLSP20 {
    address public universalProfile;

    constructor(address _universalProfile) {
        universalProfile = _universalProfile;
    }

    function secondTarget() public {
        // Calling setData function
        IERC725Y(universalProfile).setData(bytes32(0), hex"aabbccdd");
    }
}

/**
 * @dev contract used for testing
 */
contract FirstToCallLSP6 {
    address public keyManager;
    SecondToCallLSP20 private _secondToCall;

    constructor(address _keyManager, address secondToCall_) {
        keyManager = _keyManager;
        _secondToCall = SecondToCallLSP20(secondToCall_);
    }

    function firstTarget() public {
        bytes memory payload = abi.encodeWithSelector(
            IERC725X.execute.selector,
            0,
            address(0),
            0,
            hex"aabbccdd"
        );

        // Calling execute function through the KeyManager
        ILSP6KeyManager(keyManager).execute(payload);

        // Calling secondTarget function
        _secondToCall.secondTarget();
    }
}

/**
 * @dev contract used for testing
 */
contract SecondToCallLSP6 {
    address public keyManager;

    constructor(address _keyManager) {
        keyManager = _keyManager;
    }

    function secondTarget() public {
        bytes memory payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            bytes32(0),
            hex"aabbccdd"
        );

        // Calling setData function through the KeyManager
        ILSP6KeyManager(keyManager).execute(payload);
    }
}
