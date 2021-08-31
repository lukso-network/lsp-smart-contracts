// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "./IERC721-LSPX.sol";

// modules
import "@openzeppelin/contracts/security/Pausable.sol";
// TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";
import "./ERC721-LSPX-UniversalReceiver.sol";

contract ERC721LSPX is
    Pausable,
    ERC725Y,
    ERC721LSPXUniversalReceiver /*, IERC721LSPX */
{
    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    using EnumerableSet for EnumerableSet.AddressSet;

    //
    // --- Storage: Dynamic
    //

    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    EnumerableSet.AddressSet private _tokenHolders;

    // maps a tokenId to its metadata (an ERC725Y contract)
    mapping(bytes32 => address) private _metadata;

    //
    // --- Events
    //

    /**
     * @dev Emitted when `tokenId` token has a metadata contract created at address
     * `storageContract`
     */
    event MetadataCreated(
        bytes32 indexed tokenId,
        address indexed storageContract
    );

    //
    // --- Initialize
    //

    constructor(string memory name, string memory symbol)
        ERC721LSPXUniversalReceiver(name, symbol)
        ERC725Y(msg.sender)
    {}

    //
    // --- Getters
    //

    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    //
    // NOTE: this is marked with "TODO remove in main chain makes transfers to expensive"
    function allTokenHolders() public view returns (bytes32[] memory) {
        return _tokenHolders._inner._values;
    }

    /**
     * @dev Returns the address of the ERC725Y for a tokenIds metadata;
     */
    function metadataOf(bytes32 tokenId) public view virtual returns (address) {
        require(
            _exists(tokenId),
            "ERC721-LSPX: metadata query for nonexistent token"
        );

        address storageContract = _metadata[tokenId];

        return storageContract;
    }

    function ownerOf(bytes32 tokenId) public view virtual returns (address) {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return ownerOf(tokenIdAsNumber);
    }

    function getApproved(bytes32 tokenId)
        public
        view
        virtual
        returns (address)
    {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return getApproved(tokenIdAsNumber);
    }

    //
    // --- Metadata functionality
    //

    /**
     * @dev Create a ERC725Y contract to be used for metadata storage of a tokenId.
     */
    function _createMetadataFor(bytes32 tokenId)
        internal
        virtual
        returns (address)
    {
        require(
            _exists(tokenId),
            "ERC721-LSPX: metadata creation for nonexistent token"
        );

        address existingStorageContract = _metadata[tokenId];
        if (existingStorageContract != address(0)) {
            return existingStorageContract;
        }
        // TODO: we can use a proxy pattern here
        address storageContract = address(new ERC725Y(_msgSender()));

        _metadata[tokenId] = storageContract;
        emit MetadataCreated(tokenId, storageContract);

        return storageContract;
    }

    //
    // --- Transfer functionality
    //

    function approve(address to, bytes32 tokenId) public virtual {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return approve(to, tokenIdAsNumber);
    }

    function transferFrom(
        address from,
        address to,
        bytes32 tokenId
    ) public virtual {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return transferFrom(from, to, tokenIdAsNumber);
    }

    function safeTransferFrom(
        address from,
        address to,
        bytes32 tokenId
    ) public virtual {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return safeTransferFrom(from, to, tokenIdAsNumber);
    }

    function safeTransferFrom(
        address from,
        address to,
        bytes32 tokenId,
        bytes calldata data
    ) public virtual {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return safeTransferFrom(from, to, tokenIdAsNumber, data);
    }

    //
    // --- Public overrides
    //

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, ERC721)
        returns (bool)
    {
        return
            interfaceId == type(IERC721LSPX).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    //
    // --- Internal overrides
    //

    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    function _transfer(
        address from,
        address to,
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenId
    ) internal virtual override {
        super._transfer(from, to, tokenId);

        _tokenHolders.add(to);

        if (balanceOf(from) == 0) {
            _tokenHolders.remove(from);
        }
    }

    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    function _mint(
        address to,
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenId
    ) internal virtual override {
        super._mint(to, tokenId);

        _tokenHolders.add(to);
    }

    function _safeMint(address to, bytes32 tokenId) internal virtual {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        _safeMint(to, tokenIdAsNumber);
    }

    function _exists(bytes32 tokenId) internal view virtual returns (bool) {
        // TODO: we are moving tokenId to a bytes32 value.. since we are also making name changes to
        // standardize token interfaces, we will move away from openzeppelin inheritance and can
        // update these "standard" functions to work with the bytes32 value
        uint256 tokenIdAsNumber = uint256(tokenId);
        return _exists(tokenIdAsNumber);
    }
}
