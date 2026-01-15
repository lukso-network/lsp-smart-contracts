// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";

// interfaces
import {ILSP8Allowlist} from "./ILSP8Allowlist.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title LSP8AllowlistInitAbstract
/// @dev Abstract contract implementing an allowlist for LSP8 tokens, allowing specific addresses to bypass restrictions such as transfer locks. Inherits from LSP8IdentifiableDigitalAssetInitAbstract to integrate with token functionality.
abstract contract LSP8AllowlistInitAbstract is
    ILSP8Allowlist,
    LSP8IdentifiableDigitalAssetInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The set of addresses allowed to bypass certain restrictions (e.g., transfer locks).
    EnumerableSet.AddressSet internal _allowlist;

    /// @notice Initializes the allowlist with the contract owner and the zero address.
    /// @dev Adds the contract owner and `address(0)` to the allowlist to enable specific behaviors like minting and burning.
    /// @param newOwner_ The address to set as the initial owner and add to the allowlist.
    function __LSP8Allowlist_init(
        address newOwner_
    ) internal virtual onlyInitializing {
        __LSP8Allowlist_init_unchained(newOwner_);
    }

    function __LSP8Allowlist_init_unchained(
        address newOwner_
    ) internal virtual onlyInitializing {
        _allowlist.add(newOwner_);
        _allowlist.add(address(0));
    }

    /// @inheritdoc ILSP8Allowlist
    function addToAllowlist(address _address) public override onlyOwner {
        _allowlist.add(_address);
        emit AllowlistChanged(_address, true);
    }

    /// @inheritdoc ILSP8Allowlist
    function removeFromAllowlist(address _address) public override onlyOwner {
        _allowlist.remove(_address);
        emit AllowlistChanged(_address, false);
    }

    /// @inheritdoc ILSP8Allowlist
    function isAllowlisted(
        address _address
    ) public view override returns (bool) {
        return _allowlist.contains(_address);
    }

    /// @inheritdoc ILSP8Allowlist
    function getAllowlistedAddressesLength() public view returns (uint256) {
        return _allowlist.length();
    }

    /// @inheritdoc ILSP8Allowlist
    function getAllowlistedAddressesByIndex(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        uint256 sliceLength = endIndex - startIndex;

        address[] memory allowlistedAddresses = new address[](sliceLength);

        for (uint256 index = 0; index < sliceLength; ++index) {
            allowlistedAddresses[index] = _allowlist.at(startIndex + index);
        }

        return allowlistedAddresses;
    }
}
