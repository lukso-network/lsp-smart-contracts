// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface ILSP26FollowerSystem {
    /// @notice Emitted when following an address.
    /// @param follower The address that follows `addr`
    /// @param addr The address that is followed by `follower`
    event Follow(address follower, address addr);

    /// @notice Emitted when unfollowing an address.
    /// @param unfollower The address that unfollows `addr`
    /// @param addr The address that is unfollowed by `follower`
    event Unfollow(address unfollower, address addr);

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
    /// @custom:events {Follow} event when unfollowing each address in the list.
    function unfollowBatch(address[] memory addresses) external;

    /// @notice Check if an address is following a specific address.
    /// @param follower The address of the follower to check.
    /// @param addr The address being followed.
    /// @return True if `follower` is following `addr`, false otherwise.
    function isFollowing(
        address follower,
        address addr
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
}
