# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**

- Solidity 0.8.17, 0.8.24, 0.8.27, 0.8.28 - Smart contracts (multiple versions for different LSP standards)
- TypeScript 5.8+ - Build tools, scripts, tests, and type generation
- JavaScript (ES Modules) - Configuration files, automation

**Secondary:**

- Bash - Build and deployment scripts

## Runtime

**Environment:**

- Node.js 22.0.0+ - Build, testing, and package management

**Package Manager:**

- npm 10.1.0+ - Primary package manager
- Lockfile: `package-lock.json` present (npm)

## Frameworks

**Core Blockchain:**

- Hardhat 3.1.2 - Smart contract compilation, testing, deployment orchestration
- Forge/Foundry - Alternative smart contract testing framework with Solidity tests

**Testing:**

- Mocha (via @nomicfoundation/hardhat-toolbox-mocha-ethers 3.0.0) - Test runner for TypeScript/JavaScript tests
- Chai - Assertion library for test cases
- Foundry - Solidity-native testing framework for performance and security tests

**Build/Dev:**

- Turborepo (latest) - Monorepo build orchestration
- Unbuild 3.6.1 - JavaScript bundle building (for CJS/ESM dual exports)
- TypeScript 5.8+ - Static type checking and compilation
- Wagmi CLI 2.8.0 - Generate TypeScript types from contract ABIs
- ESLint 9.39.1 - JavaScript/TypeScript linting
- Prettier 3.6.2 - Code formatting

**Solidity Linting:**

- Solhint - Solidity smart contract linting (via `solhint:recommended` and custom LSP rules)
- prettier-plugin-solidity - Solidity code formatting via Prettier

## Key Dependencies

**Critical:**

- @erc725/smart-contracts-v8 8.0.1 - ERC725 reference implementation (core LUKSO standard)
- @erc725/erc725.js 0.28.2 - JavaScript ERC725 utilities for testing and interaction
- @openzeppelin/contracts 4.9.3 - OpenZeppelin Solidity library (imported in contracts)

**Infrastructure:**

- ethers 6.15.0 - Ethereum wallet and contract interaction library
- @lukso/lsp\*-contracts (various versions ~0.15-0.16) - Modular LSP standard implementations
- @lukso/universalprofile-contracts ~0.15.5 - Universal Profile contracts
- @lukso/eip191-signer.js 0.2.5 - EIP191 signing for tests
- @nomicfoundation/hardhat-toolbox-mocha-ethers 3.0.0 - Hardhat testing suite

**Development:**

- dotenv 17.2.3 - Environment variable loading
- ts-node 10.9.2 - TypeScript execution for scripts
- all-contributors-cli 6.26.1 - Contributor tracking
- husky 9.1.7 - Git hooks
- markdown-table-ts 1.0.3 - Documentation generation
- pluralize 8.0.0 - Pluralization utility

## Configuration

**Environment:**

- Loaded from `.env` files (location: `/packages/lsp-smart-contracts/.env` - contents not readable)
- Environment variables referenced: `CONTRACT_VERIFICATION_TESTNET_PK`, `CONTRACT_VERIFICATION_MAINNET_PK`, `COVERAGE`, `MYTHX_API_KEY`
- Node modules from `node_modules/` and `lib/` directories

**Build:**

- `foundry.toml` - Forge configuration with profiles for each LSP standard (lsp0, lsp2, lsp6, lsp7, lsp8, lsp11, lsp16, lsp_smart_contracts)
- `hardhat.config.ts` - Hardhat compilation settings with multiple Solidity compiler versions and optimizations
- `turbo.json` - Turborepo task definitions and cache configuration
- `tsconfig.json` - TypeScript compilation targets (ES modules)
- `.solhint.json` - Solidity linting rules configuration
- `.prettierrc` - Prettier formatting (tabWidth: 2 for JS/TS, tabWidth: 4 for Solidity)
- `build.config.ts` - Unbuild configuration for CJS/ESM dual exports
- `wagmi.config.ts` - Wagmi CLI configuration for ABI-to-TypeScript generation

**Monorepo:**

- Workspaces: `config/*` (shared tools) and `packages/*` (LSP standard implementations)
- Packages: 27 LSP contract packages + 4 config packages

## Compiler Settings

**Standard Compilation:**

- Solc 0.8.17, 0.8.24 - Default settings with optimizer (runs: 1000)

**LSP7 (Digital Asset):**

- Solc 0.8.28 - Via IR compilation with optimizer (runs: 25000), EVM version: prague

**LSP8 (Identifiable Digital Asset):**

- Solc 0.8.27 - Optimizer enabled (runs: 1000)

**LSP4 (Metadata):**

- Solc 0.8.24 - Via IR compilation

**Storage Layout:**

- All compilers generate storage layout output for validation

## Platform Requirements

**Development:**

- macOS (darwin) or Linux
- x64 or ARM64 architecture
- Node.js 22.0.0+

**Production:**

- EVM-compatible blockchain (LUKSO network primarily)
- No runtime dependencies on Node.js (contracts are on-chain)

---

_Stack analysis: 2026-02-25_
