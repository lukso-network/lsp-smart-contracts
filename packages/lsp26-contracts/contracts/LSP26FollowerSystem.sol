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
    _TYPEID_LSP26_UNFOLLOW,
    _TYPEID_LSP26_REMOVE_FOLLOWER,
    _TYPEID_LSP26_BLOCK,
    _TYPEID_LSP26_UNBLOCK,
    _TYPEID_LSP26_REQUIRES_APPROVAL_SET,
    _TYPEID_LSP26_FOLLOW_REQUEST_SENT,
    _TYPEID_LSP26_FOLLOW_REQUEST_APPROVED,
    _TYPEID_LSP26_FOLLOW_REQUEST_REJECTED
} from "./LSP26Constants.sol";
import {
    _INTERFACEID_LSP1
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";

// errors
import {
    LSP26CannotSelfFollow,
    LSP26AlreadyFollowing,
    LSP26NotFollowing,
    LSP26CannotRemoveSelf,
    LSP26CannotBlockSelf,
    LSP26CannotUnblockSelf,
    LSP26AlreadyBlocked,
    LSP26NotBlocked,
    LSP26NoFollowRequestPending,
    LSP26FollowRequestAlreadyPending,
} from "./LSP26Errors.sol";

contract LSP26FollowerSystem is ILSP26FollowerSystem {
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC165Checker for address;

    mapping(address => EnumerableSet.AddressSet) private _followersOf;
    mapping(address => EnumerableSet.AddressSet) private _followingsOf;

    mapping(address => bool) private _requiresApproval;
    mapping(address => EnumerableSet.AddressSet) private _pendingFollowRequests;

    // @inheritdoc ILSP26FollowerSystem
    function setRequiresApproval(bool requiresApproval) external {
        _requiresApproval[msg.sender] = requiresApproval;

        emit RequiresApprovalSet(msg.sender, requiresApproval);

        if (msg.sender.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
            // solhint-disable no-empty-blocks
            try
                ILSP1UniversalReceiver(msg.sender).universalReceiver(
                    _TYPEID_LSP26_REQUIRES_APPROVAL_SET,
                    abi.encodePacked(requiresApproval)
                )
            {} catch {}
        }
    }

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
    function handleFollowRequest(address follower, bool isApproved) external {
        bool isRemoved = _pendingFollowRequests[msg.sender].remove(follower);

        if (!isRemoved) {
            revert LSP26NoFollowRequestPending(follower);
        }

        if (isApproved) {
            _addFollower(follower);
            emit FollowRequestApproved(msg.sender, follower);
        } else {
            emit FollowRequestRejected(msg.sender, follower);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function handleFollowRequestBatch(address[] calldata followers, bool[] calldata approvals) external {
        uint256 batchSize = followers.length < approvals.length ? followers.length : approvals.length;

        for (uint256 i = 0; i < batchSize; i++) {
            address follower = followers[i];
            bool isApproved = approvals[i];

            bool isRemoved = _pendingFollowRequests[msg.sender].remove(follower);

            if (isRemoved) {
                if (isApproved) {
                    _addFollower(follower);
                    emit FollowRequestApproved(msg.sender, follower);
                } else {
                    emit FollowRequestRejected(msg.sender, follower);
                }

                if (follower.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
                    // solhint-disable no-empty-blocks
                    try
                        ILSP1UniversalReceiver(follower).universalReceiver(
                            isApproved ? _TYPEID_LSP26_FOLLOW_REQUEST_APPROVED : _TYPEID_LSP26_FOLLOW_REQUEST_REJECTED,
                            abi.encodePacked(msg.sender)
                        )
                    {} catch {}
                }
            } else {
                revert LSP26NoFollowRequestPending(follower);
            }
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function isApprovalRequired(address addr) external view returns (bool) {
        return _requiresApproval[addr];
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

        if (_requiresApproval[addr]) {
            _createFollowRequest(addr);
        } else {
            _addFollower(addr);
        }
    }

    function _createFollowRequest(address addr) internal {
        if (_followingsOf[msg.sender].contains(addr)) {
            revert LSP26AlreadyFollowing(addr);
        }

        bool isAdded = _pendingFollowRequests[addr].add(msg.sender);

        if (!isAdded) {
            revert LSP26FollowRequestAlreadyPending(addr);
        }
        
        emit FollowRequestSent(msg.sender, addr);
    }

    function _addFollower(address addr) internal {
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
