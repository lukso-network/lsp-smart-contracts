// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../LSP8IdentifiableDigitalAsset.sol";
import "../../LSP4DigitalAssetMetadata/LSP4Compatibility.sol";

// interfaces
import "./ILSP8CompatibilityForERC721.sol";

// constants
import "./LSP8CompatibilityConstants.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
contract LSP8CompatibilityForERC721 is
    ILSP8CompatibilityForERC721,
    LSP8IdentifiableDigitalAsset,
    LSP4Compatibility
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {
        _registerInterface(_INTERFACEID_ERC721);
        _registerInterface(_INTERFACEID_ERC721METADATA);
    }

    /*
     * @dev Compatible with ERC721Metadata tokenURI.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        bytes memory data = ERC725Utils.getDataSingle(this, _LSP4_METADATA_KEY);
        return string(data);
    }

    /*
     * @dev Compatible with ERC721 ownerOf.
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

    /*
     * @dev Compatible with ERC721 approve.
     */
    function approve(address operator, uint256 tokenId)
        external
        virtual
        override
    {
        authorizeOperator(operator, bytes32(tokenId));

        emit Approval(tokenOwnerOf(bytes32(tokenId)), operator, tokenId);
    }

    /*
     * @dev Compatible with ERC721 getApproved.
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
     * @dev Compatible with ERC721 isApprovedForAll.
     */
    function isApprovedForAll(uint256 tokenId) public virtual override returns(bool) {
        return false;
    }

    /*
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

    /*
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

    function authorizeOperator(address operator, bytes32 tokenId) public virtual override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore) {
        super.authorizeOperator(operator, tokenId);

        emit Approval(tokenOwnerOf(tokenId), operator, abi.decode(abi.encodePacked(tokenId), (uint256)));
    }

    function _transfer(address from, address to, bytes32 tokenId, bool force, bytes memory data) internal virtual override {
        super._transfer(from, to, tokenId, force, data);

        emit Transfer(from, to, abi.decode(abi.encodePacked(tokenId), (uint256)));
    }

    function _mint(address to, bytes32 tokenId, bool force, bytes memory data) internal virtual override {
        super._mint(to, tokenId, force, data);

        emit Transfer(address(0), to, abi.decode(abi.encodePacked(tokenId), (uint256)));
    }

    function _burn(bytes32 tokenId, bytes memory data) internal virtual override {
        super._burn(tokenId, data);

        address tokenOwner = tokenOwnerOf(tokenId);
        emit Transfer(tokenOwner, address(0), abi.decode(abi.encodePacked(tokenId), (uint256)));
    }
}
