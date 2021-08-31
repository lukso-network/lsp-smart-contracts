// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "../_LSPs/ILSP1_UniversalReceiver.sol";

// modules
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721LSPXUniversalReceiver is ERC721 {
    //
    // --- Storage: Fixed
    //

    // TODO: we should change this to `keccak256("ERC721TokensRecipient")`.
    //
    // We are including this so we can use the existing `UniversalReceiverAddressStore` which only
    // works with `ERC777UniversalReceiver`.. so we spoof it
    //
    // keccak256("ERC777TokensRecipient")
    bytes32 internal constant _ERC777_TOKENS_RECIPIENT_INTERFACE_HASH =
        0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

    // TODO: we should change this to `keccak256("ERC777TokensSender")`.
    //
    // We are including this as a placeholder until `UniversalReceiverAddressStore` can handle more
    // than one hardcoded `typeId`.
    //
    // keccak256("ERC777TokensRecipient")
    bytes32 internal constant _TOKENS_SENDER_INTERFACE_HASH =
        0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895; // keccak256("ERC777TokensSender")

    bytes4 private constant _INTERFACE_ID_LSP1 = 0x6bb56a14;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    //
    // --- Internal override
    //

    /**
     * @dev We expect that most `to` addresses will be the contract `LSP3Account` which does not
     * support the check `IERC721Receiver(to).onERC721Received`. Instead uses the `universalReceiver`
     * pattern, which is handled in the `_beforeTokenTransfer` hook. We will check that the contract
     * contract supports the expected interface LSP1.
     *
     * Overriding this function as `_checkOnERC721Received` does not have `virtual` modifier.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual override {
        // silence warning about unused variable
        _data;

        _mint(to, tokenId);
        _callTokensReceived(address(0), to, tokenId);
        // TODO: should we also mimic _callTokensToSend from ERC777?
    }

    /**
     * @dev We expect that most `to` addresses will be the contract `LSP3Account` which does not
     * support the check `IERC721Receiver(to).onERC721Received`. Instead uses the `universalReceiver`
     * pattern, which is handled in the `_beforeTokenTransfer` hook. We will check that the contract
     * supports the expected interface LSP1.
     *
     * Overriding this function as `_checkOnERC721Received` does not have `virtual` modifier.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual override {
        // silence warning about unused variable
        _data;

        _callTokensToSend(from, to, tokenId);
        _transfer(from, to, tokenId);
        _callTokensReceived(from, to, tokenId);
    }

    /**
     * @dev We are mirroring this hook from ERC777 to provide some parity for hooks. The usual
     * ERC721 `_beforeTokenTransfer` doesn't seem correct for this use case, as this hook is run
     * after the transfer of tokens has occured.
     *
     * NOTE: We are spoofing the typeId sent as the
     * `UniversalReceiverAddressStore.universalReceiverDelegate` is hard coded for ERC777 interface
     * hash `keccak256("ERC777TokensRecipient")`.
     */
    function _callTokensReceived(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        if (
            ERC165Checker.supportsERC165(to) &&
            ERC165Checker.supportsInterface(to, _INTERFACE_ID_LSP1)
        ) {
            bytes memory data = abi.encodePacked(from, to, tokenId);
            ILSP1(to).universalReceiver(
                _ERC777_TOKENS_RECIPIENT_INTERFACE_HASH,
                data
            );
        }
    }

    /**
     * @dev We are mirroring this hook from ERC777 to provide some parity for checks. The usual
     * ERC721 `_beforeTokenTransfer` could be correct for this use case.
     *
     * NOTE: the equivalent for LSP4 `ERC777UniversalReceiver` has two hooks `_callTokensToSend` and
     * `_callTokensReceived` which have different params. We are spoofing the typeId sent as the
     * the Lukso `UniversalReceiverAddressStore.universalReceiverDelegate` is hard coded for ERC777
     * interface hash `keccak256("ERC777TokensRecipient")`.
     *
     * TODO: we should also have `callTokensToSend` as a hook
     */
    function _callTokensToSend(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        if (
            ERC165Checker.supportsERC165(to) &&
            ERC165Checker.supportsInterface(to, _INTERFACE_ID_LSP1)
        ) {
            bytes memory data = abi.encodePacked(from, to, tokenId);
            ILSP1(to).universalReceiver(
                _ERC777_TOKENS_RECIPIENT_INTERFACE_HASH,
                data
            );
        }
    }
}
