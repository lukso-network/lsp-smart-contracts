# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**

- TypeScript test files: `{Name}.test.ts` (e.g., `ERC165Interfaces.test.ts`)
- TypeScript behavior files: `{Name}.behaviour.ts` (e.g., `LSP20CallVerification.behaviour.ts`)
- Solidity test files: `{Name}.t.sol` (e.g., `LSP7RoleOperators.t.sol`)
- TypeScript source files: PascalCase filenames (e.g., `gas-benchmark.ts`, `fixtures.ts`)
- Directory names: PascalCase or kebab-case depending on grouping (e.g., `LSP6KeyManager/`, `FallbackExtensions/`)

**Functions:**

- TypeScript: camelCase for all functions and methods
  - Public functions: `setupKeyManager()`, `deployProxy()`, `combinePermissions()`
  - Private functions: prefixed with underscore in some cases, but typically camelCase without prefix
  - Factory functions: `{ContractName}__factory` pattern for ethers-contracts
- Solidity: camelCase for functions
  - Public functions: `acceptOwnership()`, `transferOwnership()`
  - Internal functions: prefixed with underscore `_mint()`, `_setOwner()`
  - Test functions: `test{Description}()` pattern (e.g., `testCannotAcceptOwnershipInSameTransaction()`)

**Variables:**

- TypeScript: camelCase (e.g., `deploymentCosts`, `gasUsage`, `currentBenchmark`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `LOCAL_PRIVATE_KEYS`, `ARRAY_LENGTH`, `EMPTY_PAYLOAD`)
- Solidity: camelCase for state variables (e.g., `universalReceiverDisabled`)
- Solidity: camelCase with underscore prefix for private/internal state (e.g., `_owner`)
- Array/mapping constants: descriptive SCREAMING_SNAKE_CASE (e.g., `AddressOffset`)

**Types:**

- TypeScript interfaces: PascalCase prefixed with `I` (e.g., `ILSP7RoleOperators`)
- TypeScript type definitions: PascalCase (e.g., `LSP6TestContext`, `GasBenchmarkTaskArguments`)
- Solidity contracts: PascalCase (e.g., `LSP7RoleOperatorsTest`, `MockLSP7RoleOperators`)
- TypeScript enums/constants: PascalCase or SCREAMING_SNAKE_CASE depending on context

## Code Style

**Formatting:**

- Tool: Prettier v3.6.2
- Configuration: `.prettierrc` in root directory
- JavaScript/TypeScript:
  - `tabWidth: 2`
  - `printWidth: 100`
  - `trailingComma: "all"`
  - `singleQuote: true`
  - `semi: true`
- Solidity:
  - `tabWidth: 4`
  - `printWidth: 80`
  - `compiler: "0.8.17"` (can vary per profile)

**Linting:**

- Tool: ESLint v9.39.1 with TypeScript support
- Configuration: `/Users/jeancavallera/Repositories/LUKSO/Smart-Contracts/lsp-smart-contracts/config/eslint-config-custom/index.js`
- Extended configs:
  - `eslint-config-prettier` (disables conflicting rules)
  - `typescript-eslint` recommended rules
  - `eslint-plugin-turbo` for monorepo consistency
- Key rules:
  - `@typescript-eslint/no-unused-expressions: off` in test files (for Chai assertions like `expect(...).to.be.true`)
  - Ignores: `artifacts/`, `cache/`, `dist/`, `types/`, `contracts.ts`, `abi.ts`

**Solidity Linting:**

- Tool: solhint with custom LSP solidity linting rules package (`solhint-config-lsp-solidity-linting-rules`)
- Commands: `npm run lint:solidity` combines solhint + prettier check
- Files: `contracts/**/*.sol`

## Import Organization

**Order:**

1. External libraries/frameworks (e.g., `import 'forge-std/Test.sol'`, `import 'chai'`)
2. Type imports (e.g., `import type { HardhatEthersSigner }`)
3. Contract/library imports (e.g., `import { LSP6KeyManager__factory }`)
4. Interface imports (e.g., `import { ILSP7RoleOperators }`)
5. Constants imports (e.g., `import { LSP1_TYPE_IDS }`)
6. Internal imports (helpers, utilities, fixtures)

**TypeScript Examples:**

```typescript
import { expect } from "chai";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { LSP6KeyManager__factory } from "../../../lsp6-contracts/types/ethers-contracts/index.js";
import { PERMISSIONS, ALL_PERMISSIONS } from "@lukso/lsp6-contracts";
import { combinePermissions } from "./helpers.js";
```

**Solidity Examples:**

```solidity
import "forge-std/Test.sol";
import { LSP7RoleOperatorsAbstract } from "../contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsAbstract.sol";
import { ILSP7RoleOperators } from "../contracts/extensions/LSP7RoleOperators/ILSP7RoleOperators.sol";
import { _LSP4_TOKEN_TYPE_TOKEN } from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
```

**Path Aliases:**

- No explicit path aliases configured; uses explicit relative paths
- Common pattern: `../../` to navigate up from test files to contract imports
- JS module extensions: `.js` required in imports (e.g., `'./constants.js'`)

## Error Handling

**TypeScript Patterns:**

- Try-catch blocks for deployment/transaction failures
- Error messages are descriptive and specific (e.g., `'Failed to deploy proxy contract'`)
- Type guards used to check null/undefined: `if (!receipt || receipt.status !== 1 || receipt.contractAddress === null)`
- Throws with `Error` class for custom failures

**Solidity Patterns:**

- Custom error types defined separately (e.g., `LSP7RoleOperatorsInvalidIndexRange`)
- Errors imported from dedicated error files
- Revert statements check conditions explicitly, except using `require` with custom errors for LSP7 and LSP8 contracts
- Examples from tests: `vm.expectRevert(LSP14MustAcceptOwnershipInSeparateTransaction.selector)`

**Test Error Handling:**

- Chai expect with `.to.be.revertedWithCustomError()` for Solidity reverts
- `.withArgs()` chaining for error parameter validation
- `expect(...).to.equal()` for value assertions

## Logging

**Framework:** console (native JavaScript) and Chai assertions (no dedicated logging framework)

**Patterns:**

- No explicit logging in source code
- Tests use Chai's expect() for validation instead of console.log
- Gas benchmarks display information via formatted markdown tables
- Test output driven by Mocha/Hardhat test runner

## Comments

**When to Comment:**

- Test descriptions: JSDoc comments explaining test purpose (e.g., `@dev these tests check that the ERC165 interface IDs...`)
- Complex logic: Brief explanations for non-obvious implementations
- Workarounds: Document why unconventional approaches are used
- Warning comments: `WARNING!` for critical information (e.g., `WARNING! These private keys are publicly known`)

**JSDoc/TSDoc:**

- Used in test files for describe blocks and context setup
- Format: `/** @dev ... */` or `/** ... */` for test documentation
- Example: Test file headers document what is being validated
- Not heavily used in production code, focus is on clarity through naming

**Solidity Comments:**

- Section separators: `// ============================================================`
- Function documentation with Natspec: Brief descriptions of setup functions
- Inline comments: Explain non-obvious contract logic
- Example: `// Owner should have MINT_ROLE`

## Function Design

**Size:**

- Varies; utility functions are typically short (5-20 lines)
- Test setup functions can be longer (50+ lines) for complex fixture setup
- Behavior files use exported functions that accept context builders for reusable test patterns

**Parameters:**

- TypeScript helpers accept specific parameters (e.g., `combinePermissions(..._permissions: string[])`)
- Constructor parameters: explicit types with clarity (e.g., `name_`, `symbol_`, `newOwner_`)
- Context objects passed through many layers (e.g., `LSP6TestContext` passed to setup functions)
- Variadic functions used for combining permissions/call types

**Return Values:**

- Async functions return promises (e.g., `async function deployProxy(...): Promise<string>`)
- Utility functions return encoded data or computed values
- Setup functions return void (perform side effects on context)
- Test context builders return typed context objects (e.g., `Promise<LSP6TestContext>`)

## Module Design

**Exports:**

- Named exports for utilities: `export const combinePermissions = (...)`
- Default exports for Hardhat tasks: `export default async function`
- Factory pattern exports: `new {ClassName}__factory(signer).deploy()`
- Type exports: `export type {TypeName} = { ... }`

**Barrel Files:**

- Generated barrel files at `types/ethers-contracts/index.js` for contract factory exports
- Not extensively used for organizing helpers; direct imports preferred
- Pattern: `import { ... } from '../../types/ethers-contracts/index.js'`

## File Organization Patterns

**Test Files Structure:**

- Imports section (3-4 groups)
- Test context type definitions
- describe() blocks for grouping
- before/beforeEach hooks
- it() test cases with arrange-act-assert pattern

**Behavior Files Structure:**

- Export function pattern: `export const shouldBehaveLike{Name} = (buildContext: ...) => { ... }`
- Context is built/passed in dynamically
- Reusable across multiple test files
- Describe blocks nested for organization

**Fixture Files Structure:**

- Named export functions for setup operations
- Functions take context objects and mutate them
- Examples: `setupKeyManager()`, `setupProfileWithKeyManagerWithURD()`
- Return types explicit for complex returns

---

_Convention analysis: 2026-02-25_
