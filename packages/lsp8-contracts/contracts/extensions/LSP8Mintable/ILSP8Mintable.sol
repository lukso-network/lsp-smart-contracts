// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8Mintable
/// @dev Interface for a mintable LSP8 token extension, allowing the owner to mint new tokens and disable minting.
interface ILSP8Mintable {
    /// @dev Emitted when minting status is changed.
    event MintingStatusChanged(bool indexed enabled);

    /// @notice Disables minting of new tokens permanently.
    /// @dev Can only be called by the contract owner. Prevents further calls to mint after invocation.
    /// @custom:events {MintingDisabled} event.
    function disableMinting() external;

    /// @notice Mints a new token with the specified tokenId to a given address.
    /// @dev Mints a token with `tokenId` to `to`, callable only by the contract owner. Emits a Transfer event as defined in ILSP8IdentifiableDigitalAsset. Reverts if `to` is the zero address, if minting is disabled, or if the tokenId already exists.
    /// @param to The address to receive the minted token.
    /// @param tokenId The unique identifier for the token to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`'s UniversalReceiver hook, if applicable.
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) external;
}
