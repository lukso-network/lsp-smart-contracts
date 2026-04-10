// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    AccessControlExtendedAbstract
} from "../extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

// extensions
import {LSP8Burnable} from "../extensions/LSP8Burnable/LSP8Burnable.sol";
import {
    LSP8MintableAbstract
} from "../extensions/LSP8Mintable/LSP8MintableAbstract.sol";
import {
    LSP8CappedSupplyAbstract
} from "../extensions/LSP8CappedSupply/LSP8CappedSupplyAbstract.sol";
import {
    LSP8CappedBalanceAbstract
} from "../extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol";
import {
    LSP8NonTransferableAbstract
} from "../extensions/LSP8NonTransferable/LSP8NonTransferableAbstract.sol";
import {
    LSP8RevokableAbstract
} from "../extensions/LSP8Revokable/LSP8RevokableAbstract.sol";

// errors
import {
    LSP8MintDisabled
} from "../extensions/LSP8Mintable/LSP8MintableErrors.sol";

/// @dev Deployment configuration for minting feature.
/// @param mintable True to enable minting after deployment, false to disable it forever.
/// @param initialMintTokenIds Array of tokenIds to mint to `newOwner_` on deployment.
struct MintableParams {
    bool mintable;
    bytes32[] initialMintTokenIds;
}

/// @dev Deployment configuration for capped balance and capped supply features.
/// @param tokenBalanceCap The maximum number of NFTs per address, 0 to disable.
/// @param tokenSupplyCap The maximum total supply of NFTs, 0 to disable.
struct CappedParams {
    uint256 tokenBalanceCap;
    uint256 tokenSupplyCap;
}

/// @dev Deployment configuration for non-transferable feature.
/// @param transferLockStart The start timestamp of the transfer lock period, 0 to disable.
/// @param transferLockEnd The end timestamp of the transfer lock period, 0 to disable.
struct NonTransferableParams {
    uint256 transferLockStart;
    uint256 transferLockEnd;
}

/// @title LSP8CustomizableToken
/// @dev A customizable LSP8 token implementing minting, balance caps, transfer restrictions, total supply cap, burning and role-based exemptions.
/// Implements {LSP8Mintable} to allow minting.
/// Implements {LSP8Burnable} to allow burning
/// Implements {LSP8CappedBalance} to set balance caps.
/// Implements {LSP8NonTransferable} to restrict transfers.
/// Implements {LSP8CappedSupply} to set total supply cap.
contract LSP8CustomizableToken is
    LSP8Burnable,
    LSP8MintableAbstract,
    LSP8CappedSupplyAbstract,
    LSP8CappedBalanceAbstract,
    LSP8NonTransferableAbstract,
    LSP8RevokableAbstract
{
    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions and supply cap. Mints initial tokens if specified. Reverts if initialMintTokenIds length exceeds tokenSupplyCap. Inherits constructor logic from parent contracts.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 1 for NFT, 2 for Collection).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param mintableParams Deployment configuration for minting feature (see above).
    /// @param cappedParams Deployment configuration for capped balance and capped supply features (see above).
    /// @param nonTransferableParams Deployment configuration for non-transferable feature (see above).
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        MintableParams memory mintableParams,
        CappedParams memory cappedParams,
        NonTransferableParams memory nonTransferableParams
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract(newOwner_)
        LSP8MintableAbstract(mintableParams.mintable)
        LSP8CappedSupplyAbstract(cappedParams.tokenSupplyCap)
        LSP8CappedBalanceAbstract(cappedParams.tokenBalanceCap)
        LSP8NonTransferableAbstract(
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        )
        LSP8RevokableAbstract(newOwner_)
    {
        // Mint initial tokens
        for (
            uint256 ii = 0;
            ii < mintableParams.initialMintTokenIds.length;
            ii++
        ) {
            _mint(newOwner_, mintableParams.initialMintTokenIds[ii], true, "");
        }
    }

    /// @inheritdoc LSP8CappedSupplyAbstract
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @inheritdoc LSP8MintableAbstract
    /// @dev Relies on {LSP8CappedSupply} for supply cap enforcement.
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAsset,
            LSP8MintableAbstract,
            LSP8CappedSupplyAbstract
        )
    {
        require(isMintable, LSP8MintDisabled());

        _tokenSupplyCapCheck(to, tokenId, force, data);

        LSP8IdentifiableDigitalAsset._mint(to, tokenId, force, data);
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from {LSP8CappedBalance} and {LSP8NonTransferable}. Bypasses all checks for role holders configured by those extensions. Allows burning to address(0) regardless of restrictions.
    /// @param from The address sending the token.
    /// @param to The address receiving the token.
    /// @param tokenId The unique identifier of the token being transferred.
    /// @param force Whether to force the transfer.
    /// @param data Additional data for the transfer.
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAsset,
            LSP8CappedBalanceAbstract,
            LSP8NonTransferableAbstract
        )
    {
        LSP8NonTransferableAbstract._beforeTokenTransfer(
            from,
            to,
            tokenId,
            force,
            data
        );
        LSP8CappedBalanceAbstract._beforeTokenTransfer(
            from,
            to,
            tokenId,
            force,
            data
        );
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(
            Ownable,
            LSP8CappedBalanceAbstract,
            LSP8MintableAbstract,
            LSP8NonTransferableAbstract,
            LSP8RevokableAbstract
        )
    {
        super._transferOwnership(newOwner);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP8IdentifiableDigitalAsset,
            LSP8CappedBalanceAbstract,
            LSP8MintableAbstract,
            LSP8NonTransferableAbstract,
            LSP8RevokableAbstract
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
