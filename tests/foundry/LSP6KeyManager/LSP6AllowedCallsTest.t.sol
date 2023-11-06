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
    _ALLOWEDCALLS_TRANSFERVALUE,
    _ALLOWEDCALLS_CALL,
    _ALLOWEDCALLS_STATICCALL,
    _ALLOWEDCALLS_DELEGATECALL
} from "../../../contracts/LSP6KeyManager/LSP6Constants.sol";

// errors to test
import {NotAllowedCall} from "../../../contracts/LSP6KeyManager/LSP6Errors.sol";

// mock contracts for testing
import {
    FallbackInitializer
} from "../../../contracts/Mocks/FallbackInitializer.sol";
import {TargetContract} from "../../../contracts/Mocks/TargetContract.sol";

contract LSP6AllowedCallsTest is Test {
    using LSP2Utils for *;

    UniversalProfile universalProfile;
    KeyManagerInternalTester keyManager;

    TargetContract targetContract;
    FallbackInitializer targetWithFallback;

    function setUp() public {
        universalProfile = new UniversalProfile(address(this));
        keyManager = new KeyManagerInternalTester(address(universalProfile));

        targetContract = new TargetContract();
        targetWithFallback = new FallbackInitializer();
    }

    function _setupCallTypes(
        bytes4 callTypesAllowed,
        address contractToAllow,
        bytes4 allowedSelector
    ) internal {
        // setup allowed calls for this controller, when we will read them from storage
        bytes32 allowedCallsDataKey = LSP2Utils.generateMappingWithGroupingKey({
            keyPrefix: _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
            bytes20Value: bytes20(address(this))
        });

        bytes memory allowedCallsDataValue = abi.encodePacked(
            hex"0020", // 2 bytes to specify the entry is 32 bytes long (32 = 0x0020 in hex)
            callTypesAllowed, // restrictionOperations (= callTypes allowed)
            contractToAllow, // address
            bytes4(0xffffffff), // any standard
            allowedSelector // function
        );

        universalProfile.setData(allowedCallsDataKey, allowedCallsDataValue);
    }

    function testShouldRevertWithEmptyMessageCallWithCallTypeAllowedValueOnly()
        public
    {
        // setup allowed calls for this controller, when we will read them from storage
        _setupCallTypes(
            _ALLOWEDCALLS_TRANSFERVALUE,
            address(targetContract),
            bytes4(0xffffffff) // for any function
        );

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
        uint8 operationType,
        uint256 value,
        bytes memory callData
    ) public {
        _setupCallTypes(bytes4(0), address(targetContract), bytes4(0xffffffff)); // for any function

        // We don't test for operation `CREATE` or `CREATE2`
        vm.assume(operationType != 1 && operationType != 2);
        // we should use a valid operation type
        vm.assume(operationType <= 4);

        keyManager.verifyAllowedCall(
            address(this),
            uint256(operationType),
            address(targetContract),
            value,
            callData
        );
    }

    function testFail_ShouldRevertWithEmptyCallNoValueWhenAssociatedCallTypeIsNotSet(
        uint8 operationType,
        bytes4 callTypeToGrant
    ) public {
        // We don't test for operation `CREATE` or `CREATE2`
        vm.assume(operationType != 1 && operationType != 2);
        // we should use a valid operation type
        vm.assume(operationType <= 4);

        // Check for testing that the callType is not set for the associated operationType
        if (operationType == OPERATION_0_CALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_CALL != _ALLOWEDCALLS_CALL
            );
        }

        if (operationType == OPERATION_3_STATICCALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_STATICCALL !=
                    _ALLOWEDCALLS_STATICCALL
            );
        }

        if (operationType == OPERATION_4_DELEGATECALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_DELEGATECALL !=
                    _ALLOWEDCALLS_DELEGATECALL
            );
        }

        _setupCallTypes(
            callTypeToGrant,
            address(targetWithFallback),
            bytes4(0xffffffff)
        ); // for any function

        keyManager.verifyAllowedCall(
            address(this),
            uint256(operationType),
            address(targetWithFallback),
            0,
            ""
        );
    }

    function test_ShouldPassWithEmptyCallNoValueWhenAssociatedCallTypeIsSet(
        uint8 operationType,
        bytes4 callTypeToGrant
    ) public {
        // We don't test for operation `CREATE` or `CREATE2`
        vm.assume(operationType != 1 && operationType != 2);
        // we should use a valid operation type
        vm.assume(operationType <= 4);

        // We should have at least one bit set in the callTypes
        vm.assume(callTypeToGrant != bytes4(0));

        // Check for testing that the callType is not set for the associated operationType
        if (operationType == OPERATION_0_CALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_CALL == _ALLOWEDCALLS_CALL
            );
        }

        if (operationType == OPERATION_3_STATICCALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_STATICCALL ==
                    _ALLOWEDCALLS_STATICCALL
            );
        }

        if (operationType == OPERATION_4_DELEGATECALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_DELEGATECALL ==
                    _ALLOWEDCALLS_DELEGATECALL
            );
        }

        _setupCallTypes(
            callTypeToGrant,
            address(targetWithFallback),
            bytes4(0xffffffff)
        ); // for any function

        keyManager.verifyAllowedCall(
            address(this),
            uint256(operationType),
            address(targetWithFallback),
            0,
            ""
        );
    }

    function test_ShouldPassWithCallDataAs0x00000000WhenCallTypeAllowBytes4ZeroSelector(
        uint8 operationType,
        bytes4 callTypeToGrant
    ) public {
        // We don't test for operation `CREATE` or `CREATE2`
        vm.assume(operationType != 1 && operationType != 2);
        // we should use a valid operation type
        vm.assume(operationType <= 4);

        // Check for testing that the callType is not set for the associated operationType
        if (operationType == OPERATION_0_CALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_CALL == _ALLOWEDCALLS_CALL
            );
        }

        if (operationType == OPERATION_3_STATICCALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_STATICCALL ==
                    _ALLOWEDCALLS_STATICCALL
            );
        }

        if (operationType == OPERATION_4_DELEGATECALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_DELEGATECALL ==
                    _ALLOWEDCALLS_DELEGATECALL
            );
        }

        _setupCallTypes(
            callTypeToGrant,
            address(targetWithFallback),
            bytes4(0) // only for the bytes4(0) selector
        );

        keyManager.verifyAllowedCall(
            address(this),
            uint256(operationType),
            address(targetWithFallback),
            0,
            hex"00000000"
        );
    }

    function testFail_ShouldRevertWithCallDataAs0x00000000WhenCallTypeDoesNotAllowBytes4ZeroSelector(
        uint8 operationType,
        bytes4 callTypeToGrant,
        bytes4 randomFunctionSelectorToAllow
    ) public {
        // We don't test for operation `CREATE` or `CREATE2`
        vm.assume(operationType != 1 && operationType != 2);
        // we should use a valid operation type
        vm.assume(operationType <= 4);

        // exclude the bytes4(0) selector for graffiti, and 0xffffffff for any function allowed
        vm.assume(
            randomFunctionSelectorToAllow != bytes4(0) &&
                randomFunctionSelectorToAllow != 0xffffffff
        );

        // Check for testing that the callType is not set for the associated operationType
        if (operationType == OPERATION_0_CALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_CALL == _ALLOWEDCALLS_CALL
            );
        }

        if (operationType == OPERATION_3_STATICCALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_STATICCALL ==
                    _ALLOWEDCALLS_STATICCALL
            );
        }

        if (operationType == OPERATION_4_DELEGATECALL) {
            vm.assume(
                callTypeToGrant & _ALLOWEDCALLS_DELEGATECALL ==
                    _ALLOWEDCALLS_DELEGATECALL
            );
        }

        _setupCallTypes(
            callTypeToGrant,
            address(targetWithFallback),
            randomFunctionSelectorToAllow
        );

        keyManager.verifyAllowedCall(
            address(this),
            uint256(operationType),
            address(targetWithFallback),
            0,
            hex"00000000"
        );
    }
}
