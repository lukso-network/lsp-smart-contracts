// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./LSP11SocialRecoveryInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of LSP11-SocialRecovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
contract LSP11SocialRecoveryInit is LSP11SocialRecoveryInitAbstract {
    /**
     * @inheritdoc LSP11SocialRecoveryInitAbstract
     */
    function initialize(
        address newOwner,
        ERC725 _account,
        uint256 newThreshold
    ) public override initializer {
        LSP11SocialRecoveryInitAbstract.initialize(
            newOwner,
            _account,
            newThreshold
        );
    }
}
