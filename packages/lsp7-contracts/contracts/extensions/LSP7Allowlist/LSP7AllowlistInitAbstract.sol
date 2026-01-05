// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAssetInitAbstract} from "../../LSP7DigitalAssetInitAbstract.sol";

// interfaces
import {ILSP7Allowlist} from "./ILSP7Allowlist.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title LSP7AllowlistInitAbstract
/// @dev Abstract contract implementing an _allowlist for LSP7 tokens, allowing specific addresses to bypass restrictions such as transfer locks. Inherits from LSP7DigitalAsset to integrate with token functionality.
abstract contract LSP7AllowlistInitAbstract is
    ILSP7Allowlist,
    LSP7DigitalAssetInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The set of addresses allowed to bypass certain restrictions (e.g., transfer locks).
    EnumerableSet.AddressSet internal _allowlist;

    /// @notice Initializes the _allowlist with the contract owner and the zero address.
    /// @dev Adds the contract owner and `address(0)` to the _allowlist to enable specific behaviors like minting and burning.
    /// @param newOwner_ The address to set as the initial owner and add to the _allowlist.
    function _initialize(
        address newOwner_
    ) internal virtual override onlyInitializing {
        super._initialize(newOwner_);

        _allowlist.add(newOwner_);
        _allowlist.add(address(0));
    }

    /// @inheritdoc ILSP7Allowlist
    function addToAllowlist(address _address) public override onlyOwner {
        _allowlist.add(_address);
        emit AllowlistChanged(_address, true);
    }

    /// @inheritdoc ILSP7Allowlist
    function removeFromAllowlist(address _address) public override onlyOwner {
        _allowlist.remove(_address);
        emit AllowlistChanged(_address, false);
    }

    /// @inheritdoc ILSP7Allowlist
    function isAllowlisted(
        address _address
    ) public view override returns (bool) {
        return _allowlist.contains(_address);
    }

    /// @inheritdoc ILSP7Allowlist
    function getAllowlistedAddressesLength() public view returns (uint256) {
        return _allowlist.length();
    }

    /// @inheritdoc ILSP7Allowlist
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
