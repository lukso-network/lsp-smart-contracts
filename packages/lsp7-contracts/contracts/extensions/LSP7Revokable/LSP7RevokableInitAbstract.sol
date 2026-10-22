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
import {LSP7RevokableFeatureDisabled} from "./LSP7RevokableErrors.sol";

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
    LSP7DigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    bool internal _isRevokable;

    /// @dev keccak256("REVOKER_ROLE")
    bytes32 public constant REVOKER_ROLE =
        0xce3f34913921da558f105cefb578d87278debbbd073a8d552b5de0d168deee30;

    /// @notice Initializes the LSP7Revokable contract with base token params.
    /// @dev Initializes the LSP7DigitalAsset base contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract (implicitly a revoker).
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    /// @param isRevokable_ Whether token revocation is enabled.
    function __LSP7Revokable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool isRevokable_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init();
        __LSP7Revokable_init_unchained(isRevokable_);
    }

    /// @notice Unchained initializer for LSP7Revokable.
    function __LSP7Revokable_init_unchained(
        bool isRevokable_
    ) internal virtual onlyInitializing {
        _isRevokable = isRevokable_;

        if (isRevokable_) {
            _grantRole(REVOKER_ROLE, owner());
        }
    }

    /// @inheritdoc ILSP7Revokable
    function isRevokable() public view virtual override returns (bool) {
        return _isRevokable;
    }

    /// @inheritdoc ILSP7Revokable
    /// @custom:warning Once this function is called, any address holding the `REVOKER_ROLE` will be inoperable.
    /// @custom:info The list of addresses holding the `REVOKER_ROLE` remains populated after the revokable feature is switched off.
    function disableRevokable() public virtual override onlyOwner {
        require(isRevokable(), LSP7RevokableFeatureDisabled());
        _isRevokable = false;
        emit RevokableStatusChanged({enabled: false});
    }

    /// @inheritdoc ILSP7Revokable
    function revoke(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public virtual override onlyRole(REVOKER_ROLE) {
        require(isRevokable(), LSP7RevokableFeatureDisabled());
        require(
            to == owner() || hasRole(REVOKER_ROLE, to),
            AccessControlUnauthorizedAccount(to, REVOKER_ROLE)
        );

        emit TokenRevoked({
            revoker: msg.sender,
            from: from,
            to: to,
            amount: amount,
            data: data
        });

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
    /// The only exception is if the old contract owner had the `REVOKER_ROLE`. This role will be given to the new owner.
    ///
    /// @custom:warning This function clears the entire `REVOKER_ROLE` member set.
    /// - Gas cost scales linearly with the number of addresses with the `REVOKER_ROLE`.
    /// - If the number of addresses with the `REVOKER_ROLE` is large, it might consume a lot of gas,
    /// leading the transaction to approach or exceed the block gas limit and fail.
    /// Consider revoking addresses with the `REVOKER_ROLE` in batches in separate transactions to mitigate this.
    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant REVOKER_ROLE to new accounts post-transfer
        _setRoleAdmin(REVOKER_ROLE, DEFAULT_ADMIN_ROLE);

        // Transfer all roles from old owner to new owner first (including the `REVOKER_ROLE`)
        // before clearing the list of revokers.
        super._transferOwnership(newOwner);

        address[] memory revokers = getRoleMembers(REVOKER_ROLE);

        for (uint256 ii = 0; ii < revokers.length; ++ii) {
            // Exclude the new owner from the list of revokers to delete.
            address revoker = revokers[ii];
            if (revoker == newOwner) continue;

            _revokeRole(REVOKER_ROLE, revoker);
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     *
     * @custom:info The size of the `__gap` array is calculated so that the amount of storage used by the contract
     * always adds up to the same number (in this case 50 storage slots).
     */
    uint256[49] private __gap;
}
