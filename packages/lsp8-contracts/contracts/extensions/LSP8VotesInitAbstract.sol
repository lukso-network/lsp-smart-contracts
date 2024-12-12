// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    VotesUpgradeable
} from "@openzeppelin/contracts-upgradeable/governance/utils/VotesUpgradeable.sol";
import {
    _TYPEID_LSP8_VOTESDELEGATOR,
    _TYPEID_LSP8_VOTESDELEGATEE
} from "./LSP8VotesConstants.sol";
import {LSP1Utils} from "@lukso/lsp-smart-contracts/contracts/LSP1UniversalReceiver/LSP1Utils.sol";
/**
 * @dev Extension of LSP8 to support voting and delegation as implemented by {Votes}, where each individual NFT counts
 * as 1 vote unit.
 *
 * Tokens do not count as votes until they are delegated, because votes must be tracked which incurs an additional cost
 * on every transfer. Token holders can either delegate to a trusted representative who will decide how to make use of
 * the votes in governance decisions, or they can delegate to themselves to be their own representative.
 */
abstract contract LSP8VotesInitAbstract is
    LSP8IdentifiableDigitalAssetInitAbstract,
    VotesUpgradeable
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_,
        uint256 tokenIdFormat_,
        string memory version_
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            tokenIdType_,
            tokenIdFormat_
        );
        __EIP712_init(name_, version_);
    }

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

        /**
     * @dev Override of the {Votes-_delegate} function to add LSP1 notifications.
     * Notifies both the delegator and delegatee through LSP1.
     */
    function _delegate(address delegator, address delegatee) internal virtual override {
        address currentDelegate = delegates(delegator);
        uint256 delegatorBalance = balanceOf(delegator);

        super._delegate(delegator, delegatee);

        // Notify the delegator if it's not address(0)
        if (delegator != address(0)) {
            bytes memory delegatorNotificationData = abi.encode(
                msg.sender,
                delegatee,
                delegatorBalance
            );
            LSP1Utils.notifyUniversalReceiver(
                delegator,
                _TYPEID_LSP8_VOTESDELEGATOR,
                delegatorNotificationData
            );
        }

        // Only notify the new delegatee if it's not address(0) and if there's actual voting power
        if (delegatee != address(0) && delegatorBalance > 0) {
            bytes memory delegateeNotificationData = abi.encode(
                msg.sender,
                delegator,
                delegatorBalance
            );

            LSP1Utils.notifyUniversalReceiver(
                delegatee,
                _TYPEID_LSP8_VOTESDELEGATEE,
                delegateeNotificationData
            );
        }
    }
}
