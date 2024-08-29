// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

error LSP26CannotSelfFollow();

error LSP26AlreadyFollowing(address addr);

error LSP26NotFollowing(address addr);

error LSP26CannotRemoveNonFollower(address addr);

error LSP26CannotRemoveSelf();

error LSP26CannotBlockSelf();

error LSP26CannotUnblockSelf();

error LSP26AlreadyBlocked(address addr);

error LSP26NotBlocked(address addr);

error LSP26NoFollowRequestPending(address follower);

error LSP26FollowRequestAlreadyPending(address addr);