// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP8IdentifiableDigitalAsset.sol";
import "./LSP8CompatibilityForERC721Core.sol";

// constants
import "./LSP8CompatibilityConstants.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
contract LSP8CompatibilityForERC721 is
    LSP8IdentifiableDigitalAsset,
    LSP8CompatibilityForERC721Core
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {
        _registerInterface(_INTERFACEID_ERC721);
        _registerInterface(_INTERFACEID_ERC721METADATA);
    }

    /*
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        // silence compiler warning about unused variable
        tokenId;
        bytes memory data = ERC725Utils.getDataSingle(this, _LSP4_METADATA_KEY);

        // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36
        uint256 offset = 36;

        bytes memory uriBytes = BytesLib.slice(
            data,
            offset,
            data.length - offset
        );
        return string(uriBytes);
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function ownerOf(uint256 tokenId)
        external
        view
        virtual
        override
        returns (address)
    {
        return tokenOwnerOf(bytes32(tokenId));
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function approve(address operator, uint256 tokenId)
        external
        virtual
        override
    {
        authorizeOperator(operator, bytes32(tokenId));

        emit Approval(tokenOwnerOf(bytes32(tokenId)), operator, tokenId);
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function getApproved(uint256 tokenId)
        external
        view
        virtual
        override
        returns (address)
    {
        require(
            _exists(bytes32(tokenId)),
            "LSP8: can not query operator for non existent token"
        );

        EnumerableSet.AddressSet storage operatorsForTokenId = _operators[
            bytes32(tokenId)
        ];
        uint256 operatorListLength = operatorsForTokenId.length();

        if (operatorListLength == 0) {
            return address(0);
        } else {
            // Read the last added operator authorized to provide "best" compatibility.
            // In ERC721 there is one operator address at a time for a tokenId, so multiple calls to
            // `approve` would cause `getApproved` to return the last added operator. In this
            // compatibility version the same is true, when the authorized operators were not previously
            // authorized. If addresses are removed, then `getApproved` returned address can change due
            // to implementation of `EnumberableSet._remove`.
            return operatorsForTokenId.at(operatorListLength - 1);
        }
    }

    /*
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function isApprovedForAll(uint256 tokenId)
        public
        virtual
        override
        returns (bool)
    {
        // silence compiler warning about unused variable
        tokenId;

        return false;
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     * @dev Compatible with ERC721 transferFrom.
     * Using force=true so that EOA and any contract may receive the tokenId.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external virtual override {
        return
            transfer(from, to, bytes32(tokenId), true, "compat-transferFrom");
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external virtual override {
        return
            transfer(
                from,
                to,
                bytes32(tokenId),
                false,
                "compat-safeTransferFrom"
            );
    }

    /*
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external virtual override {
        return transfer(from, to, bytes32(tokenId), false, data);
    }

    // --- Overrides

    function authorizeOperator(address operator, bytes32 tokenId)
        public
        virtual
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core
        )
    {
        super.authorizeOperator(operator, tokenId);
    }

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core
        )
    {
        super._transfer(from, to, tokenId, force, data);
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
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core
        )
    {
        super._mint(to, tokenId, force, data);
    }

    function _burn(bytes32 tokenId, bytes memory data)
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core
        )
    {
        super._burn(tokenId, data);
    }
}
