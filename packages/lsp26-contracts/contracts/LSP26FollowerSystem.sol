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
    LSP26BlockedFromFollowing,
    LSP26CannotUnblockSelf,
    LSP26UserBlocked,
    LSP26AlreadyBlocked,
    LSP26NotBlocked,
    LSP26NoFollowRequestPending,
    LSP26FollowRequestAlreadyPending
} from "./LSP26Errors.sol";

contract LSP26FollowerSystem is ILSP26FollowerSystem {
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC165Checker for address;

    mapping(address => EnumerableSet.AddressSet) private _followersOf;
    mapping(address => EnumerableSet.AddressSet) private _followingsOf;

    mapping(address => bool) private _requiresApproval;
    mapping(address => EnumerableSet.AddressSet) private _pendingFollowRequests;

    mapping(address => EnumerableSet.AddressSet) private _blockedAddresses;

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
    function respondToFollowRequest(address follower, bool isApproved) external {
        bool isRemoved = _pendingFollowRequests[msg.sender].remove(follower);

        if (!isRemoved) {
            revert LSP26NoFollowRequestPending(follower);
        }

        if (isApproved) {
            _addFollower(follower, msg.sender);
            emit FollowRequestApproved(msg.sender, follower);
        } else {
            emit FollowRequestRejected(msg.sender, follower);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function respondToFollowRequestBatch(address[] calldata followers, bool[] calldata approvals) external {
        uint256 batchSize = followers.length < approvals.length ? followers.length : approvals.length;

        for (uint256 i = 0; i < batchSize; i++) {
            address follower = followers[i];
            bool isApproved = approvals[i];

            bool isRemoved = _pendingFollowRequests[msg.sender].remove(follower);

            if (isRemoved) {
                if (isApproved) {
                    _addFollower(follower, msg.sender);
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
    function remove(address follower) external {
        _removeFollower(follower);
    }

    // @inheritdoc ILSP26FollowerSystem
    function removeBatch(address[] memory followers) external {
        for (uint256 i = 0; i < followers.length; i++) {
            _removeFollower(followers[i]);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function blockAddress(address addr) external {
        _block(addr);
    }

    // @inheritdoc ILSP26FollowerSystem
    function blockBatch(address[] memory addresses) external {
        for (uint256 i = 0; i < addresses.length; i++) {
            _block(addresses[i]);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function unblockAddress(address addr) external {
        _unblock(addr);
    }

    // @inheritdoc ILSP26FollowerSystem
    function unblockBatch(address[] memory addresses) external {
        for (uint256 i = 0; i < addresses.length; i++) {
            _unblock(addresses[i]);
        }
    }

    // @inheritdoc ILSP26FollowerSystem
    function isApprovalRequired(address addr) external view returns (bool) {
        return _requiresApproval[addr];
    }

    // @inheritdoc ILSP26FollowerSystem
    function isBlocked(address blocker, address blocked) public view returns (bool) {
        return _blockedAddresses[blocker].contains(blocked);
    }

    // @inheritdoc ILSP26FollowerSystem
    function isFollowing(
        address follower,
        address followee
    ) public view returns (bool) {
        return _followingsOf[follower].contains(followee);
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

    // @inheritdoc ILSP26FollowerSystem
    function pendingRequestCount(address addr) public view returns (uint256) {
        return _pendingFollowRequests[addr].length();
    }

    // @inheritdoc ILSP26FollowerSystem
    function getPendingFollowRequests(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        uint256 sliceLength = endIndex - startIndex;

        address[] memory pendingRequests = new address[](sliceLength);

        for (uint256 i = 0; i < sliceLength; i++) {
            pendingRequests[i] = _pendingFollowRequests[addr].at(startIndex + i);
        }

        return pendingRequests;
    }

    // @inheritdoc ILSP26FollowerSystem
    function blockedCount(address addr) public view returns (uint256) {
        return _blockedAddresses[addr].length();
    }

    // @inheritdoc ILSP26FollowerSystem
    function getBlockedAddresses(
        address addr,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        uint256 sliceLength = endIndex - startIndex;

        address[] memory blockedAddrs = new address[](sliceLength);

        for (uint256 i = 0; i < sliceLength; i++) {
            blockedAddrs[i] = _blockedAddresses[addr].at(startIndex + i);
        }
        
        return blockedAddrs;
    }

    function _follow(address addr) internal {
        if (msg.sender == addr) {
            revert LSP26CannotSelfFollow();
        }

        if (_blockedAddresses[addr].contains(msg.sender)) {
            revert LSP26BlockedFromFollowing(addr);
        }

        if(_blockedAddresses[msg.sender].contains(addr)) {
            revert LSP26UserBlocked(addr);
        }

        if (_requiresApproval[addr]) {
            _createFollowRequest(addr);
        } else {
            _addFollower(msg.sender, addr);
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

    function _addFollower(address follower, address followee) internal {
        bool isAdded = _followingsOf[follower].add(followee);

        if (!isAdded) {
            revert LSP26AlreadyFollowing(followee);
        }

        _followersOf[followee].add(follower);

        emit Follow(follower, followee);

        if (followee.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
            // solhint-disable no-empty-blocks
            try
                ILSP1UniversalReceiver(followee).universalReceiver(
                    _TYPEID_LSP26_FOLLOW,
                    abi.encodePacked(follower)
                )
            {} catch {}
        }
    }

    function _removeFollower(address follower) internal {
        if (follower == msg.sender) {
            revert LSP26CannotRemoveSelf();
        }

        bool isRemoved = _followersOf[msg.sender].remove(follower);

        if (!isRemoved) {
            revert LSP26NotFollowing(follower);
        }

        _followingsOf[follower].remove(msg.sender);

        emit RemoveFollower(msg.sender, follower);
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

    function _block(address addr) internal {
        if (addr == msg.sender) {
            revert LSP26CannotBlockSelf();
        }

        bool isAdded = _blockedAddresses[msg.sender].add(addr);

        if (!isAdded) {
            revert LSP26AlreadyBlocked(addr);
        }

        // If the address is a follower, remove it
        if (_followersOf[msg.sender].contains(addr)) {
            _removeFollower(addr);
        }

        emit Block(msg.sender, addr);
    }

    function _unblock(address addr) internal {
        if (addr == msg.sender) {
            revert LSP26CannotUnblockSelf();
        }

        bool isRemoved = _blockedAddresses[msg.sender].remove(addr);

        if (!isRemoved) {
            revert LSP26NotBlocked(addr);
        }

        emit Unblock(msg.sender, addr);
    }
}