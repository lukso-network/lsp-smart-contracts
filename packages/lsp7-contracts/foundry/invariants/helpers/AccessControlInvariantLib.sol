// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {
    LSP7CustomizableToken
} from "../../../contracts/presets/LSP7CustomizableToken.sol";

/// @dev Shared view helpers for AccessControlExtended invariants (8–10).
library AccessControlInvariantLib {
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    function assertOwnerHasDefaultAdmin(
        LSP7CustomizableToken token
    ) internal view {
        require(
            token.hasRole(token.DEFAULT_ADMIN_ROLE(), token.owner()),
            "owner must hold DEFAULT_ADMIN_ROLE"
        );
    }

    function assertRoleIndexesConsistent(
        LSP7CustomizableToken token,
        bytes32[] memory roles,
        address[] memory accounts
    ) internal view {
        uint256 rolesLength = roles.length;
        uint256 accountsLength = accounts.length;

        for (uint256 ai; ai < accountsLength; ++ai) {
            address account = accounts[ai];
            bytes32[] memory assignedRoles = token.rolesOf(account);

            for (uint256 ri; ri < assignedRoles.length; ++ri) {
                require(
                    token.hasRole(assignedRoles[ri], account),
                    "rolesOf entry must match hasRole"
                );
            }

            for (uint256 rj; rj < rolesLength; ++rj) {
                bytes32 role = roles[rj];
                bool has = token.hasRole(role, account);
                bool inRolesOf = _roleContained(assignedRoles, role);
                require(has == inRolesOf, "hasRole must match rolesOf membership");
            }
        }

        for (uint256 rk; rk < rolesLength; ++rk) {
            bytes32 role = roles[rk];
            address[] memory members = token.getRoleMembers(role);
            uint256 memberCount = token.getRoleMemberCount(role);

            require(
                members.length == memberCount,
                "getRoleMembers length mismatch"
            );

            for (uint256 mi; mi < members.length; ++mi) {
                require(
                    token.hasRole(role, members[mi]),
                    "getRoleMembers entry must satisfy hasRole"
                );
            }

            assertNoDuplicateAddresses(members);
        }

        for (uint256 aj; aj < accountsLength; ++aj) {
            assertNoDuplicateRoles(token.rolesOf(accounts[aj]));
        }
    }

    function assertNoDuplicateAddresses(
        address[] memory addresses
    ) internal pure {
        uint256 length = addresses.length;
        for (uint256 i; i < length; ++i) {
            for (uint256 j = i + 1; j < length; ++j) {
                require(
                    addresses[i] != addresses[j],
                    "duplicate address in role members"
                );
            }
        }
    }

    function assertNoDuplicateRoles(bytes32[] memory roles) internal pure {
        uint256 length = roles.length;
        for (uint256 i; i < length; ++i) {
            for (uint256 j = i + 1; j < length; ++j) {
                require(roles[i] != roles[j], "duplicate role in rolesOf");
            }
        }
    }

    function _roleContained(
        bytes32[] memory roles,
        bytes32 role
    ) private pure returns (bool) {
        for (uint256 i; i < roles.length; ++i) {
            if (roles[i] == role) return true;
        }
        return false;
    }
}
