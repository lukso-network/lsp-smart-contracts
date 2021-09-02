// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "../_LSPs/ILSP1_UniversalReceiver.sol";
import "./IERC721-LSPX.sol";

// modules
import "@openzeppelin/contracts/security/Pausable.sol";
// TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

// library
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract ERC721LSPX is Pausable, ERC725Y, IERC721LSPX {
    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    using EnumerableSet for EnumerableSet.AddressSet;

    //
    // --- Storage: Fixed
    //

    // TODO: we should change this to something unique like `keccak256("ERC721TokensRecipient")`.
    //
    // We are including this so we can use the existing `UniversalReceiverAddressStore` which only
    // works with `ERC777UniversalReceiver`.. so we spoof it
    //
    // keccak256("ERC777TokensRecipient")
    bytes32 internal constant _TOKENS_RECIPIENT_INTERFACE_HASH =
        0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

    // TODO: we should change this to something unique like `keccak256("ERC721TokensSender")`.
    //
    // We are including this as a placeholder until `UniversalReceiverAddressStore` can handle more
    // than one hardcoded `typeId`.
    //
    // keccak256("ERC777TokensRecipient")
    bytes32 internal constant _TOKENS_SENDER_INTERFACE_HASH =
        0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895; // keccak256("ERC777TokensSender")

    bytes4 private constant _INTERFACE_ID_LSP1 = 0x6bb56a14;

    uint256 private _tokenSupplyCap;
    uint256 private _mintedTokens;
    string private _name;
    string private _symbol;

    //
    // --- Storage: Dynamic
    //

    // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
    EnumerableSet.AddressSet private _tokenHolders;

    // Mapping from token ID to owner address
    mapping(bytes32 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(bytes32 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping from token ID to metadata address (an ERC725Y contract)
    mapping(bytes32 => address) private _metadata;

    //
    // --- Initialize
    //

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 tokenSupplyCap_
    ) ERC725Y(msg.sender) {
        _name = name_;
        _symbol = symbol_;

        require(tokenSupplyCap_ > 0, "ERC721-LSPX: TokenSupplyCapRequired");
        _tokenSupplyCap = tokenSupplyCap_;
    }

    //
    // --- Token queries
    //

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the total amount of tokens stored by the contract.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _tokenSupplyCap;
    }

    /**
     * @dev Returns the number of tokens that have been minted.
     */
    function mintedSupply() public view virtual override returns (uint256) {
        return _mintedTokens;
    }

    /**
     * @dev Returns the number of tokens available to be minted.
     */
    function mintableSupply() public view override returns (uint256) {
        return _tokenSupplyCap - _mintedTokens;
    }

    /**
     * @dev Returns a bytes32 array of all token holder addresses
     */
    function allTokenHolders() public view override returns (bytes32[] memory) {
        // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
        // as its marked in implementation with "TODO remove in main chain makes transfers to expensive"

        return _tokenHolders._inner._values;
    }

    //
    // --- Token ID owner queries
    //

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     *
     * * Requirements:
     *
     * - `owner` cannot be the zero address.
     */
    function balanceOf(address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERC721-LSPX: balance query for the zero address"
        );
        return _balances[owner];
    }

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(bytes32 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = _owners[tokenId];
        require(
            owner != address(0),
            "ERC721-LSPX: owner query for nonexistent token"
        );
        return owner;
    }

    //
    // --- Metadata functionality
    //

    /**
     * @dev Returns the metadata address of the `tokenId` token;
     *
     * * Requirements:
     *
     * - `tokenId` must exist.
     */
    function metadataOf(bytes32 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(
            _exists(tokenId),
            "ERC721-LSPX: metadata query for nonexistent token"
        );

        address storageContract = _metadata[tokenId];

        return storageContract;
    }

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
        // TODO: can use a proxy pattern here
        address storageContract = address(new ERC725Y(_msgSender()));

        _metadata[tokenId] = storageContract;
        emit MetadataCreated(tokenId, storageContract);

        return storageContract;
    }

    //
    // --- Approval functionality
    //

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(bytes32 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(
            _exists(tokenId),
            "ERC721-LSPX: approved query for nonexistent token"
        );

        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        require(operator != _msgSender(), "ERC721: approve to caller");

        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, bytes32 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721-LSPX: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721-LSPX: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits a {Approval} event.
     */
    function _approve(address to, bytes32 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, bytes32 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721-LSPX: operator query for nonexistent token"
        );
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    //
    // --- Transfer functionality
    //

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        bytes32 tokenId
    ) public virtual override {
        transferFrom(from, to, tokenId, "");
    }

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) public virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(from, to, tokenId, data);
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(bytes32 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `mintableSupply()` must be greater than zero.
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        bytes32 tokenId,
        bytes memory data
    ) internal virtual {
        require(mintableSupply() > 0, "ERC721-LSPX: mintableSupply is zero");
        require(to != address(0), "ERC721-LSPX: mint to the zero address");
        require(!_exists(tokenId), "ERC721-LSPX: token already minted");

        _beforeTokenTransfer(address(0), to, tokenId);

        _balances[to] += 1;
        _owners[tokenId] = to;

        _callTokensReceived(address(0), to, tokenId, data);

        // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
        _tokenHolders.add(to);

        emit Transfer(address(0), to, tokenId);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(bytes32 tokenId, bytes memory data) internal virtual {
        address owner = ownerOf(tokenId);

        _callTokensToSend(owner, address(0), tokenId, data);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        _balances[owner] -= 1;
        delete _owners[tokenId];

        // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
        if (balanceOf(owner) == 0) {
            _tokenHolders.remove(owner);
        }

        emit Transfer(owner, address(0), tokenId);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) internal virtual {
        require(
            ownerOf(tokenId) == from,
            "ERC721: transfer of token that is not own"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _callTokensToSend(from, to, tokenId, data);

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        _callTokensReceived(from, to, tokenId, data);

        // TODO: only here to satisfy LSP4DigitalCertificate `_tokenHolders`, possibly drops for mainnet
        _tokenHolders.add(to);
        if (balanceOf(from) == 0) {
            _tokenHolders.remove(from);
        }

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId
    ) internal virtual {
        // silence compiler warning about unused variable
        tokenId;

        // token being minted
        if (from == address(0)) {
            _mintedTokens += 1;
        }

        // token being burned
        if (to == address(0)) {
            _mintedTokens -= 1;
        }
    }

    /**
     * @dev We are using this hook from ERC777 to provide some parity for checks. The usual ERC721
     * hook `_beforeTokenTransfer` doesn't seem correct for this use case as it is not called when
     * receiver is address(0) in ERC777.
     *
     */
    function _callTokensToSend(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) private {
        if (
            ERC165Checker.supportsERC165(from) &&
            ERC165Checker.supportsInterface(from, _INTERFACE_ID_LSP1)
        ) {
            bytes memory packedData = abi.encodePacked(from, to, tokenId, data);
            ILSP1(from).universalReceiver(
                _TOKENS_SENDER_INTERFACE_HASH,
                packedData
            );
        }
    }

    /**
     * @dev We are using this hook from ERC777 to provide some parity for hooks. The usual ERC721
     * hook `_beforeTokenTransfer` doesn't seem correct for this use case, as this hook is run
     * after the transfer of tokens has occured & is not called when receiver is address(0) in
     * ERC777.
     */
    function _callTokensReceived(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) private {
        if (
            ERC165Checker.supportsERC165(to) &&
            ERC165Checker.supportsInterface(to, _INTERFACE_ID_LSP1)
        ) {
            bytes memory packedData = abi.encodePacked(from, to, tokenId, data);
            ILSP1(to).universalReceiver(
                _TOKENS_RECIPIENT_INTERFACE_HASH,
                packedData
            );
        }
    }

    //
    // --- ERC165 functionality
    //

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC721LSPX).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
