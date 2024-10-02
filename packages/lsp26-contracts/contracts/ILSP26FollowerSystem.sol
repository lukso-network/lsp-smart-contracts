// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface ILSP26FollowerSystem {
    /// @notice Emitted when following an address.
    /// @param follower The address that follows `addr`
    /// @param addr The address that is followed by `follower`
    event Follow(address indexed follower, address indexed addr);

    /// @notice Emitted when unfollowing an address.
    /// @param unfollower The address that unfollows `addr`
    /// @param addr The address that is unfollowed by `follower`
    event Unfollow(address indexed unfollower, address indexed addr);

    /// @notice Emitted when a follower is removed.
    /// @param followee The address that removed the follower.
    /// @param follower The address that was removed.
    event RemovedFollower(address indexed followee, address indexed follower);

    /// @notice Emitted when an address is blocked.
    /// @param initiator The address that blocked the other address.
    /// @param addr The address that was blocked.
    event Block(address indexed initiator, address indexed addr);

    /// @notice Emitted when an address is unblocked.
    /// @param initiator The address that unblocked the other address.
    /// @param addr The address that was unblocked.
    event Unblock(address indexed initiator, address indexed addr);

    /// @notice Emitted when the `requiresApproval` setting is toggled.
    /// @param owner The address that toggled the approval setting.
    /// @param requiresApproval The new state of the `requiresApproval` setting.
    event RequiresApprovalSet(address indexed owner, bool requiresApproval);

    /// @notice Emitted when a follow request is sent.
    /// @param requester The address that sent the follow request.
    /// @param target The address that received the follow request.
    event FollowRequestSent(address indexed requester, address indexed target);

    /// @notice Emitted when a follow request is approved.
    /// @param approver The address that approved the follow request.
    /// @param follower The address that sent the follow request.
    event FollowRequestApproved(address indexed approver, address indexed follower);

    /// @notice Emitted when a follow request is rejected.
    /// @param rejector The address that rejected the follow request.
    /// @param follower The address that sent the follow request.
    event FollowRequestRejected(address indexed rejector, address indexed follower);

    /// @notice Set whether following requires approval from the followee.
    /// @param requiresApproval True if following requires approval from the followee, false otherwise.
    /// @custom:events {RequiresApprovalSet} event when toggling the approval setting.
    function setRequiresApproval(bool requiresApproval) external;

    /// @notice Follow an specific address.
    /// @param addr The address to start following.
    /// @custom:events {Follow} event when following an address.
    function follow(address addr) external;

    /// @notice Follow a list of addresses.
    /// @param addresses The list of addresses to follow.
    /// @custom:events {Follow} event when following each address in the list.
    function followBatch(address[] memory addresses) external;

    /// @notice Unfollow a specific address.
    /// @param addr The address to stop following.
    /// @custom:events {Unfollow} event when unfollowing an address.
    function unfollow(address addr) external;

    /// @notice Unfollow a list of addresses.
    /// @param addresses The list of addresses to unfollow.
    /// @custom:events {Unfollow} event when unfollowing each address in the list.
    function unfollowBatch(address[] memory addresses) external;

    /// @notice Handles follow request pending approval/rejection.
    /// @param follower Address that requested follow, pending approval/rejection.
    /// @param isApproved True if follower is approved, false if rejected.
    /// @custom:events {FollowRequestApproved} event when a follow request is approved.
    /// @custom:events {FollowRequestRejected} event when a follow request is rejected.
    function respondToFollowRequest(address follower, bool isApproved) external;

    /// @notice Handles multiple follow requests in a batch operation.
    /// @param followers An array of addresses that sent follow requests.
    /// @param approvals An array of booleans indicating whether each corresponding follow request is approved (true) or rejected (false).
    /// @custom:events {FollowRequestApproved} event when a follow request is approved.
    /// @custom:events {FollowRequestRejected} event when a follow request is rejected.
    function respondToFollowRequestBatch(address[] calldata followers, bool[] calldata approvals) external;

    /// @notice Removes specific follower from follower's list.
    /// @param follower The address to be removed.
    /// @custom:events {RemoveFollower} event when removing a follower.
    function removeFollower(address follower) external;

    /// @notice Removes an array of followers from follower's list.
    /// @param followers The addresses to be removed.
    /// @custom:events {RemoveFollower} event when removing a follower in the list.
    function removeFollowerBatch(address[] memory followers) external;

    /// @notice Block a specific address. If the address is a follower, remove first, then block.
    /// @param addr The address to block.
    /// @custom:events {Block} event when blocking an address.
    function blockAddress(address addr) external;

    /// @notice Block an array of addresses.
    /// @param addresses The addresses to block.
    /// @custom:events {Block} event when blocking an address in the list.
    function blockBatch(address[] memory addresses) external;

    /// @notice Unblock a specific address.
    /// @param addr The address to unblock.
    /// @custom:events {Unblock} event when unblocking an address.
    function unblockAddress(address addr) external;

    /// @notice Unblock an array of addresses.
    /// @param addresses The addresses to unblock.
    /// @custom:events {Unblock} event when unblocking an address in the list.
    function unblockBatch(address[] memory addresses) external;

    /// @notice Get if the following requires approval from the followee.
    /// @param addr The address to check.
    /// @return True if the address requires approval for following, false otherwise.
    function isApprovalRequired(address addr) external view returns (bool);

    /// @notice Check if an address is blocked.
    /// @param blocker The address that might have blocked the other address.
    /// @param blocked The address that might be blocked.
    /// @return True if the address is blocked, false otherwise.
    function isBlocked(address blocker, address blocked) external view returns (bool);

    /// @notice Check if an address is following a specific address.
    /// @param follower The address of the follower to check.
    /// @param followee The address being followed.
    /// @return True if `follower` is following `addr`, false otherwise.
    function isFollowing(
        address follower,
        address followee
    ) external view returns (bool);

    /// @notice Get the number of followers for an address.
    /// @param addr The address whose followers count is requested.
    /// @return The number of followers of `addr`.
    function followerCount(address addr) external view returns (uint256);

    /// @notice Get the number of addresses an address is following.
    /// @param addr The address of the follower whose following count is requested.
    /// @return The number of addresses that `addr` is following.
    function followingCount(address addr) external view returns (uint256);

    /// @notice Get the list of addresses the given address is following within a specified range.
    /// @param addr The address whose followed addresses are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses followed by the given address.
    function getFollowsByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Get the list of addresses that follow an address within a specified range.
    /// @param addr The address whose followers are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses that are following an addresses.
    function getFollowersByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Get the number of pending requests for an address.
    /// @param addr The address whose pending requests count is requested.
    /// @return The number of pending requests for `addr`.
    function pendingRequestCount(address addr) external view returns (uint256);

    /// @notice Get the list of pending follow requests for an address within a specified range.
    /// @param addr The address whose pending follow requests are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses that have sent follow requests to `addr`.
    function getPendingFollowRequests(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Get the number of blocked addresses for an address.
    /// @param addr The address whose blocked addresses count is requested.
    /// @return The number of blocked addresses for `addr`.
    function blockedCount(address addr) external view returns (uint256);

    /// @notice Get the list of blocked addresses for an address within a specified range.
    /// @param addr The address whose blocked addresses are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses that are blocked by `addr`.
    function getBlockedAddresses(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);
}
