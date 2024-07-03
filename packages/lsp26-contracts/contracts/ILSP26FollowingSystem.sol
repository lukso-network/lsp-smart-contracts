// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface ILSP26FollowingSystem {
    event Follow(address follower, address addr);
    event Unfollow(address unfollower, address addr);

    /// @notice Followed `addr`.
    /// @custom:events {Follow} event when following someone.
    /// @param addr The address of the user to start following.
    function follow(address addr) external;

    /// @notice Unfollowed `addr`.
    /// @custom:events {Unfollow} event when unfollowing someone.
    /// @param addr The address of the user to stop following.
    function unfollow(address addr) external;

    /// @notice Checks if `follower` is following `addr`.
    /// @param follower The address of the follower to check.
    /// @param addr The address of the user being followed.
    /// @return True if `follower` is following `addr`, false otherwise.
    function isFollowing(
        address follower,
        address addr
    ) external view returns (bool);

    /// @notice Get the number of followers for `addr`.
    /// @param addr The address of the user whose followers count is requested.
    /// @return The number of followers of `addr`.
    function followerCount(address addr) external view returns (uint256);

    /// @notice Get the number of users that `addr` is following.
    /// @param addr The address of the follower whose following count is requested.
    /// @return The number of users that `addr` is following.
    function followingCount(address addr) external view returns (uint256);

    /// @notice Get a list of users followed by `addr` within a specified range.
    /// @param addr The address of the follower whose followed users are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses representing the users followed by `addr`.
    function getFollowingByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Get a list of users following `addr` within a specified range.
    /// @param addr The address of the user whose followers are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses representing the users following `addr`.
    function getFollowersByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);
}
