// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {
    LSP7CustomizableTokenInit
} from "../../../contracts/presets/LSP7CustomizableTokenInit.sol";
import {
    LSP7MintableParams,
    LSP7NonTransferableParams,
    LSP7CappedParams,
    LSP7RevokableParams
} from "../../../contracts/presets/LSP7CustomizableTokenConstants.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7CustomizableTokenInit preset invariants 1–7 and 12.
contract LSP7CustomizableTokenInitHandler is Test {
    uint256 internal constant NUM_ACTORS = 6;
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    LSP7CustomizableTokenInit public implementation;
    LSP7CustomizableTokenInit public token;

    uint256 public configuredSupplyCap;
    uint256 public configuredBalanceCap;

    address[] public actors;
    address[] public trackedHolders;

    address internal currentActor;

    uint256 public ghost_supplyWhenMintDisabled;
    bool public ghost_mintingWasDisabled;
    bool public ghost_transferLockViolation;
    bool public ghost_secondInitializeSucceeded;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor() {
        configuredSupplyCap = InvariantConstants.SUPPLY_CAP;
        configuredBalanceCap = InvariantConstants.BALANCE_CAP;

        for (uint256 i; i < NUM_ACTORS; ++i) {
            actors.push(makeAddr(string(abi.encodePacked("initActor", i))));
        }

        address deployer = address(this);

        uint256 initialMint = configuredSupplyCap > 0
            ? bound(configuredSupplyCap / 4, 1, configuredSupplyCap)
            : 100;

        implementation = new LSP7CustomizableTokenInit();
        address instance = Clones.clone(address(implementation));
        token = LSP7CustomizableTokenInit(payable(instance));

        token.initialize(
            "Invariant Init Token",
            "INVI",
            deployer,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            LSP7MintableParams({isMintable: true, initialMintAmount: initialMint}),
            LSP7CappedParams({
                tokenBalanceCap: configuredBalanceCap,
                tokenSupplyCap: configuredSupplyCap
            }),
            LSP7NonTransferableParams({
                transferLockStart: InvariantConstants.TRANSFER_LOCK_START,
                transferLockEnd: InvariantConstants.TRANSFER_LOCK_END
            }),
            LSP7RevokableParams({isRevokable: true})
        );

        _trackHolder(deployer);
    }

    function mint(uint256 amount, uint256 toSeed, uint256 actorSeed) external useActor(actorSeed) {
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

    function attemptSecondInitialize() external {
        try
            token.initialize(
                "Reinit",
                "RE",
                address(this),
                _LSP4_TOKEN_TYPE_TOKEN,
                false,
                LSP7MintableParams({isMintable: true, initialMintAmount: 1}),
                LSP7CappedParams({
                    tokenBalanceCap: configuredBalanceCap,
                    tokenSupplyCap: configuredSupplyCap
                }),
                LSP7NonTransferableParams({transferLockStart: 0, transferLockEnd: 0}),
                LSP7RevokableParams({isRevokable: true})
            )
        {
            ghost_secondInitializeSucceeded = true;
        } catch {}
    }

    function warpTime(uint256 secondsForward) external {
        secondsForward = bound(secondsForward, 1, 45 days);
        vm.warp(block.timestamp + secondsForward);
    }

    function transferOwnership(uint256 newOwnerSeed) external {
        address newOwner = actors[bound(newOwnerSeed, 0, actors.length - 1)];
        address oldOwner = token.owner();

        vm.prank(oldOwner);
        try token.transferOwnership(newOwner) {
            _assertOwnerAdminSync(oldOwner, newOwner);
        } catch {}
    }

    function sumTrackedBalances() external view returns (uint256 sum) {
        for (uint256 i; i < trackedHolders.length; ++i) {
            sum += token.balanceOf(trackedHolders[i]);
        }
    }

    function _assertRecipientBalanceCap(address to) internal {
        uint256 cap = configuredBalanceCap;
        if (cap == 0 || isBalanceCapExempt(to)) return;

        assertLe(token.balanceOf(to), cap);
    }

    function isBalanceCapExempt(address account) public view returns (bool) {
        return
            account == address(0) ||
            account == DEAD_ADDRESS ||
            token.hasRole(token.UNCAPPED_BALANCE_ROLE(), account);
    }

    function _assertOwnerAdminSync(address oldOwner, address newOwner) internal {
        if (newOwner != address(0)) {
            assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), newOwner));
        }

        assertFalse(token.hasRole(token.DEFAULT_ADMIN_ROLE(), oldOwner));
        assertFalse(token.hasRole(token.MINTER_ROLE(), oldOwner));
        assertFalse(token.hasRole(token.UNCAPPED_BALANCE_ROLE(), oldOwner));
        assertFalse(token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), oldOwner));
    }

    function _trackHolder(address account) internal {
        if (account == address(0)) return;
        for (uint256 i; i < trackedHolders.length; ++i) {
            if (trackedHolders[i] == account) return;
        }
        trackedHolders.push(account);
    }

    function _pickRevokeRecipient(uint256 seed) internal view returns (address) {
        if (seed % 2 == 0) return token.owner();

        address candidate = actors[bound(seed, 0, actors.length - 1)];
        if (token.hasRole(token.REVOKER_ROLE(), candidate)) return candidate;

        return token.owner();
    }
}
