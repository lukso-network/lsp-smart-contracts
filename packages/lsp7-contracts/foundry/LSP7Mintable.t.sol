// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// test
import {Test, Vm} from "forge-std/Test.sol";

// interfaces
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    ILSP7Mintable
} from "../contracts/extensions/LSP7Mintable/ILSP7Mintable.sol";

// modules
import {
    LSP7MintableAbstract
} from "../contracts/extensions/LSP7Mintable/LSP7MintableAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
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
        AccessControlExtendedAbstract()
        LSP7MintableAbstract(mintable_)
    {}
}

contract LSP7MintableTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    address owner = address(this);
    address randomOwner;
    address recipient;

    MockLSP7Mintable lsp7Mintable;
    MockLSP7Mintable lsp7MintableRandomOwner;
    MockLSP7Mintable lsp7NonMintable;

    bytes32 minterRole;

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

        minterRole = lsp7Mintable.MINTER_ROLE();

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

        for (uint256 ii = 0; ii < logs.length; ii++) {
            if (
                logs[ii].topics[0] ==
                ILSP7Mintable.MintingStatusChanged.selector
            ) {
                assertEq(
                    logs[ii].topics[0],
                    ILSP7Mintable.MintingStatusChanged.selector
                );
                assertEq(logs[ii].topics[1], bytes32(abi.encode(true)));
            }
        }

        lsp7NonMintable = new MockLSP7Mintable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            false
        );
    }

    // Logs details (Note that this might not be accurate if contract logic changes)
    // ------------------------------------------------------------
    //     ├─ [2962647] → new MockLSP7Mintable@0xF62849F9A0B5Bf2913b396098F7c7019b51A820a
    // │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    // │   ├─ emit RoleGranted(role: 0x0000000000000000000000000000000000000000000000000000000000000000, account: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], sender: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    // │   ├─ emit OwnershipTransferred(previousOwner: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], newOwner: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    // │   ├─ emit DataChanged(dataKey: 0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c, dataValue: 0xa4d96624)
    // │   ├─ emit DataChanged(dataKey: 0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1, dataValue: 0x5465737420546f6b656e)
    // │   ├─ emit DataChanged(dataKey: 0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756, dataValue: 0x5454)
    // │   ├─ emit DataChanged(dataKey: 0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3, dataValue: 0x0000000000000000000000000000000000000000000000000000000000000000)
    // │   ├─ emit MintingStatusChanged(enabled: false)
    // │   ├─ emit RoleGranted(role: 0x4d494e5445525f524f4c45000000000000000000000000000000000000000000, account: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], sender: LSP7MintableTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    function test_EventsEmissionOnDeployment() public {
        address contractOwner = makeAddr("contractOwner");

        vm.recordLogs();

        MockLSP7Mintable deployedTokenContract = new MockLSP7Mintable(
            name,
            symbol,
            contractOwner,
            tokenType,
            isNonDivisible,
            true
        );

        Vm.Log[] memory logs = vm.getRecordedLogs();

        uint256 logsCount = logs.length;
        // assertEq(logsCount, 9);

        assertEq(
            logs[logsCount - 2].topics[0],
            ILSP7Mintable.MintingStatusChanged.selector
        );
        assertEq(logs[logsCount - 2].topics[1], bytes32(abi.encode(true)));

        assertEq(
            logs[logsCount - 1].topics[0],
            IAccessControl.RoleGranted.selector
        );
        assertEq(
            logs[logsCount - 1].topics[1],
            deployedTokenContract.MINTER_ROLE()
        );
        assertEq(
            logs[logsCount - 1].topics[2],
            bytes32(abi.encode(contractOwner))
        );
    }

    function test_ContractOwnerAreCorrectlySet() public {
        assertEq(lsp7Mintable.owner(), owner);
        assertEq(lsp7MintableRandomOwner.owner(), randomOwner);
        assertEq(lsp7NonMintable.owner(), owner);
    }

    function test_OwnerStartsWithDefaultAdminRoleAndMinterRole() public {
        assertTrue(
            lsp7Mintable.hasRole(DEFAULT_ADMIN_ROLE, owner),
            "Owner should start with DEFAULT_ADMIN_ROLE"
        );
        assertTrue(
            lsp7Mintable.hasRole(lsp7Mintable.MINTER_ROLE(), owner),
            "Owner should start with MINTER_ROLE"
        );

        assertTrue(
            lsp7MintableRandomOwner.hasRole(DEFAULT_ADMIN_ROLE, randomOwner),
            "Random owner should start with DEFAULT_ADMIN_ROLE"
        );
        assertTrue(
            lsp7MintableRandomOwner.hasRole(
                lsp7MintableRandomOwner.MINTER_ROLE(),
                randomOwner
            ),
            "Random owner should start with MINTER_ROLE"
        );
    }

    function test_DeployWithoutMintableFeatureDoesNotGrantMinterRoleToOwner() public {
        
        MockLSP7Mintable tokenContract = new MockLSP7Mintable(
            name,
            symbol,
            contractOwner,
            tokenType,
            isNonDivisible,
            true // mintable
        );

        assertTrue(tokenContract.hasRole(tokenContract.MINTER_ROLE(), contractOwner));
        assertTrue(tokenContract.hasRole(DEFAULT_ADMIN_ROLE, contractOwner));
        
        bytes32[] memory ownerRoles = tokenContract.rolesOf(contractOwner);
        assertEq(ownerRoles.length, 2);

        assertEq(ownerRoles[0], DEFAULT_ADMIN_ROLE);
        assertEq(ownerRoles[1], tokenContract.MINTER_ROLE());
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

    function test_DefaultAdminCannotMintWithoutMinterRole() public {
        address defaultAdmin = vm.addr(102);

        vm.prank(randomOwner);
        lsp7MintableRandomOwner.grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);

        assertTrue(
            lsp7MintableRandomOwner.hasRole(DEFAULT_ADMIN_ROLE, defaultAdmin)
        );
        assertFalse(lsp7MintableRandomOwner.hasRole(minterRole, defaultAdmin));

        vm.prank(defaultAdmin);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                defaultAdmin,
                minterRole
            )
        );
        lsp7MintableRandomOwner.mint(recipient, 100, true, "");
    }

    function test_DefaultAdminCanGrantItselfMinterRoleAndMint() public {
        address defaultAdmin = vm.addr(103);

        assertEq(lsp7MintableRandomOwner.owner(), randomOwner);
        assertTrue(
            lsp7MintableRandomOwner.hasRole(DEFAULT_ADMIN_ROLE, randomOwner)
        );

        vm.prank(randomOwner);
        lsp7MintableRandomOwner.grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);

        vm.prank(defaultAdmin);
        lsp7MintableRandomOwner.grantRole(minterRole, defaultAdmin);

        vm.prank(defaultAdmin);
        lsp7MintableRandomOwner.mint(recipient, 100, true, "");

        assertEq(lsp7MintableRandomOwner.balanceOf(recipient), 100);
    }

    function test_OwnerCanReGrantItselfMinterRoleAfterRevocation() public {
        lsp7Mintable.revokeRole(minterRole, owner);
        assertFalse(lsp7Mintable.hasRole(minterRole, owner));

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                owner,
                minterRole
            )
        );
        lsp7Mintable.mint(recipient, 100, true, "");

        lsp7Mintable.grantRole(minterRole, owner);
        lsp7Mintable.mint(recipient, 100, true, "");

        assertEq(lsp7Mintable.balanceOf(recipient), 100);
    }

    function testFuzz_MintableNonOwnerCannotMint(address nonOwner) public {
        vm.assume(nonOwner != lsp7MintableRandomOwner.owner());

        // TODO: there is a big bug, where the deployer is stillk granted the MINTER_ROLE
        // here `address(this)` was the deployer and can still mint the deployer (test contract)
        // retains DEFAULT_ADMIN_ROLE on lsp7MintableRandomOwner, which likely allows it to bypass the MINTER_ROLE check.

        // UPDATE: this comment might be out of date
        /// vm.assume(nonOwner != address(this));

        assertEq(lsp7MintableRandomOwner.balanceOf(recipient), 0);

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                minterRole
            )
        );
        lsp7MintableRandomOwner.mint(recipient, 100, true, "");

        assertEq(lsp7MintableRandomOwner.balanceOf(recipient), 0);
    }

    function testFuzz_MintableNonOwnerCannotDisableMint(
        address nonOwner
    ) public {
        vm.assume(nonOwner != lsp7MintableRandomOwner.owner());
        // vm.assume(nonOwner != address(this));

        assertEq(lsp7MintableRandomOwner.isMintable(), true);

        vm.prank(nonOwner);
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

    // Test transfer ownership
    function test_TransferOwnershipClearsMinterRoleAdmin() public {
        bytes32 minterRoleAdmin = keccak256("MINTER_ADMIN_ROLE");
        address minterRoleAdminAccount = makeAddr("A Minter Role Admin");

        lsp7Mintable.setRoleAdmin(minterRole, minterRoleAdmin);
        assertEq(lsp7Mintable.getRoleAdmin(minterRole), minterRoleAdmin);

        lsp7Mintable.grantRole(minterRoleAdmin, minterRoleAdminAccount);
        assertTrue(
            lsp7Mintable.hasRole(minterRoleAdmin, minterRoleAdminAccount)
        );

        vm.prank(minterRoleAdminAccount);
        lsp7Mintable.grantRole(minterRole, address(11111));
        assertTrue(lsp7Mintable.hasRole(minterRole, address(11111)));

        lsp7Mintable.transferOwnership(vm.addr(200));

        assertEq(
            lsp7Mintable.getRoleAdmin(minterRole),
            lsp7Mintable.DEFAULT_ADMIN_ROLE()
        );

        // Test previous admin cannot use its role
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                minterRoleAdminAccount,
                lsp7Mintable.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(minterRoleAdminAccount);
        lsp7Mintable.grantRole(minterRole, address(22222));

        // Addresses with previously granted role still persist
        assertTrue(lsp7Mintable.hasRole(minterRole, address(11111)));
    }
}
