// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP8BurnableInitAbstract
} from "../extensions/LSP8Burnable/LSP8BurnableInitAbstract.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    LSP8MintableInitAbstract
} from "../extensions/LSP8Mintable/LSP8MintableInitAbstract.sol";

/**
 * @dev LSP8IdentifiableDigitalAsset deployable preset contract (proxy version) with:
 * - a public {mint} function callable by addresses holding `MINTER_ROLE`.
 * - a public {burn} function callable by any token holder.
 */
contract LSP8MintableInit is
    LSP8MintableInitAbstract,
    LSP8BurnableInitAbstract
{
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a `LSP8MintableInit` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    ) external virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __AccessControlExtended_init();
        __LSP8Mintable_init_unchained(true);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP8MintableInitAbstract,
            LSP8IdentifiableDigitalAssetInitAbstract
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8MintableInitAbstract,
            LSP8IdentifiableDigitalAssetInitAbstract
        )
    {
        LSP8MintableInitAbstract._mint(to, tokenId, force, data);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(LSP8MintableInitAbstract, OwnableUpgradeable) {
        LSP8MintableInitAbstract._transferOwnership(newOwner);
    }
}
