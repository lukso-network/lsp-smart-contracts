// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../LSP8IdentifiableDigitalAsset.sol";
import "@openzeppelin/contracts/governance/utils/Votes.sol";

/**
 * @dev Extension of LSP8 to support voting and delegation as implemented by {Votes}, where each individual NFT counts
 * as 1 vote unit.
 *
 * Tokens do not count as votes until they are delegated, because votes must be tracked which incurs an additional cost
 * on every transfer. Token holders can either delegate to a trusted representative who will decide how to make use of
 * the votes in governance decisions, or they can delegate to themselves to be their own representative.
 */
abstract contract LSP8Votes is LSP8IdentifiableDigitalAsset, Votes {
    /**
     * @dev Adjusts votes when tokens are transferred.
     *
     * Emits a {IVotes-DelegateVotesChanged} event.
     */
    function _afterTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) internal virtual override {
        _transferVotingUnits(from, to, 1);
        super._afterTokenTransfer(from, to, tokenId, data);
    }

    /**
     * @dev Returns the balance of `account`.
     *
     * WARNING: Overriding this function will likely result in incorrect vote tracking.
     */
    function _getVotingUnits(
        address account
    ) internal view virtual override returns (uint256) {
        return balanceOf(account);
    }
}
