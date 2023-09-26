// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "./LSP11Mock.sol";
import "../../../contracts/LSP11BasicSocialRecovery/LSP11Errors.sol";

contract LSP11BasicSocialRecoveryTests is Test {
    LSP11Mock public lsp11;
    address internal _lsp11OwnerAddress = vm.addr(1);
    address internal _targetAddress = vm.addr(2);

    function setUp() public {
        lsp11 = new LSP11Mock(_lsp11OwnerAddress, _targetAddress);
    }

    // when secret is not set, should revert with any plainSecret value
    function testValidateRequirementsShouldRevertWithRandomSecret(
        string memory plainSecret
    ) public {
        address recoverer = vm.addr(3);
        uint256 currentRecoveryCounter = 1;
        bytes32 newHash = keccak256(abi.encodePacked("newHash"));
        address[] memory guardians = new address[](0);
        vm.expectRevert(WrongPlainSecret.selector);
        lsp11.validateRequirements(
            recoverer,
            currentRecoveryCounter,
            plainSecret,
            newHash,
            guardians
        );
    }

    function testShouldNotRevertWithCorrectSecret(
        string memory plainSecret
    ) public {
        address recoverer = vm.addr(3);
        uint256 currentRecoveryCounter = 1;
        bytes32 newHash = keccak256(abi.encodePacked("newHash"));
        address[] memory guardians = new address[](0);
        vm.prank(_lsp11OwnerAddress);
        lsp11.setRecoverySecretHash(keccak256(abi.encodePacked(plainSecret)));
        lsp11.validateRequirements(
            recoverer,
            currentRecoveryCounter,
            plainSecret,
            newHash,
            guardians
        );
    }

    // mocking setGuardiansThreshold(...) to be able to test the revert (ThresholdCannotBeHigherThanGuardiansNumber)
    function testSetCannotGuardiansThresholdSuperiorToGuardiansLength(
        uint64 guardianLength,
        uint64 offset
    ) public {
        if (offset == 0) return;
        vm.startPrank(_lsp11OwnerAddress);
        uint256 guardianLength256 = guardianLength;
        uint256 offset256 = offset;
        uint256 newThreshold = guardianLength256 + offset256;

        vm.expectRevert(
            abi.encodeWithSelector(
                ThresholdCannotBeHigherThanGuardiansNumber.selector,
                newThreshold,
                guardianLength
            )
        );
        lsp11.setGuardiansThresholdMock(newThreshold, guardianLength);
        vm.stopPrank();
    }
}
