// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface ILSP26FollowingSystem {
    event Follow(address follower, address addr);
    event Unfollow(address unfollower, address addr);

    /// @notice Follow an specific address.
    /// @custom:events {Follow} event when following someone.
    /// @param addr The address to start following.
    function follow(address addr) external;

    /// @notice Unfollow a specific address.
    /// @custom:events {Unfollow} event when unfollowing someone.
    /// @param addr The address to stop following.
    function unfollow(address addr) external;

    /// @notice Checks if an address is following a specific address.
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

    /// @notice Get the number an address is following.
    /// @param addr The address whose following count is requested.
    /// @return The number of users that `addr` is following.
    function followingCount(address addr) external view returns (uint256);

    /// @notice Get a list of addresses, the given address is following within a specified range.
    /// @param addr The address whose followed addresses are requested.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses followed by the given address.
    function getFollowsByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Get a list of addresses that follow an address within a specified range.
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
