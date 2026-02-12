// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {
    LSP7RoleOperatorsAbstract
} from "../contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// interfaces
import {
    ILSP7RoleOperators
} from "../contracts/extensions/LSP7RoleOperators/ILSP7RoleOperators.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {
    _MINT_ROLE,
    _ALLOW_TRANSFER_ROLE,
    _INFINITE_BALANCE_ROLE,
    _DEAD_ADDRESS,
    _ZERO_ADDRESS
} from "../contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsConstants.sol";

// errors
import {
    LSP7RoleOperatorsInvalidIndexRange,
    LSP7RoleOperatorsCannotRemoveReservedAddress,
    LSP7RoleOperatorsNotAuthorized,
    LSP7RoleOperatorsArrayLengthMismatch
} from "../contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsErrors.sol";

// Mock contract for testing
contract MockLSP7RoleOperators is LSP7RoleOperatorsAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7RoleOperatorsAbstract(newOwner_)
    {}

    function mint(address to, uint256 amount, bool force, bytes memory data) public {
        _mint(to, amount, force, data);
    }
}

contract LSP7RoleOperatorsTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address operator1 = vm.addr(101);
    address operator2 = vm.addr(102);
    address operator3 = vm.addr(103);

    MockLSP7RoleOperators lsp7RoleOperators;

    function setUp() public {
        lsp7RoleOperators = new MockLSP7RoleOperators(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible
        );
    }

    // ============================================================
    // Constructor initialization tests
    // ============================================================

    function test_ConstructorInitializesDefaultRoles() public {
        // Owner should have all three roles
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, owner),
            "Owner should have MINT_ROLE"
        );
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_ALLOW_TRANSFER_ROLE, owner),
            "Owner should have ALLOW_TRANSFER_ROLE"
        );
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_INFINITE_BALANCE_ROLE, owner),
            "Owner should have INFINITE_BALANCE_ROLE"
        );
    }

    function test_ConstructorInitializesReservedAddresses() public {
        // Zero address in ALLOW_TRANSFER and INFINITE_BALANCE
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_ALLOW_TRANSFER_ROLE, _ZERO_ADDRESS),
            "Zero address should have ALLOW_TRANSFER_ROLE"
        );
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_INFINITE_BALANCE_ROLE, _ZERO_ADDRESS),
            "Zero address should have INFINITE_BALANCE_ROLE"
        );

        // Dead address in INFINITE_BALANCE
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_INFINITE_BALANCE_ROLE, _DEAD_ADDRESS),
            "Dead address should have INFINITE_BALANCE_ROLE"
        );

        // Dead address NOT in ALLOW_TRANSFER
        assertFalse(
            lsp7RoleOperators.isRoleOperator(_ALLOW_TRANSFER_ROLE, _DEAD_ADDRESS),
            "Dead address should NOT have ALLOW_TRANSFER_ROLE"
        );
    }

    // ============================================================
    // Role operator basic CRUD tests (TEST-01)
    // ============================================================

    function test_AuthorizeRoleOperatorAsOwner() public {
        vm.expectEmit(true, true, true, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorChanged(_MINT_ROLE, operator1, true);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should have MINT_ROLE"
        );
    }

    function test_AuthorizeRoleOperatorAlreadyAdded() public {
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should have MINT_ROLE"
        );

        // Adding again should not emit event
        vm.recordLogs();
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            0,
            "No event should be emitted for duplicate add"
        );
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should still have MINT_ROLE"
        );
    }

    function test_RevokeRoleOperatorAsOwner() public {
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should have MINT_ROLE initially"
        );

        vm.expectEmit(true, true, true, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorChanged(_MINT_ROLE, operator1, false);
        lsp7RoleOperators.revokeRoleOperator(_MINT_ROLE, operator1);
        
        assertFalse(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should not have MINT_ROLE"
        );
    }

    function test_NonOwnerCannotAuthorize() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        
        assertFalse(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should not have MINT_ROLE"
        );
    }

    function test_NonOwnerCannotRevoke() public {
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        
        vm.prank(nonOwner);
        vm.expectRevert();
        lsp7RoleOperators.revokeRoleOperator(_MINT_ROLE, operator1);
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should still have MINT_ROLE"
        );
    }

    function test_IsRoleOperatorReturnsCorrectStatus() public {
        assertFalse(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should not have MINT_ROLE initially"
        );
        
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should have MINT_ROLE after authorization"
        );
        
        lsp7RoleOperators.revokeRoleOperator(_MINT_ROLE, operator1);
        assertFalse(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should not have MINT_ROLE after revocation"
        );
    }

    // ============================================================
    // Data storage tests (TEST-01)
    // ============================================================

    function test_AuthorizeRoleOperatorWithData() public {
        bytes memory data = abi.encodePacked(uint256(1000));
        
        vm.expectEmit(true, true, true, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorChanged(_MINT_ROLE, operator1, true);
        vm.expectEmit(true, true, false, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorDataChanged(_MINT_ROLE, operator1, data);
        
        lsp7RoleOperators.authorizeRoleOperatorWithData(_MINT_ROLE, operator1, data);
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1),
            "Operator1 should have MINT_ROLE"
        );
        
        bytes memory storedData = lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1);
        assertEq(storedData, data, "Stored data should match");
    }

    function test_SetRoleOperatorData() public {
        // First authorize the operator
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        
        bytes memory data = abi.encodePacked(uint256(2000));
        
        vm.expectEmit(true, true, false, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorDataChanged(_MINT_ROLE, operator1, data);
        
        lsp7RoleOperators.setRoleOperatorData(_MINT_ROLE, operator1, data);
        
        bytes memory storedData = lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1);
        assertEq(storedData, data, "Stored data should match");
    }

    function test_SetRoleOperatorDataRevertsIfNotAuthorized() public {
        bytes memory data = abi.encodePacked(uint256(1000));
        
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsNotAuthorized.selector,
                _MINT_ROLE,
                operator1
            )
        );
        lsp7RoleOperators.setRoleOperatorData(_MINT_ROLE, operator1, data);
    }

    function test_GetRoleOperatorDataReturnsStoredData() public {
        bytes memory data = abi.encodePacked(uint256(3000));
        
        lsp7RoleOperators.authorizeRoleOperatorWithData(_MINT_ROLE, operator1, data);
        
        bytes memory retrievedData = lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1);
        assertEq(retrievedData, data, "Retrieved data should match stored data");
    }

    function test_GetRoleOperatorDataReturnsEmptyForNonOperator() public {
        bytes memory data = lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1);
        assertEq(data.length, 0, "Should return empty bytes for non-operator");
    }

    function test_RevokeRoleOperatorClearsData() public {
        bytes memory data = abi.encodePacked(uint256(4000));
        lsp7RoleOperators.authorizeRoleOperatorWithData(_MINT_ROLE, operator1, data);
        
        // Verify data is stored
        bytes memory storedData = lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1);
        assertEq(storedData, data, "Data should be stored");
        
        // Revoke should emit data changed event with empty bytes
        vm.expectEmit(true, true, false, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorDataChanged(_MINT_ROLE, operator1, "");
        vm.expectEmit(true, true, true, true, address(lsp7RoleOperators));
        emit ILSP7RoleOperators.RoleOperatorChanged(_MINT_ROLE, operator1, false);
        
        lsp7RoleOperators.revokeRoleOperator(_MINT_ROLE, operator1);
        
        // Verify data is cleared
        bytes memory clearedData = lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1);
        assertEq(clearedData.length, 0, "Data should be cleared after revocation");
    }

    // ============================================================
    // Batch operations tests (TEST-02)
    // ============================================================

    function test_AuthorizeRoleOperatorBatch() public {
        address[] memory operators = new address[](3);
        operators[0] = operator1;
        operators[1] = operator2;
        operators[2] = operator3;
        
        bytes[] memory dataArray = new bytes[](3);
        dataArray[0] = abi.encodePacked(uint256(1000));
        dataArray[1] = abi.encodePacked(uint256(2000));
        dataArray[2] = abi.encodePacked(uint256(3000));
        
        lsp7RoleOperators.authorizeRoleOperatorBatch(_MINT_ROLE, operators, dataArray);
        
        // Verify all operators are authorized
        assertTrue(lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1), "Operator1 should be authorized");
        assertTrue(lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator2), "Operator2 should be authorized");
        assertTrue(lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator3), "Operator3 should be authorized");
        
        // Verify data is stored
        assertEq(
            lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1),
            dataArray[0],
            "Operator1 data should match"
        );
        assertEq(
            lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator2),
            dataArray[1],
            "Operator2 data should match"
        );
        assertEq(
            lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator3),
            dataArray[2],
            "Operator3 data should match"
        );
    }

    function test_AuthorizeRoleOperatorBatchArrayMismatch() public {
        address[] memory operators = new address[](3);
        operators[0] = operator1;
        operators[1] = operator2;
        operators[2] = operator3;
        
        bytes[] memory dataArray = new bytes[](2); // Wrong length
        dataArray[0] = abi.encodePacked(uint256(1000));
        dataArray[1] = abi.encodePacked(uint256(2000));
        
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsArrayLengthMismatch.selector,
                3,
                2
            )
        );
        lsp7RoleOperators.authorizeRoleOperatorBatch(_MINT_ROLE, operators, dataArray);
    }

    function test_RevokeRoleOperatorBatch() public {
        // First authorize operators
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator2);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator3);
        
        address[] memory operators = new address[](2);
        operators[0] = operator1;
        operators[1] = operator2;
        
        lsp7RoleOperators.revokeRoleOperatorBatch(_MINT_ROLE, operators);
        
        // Verify operators are revoked
        assertFalse(lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator1), "Operator1 should be revoked");
        assertFalse(lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator2), "Operator2 should be revoked");
        assertTrue(lsp7RoleOperators.isRoleOperator(_MINT_ROLE, operator3), "Operator3 should still be authorized");
    }

    function test_RevokeRoleOperatorBatchClearsData() public {
        // Authorize with data
        bytes memory data1 = abi.encodePacked(uint256(1000));
        bytes memory data2 = abi.encodePacked(uint256(2000));
        lsp7RoleOperators.authorizeRoleOperatorWithData(_MINT_ROLE, operator1, data1);
        lsp7RoleOperators.authorizeRoleOperatorWithData(_MINT_ROLE, operator2, data2);
        
        address[] memory operators = new address[](2);
        operators[0] = operator1;
        operators[1] = operator2;
        
        lsp7RoleOperators.revokeRoleOperatorBatch(_MINT_ROLE, operators);
        
        // Verify data is cleared
        assertEq(
            lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator1).length,
            0,
            "Operator1 data should be cleared"
        );
        assertEq(
            lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, operator2).length,
            0,
            "Operator2 data should be cleared"
        );
    }

    // ============================================================
    // Enumeration and pagination tests (TEST-03)
    // ============================================================

    function test_GetRoleOperatorsLength() public {
        // Initially owner only has MINT_ROLE
        uint256 initialLength = lsp7RoleOperators.getRoleOperatorsLength(_MINT_ROLE);
        assertEq(initialLength, 1, "Initial length should be 1 (owner)");
        
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator2);
        
        uint256 newLength = lsp7RoleOperators.getRoleOperatorsLength(_MINT_ROLE);
        assertEq(newLength, 3, "Length should be 3 after adding 2 operators");
    }

    function test_GetRoleOperatorsByIndex() public {
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator2);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator3);
        
        address[] memory operators = lsp7RoleOperators.getRoleOperatorsByIndex(_MINT_ROLE, 0, 3);
        assertEq(operators.length, 3, "Should return 3 operators");
        
        // Get slice
        address[] memory slice = lsp7RoleOperators.getRoleOperatorsByIndex(_MINT_ROLE, 1, 3);
        assertEq(slice.length, 2, "Should return 2 operators");
    }

    function test_GetRoleOperatorsByIndexInvalidRange() public {
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator2);
        
        uint256 length = lsp7RoleOperators.getRoleOperatorsLength(_MINT_ROLE);
        
        // startIndex >= endIndex
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsInvalidIndexRange.selector,
                2,
                1,
                length
            )
        );
        lsp7RoleOperators.getRoleOperatorsByIndex(_MINT_ROLE, 2, 1);
        
        // endIndex > length
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsInvalidIndexRange.selector,
                0,
                10,
                length
            )
        );
        lsp7RoleOperators.getRoleOperatorsByIndex(_MINT_ROLE, 0, 10);
    }

    function test_EnumerationAfterAddAndRemove() public {
        // Add operators
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator1);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator2);
        lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, operator3);
        
        assertEq(lsp7RoleOperators.getRoleOperatorsLength(_MINT_ROLE), 4, "Should have 4 operators");
        
        // Remove one
        lsp7RoleOperators.revokeRoleOperator(_MINT_ROLE, operator2);
        
        assertEq(lsp7RoleOperators.getRoleOperatorsLength(_MINT_ROLE), 3, "Should have 3 operators");
        
        // Verify remaining operators
        address[] memory operators = lsp7RoleOperators.getRoleOperatorsByIndex(_MINT_ROLE, 0, 3);
        assertEq(operators.length, 3, "Should return 3 operators");
        
        // Verify operator2 is not in the list
        bool foundOperator2 = false;
        for (uint256 i = 0; i < operators.length; i++) {
            if (operators[i] == operator2) {
                foundOperator2 = true;
                break;
            }
        }
        assertFalse(foundOperator2, "Operator2 should not be in the list");
    }

    // ============================================================
    // Reserved address tests (TEST-04)
    // ============================================================

    function test_CannotRemoveZeroAddress() public {
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_ALLOW_TRANSFER_ROLE, _ZERO_ADDRESS),
            "Zero address should have ALLOW_TRANSFER_ROLE"
        );
        
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsCannotRemoveReservedAddress.selector,
                _ZERO_ADDRESS
            )
        );
        lsp7RoleOperators.revokeRoleOperator(_ALLOW_TRANSFER_ROLE, _ZERO_ADDRESS);
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_ALLOW_TRANSFER_ROLE, _ZERO_ADDRESS),
            "Zero address should still have ALLOW_TRANSFER_ROLE"
        );
    }

    function test_CannotRemoveDeadAddress() public {
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_INFINITE_BALANCE_ROLE, _DEAD_ADDRESS),
            "Dead address should have INFINITE_BALANCE_ROLE"
        );
        
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsCannotRemoveReservedAddress.selector,
                _DEAD_ADDRESS
            )
        );
        lsp7RoleOperators.revokeRoleOperator(_INFINITE_BALANCE_ROLE, _DEAD_ADDRESS);
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_INFINITE_BALANCE_ROLE, _DEAD_ADDRESS),
            "Dead address should still have INFINITE_BALANCE_ROLE"
        );
    }

    function test_CannotBatchRemoveReservedAddresses() public {
        address[] memory operators = new address[](2);
        operators[0] = _ZERO_ADDRESS;
        operators[1] = operator1;
        
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7RoleOperatorsCannotRemoveReservedAddress.selector,
                _ZERO_ADDRESS
            )
        );
        lsp7RoleOperators.revokeRoleOperatorBatch(_ALLOW_TRANSFER_ROLE, operators);
    }

    function test_ZeroAddressPrePopulatedInAllowTransferRole() public {
        uint256 length = lsp7RoleOperators.getRoleOperatorsLength(_ALLOW_TRANSFER_ROLE);
        assertTrue(length >= 1, "ALLOW_TRANSFER_ROLE should have at least 1 operator");
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_ALLOW_TRANSFER_ROLE, _ZERO_ADDRESS),
            "Zero address should be pre-populated in ALLOW_TRANSFER_ROLE"
        );
    }

    function test_DeadAddressPrePopulatedInInfiniteBalanceRole() public {
        uint256 length = lsp7RoleOperators.getRoleOperatorsLength(_INFINITE_BALANCE_ROLE);
        assertTrue(length >= 1, "INFINITE_BALANCE_ROLE should have at least 1 operator");
        
        assertTrue(
            lsp7RoleOperators.isRoleOperator(_INFINITE_BALANCE_ROLE, _DEAD_ADDRESS),
            "Dead address should be pre-populated in INFINITE_BALANCE_ROLE"
        );
    }

    // ============================================================
    // Fuzz tests
    // ============================================================

    function testFuzz_RoleOperatorManagement(
        address addr,
        bool authorize,
        bytes memory data
    ) public {
        vm.assume(addr != address(0));
        vm.assume(addr != _DEAD_ADDRESS);
        vm.assume(addr != owner);
        
        if (authorize) {
            lsp7RoleOperators.authorizeRoleOperatorWithData(_MINT_ROLE, addr, data);
            assertTrue(
                lsp7RoleOperators.isRoleOperator(_MINT_ROLE, addr),
                "Address should be authorized"
            );
            assertEq(
                lsp7RoleOperators.getRoleOperatorData(_MINT_ROLE, addr),
                data,
                "Data should match"
            );
        } else {
            lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, addr);
            lsp7RoleOperators.revokeRoleOperator(_MINT_ROLE, addr);
            assertFalse(
                lsp7RoleOperators.isRoleOperator(_MINT_ROLE, addr),
                "Address should not be authorized"
            );
        }
    }

    function testFuzz_GetRoleOperatorsByIndex(
        uint8 startIndex,
        uint8 endIndex
    ) public {
        // Add some operators
        for (uint256 i = 0; i < 10; i++) {
            lsp7RoleOperators.authorizeRoleOperator(_MINT_ROLE, vm.addr(200 + i));
        }
        
        uint256 totalLength = lsp7RoleOperators.getRoleOperatorsLength(_MINT_ROLE);
        
        // Bound indices
        uint256 boundedStart = bound(startIndex, 0, totalLength - 1);
        uint256 boundedEnd = bound(endIndex, boundedStart + 1, totalLength);
        
        address[] memory operators = lsp7RoleOperators.getRoleOperatorsByIndex(
            _MINT_ROLE,
            boundedStart,
            boundedEnd
        );
        
        assertEq(
            operators.length,
            boundedEnd - boundedStart,
            "Returned array length should match range"
        );
    }
}
