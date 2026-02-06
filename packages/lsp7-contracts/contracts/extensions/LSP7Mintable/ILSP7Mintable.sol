// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP7Mintable
/// @dev Interface for a isMintable LSP7 token extension, allowing the owner to mint new tokens and disable minting.
interface ILSP7Mintable {
    /// @dev Emitted when minting status is changed.
    event MintingStatusChanged(bool enabled);

    /// @notice Disables minting of new tokens permanently.
    /// @dev Can only be called by the contract owner. Prevents further calls to mint after invocation.
    /// @custom:events {MintingDisabled} event.
    function disableMinting() external;

    /// @notice Mints new tokens to a specified address.
    /// @dev Mints `amount` tokens to `to`, callable only by the contract owner. Emits a Transfer event as defined in ILSP7DigitalAsset. Reverts if `to` is the zero address or if minting is disabled.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable.
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) external;
}
