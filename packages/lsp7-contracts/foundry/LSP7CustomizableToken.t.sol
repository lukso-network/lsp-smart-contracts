// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import {Test} from "forge-std/Test.sol";

// modules
import {
    LSP7CustomizableToken,
    LSP7MintableParams,
    LSP7NonTransferableParams,
    LSP7CappedParams,
    LSP7RevokableParams
} from "../contracts/presets/LSP7CustomizableToken.sol";

// errors
import {
    LSP7MintDisabled
} from "../contracts/extensions/LSP7Mintable/LSP7MintableErrors.sol";
import {
    LSP7CappedBalanceExceeded
} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceErrors.sol";
import {
    LSP7InvalidTransferLockPeriod
} from "../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableErrors.sol";
import {
    LSP7CappedSupplyCannotMintOverCap
} from "../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyErrors.sol";
import {
    LSP7RevokableFeatureDisabled
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP7CustomizableTokenTest is Test {
    string name = "Custom Token";
    string symbol = "CT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;
    bool mintable = true;
    bool isRevokable = true;
    uint256 initialMintAmount = 1000;
    uint256 transferLockStart = 0;
    uint256 transferLockEnd = 0;
    uint256 tokenBalanceCap = 2000;
    uint256 tokenSupplyCap = 5000;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address zeroAddress = address(0);

    LSP7CustomizableToken token;

    function setUp() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: initialMintAmount
        });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        token = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    // Constructor Tests
    function test_ConstructorInitializesCorrectly() public {
        assertEq(
            token.balanceOf(owner),
            initialMintAmount,
            "Owner should have initial tokens"
        );
        assertEq(
            token.totalSupply(),
            initialMintAmount,
            "Total supply should match initial mint"
        );
        assertEq(
            token.tokenBalanceCap(),
            tokenBalanceCap,
            "Balance cap should be set"
        );
        assertEq(token.isMintable(), mintable, "Mintable status should be set");
        assertTrue(token.isRevokable(), "Revokable status should be set");
        assertTrue(token.isTransferable(), "Token should be transferable");
        assertEq(
            token.transferLockStart(),
            transferLockStart,
            "Lock start should be set"
        );
        assertEq(
            token.transferLockEnd(),
            transferLockEnd,
            "Lock end should be set"
        );
        assertEq(
            token.tokenSupplyCap(),
            tokenSupplyCap,
            "Supply cap should be set"
        );

        assertTrue(
            token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner),
            "Owner should have DEFAULT_ADMIN_ROLE"
        );
    }

    function test_ConstructorRevertsIfInitialMintExceedsSupplyCap() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: tokenSupplyCap + 1
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function test_ConstructorSucceedsWithZeroInitialMint() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: 0
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken zeroMintToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
        assertEq(
            zeroMintToken.balanceOf(owner),
            0,
            "Owner should have no tokens"
        );
        assertEq(zeroMintToken.totalSupply(), 0, "Total supply should be zero");
    }

    function test_ConstructorRevertsWithInvalidLockPeriod() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: initialMintAmount
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 200,
                transferLockEnd: 100
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
        new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    // Supply Cap Tests
    function test_TokenSupplyCapReturnsCorrectValue() public {
        assertEq(
            token.tokenSupplyCap(),
            tokenSupplyCap,
            "Should return supply cap when isMintable"
        );
        token.disableMinting();
        assertEq(
            token.tokenSupplyCap(),
            initialMintAmount,
            "Should return totalSupply when not isMintable"
        );
    }

    function test_MintFailsWhenExceedingSupplyCap() public {
        token.mint(owner, tokenSupplyCap - initialMintAmount, true, "");
        assertEq(
            token.totalSupply(),
            tokenSupplyCap,
            "Total supply should reach cap"
        );

        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        token.mint(owner, 1, true, "");
    }

    function test_MintSucceedsUpToSupplyCap() public {
        uint256 amount = tokenSupplyCap - initialMintAmount;
        token.mint(owner, amount, true, "");
        assertEq(
            token.totalSupply(),
            tokenSupplyCap,
            "Total supply should match cap"
        );
    }

    function test_MintWithMaxSupplyCapAllowsUnlimitedMinting() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: initialMintAmount
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken unlimitedToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
        unlimitedToken.mint(owner, type(uint256).max / 2, true, "");
        assertEq(
            unlimitedToken.balanceOf(owner),
            type(uint256).max / 2 + initialMintAmount,
            "Should allow large mint"
        );
    }

    // Balance Cap Tests
    function test_BalanceCapEnforcedCorrectly() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: 2000
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 1500,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken tokenWithBalanceCap = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        // Should be able to transfer up to the balance cap
        tokenWithBalanceCap.transfer(owner, user1, 1000, true, "");
        assertEq(tokenWithBalanceCap.balanceOf(user1), 1000);

        // Should fail when trying to exceed the balance cap
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                user1,
                600,
                1000,
                1500
            )
        );
        tokenWithBalanceCap.transfer(owner, user1, 600, true, ""); // Would make total 1600 > 1500 cap
    }

    function test_BalanceCapDisabledWhenZero() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: 1000000
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0, // tokenBalanceCap = 0 (disabled)
            tokenSupplyCap: 0 // tokenSupplyCap = 0 (disabled)
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken tokenWithoutBalanceCap = new LSP7CustomizableToken(
                name,
                symbol,
                owner,
                tokenType,
                isNonDivisible,
                mintableParams,
                cappedParams,
                nonTransferableParams,
                revokableParams
            );

        // Should be able to transfer any amount when balance cap is disabled
        tokenWithoutBalanceCap.transfer(owner, user1, 1000000, true, "");
        assertEq(tokenWithoutBalanceCap.balanceOf(user1), 1000000);
    }

    // Minting Tests
    function test_OwnerCanMintToNonAllowlistedAddress() public {
        // TODO: replace with AccessControlExtended tests
        // assertFalse(
        //     token.isAllowlisted(user1),
        //     "User1 should not be allowlisted"
        // );
        token.mint(user1, 500, true, "");
        assertEq(token.balanceOf(user1), 500, "User1 should have 500 tokens");
    }

    function test_MintFailsWhenDisabled() public {
        token.disableMinting();
        vm.expectRevert(LSP7MintDisabled.selector);
        token.mint(user1, 500, true, "");
    }

    function test_RevokeFailsWhenRevocationIsDisabled() public {
        bytes32 revokerRole = token.REVOKER_ROLE();
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            mintable: mintable,
            initialMintAmount: 1000
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: false
        });

        LSP7CustomizableToken nonRevokableToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        nonRevokableToken.transfer(owner, user1, 500, true, "");

        assertFalse(nonRevokableToken.isRevokable());
        assertFalse(nonRevokableToken.hasRole(revokerRole, owner));

        nonRevokableToken.grantRole(revokerRole, owner);

        vm.expectRevert(LSP7RevokableFeatureDisabled.selector);
        nonRevokableToken.revoke(user1, owner, 100, "");
    }
}
