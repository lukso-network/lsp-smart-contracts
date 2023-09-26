// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "../../../contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol";
import "../../../contracts/LSP11BasicSocialRecovery/LSP11Errors.sol";

contract LSP11Mock is LSP11BasicSocialRecovery {
    constructor(
        address _owner,
        address target_
    ) LSP11BasicSocialRecovery(_owner, target_) {}

    function validateRequirements(
        address recoverer,
        uint256 currentRecoveryCounter,
        string memory plainSecret,
        bytes32 newHash,
        address[] memory guardians
    ) public view {
        _validateRequirements(
            recoverer,
            currentRecoveryCounter,
            plainSecret,
            newHash,
            guardians
        );
    }

    function setGuardiansThresholdMock(
        uint256 newThreshold,
        uint256 guardianLength
    ) public onlyOwner {
        if (newThreshold > guardianLength)
            revert ThresholdCannotBeHigherThanGuardiansNumber(
                newThreshold,
                guardianLength
            );

        _guardiansThreshold = newThreshold;
    }
}
