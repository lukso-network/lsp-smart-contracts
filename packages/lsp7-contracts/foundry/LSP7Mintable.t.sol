// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// test
import "forge-std/Test.sol";

// interfaces
import {
    ILSP7Mintable
} from "../contracts/extensions/LSP7Mintable/ILSP7Mintable.sol";

// modules
import {
    LSP7MintableAbstract
} from "../contracts/extensions/LSP7Mintable/LSP7MintableAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// errors
import {
    LSP7MintDisabled
} from "../contracts/extensions/LSP7Mintable/LSP7MintableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockLSP7Mintable is LSP7MintableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7MintableAbstract(mintable_)
    {}
}

contract LSP7MintableTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address owner = address(this);
    address randomOwner;
    address recipient;

    MockLSP7Mintable lsp7Mintable;
    MockLSP7Mintable lsp7MintableRandomOwner;
    MockLSP7Mintable lsp7NonMintable;

    function setUp() public {
        recipient = vm.addr(100);
        randomOwner = vm.addr(101);

        lsp7Mintable = new MockLSP7Mintable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            true
        );

        vm.recordLogs();
        lsp7MintableRandomOwner = new MockLSP7Mintable(
            name,
            symbol,
            randomOwner,
            tokenType,
            isNonDivisible,
            true
        );
        Vm.Log[] memory logs = vm.getRecordedLogs();
        // assertEq(logs.length, 1);
        uint256 lastEvent = logs.length - 1;
        assertEq(
            logs[lastEvent].topics[0],
            ILSP7Mintable.MintingStatusChanged.selector
        );
        assertEq(logs[lastEvent].topics[1], bytes32(abi.encode(true)));

        vm.recordLogs();
        lsp7NonMintable = new MockLSP7Mintable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            false
        );
        logs = vm.getRecordedLogs();
        lastEvent = logs.length - 1;
        assertEq(
            logs[lastEvent].topics[0],
            ILSP7Mintable.MintingStatusChanged.selector
        );
        assertEq(logs[lastEvent].topics[1], bytes32(abi.encode(false)));
    }

    function test_MintableOwnerCanMint() public {
        assertEq(lsp7Mintable.balanceOf(recipient), 0);
        lsp7Mintable.mint(recipient, 100, true, "");
        assertEq(lsp7Mintable.balanceOf(recipient), 100);
    }

    function test_MintableOwnerCanDisableMint() public {
        assertEq(lsp7Mintable.isMintable(), true);

        vm.recordLogs();
        lsp7Mintable.disableMinting();

        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 1);
        assertEq(
            logs[0].topics[0],
            ILSP7Mintable.MintingStatusChanged.selector
        );
        assertEq(logs[0].topics[1], bytes32(abi.encode(false)));

        assertEq(lsp7Mintable.isMintable(), false);

        assertEq(lsp7Mintable.balanceOf(recipient), 0);
        vm.expectRevert(LSP7MintDisabled.selector);
        lsp7Mintable.mint(recipient, 100, true, "");
        assertEq(lsp7Mintable.balanceOf(recipient), 0);
    }

    function test_MintableNonOwnerCannotMint() public {
        assertEq(lsp7MintableRandomOwner.balanceOf(recipient), 0);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7MintableRandomOwner.mint(recipient, 100, true, "");
        assertEq(lsp7MintableRandomOwner.balanceOf(recipient), 0);
    }

    function test_MintableNonOwnerCannotDisableMint() public {
        assertEq(lsp7MintableRandomOwner.isMintable(), true);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7MintableRandomOwner.disableMinting();
        assertEq(lsp7MintableRandomOwner.isMintable(), true);
    }

    function test_NonMintableOwnerCannotMint() public {
        assertEq(lsp7NonMintable.balanceOf(recipient), 0);
        vm.expectRevert(LSP7MintDisabled.selector);
        lsp7NonMintable.mint(recipient, 100, true, "");
        assertEq(lsp7NonMintable.balanceOf(recipient), 0);
    }
}
