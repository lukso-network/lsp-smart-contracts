// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import "forge-std/Test.sol";
import {
    LSP2Utils
} from "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";

// modules
import {UniversalProfile} from "../../../contracts/UniversalProfile.sol";
import {
    KeyManagerInternalTester
} from "../../../contracts/Mocks/KeyManager/KeyManagerInternalsTester.sol";

// constants
import {
    OPERATION_0_CALL,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
    _ALLOWEDCALLS_TRANSFERVALUE
} from "../../../contracts/LSP6KeyManager/LSP6Constants.sol";

// errors to test
import {NotAllowedCall} from "../../../contracts/LSP6KeyManager/LSP6Errors.sol";

// mock contracts for testing
import {TargetContract} from "../../../contracts/Mocks/TargetContract.sol";

contract LSP6AllowedCallsTest is Test {
    using LSP2Utils for *;

    UniversalProfile universalProfile;
    KeyManagerInternalTester keyManager;

    TargetContract targetContract;

    function setUp() public {
        universalProfile = new UniversalProfile(address(this));
        keyManager = new KeyManagerInternalTester(address(universalProfile));

        targetContract = new TargetContract();
    }

    function _setupCallTypes(bytes4 callTypesAllowed) internal {
        // setup allowed calls for this controller, when we will read them from storage
        bytes32 allowedCallsDataKey = LSP2Utils.generateMappingWithGroupingKey({
            keyPrefix: _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
            bytes20Value: bytes20(address(this))
        });

        bytes memory allowedCallsDataValue = abi.encodePacked(
            hex"0020", // 2 bytes to specify the entry is 32 bytes long (32 = 0x0020 in hex)
            callTypesAllowed, // restrictionOperations (= callTypes allowed)
            targetContract,
            bytes4(0),
            bytes4(0)
        );

        universalProfile.setData(allowedCallsDataKey, allowedCallsDataValue);
    }

    function testShouldRevertWithEmptyMessageCallWithCallTypeAllowedValueOnly()
        public
    {
        // setup allowed calls for this controller, when we will read them from storage
        _setupCallTypes(_ALLOWEDCALLS_TRANSFERVALUE);

        bytes memory expectedRevertData = abi.encodeWithSelector(
            NotAllowedCall.selector,
            address(this),
            targetContract,
            bytes4(0)
        );

        // Test with CALL
        vm.expectRevert(expectedRevertData);
        keyManager.verifyAllowedCall(
            address(this),
            OPERATION_0_CALL,
            address(targetContract),
            0,
            ""
        );

        // Test with STATICCALL
        vm.expectRevert(expectedRevertData);
        keyManager.verifyAllowedCall(
            address(this),
            OPERATION_3_STATICCALL,
            address(targetContract),
            0,
            ""
        );

        // Test with DELEGATECALL
        vm.expectRevert(expectedRevertData);
        keyManager.verifyAllowedCall(
            address(this),
            OPERATION_4_DELEGATECALL,
            address(targetContract),
            0,
            ""
        );
    }

    function testFail_ShouldRevertForAnyMessageCallToTargetWithNoCallTypeAllowed(
        uint256 operationType,
        uint256 value,
        bytes memory callData
    ) public {
        _setupCallTypes(bytes4(0));

        // we should use a valid operation type
        vm.assume(operationType <= 4);

        keyManager.verifyAllowedCall(
            address(this),
            operationType,
            address(targetContract),
            value,
            callData
        );
    }
}
