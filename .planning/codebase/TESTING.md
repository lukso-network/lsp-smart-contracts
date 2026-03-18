# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

**Runner:**
- Hardhat (v3.1.2) with Mocha test runner
- Solidity testing: Foundry (forge test)
- Both runners configured in monorepo with separate npm scripts

**Assertion Library:**
- Chai (built-in with `@nomicfoundation/hardhat-toolbox-mocha-ethers`)
- Hardhat-specific matchers for Solidity reverts and custom errors

**Run Commands:**
```bash
npm run test                    # Run all Hardhat tests
npm run test:foundry           # Run all Foundry tests (filtered)
npm run test:coverage          # Generate coverage report
npm run test:mocks             # Run mock-specific tests
npm run test:lsp6              # Run LSP6KeyManager tests
npm run test:lsp7              # Run LSP7DigitalAsset tests
npm run test:lsp8              # Run LSP8IdentifiableDigitalAsset tests
npm run test:benchmark         # Run performance benchmarks
```

## Test File Organization

**Location:**
- Hardhat tests: `packages/lsp-smart-contracts/tests/` directory
- Foundry tests: `packages/{package}/foundry/` directories
- Pattern: co-located tests near source code when organized by package
- Separate test suite in main monorepo for comprehensive integration tests

**Naming:**
- Hardhat: `{Name}.test.ts` (e.g., `ERC165Interfaces.test.ts`, `PermissionCall.test.ts`)
- Behavior files: `{Name}.behaviour.ts` (e.g., `LSP20CallVerification.behaviour.ts`)
- Foundry: `{Name}.t.sol` (e.g., `LSP7RoleOperators.t.sol`)
- Sub-directories organize by contract/module: `LSP6KeyManager/`, `LSP1UniversalReceiver/`

**Structure:**
```
packages/lsp-smart-contracts/
├── tests/
│   ├── Mocks/                          # Mock contract tests
│   │   ├── ERC165Interfaces.test.ts
│   │   ├── ABIEncoder.test.ts
│   │   └── ...
│   ├── LSP6KeyManager/                # LSP6-specific tests
│   │   ├── LSP6KeyManager.test.ts
│   │   ├── LSP6KeyManagerInit.test.ts
│   │   ├── SetData/
│   │   │   └── PermissionSetData.test.ts
│   │   ├── Interactions/
│   │   │   ├── PermissionCall.test.ts
│   │   │   └── ...
│   │   └── Admin/
│   ├── LSP20CallVerification/
│   │   ├── LSP20CallVerification.behaviour.ts
│   │   ├── LSP6/
│   │   │   ├── LSP20WithLSP6.test.ts
│   │   │   └── ...
│   ├── utils/
│   │   ├── context.ts                # Test context type definitions
│   │   ├── fixtures.ts               # Reusable setup functions
│   │   ├── helpers.ts                # Utility functions
│   │   └── ...
│   └── UniversalProfile.test.ts
├── foundry/
│   ├── GasTests/
│   └── LSP20SetDataTest.t.sol
└── contracts/
```

## Test Structure

**Suite Organization:**
```typescript
import { expect } from 'chai';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';

describe('Calculate LSP interfaces', () => {
  let accounts: HardhatEthersSigner[];
  let contract: CalculateLSPInterfaces;

  before(async () => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    accounts = await ethers.getSigners();
    contract = await new CalculateLSPInterfaces__factory(accounts[0]).deploy();
  });

  it('LSP0', async () => {
    const result = await contract.calculateInterfaceLSP0();
    expect(result).to.equal(INTERFACE_IDS.LSP0ERC725Account);
  });

  it('LSP1', async () => {
    const result = await contract.calculateInterfaceLSP1();
    expect(result).to.equal(INTERFACE_IDS.LSP1UniversalReceiver);
  });
});
```

**Patterns:**
- **Setup pattern:** `before()` hook runs once; `beforeEach()` for per-test setup
- **Teardown pattern:** Not explicitly used; relies on blockchain state resets
- **Assertion pattern:** Chai expect with chaining (e.g., `.to.equal()`, `.to.be.revertedWithCustomError()`)
- **Async pattern:** All test functions are async; use `await` for contract calls

**Shared Test Behavior Pattern:**
```typescript
export const shouldBehaveLikeLSP20 = (buildContext: () => Promise<LSP20TestContext>) => {
  let context: LSP20TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when testing lsp20 integration', () => {
    describe('when owner is an EOA', () => {
      it('should pass when owner calls', async () => {
        await context.universalProfile
          .connect(context.deployParams.owner)
          .setData(dataKey, dataValue);
        expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
      });
    });
  });
};
```

## Mocking

**Framework:** Hardhat VM (via hardhat-ethers) and Foundry's CheatCodes (`vm`)

**TypeScript Patterns:**
```typescript
// Mock contract deployment
const mockContract = await new MockContractFactory(signer).deploy();

// Contract interface manipulation
const ERC725XInterface = UniversalProfile__factory.createInterface();

// Bytecode deployment for proxy testing
const proxyBytecode = eip1167RuntimeCodeTemplate.replace(
  'bebebebebebebebebebebebebebebebebebebebe',
  baseContractAddress.substring(2),
);
const tx = await deployer.sendTransaction({ data: proxyBytecode });
```

**Solidity Patterns:**
```solidity
// Mock contract inheritance
contract MockLSP7RoleOperators is LSP7RoleOperatorsAbstract {
    constructor(...) LSP7DigitalAsset(...) LSP7RoleOperatorsAbstract(...) {}
}

// VM cheatcodes for address generation
address nonOwner = vm.addr(100);
address operator1 = vm.addr(101);

// Deal token balance
deal(address(account), 10 ether);
```

**What to Mock:**
- External contract interfaces for isolated testing
- Addresses for permission and authorization testing
- Mock extensions and handlers (e.g., `MaliciousReceiver`, `FallbackExtensions`)
- Not: blockchain state (use test blockchain), time (use Foundry's warp/roll)

**What NOT to Mock:**
- Production smart contracts being tested
- Core business logic (test real behavior)
- Time/block manipulation in critical tests (can hide real issues)

## Fixtures and Factories

**Test Data:**
```typescript
// Helper function for random addresses
export function getRandomAddresses(count: number): string[] {
  const addresses: string[] = [];
  for (let ii = 0; ii < count; ii++) {
    const randomAddress = Wallet.createRandom().address.toLowerCase();
    addresses.push(randomAddress);
  }
  return addresses;
}

// Constants for array lengths
export const ARRAY_LENGTH = {
  ZERO: '0x00000000000000000000000000000000',
  ONE: '0x00000000000000000000000000000001',
  TWO: '0x00000000000000000000000000000002',
};

// Private keys for local testing (hardhat accounts)
export const LOCAL_PRIVATE_KEYS: { [key: string]: `0x${string}` } = {
  ACCOUNT0: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ACCOUNT1: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  // ...
};
```

**Setup Fixtures:**
```typescript
// Reusable setup function
export async function setupKeyManager(
  _context: LSP6TestContext,
  _dataKeys: string[],
  _dataValues: string[],
) {
  await _context.universalProfile.connect(_context.mainController).setDataBatch(
    [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        _context.mainController.address.substring(2),
      ..._dataKeys,
    ],
    [ALL_PERMISSIONS, ..._dataValues],
  );

  const keyManagerAddress = await _context.keyManager.getAddress();
  await _context.universalProfile
    .connect(_context.mainController)
    .transferOwnership(keyManagerAddress);

  const payload = _context.universalProfile.interface.getFunction('acceptOwnership').selector;
  await _context.keyManager.connect(_context.mainController).execute(payload);
}

// Complex fixture with URD setup
export async function setupProfileWithKeyManagerWithURD(EOA: HardhatEthersSigner) {
  const universalProfile = await new UniversalProfile__factory(EOA).deploy(EOA.address, {
    value: parseEther('10'),
  });
  // ... more setup
}
```

**Location:**
- TypeScript fixtures: `/packages/lsp-smart-contracts/tests/utils/fixtures.ts`
- Helper functions: `/packages/lsp-smart-contracts/tests/utils/helpers.ts`
- Context types: `/packages/lsp-smart-contracts/tests/utils/context.ts`
- Constants: `/packages/lsp-smart-contracts/tests/constants.js` and contract-specific constants

## Coverage

**Requirements:** No explicit enforcement visible; coverage reports available

**View Coverage:**
```bash
npm run test:coverage              # Generate coverage report
# Report generated in coverage/ directory after test run
```

## Test Types

**Unit Tests:**
- Scope: Individual function behavior in isolation
- Approach: Direct contract function calls with controlled inputs
- Example: `ERC165Interfaces.test.ts` validates each interface ID calculation
- Location: `packages/lsp-smart-contracts/tests/Mocks/` for mock tests

**Integration Tests:**
- Scope: Multiple contracts/modules working together
- Approach: Setup complex context with KeyManager + UniversalProfile + URD
- Example: `LSP20WithLSP6.test.ts` tests LSP20 call verification with LSP6 permissions
- Pattern: Shared behavior functions allow running same tests against different contexts
- Location: `packages/lsp-smart-contracts/tests/LSP20CallVerification/`

**E2E Tests:**
- Not explicitly labeled as separate suite
- Closest equivalent: Benchmark and performance tests
- Test: `npm run test:benchmark` runs real gas usage scenarios
- Location: `packages/lsp-smart-contracts/tests/Benchmark.test.ts`

**Foundry (Solidity) Tests:**
- Scope: Smart contract logic and security properties
- Approach: Test contract behavior directly in Solidity
- Examples: `LSP7RoleOperators.t.sol`, `TwoStepOwnership.t.sol`
- Pattern: Inherits from `Test` (forge-std); uses `vm` cheatcodes for setup
- Coverage: Gas optimization tests, permission tests, reentrancy tests

## Common Patterns

**Async Testing:**
```typescript
// Standard async/await pattern
it('should do something async', async () => {
  const result = await contract.someAsyncMethod();
  expect(result).to.equal(expectedValue);
});

// Promise chains allowed
it('should chain promises', () => {
  return contract.method1()
    .then((result) => contract.method2(result))
    .then((result) => expect(result).to.equal(expectedValue));
});
```

**Error Testing:**
```typescript
// Chai matcher for custom errors
it('should revert when non-owner calls', async () => {
  await expect(
    context.universalProfile.connect(context.accounts[1]).setData(dataKey, dataValue),
  )
    .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
    .withArgs(context.deployParams.owner.address);
});

// Foundry expect revert pattern
vm.expectRevert(LSP14MustAcceptOwnershipInSeparateTransaction.selector);
account.transferOwnership(address(maliciousReceiver));
```

**Context-Driven Testing:**
```typescript
// Context object passed through test hierarchy
type LSP6TestContext = {
  ethers: HardhatEthers;
  networkHelpers: NetworkHelpers;
  accounts: HardhatEthersSigner[];
  mainController: HardhatEthersSigner;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
  initialFunding?: bigint;
};

// Used in behavior functions and test files
const context = await buildContext(initialFunding);
await context.universalProfile.connect(context.mainController).setData(key, value);
```

**Helper Function Patterns:**
```typescript
// Bit manipulation for permissions
export function combinePermissions(..._permissions: string[]) {
  let result: bigint = toBigInt(0);
  _permissions.forEach((permission) => {
    const permissionAsBN = toBigInt(permission);
    result = result | permissionAsBN;
  });
  return zeroPadValue(toBeHex(result), 32);
}

// Encoding utilities
export function encodeCompactBytesArray(inputKeys: BytesLike[]) {
  let compactBytesArray = '0x';
  for (let i = 0; i < inputKeys.length; i++) {
    compactBytesArray +=
      zeroPadValue(toBeHex(inputKeys[i].toString().substring(2).length / 2), 2).substring(2) +
      inputKeys[i].toString().substring(2);
  }
  return compactBytesArray;
}
```

**Foundry Test Setup:**
```solidity
contract LSP7RoleOperatorsTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address operator1 = vm.addr(101);

    MockLSP7RoleOperators lsp7RoleOperators;

    function setUp() public {
        lsp7RoleOperators = new MockLSP7RoleOperators(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible
        );
    }

    function test_ConstructorInitializesDefaultRoles() public {
        assertTrue(
            lsp7RoleOperators.hasRole(owner, _MINT_ROLE),
            "Owner should have MINT_ROLE"
        );
    }
}
```

---

*Testing analysis: 2026-02-25*
