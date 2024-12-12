// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    _TYPEID_LSP0_VALUE_RECEIVED,
    _TYPEID_LSP0_OwnershipTransferStarted,
    _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP0_OwnershipTransferred_RecipientNotification
} from "@lukso/lsp0-contracts/contracts/LSP0Constants.sol";
import {
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT,
    _TYPEID_LSP7_TOKENOPERATOR
} from "@lukso/lsp7-contracts/contracts/LSP7Constants.sol";
import {
    _TYPEID_LSP7_VOTESDELEGATOR,
    _TYPEID_LSP7_VOTESDELEGATEE
} from "@lukso/lsp7-contracts/contracts/extensions/LSP7VotesConstants.sol";
import {
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT,
    _TYPEID_LSP8_TOKENOPERATOR
} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import {
    _TYPEID_LSP8_VOTESDELEGATOR,
    _TYPEID_LSP8_VOTESDELEGATEE
} from "@lukso/lsp8-contracts/contracts/extensions/LSP8VotesConstants.sol";
import {
    _TYPEID_LSP9_VALUE_RECEIVED,
    _TYPEID_LSP9_OwnershipTransferStarted,
    _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
} from "@lukso/lsp9-contracts/contracts/LSP9Constants.sol";
import {
    _TYPEID_LSP14_OwnershipTransferStarted,
    _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
} from "@lukso/lsp14-contracts/contracts/LSP14Constants.sol";
import {
    _TYPEID_LSP26_FOLLOW,
    _TYPEID_LSP26_UNFOLLOW
} from "@lukso/lsp26-contracts/contracts/LSP26Constants.sol";

error LSP1TypeIdHashIsWrong(bytes32 typeIdHash, string typeIdname);

contract LSP1TypeIDsTester {
    mapping(string => bytes32) private _typeIds;

    constructor() {
        // ------ LSP0 ------
        _typeIds["LSP0ValueReceived"] = _TYPEID_LSP0_VALUE_RECEIVED;
        _typeIds[
            "LSP0OwnershipTransferStarted"
        ] = _TYPEID_LSP0_OwnershipTransferStarted;
        _typeIds[
            "LSP0OwnershipTransferred_SenderNotification"
        ] = _TYPEID_LSP0_OwnershipTransferred_SenderNotification;
        _typeIds[
            "LSP0OwnershipTransferred_RecipientNotification"
        ] = _TYPEID_LSP0_OwnershipTransferred_RecipientNotification;
        // ------------------

        // ------ LSP7 ------
        _typeIds["LSP7Tokens_SenderNotification"] = _TYPEID_LSP7_TOKENSSENDER;
        _typeIds[
            "LSP7Tokens_RecipientNotification"
        ] = _TYPEID_LSP7_TOKENSRECIPIENT;
        _typeIds[
            "LSP7Tokens_OperatorNotification"
        ] = _TYPEID_LSP7_TOKENOPERATOR;
        _typeIds[
            "LSP7Tokens_VotesDelegatorNotification"
        ] = _TYPEID_LSP7_VOTESDELEGATOR;
        _typeIds[
            "LSP7Tokens_VotesDelegateeNotification"
        ] = _TYPEID_LSP7_VOTESDELEGATEE;
        // ------------------

        // ------ LSP8 ------
        _typeIds["LSP8Tokens_SenderNotification"] = _TYPEID_LSP8_TOKENSSENDER;
        _typeIds[
            "LSP8Tokens_RecipientNotification"
        ] = _TYPEID_LSP8_TOKENSRECIPIENT;
        _typeIds[
            "LSP8Tokens_OperatorNotification"
        ] = _TYPEID_LSP8_TOKENOPERATOR;
        _typeIds[
            "LSP8Tokens_VotesDelegatorNotification"
        ] = _TYPEID_LSP8_VOTESDELEGATOR;
        _typeIds[
            "LSP8Tokens_VotesDelegateeNotification"
        ] = _TYPEID_LSP8_VOTESDELEGATEE;
        // ------------------

        // ------ LSP9 ------
        _typeIds["LSP9ValueReceived"] = _TYPEID_LSP9_VALUE_RECEIVED;
        _typeIds[
            "LSP9OwnershipTransferStarted"
        ] = _TYPEID_LSP9_OwnershipTransferStarted;
        _typeIds[
            "LSP9OwnershipTransferred_SenderNotification"
        ] = _TYPEID_LSP9_OwnershipTransferred_SenderNotification;
        _typeIds[
            "LSP9OwnershipTransferred_RecipientNotification"
        ] = _TYPEID_LSP9_OwnershipTransferred_RecipientNotification;
        // ------------------

        // ------ LSP14 ------
        _typeIds[
            "LSP14OwnershipTransferStarted"
        ] = _TYPEID_LSP14_OwnershipTransferStarted;
        _typeIds[
            "LSP14OwnershipTransferred_SenderNotification"
        ] = _TYPEID_LSP14_OwnershipTransferred_SenderNotification;
        _typeIds[
            "LSP14OwnershipTransferred_RecipientNotification"
        ] = _TYPEID_LSP14_OwnershipTransferred_RecipientNotification;
        // -------------------

        // ------ LSP26 ------
        _typeIds[
            "LSP26FollowerSystem_FollowNotification"
        ] = _TYPEID_LSP26_FOLLOW;
        _typeIds[
            "LSP26FollowerSystem_UnfollowNotification"
        ] = _TYPEID_LSP26_UNFOLLOW;
        // -------------------
    }

    function verifyLSP1TypeID(
        string calldata typeIdName
    ) public view returns (bytes32) {
        bytes32 typeIdHash = _typeIds[typeIdName];

        if (typeIdHash != keccak256(bytes(typeIdName))) {
            revert LSP1TypeIdHashIsWrong(typeIdHash, typeIdName);
        }

        return typeIdHash;
    }
}
