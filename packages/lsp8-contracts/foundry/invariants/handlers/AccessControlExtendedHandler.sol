// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP8AccessControlExtended} from "../mocks/InvariantTestMocks.sol";

/// @dev Handler for AccessControlExtendedAbstract invariants 36–39.
contract AccessControlExtendedHandler is Test {
    uint256 internal constant NUM_ACTORS = 6;

    MockLSP8AccessControlExtended public token;

    address[] public actors;
    bytes32[] public trackedRoles;
    address[] public trackedAccounts;

    address internal currentActor;
    bytes32[] public lastOwnershipTransferOldRoles;
    uint256 internal nextTokenId;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor() {
        for (uint256 i; i < NUM_ACTORS; ++i) {
            address actor = makeAddr(string(abi.encodePacked("lsp8AcActor", i)));
            actors.push(actor);
            _trackAccount(actor);
        }

        address deployer = address(this);
        token = new MockLSP8AccessControlExtended(deployer);

        _trackAccount(deployer);
        _trackRole(token.DEFAULT_ADMIN_ROLE());
        _trackRole(token.TEST_ROLE());
    }

    function mint(uint256 toSeed) external {
        address to = actors[bound(toSeed, 0, actors.length - 1)];
        bytes32 tokenId = bytes32(++nextTokenId);

        try token.mint(to, tokenId, true, "") {
            _trackAccount(to);
        } catch {}
    }

    function grantRole(uint256 roleSeed, uint256 accountSeed) external {
        bytes32 role = _pickTrackedRole(roleSeed);
        address account = _pickTrackedAccount(accountSeed);

        bytes32[] memory rolesBefore = token.rolesOf(account);
        uint256 membersBefore = token.getRoleMemberCount(role);

        vm.prank(token.owner());
        try token.grantRole(role, account) {
            _trackAccount(account);
            _assertIdempotentGrant(role, account, rolesBefore, membersBefore);
        } catch {}
    }

    function revokeRole(uint256 roleSeed, uint256 accountSeed) external {
        bytes32 role = _pickTrackedRole(roleSeed);
        address account = _pickTrackedAccount(accountSeed);

        bytes32[] memory rolesBefore = token.rolesOf(account);
        uint256 membersBefore = token.getRoleMemberCount(role);

        vm.prank(token.owner());
        try token.revokeRole(role, account) {
            _assertIdempotentRevoke(role, account, rolesBefore, membersBefore);
        } catch {}
    }

    function renounceRole(uint256 roleSeed, uint256 actorSeed) external useActor(actorSeed) {
        bytes32 role = _pickTrackedRole(roleSeed);

        bytes32[] memory rolesBefore = token.rolesOf(currentActor);
        uint256 membersBefore = token.getRoleMemberCount(role);

        try token.renounceRole(role, currentActor) {
            _assertIdempotentRevoke(role, currentActor, rolesBefore, membersBefore);
        } catch {}
    }

    function transferOwnership(uint256 newOwnerSeed) external {
        _transferOwnershipTo(actors[bound(newOwnerSeed, 0, actors.length - 1)]);
    }

    function renounceOwnership() external {
        _transferOwnershipTo(address(0));
    }

    function trackedRolesSnapshot() external view returns (bytes32[] memory) {
        return trackedRoles;
    }

    function invariantAccountsSnapshot() external view returns (address[] memory accounts) {
        uint256 length = actors.length + 1;
        accounts = new address[](length);

        for (uint256 i; i < actors.length; ++i) {
            accounts[i] = actors[i];
        }

        accounts[actors.length] = token.owner();
    }

    function _transferOwnershipTo(address newOwner) internal {
        address oldOwner = token.owner();
        lastOwnershipTransferOldRoles = token.rolesOf(oldOwner);

        vm.prank(oldOwner);
        try token.transferOwnership(newOwner) {
            _assertOwnershipTransferInvariants(
                oldOwner,
                newOwner,
                lastOwnershipTransferOldRoles
            );
            if (newOwner != address(0)) {
                _trackAccount(newOwner);
            }
        } catch {}
    }

    function _assertOwnershipTransferInvariants(
        address oldOwner,
        address newOwner,
        bytes32[] memory oldOwnerRoles
    ) internal {
        // Self-transfer revokes then re-grants each role to the same address,
        // so the post-state retains every role on `newOwner == oldOwner`.
        if (oldOwner == newOwner) {
            for (uint256 i; i < oldOwnerRoles.length; ++i) {
                assertTrue(token.hasRole(oldOwnerRoles[i], newOwner));
            }
            assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), newOwner));
            return;
        }

        for (uint256 i; i < oldOwnerRoles.length; ++i) {
            bytes32 role = oldOwnerRoles[i];
            assertFalse(token.hasRole(role, oldOwner));

            if (newOwner != address(0)) {
                assertTrue(token.hasRole(role, newOwner));
            } else {
                assertFalse(token.hasRole(role, address(0)));
            }
        }

        if (newOwner != address(0)) {
            assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), newOwner));
        }
    }

    function _trackAccount(address account) internal {
        if (account == address(0)) return;
        for (uint256 i; i < trackedAccounts.length; ++i) {
            if (trackedAccounts[i] == account) return;
        }
        trackedAccounts.push(account);
    }

    function _trackRole(bytes32 role) internal {
        for (uint256 i; i < trackedRoles.length; ++i) {
            if (trackedRoles[i] == role) return;
        }
        trackedRoles.push(role);
    }

    function _pickTrackedRole(uint256 seed) internal view returns (bytes32) {
        return trackedRoles[bound(seed, 0, trackedRoles.length - 1)];
    }

    function _pickTrackedAccount(uint256 seed) internal view returns (address) {
        return trackedAccounts[bound(seed, 0, trackedAccounts.length - 1)];
    }

    function _assertIdempotentGrant(
        bytes32 role,
        address account,
        bytes32[] memory rolesBefore,
        uint256 membersBefore
    ) internal {
        if (!_roleContained(rolesBefore, role)) return;

        assertEq(token.rolesOf(account).length, rolesBefore.length);
        assertEq(token.getRoleMemberCount(role), membersBefore);
    }

    function _assertIdempotentRevoke(
        bytes32 role,
        address account,
        bytes32[] memory rolesBefore,
        uint256 membersBefore
    ) internal {
        if (_roleContained(rolesBefore, role)) return;

        assertEq(token.rolesOf(account).length, rolesBefore.length);
        assertEq(token.getRoleMemberCount(role), membersBefore);
    }

    function _roleContained(
        bytes32[] memory roles,
        bytes32 role
    ) internal pure returns (bool) {
        for (uint256 i; i < roles.length; ++i) {
            if (roles[i] == role) return true;
        }
        return false;
    }
}
