// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";

// interfaces
import {ILSP8Allowlist} from "./ILSP8Allowlist.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {LSP8AllowListInvalidIndexRange, LSP8AllowListCannotRemoveReservedAddress} from "./LSP8AllowlistErrors.sol";

/// @title LSP8AllowlistInitAbstract
/// @dev Abstract contract implementing an allowlist for LSP8 tokens, allowing specific addresses to bypass restrictions such as transfer locks. Inherits from LSP8IdentifiableDigitalAssetInitAbstract to integrate with token functionality.
abstract contract LSP8AllowlistInitAbstract is
    ILSP8Allowlist,
    LSP8IdentifiableDigitalAssetInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The set of addresses allowed to bypass certain restrictions (e.g., transfer locks).
    EnumerableSet.AddressSet internal _allowlist;

    /// @notice The dead address is also commonly used for burning tokens as an alternative to address(0).
    address internal constant _DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    /// @notice Initializes the LSP8Allowlist contract with base token params and allowlist.
    /// @dev Initializes the LSP8IdentifiableDigitalAsset base and sets up the allowlist with owner and zero address.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract, added to the allowlist.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    function __LSP8Allowlist_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __LSP8Allowlist_init_unchained(newOwner_);
    }

    /// @notice Unchained initializer for the allowlist.
    /// @dev Adds the contract owner, `address(0)`, and the dead address to the allowlist.
    /// @param newOwner_ The address to add to the allowlist.
    function __LSP8Allowlist_init_unchained(
        address newOwner_
    ) internal virtual onlyInitializing {
        _allowlist.add(newOwner_);
        _allowlist.add(address(0));
        _allowlist.add(_DEAD_ADDRESS);
    }

    /// @inheritdoc ILSP8Allowlist
    function addToAllowlist(address _address) public override onlyOwner {
        bool added = _allowlist.add(_address);
        if (added) emit AllowlistChanged(_address, true);
    }

    /// @inheritdoc ILSP8Allowlist
    function removeFromAllowlist(address _address) public override onlyOwner {
        require(
            _address != address(0) && _address != _DEAD_ADDRESS,
            LSP8AllowListCannotRemoveReservedAddress(_address)
        );
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
        uint256 allowedAddressesCount = _allowlist.length();
        require(
            startIndex < endIndex && endIndex <= allowedAddressesCount,
            LSP8AllowListInvalidIndexRange(
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
