// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Deployment configuration for minting feature.
/// @param isMintable True to enable minting after deployment, false to disable it forever.
/// @param initialMintTokenIds Array of tokenIds to mint to `newOwner_` on deployment.
struct LSP8MintableParams {
    bool isMintable;
    bytes32[] initialMintTokenIds;
}

/// @dev Deployment configuration for capped balance and capped supply features.
/// @param tokenBalanceCap The maximum number of NFTs per address, 0 to disable.
/// @param tokenSupplyCap The maximum total supply of NFTs, 0 to disable.
struct LSP8CappedParams {
    uint256 tokenBalanceCap;
    uint256 tokenSupplyCap;
}

/// @dev Deployment configuration for non-transferable feature.
/// @param transferLockStart The start timestamp of the transfer lock period, 0 to disable.
/// @param transferLockEnd The end timestamp of the transfer lock period, 0 to disable.
struct LSP8NonTransferableParams {
    uint256 transferLockStart;
    uint256 transferLockEnd;
}

/// @dev Deployment configuration for revokable feature.
/// @param isRevokable True to enable token revocation after deployment, false to disable it.
struct LSP8RevokableParams {
    bool isRevokable;
}
