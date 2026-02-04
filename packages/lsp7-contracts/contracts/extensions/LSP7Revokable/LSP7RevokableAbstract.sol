// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";

// interfaces
import {ILSP7Revokable} from "./ILSP7Revokable.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {
    LSP7NotAuthorizedRevoker,
    LSP7InvalidRevokerIndexRange
} from "./LSP7RevokableErrors.sol";

/// @title LSP7RevokableAbstract
/// @dev Abstract contract implementing revokable functionality for LSP7 tokens.
/// Allows the token issuer (owner) and delegated revokers to revoke tokens from any holder
/// back to the owner, or burn tokens from any holder.
///
/// Use cases include:
/// - Memberships: Revoke membership tokens when they expire or are terminated
/// - Role badges: Remove role badges from community members
/// - Compliance: Freeze or reverse tokens for regulatory requirements
/// - Vesting: Revoke unvested tokens if conditions are not met
abstract contract LSP7RevokableAbstract is ILSP7Revokable, LSP7DigitalAsset {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The set of addresses with delegated revoker rights.
    /// @dev The owner is implicitly a revoker and does not need to be in this set.
    EnumerableSet.AddressSet internal _revokers;

    /// @dev Modifier to restrict access to the owner or delegated revokers.
    modifier onlyRevoker() {
        if (msg.sender != owner() && !_revokers.contains(msg.sender)) {
            revert LSP7NotAuthorizedRevoker(msg.sender);
        }
        _;
    }

    /// @inheritdoc ILSP7Revokable
    function addRevoker(address revoker) public virtual override onlyOwner {
        bool added = _revokers.add(revoker);
        if (added) {
            emit RevokerAdded(revoker);
        }
    }

    /// @inheritdoc ILSP7Revokable
    function removeRevoker(address revoker) public virtual override onlyOwner {
        bool removed = _revokers.remove(revoker);
        if (removed) {
            emit RevokerRemoved(revoker);
        }
    }

    /// @inheritdoc ILSP7Revokable
    function isRevoker(address account) public view virtual override returns (bool) {
        return account == owner() || _revokers.contains(account);
    }

    /// @inheritdoc ILSP7Revokable
    function getRevokersCount() public view virtual override returns (uint256) {
        return _revokers.length();
    }

    /// @inheritdoc ILSP7Revokable
    function getRevokersByIndex(
        uint256 startIndex,
        uint256 endIndex
    ) public view virtual override returns (address[] memory) {
        uint256 revokersCount = _revokers.length();

        if (startIndex >= endIndex || endIndex > revokersCount) {
            revert LSP7InvalidRevokerIndexRange(startIndex, endIndex, revokersCount);
        }

        uint256 sliceLength = endIndex - startIndex;
        address[] memory revokers = new address[](sliceLength);

        for (uint256 i = 0; i < sliceLength; ++i) {
            revokers[i] = _revokers.at(startIndex + i);
        }

        return revokers;
    }

    /// @inheritdoc ILSP7Revokable
    function revoke(
        address from,
        uint256 amount,
        bytes memory data
    ) public virtual override onlyRevoker {
        address tokenIssuer = owner();
        // force=true to bypass LSP1 receiver check on the owner
        _transfer(from, tokenIssuer, amount, true, data);
    }

    /// @inheritdoc ILSP7Revokable
    function revokeAndBurn(
        address from,
        uint256 amount,
        bytes memory data
    ) public virtual override onlyRevoker {
        _burn(from, amount, data);
    }
}
