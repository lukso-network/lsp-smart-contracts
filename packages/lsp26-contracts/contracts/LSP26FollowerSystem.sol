// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// interfaces
import {ILSP26FollowerSystem} from "./ILSP26FollowerSystem.sol";
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
    LSP26AlreadyFollowing,
    LSP26NotFollowing
} from "./LSP26Errors.sol";

contract LSP26FollowerSystem is ILSP26FollowerSystem {
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC165Checker for address;

    mapping(address => EnumerableSet.AddressSet) private _followersOf;
    mapping(address => EnumerableSet.AddressSet) private _followingsOf;

    // @inheritdoc ILSP26FollowerSystem
    function follow(address addr) public {
        _follow(addr);
    }

    // @inheritdoc ILSP26FollowerSystem
    function followBatch(address[] memory addresses) public {
        for (uint256 index = 0; index < addresses.length; ++index) {
            _follow(addresses[index]);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function unfollow(address addr) public {
        _unfollow(addr);
    }

    // @inheritdoc ILSP26FollowerSystem
    function unfollowBatch(address[] memory addresses) public {
        for (uint256 index = 0; index < addresses.length; ++index) {
            _unfollow(addresses[index]);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function isFollowing(
        address follower,
        address addr
    ) public view returns (bool) {
        return _followingsOf[follower].contains(addr);
    }

    // @inheritdoc ILSP26FollowerSystem
    function followerCount(address addr) public view returns (uint256) {
        return _followersOf[addr].length();
    }

    // @inheritdoc ILSP26FollowerSystem
    function followingCount(address addr) public view returns (uint256) {
        return _followingsOf[addr].length();
    }

    // @inheritdoc ILSP26FollowerSystem
    function getFollowsByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        uint256 sliceLength = endIndex - startIndex;

        address[] memory followings = new address[](sliceLength);

        for (uint256 index = 0; index < sliceLength; ++index) {
            followings[index] = _followingsOf[addr].at(startIndex + index);
        }

        return followings;
    }

    // @inheritdoc ILSP26FollowerSystem
    function getFollowersByIndex(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        uint256 sliceLength = endIndex - startIndex;

        address[] memory followers = new address[](sliceLength);

        for (uint256 index = 0; index < sliceLength; ++index) {
            followers[index] = _followersOf[addr].at(startIndex + index);
        }

        return followers;
    }

    function _follow(address addr) internal {
        if (msg.sender == addr) {
            revert LSP26CannotSelfFollow();
        }

        bool isAdded = _followingsOf[msg.sender].add(addr);

        if (!isAdded) {
            revert LSP26AlreadyFollowing(addr);
        }

        _followersOf[addr].add(msg.sender);

        emit Follow(msg.sender, addr);

        if (addr.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
            // solhint-disable no-empty-blocks
            try
                ILSP1UniversalReceiver(addr).universalReceiver(
                    _TYPEID_LSP26_FOLLOW,
                    abi.encodePacked(msg.sender)
                )
            {} catch {}
        }
    }

    function _unfollow(address addr) internal {
        bool isRemoved = _followingsOf[msg.sender].remove(addr);

        if (!isRemoved) {
            revert LSP26NotFollowing(addr);
        }

        _followersOf[addr].remove(msg.sender);

        emit Unfollow(msg.sender, addr);

        if (addr.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
            // solhint-disable no-empty-blocks
            try
                ILSP1UniversalReceiver(addr).universalReceiver(
                    _TYPEID_LSP26_UNFOLLOW,
                    abi.encodePacked(msg.sender)
                )
            {} catch {}
        }
    }
}
