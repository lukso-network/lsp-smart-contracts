// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    LSP7CustomizableToken,
    LSP7MintableParams,
    LSP7NonTransferableParams,
    LSP7CappedParams,
    LSP7RevokableParams
} from "../../../contracts/presets/LSP7CustomizableToken.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Stateful fuzz handler for LSP7CustomizableToken invariant campaigns.
contract LSP7CustomizableTokenHandler is Test {
    uint256 internal constant NUM_ACTORS = 6;
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    LSP7CustomizableToken public token;

    uint256 public configuredSupplyCap;
    uint256 public configuredBalanceCap;

    address[] public actors;
    address[] public trackedHolders;
    bytes32[] public trackedRoles;
    address[] public trackedAccounts;

    address internal currentActor;
    address public lastOwnershipTransferOldOwner;

    uint256 public ghost_supplyWhenMintDisabled;
    bool public ghost_mintingWasDisabled;
    bool public ghost_transferLockViolation;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor(
        uint256 supplyCap_,
        uint256 balanceCap_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) {
        configuredSupplyCap = supplyCap_;
        configuredBalanceCap = balanceCap_;

        for (uint256 i; i < NUM_ACTORS; ++i) {
            address actor = makeAddr(string(abi.encodePacked("actor", i)));
            actors.push(actor);
            _trackAccount(actor);
        }

        address deployer = address(this);

        uint256 initialMint = supplyCap_ > 0
            ? bound(supplyCap_ / 4, 1, supplyCap_)
            : 100;

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: initialMint
        });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: balanceCap_,
            tokenSupplyCap: supplyCap_
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart_,
                transferLockEnd: transferLockEnd_
            });

        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        token = new LSP7CustomizableToken(
            "Invariant Token",
            "INV",
            deployer,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        _trackAccount(deployer);
        _trackHolder(deployer);
        _trackRole(token.DEFAULT_ADMIN_ROLE());
        _trackRole(token.MINTER_ROLE());
        _trackRole(token.REVOKER_ROLE());
        _trackRole(token.UNCAPPED_BALANCE_ROLE());
        _trackRole(token.NON_TRANSFERABLE_BYPASS_ROLE());

        if (initialMint > 0) {
            _trackHolder(deployer);
        }
    }

    // --- Token operations ---

    function mint(
        uint256 amount,
        uint256 toSeed,
        uint256 actorSeed
    ) external useActor(actorSeed) {
        amount = bound(amount, 1, 500);
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.mint(to, amount, true, "") {
            _trackHolder(to);
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function burn(uint256 amount, uint256 actorSeed) external useActor(actorSeed) {
        uint256 balance = token.balanceOf(currentActor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);

        try token.burn(currentActor, amount, "") {
            _trackHolder(currentActor);
        } catch {}
    }

    function transfer(
        uint256 amount,
        uint256 toSeed,
        uint256 actorSeed
    ) external useActor(actorSeed) {
        uint256 balance = token.balanceOf(currentActor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.transfer(currentActor, to, amount, true, "") {
            if (
                !token.isTransferable() &&
                !token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), currentActor)
            ) {
                ghost_transferLockViolation = true;
            }
            _trackHolder(to);
            _trackHolder(currentActor);
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function revoke(
        uint256 amount,
        uint256 holderSeed,
        uint256 recipientSeed
    ) external {
        if (!token.isRevokable()) return;

        address holder = actors[bound(holderSeed, 0, actors.length - 1)];
        uint256 holderBalance = token.balanceOf(holder);
        if (holderBalance == 0) return;

        amount = bound(amount, 1, holderBalance);

        address recipient = _pickRevokeRecipient(recipientSeed);

        vm.prank(token.owner());
        try token.revoke(holder, recipient, amount, "") {
            require(
                recipient == token.owner() ||
                    token.hasRole(token.REVOKER_ROLE(), recipient),
                "revoke destination must be owner or revoker"
            );
            _trackHolder(recipient);
            _trackHolder(holder);
            _assertRecipientBalanceCap(recipient);
        } catch {}
    }

    function disableMinting() external {
        if (!token.isMintable()) return;

        vm.prank(token.owner());
        try token.disableMinting() {
            ghost_mintingWasDisabled = true;
            ghost_supplyWhenMintDisabled = token.totalSupply();
        } catch {}
    }

    function disableRevokable() external {
        if (!token.isRevokable()) return;

        vm.prank(token.owner());
        try token.disableRevokable() {} catch {}
    }

    function makeTransferable() external {
        vm.prank(token.owner());
        try token.makeTransferable() {} catch {}
    }

    function updateTransferLockPeriod(
        uint256 newStart,
        uint256 newEnd
    ) external {
        newStart = bound(newStart, 0, 30 days);
        newEnd = bound(newEnd, newStart, 60 days);

        vm.prank(token.owner());
        try token.updateTransferLockPeriod(newStart, newEnd) {} catch {}
    }

    function warpTime(uint256 secondsForward) external {
        secondsForward = bound(secondsForward, 1, 45 days);
        vm.warp(block.timestamp + secondsForward);
    }

    // --- Access control operations ---

    function grantRole(
        uint256 roleSeed,
        uint256 accountSeed
    ) external {
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

    function revokeRole(
        uint256 roleSeed,
        uint256 accountSeed
    ) external {
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
        address newOwner = actors[bound(newOwnerSeed, 0, actors.length - 1)];

        lastOwnershipTransferOldOwner = token.owner();

        vm.prank(token.owner());
        try token.transferOwnership(newOwner) {
            _assertOwnerRolesMigrated(lastOwnershipTransferOldOwner, newOwner);
            _trackAccount(newOwner);
        } catch {}
    }

    // --- View helpers for invariants ---

    function sumTrackedBalances() external view returns (uint256 sum) {
        uint256 length = trackedHolders.length;
        for (uint256 i; i < length; ++i) {
            sum += token.balanceOf(trackedHolders[i]);
        }
    }

    function trackedHoldersLength() external view returns (uint256) {
        return trackedHolders.length;
    }

    function trackedHolderAt(uint256 index) external view returns (address) {
        return trackedHolders[index];
    }

    function trackedRolesSnapshot() external view returns (bytes32[] memory) {
        return trackedRoles;
    }

    function trackedAccountsSnapshot() external view returns (address[] memory) {
        return trackedAccounts;
    }

    /// @dev Bounded account set for invariant 9/10 (actors + current owner).
    function invariantAccountsSnapshot() external view returns (address[] memory accounts) {
        uint256 length = actors.length + 1;
        accounts = new address[](length);

        for (uint256 i; i < actors.length; ++i) {
            accounts[i] = actors[i];
        }

        accounts[actors.length] = token.owner();
    }

    function isBalanceCapExempt(address account) public view returns (bool) {
        return
            account == address(0) ||
            account == DEAD_ADDRESS ||
            token.hasRole(token.UNCAPPED_BALANCE_ROLE(), account);
    }

    // --- Internal bookkeeping ---

    function _assertRecipientBalanceCap(address to) internal {
        uint256 cap = configuredBalanceCap;
        if (cap == 0 || isBalanceCapExempt(to)) return;

        assertLe(
            token.balanceOf(to),
            cap,
            "recipient balance exceeds cap after mint/transfer"
        );
    }

    function _assertOwnerRolesMigrated(
        address oldOwner,
        address newOwner
    ) internal {
        if (newOwner == address(0)) return;

        assertTrue(
            token.hasRole(token.DEFAULT_ADMIN_ROLE(), newOwner),
            "new owner must hold DEFAULT_ADMIN_ROLE"
        );

        assertFalse(
            token.hasRole(token.DEFAULT_ADMIN_ROLE(), oldOwner),
            "old owner must not retain DEFAULT_ADMIN_ROLE"
        );
        assertFalse(
            token.hasRole(token.MINTER_ROLE(), oldOwner),
            "old owner must not retain MINTER_ROLE"
        );
        assertFalse(
            token.hasRole(token.UNCAPPED_BALANCE_ROLE(), oldOwner),
            "old owner must not retain UNCAPPED_BALANCE_ROLE"
        );
        assertFalse(
            token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), oldOwner),
            "old owner must not retain NON_TRANSFERABLE_BYPASS_ROLE"
        );
    }

    function _trackHolder(address account) internal {
        if (account == address(0)) return;
        for (uint256 i; i < trackedHolders.length; ++i) {
            if (trackedHolders[i] == account) return;
        }
        trackedHolders.push(account);
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
        require(trackedRoles.length > 0, "no tracked roles");
        return trackedRoles[bound(seed, 0, trackedRoles.length - 1)];
    }

    function _pickTrackedAccount(uint256 seed) internal view returns (address) {
        require(trackedAccounts.length > 0, "no tracked accounts");
        return trackedAccounts[bound(seed, 0, trackedAccounts.length - 1)];
    }

    function _pickRevokeRecipient(uint256 seed) internal view returns (address) {
        // Mix owner and revoker destinations to exercise invariant 4.
        if (seed % 2 == 0) {
            return token.owner();
        }
        address candidate = actors[bound(seed, 0, actors.length - 1)];
        if (token.hasRole(token.REVOKER_ROLE(), candidate)) {
            return candidate;
        }
        return token.owner();
    }

    function _assertIdempotentGrant(
        bytes32 role,
        address account,
        bytes32[] memory rolesBefore,
        uint256 membersBefore
    ) internal {
        if (!_roleContained(rolesBefore, role)) return;

        assertEq(
            token.rolesOf(account).length,
            rolesBefore.length,
            "grantRole must be idempotent for rolesOf"
        );
        assertEq(
            token.getRoleMemberCount(role),
            membersBefore,
            "grantRole must be idempotent for getRoleMemberCount"
        );
    }

    function _assertIdempotentRevoke(
        bytes32 role,
        address account,
        bytes32[] memory rolesBefore,
        uint256 membersBefore
    ) internal {
        if (_roleContained(rolesBefore, role)) return;

        assertEq(
            token.rolesOf(account).length,
            rolesBefore.length,
            "revokeRole must be idempotent for rolesOf"
        );
        assertEq(
            token.getRoleMemberCount(role),
            membersBefore,
            "revokeRole must be idempotent for getRoleMemberCount"
        );
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
