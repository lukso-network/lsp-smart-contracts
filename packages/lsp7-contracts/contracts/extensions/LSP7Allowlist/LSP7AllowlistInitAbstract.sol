// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAssetInitAbstract} from "../../LSP7DigitalAssetInitAbstract.sol";

// interfaces
import {ILSP7Allowlist} from "./ILSP7Allowlist.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {LSP7InvalidAllowlistIndexRange} from "./LSP7AllowlistErrors.sol";

/// @title LSP7AllowlistInitAbstract
/// @dev Abstract contract implementing an _allowlist for LSP7 tokens, allowing specific addresses to bypass restrictions such as transfer locks. Inherits from LSP7DigitalAsset to integrate with token functionality.
abstract contract LSP7AllowlistInitAbstract is
    ILSP7Allowlist,
    LSP7DigitalAssetInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The set of addresses allowed to bypass certain restrictions (e.g., transfer locks).
    EnumerableSet.AddressSet internal _allowlist;

    /// @notice Initializes the LSP7Allowlist contract with base token params and allowlist.
    /// @dev Initializes the LSP7DigitalAsset base and adds the owner and `address(0)` to the allowlist.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract, added to the allowlist.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    function __LSP7Allowlist_init(
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
        __LSP7Allowlist_init_unchained(newOwner_);
    }

    /// @notice Unchained initializer for the _allowlist.
    /// @dev Adds the contract owner and `address(0)` to the _allowlist to enable specific behaviors like minting and burning.
    /// @param newOwner_ The address to set as the initial owner and add to the _allowlist.
    function __LSP7Allowlist_init_unchained(
        address newOwner_
    ) internal virtual onlyInitializing {
        _allowlist.add(newOwner_);
        _allowlist.add(address(0));
    }

    /// @inheritdoc ILSP7Allowlist
    function addToAllowlist(address _address) public override onlyOwner {
        bool added = _allowlist.add(_address);
        if (added) emit AllowlistChanged(_address, true);
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
        uint256 allowedAddressesCount = _allowlist.length();
        require(
            startIndex < endIndex && endIndex <= allowedAddressesCount,
            LSP7InvalidAllowlistIndexRange(
                startIndex,
                endIndex,
                allowedAddressesCount
            )
        );

        uint256 sliceLength = endIndex - startIndex;

        address[] memory allowlistedAddresses = new address[](sliceLength);

        for (uint256 index = 0; index < sliceLength; ++index) {
            allowlistedAddresses[index] = _allowlist.at(startIndex + index);
        }

        return allowlistedAddresses;
    }
}
