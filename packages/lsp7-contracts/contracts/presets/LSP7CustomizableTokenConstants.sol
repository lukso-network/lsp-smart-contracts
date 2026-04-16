// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Deployment configuration for minting feature.
/// @param isMintable True to enable minting after deployment, false to disable it forever.
/// @param initialMintAmount The amount of tokens to mint to `newOwner_` on deployment in wei.
struct LSP7MintableParams {
    bool isMintable;
    uint256 initialMintAmount;
}

/// @dev Deployment configuration for capped balance and capped supply features.
/// @param tokenBalanceCap The maximum balance per address in wei, 0 to disable.
/// @param tokenSupplyCap The maximum total supply in wei, 0 to disable.
struct LSP7CappedParams {
    uint256 tokenBalanceCap;
    uint256 tokenSupplyCap;
}

/// @dev Deployment configuration for non-transferable feature.
/// @param transferLockStart The start timestamp of the transfer lock period, 0 to disable.
/// @param transferLockEnd The end timestamp of the transfer lock period, 0 to disable.
struct LSP7NonTransferableParams {
    uint256 transferLockStart;
    uint256 transferLockEnd;
}

/// @dev Deployment configuration for revokable feature.
/// @param isRevokable True to enable token revocation after deployment, false to disable it.
struct LSP7RevokableParams {
    bool isRevokable;
}
