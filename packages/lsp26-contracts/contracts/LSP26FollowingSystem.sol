// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// interafces
import {ILSP26FollowingSystem} from "./ILSP26FollowingSystem.sol";
import {
    ILSP1UniversalReceiver
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import {
    _TYPEID_LSP26_FOLLOW,
    _TYPEID_LSP26_UNFOLLOW
} from "./LSP26Constants.sol";
import {
    _INTERFACEID_LSP1
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";

// errors
import {
    LSP26CannotSelfFollow,
    LSP26CannotSelfUnfollow,
    LSP26AlreadyFollowing,
    LSP26NotFollowing
} from "./LSP26Errors.sol";

contract LSP26FollowingSystem is ILSP26FollowingSystem {
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC165Checker for address;

    mapping(address => EnumerableSet.AddressSet) private _followersOf;
    mapping(address => EnumerableSet.AddressSet) private _followingsOf;

    // @inheritdoc ILSP26FollowingSystem
    function follow(address addr) public {
        _follow(addr);
    }

    // @inheritdoc ILSP26FollowingSystem
    function followBatch(address[] memory addresses) public {
        for (uint256 index = 0; index < addresses.length; index++) {
            _follow(addresses[index]);
        }
    }

    // @inheritdoc ILSP26FollowingSystem
    function unfollow(address addr) public {
        if (msg.sender == addr) {
            revert LSP26CannotSelfUnfollow();
        }

        if (!_followingsOf[msg.sender].contains(addr)) {
            revert LSP26NotFollowing(addr);
        }

        _followingsOf[msg.sender].add(addr);
        _followersOf[addr].remove(msg.sender);

        if (addr.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
            // solhint-disable no-empty-blocks
            try
                ILSP1UniversalReceiver(addr).universalReceiver(
                    _TYPEID_LSP26_UNFOLLOW,
                    abi.encodePacked(msg.sender)
                )
            {} catch {}
            // returns (bytes memory data) {} catch {}
        }

        emit Unfollow(msg.sender, addr);
    }

    // @inheritdoc ILSP26FollowingSystem
    function isFollowing(
        address follower,
        address addr
    ) public view returns (bool) {
        return _followingsOf[follower].contains(addr);
    }

    // @inheritdoc ILSP26FollowingSystem
    function followerCount(address addr) public view returns (uint256) {
        return _followersOf[addr].length();
    }

    // @inheritdoc ILSP26FollowingSystem
    function followingCount(address addr) public view returns (uint256) {
        return _followingsOf[addr].length();
    }

    // @inheritdoc ILSP26FollowingSystem
    function getFollowingByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        address[] memory followings = new address[](endIndex - startIndex);

        for (uint256 index = 0; index < endIndex - startIndex; index++) {
            followings[index] = _followingsOf[addr].at(startIndex + index);
        }

        return followings;
    }

    // @inheritdoc ILSP26FollowingSystem
    function getFollowersByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        address[] memory followers = new address[](endIndex - startIndex);

        for (uint256 index = 0; index < endIndex - startIndex; index++) {
            followers[index] = _followersOf[addr].at(startIndex + index);
        }

        return followers;
    }

    function _follow(address addr) internal {
        if (msg.sender == addr) {
            revert LSP26CannotSelfFollow();
        }

        if (_followingsOf[msg.sender].contains(addr)) {
            revert LSP26AlreadyFollowing(addr);
        }

        _followingsOf[msg.sender].add(addr);
        _followersOf[addr].add(msg.sender);

        if (addr.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
            // solhint-disable no-empty-blocks
            try
                ILSP1UniversalReceiver(addr).universalReceiver(
                    _TYPEID_LSP26_FOLLOW,
                    abi.encodePacked(msg.sender)
                )
            {} catch {}
            // returns (bytes memory data) {} catch {}
        }

        emit Follow(msg.sender, addr);
    }
}
