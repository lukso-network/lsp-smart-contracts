// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP7DigitalAssetInitAbstract
} from "../../LSP7DigitalAssetInitAbstract.sol";
import {
    AccessControlExtendedInitAbstract
} from "../AccessControlExtended/AccessControlExtendedInitAbstract.sol";

// interfaces
import {ILSP7Revokable} from "./ILSP7Revokable.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../AccessControlExtended/AccessControlExtendedErrors.sol";

/// @title LSP7RevokableInitAbstract
/// @dev Abstract contract implementing revokable functionality for LSP7 tokens (initializer version).
/// Allows addresses with the `REVOKER_ROLE` to revoke tokens from any holder
/// back to the contract owner or any other address that also has revoke rights.
///
/// This version is for proxy deployments using the initializer pattern.
///
/// Use cases include:
/// - Memberships: Revoke membership tokens when they expire or are terminated
/// - Role badges: Remove role badges from community members
/// - Compliance: Freeze or reverse tokens for regulatory requirements
/// - Vesting: Revoke unvested tokens if conditions are not met
abstract contract LSP7RevokableInitAbstract is
    ILSP7Revokable,
    AccessControlExtendedInitAbstract,
    LSP7DigitalAssetInitAbstract
{
    /// @dev `"REVOKER_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant REVOKER_ROLE = 0x5245564f4b45525f524f4c450000000000000000000000000000000000000000;

    /// @notice Initializes the LSP7Revokable contract with base token params.
    /// @dev Initializes the LSP7DigitalAsset base contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract (implicitly a revoker).
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    function __LSP7Revokable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init(newOwner_);
        __LSP7Revokable_init_unchained(newOwner_);
    }

    /// @notice Unchained initializer for LSP7Revokable.
    function __LSP7Revokable_init_unchained(
        address newOwner_
    ) internal virtual onlyInitializing {
        _grantRole(REVOKER_ROLE, newOwner_);
    }

    /// @inheritdoc ILSP7Revokable
    function revoke(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public virtual override onlyRole(REVOKER_ROLE) {
        require(
            to == owner() || hasRole(REVOKER_ROLE, to),
            AccessControlUnauthorizedAccount(to, REVOKER_ROLE)
        );

        // We assume revokers are trusted when specifying revocation destinations.
        // Therefore, we bypass LSP1 receiver checks.
        _transfer({
            from: from,
            to: to,
            amount: amount,
            force: true,
            data: data
        });
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            AccessControlExtendedInitAbstract,
            LSP7DigitalAssetInitAbstract
        )
        returns (bool)
    {
        return
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId) ||
            LSP7DigitalAssetInitAbstract.supportsInterface(interfaceId);
    }

    /// @dev Overridden function to ensure previous revokers do not persist after contract ownership has been transferred.
    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        _clearRevokers();
        super._transferOwnership(newOwner);
    }

    function _clearRevokers() internal virtual {
        while (getRoleMemberCount(REVOKER_ROLE) != 0) {
            _revokeRole(REVOKER_ROLE, getRoleMember(REVOKER_ROLE, 0));
        }
    }
}
