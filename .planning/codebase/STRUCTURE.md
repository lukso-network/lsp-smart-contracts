# Codebase Structure

**Analysis Date:** 2026-02-25

## Directory Layout

```
lsp-smart-contracts/
├── packages/                          # Monorepo workspace packages
│   ├── lsp0-contracts/               # LSP0 ERC725Account implementation
│   ├── lsp1-contracts/               # LSP1 Universal Receiver interface
│   ├── lsp1delegate-contracts/       # LSP1 Universal Receiver Delegate
│   ├── lsp2-contracts/               # LSP2 ERC725Y JSON Schema
│   ├── lsp3-contracts/               # LSP3 Profile Metadata
│   ├── lsp4-contracts/               # LSP4 Digital Asset Metadata
│   ├── lsp5-contracts/               # LSP5 Received Assets
│   ├── lsp6-contracts/               # LSP6 Key Manager
│   ├── lsp7-contracts/               # LSP7 Digital Asset (Fungible Token)
│   ├── lsp8-contracts/               # LSP8 Identifiable Digital Asset (NFT)
│   ├── lsp9-contracts/               # LSP9 Vault
│   ├── lsp10-contracts/              # LSP10 Received Vaults
│   ├── lsp11-contracts/              # LSP11 Social Recovery
│   ├── lsp12-contracts/              # LSP12 Issued Assets
│   ├── lsp14-contracts/              # LSP14 Ownable 2 Step
│   ├── lsp16-contracts/              # LSP16 Universal Factory
│   ├── lsp17-contracts/              # LSP17 Extensions Package
│   ├── lsp17contractextension-contracts/  # LSP17 Contract Extension
│   ├── lsp20-contracts/              # LSP20 Call Verification
│   ├── lsp23-contracts/              # LSP23 Linked Contracts Factory
│   ├── lsp25-contracts/              # LSP25 Execute Relay Call
│   ├── lsp26-contracts/              # LSP26 Follower System
│   ├── lsp-smart-contracts/          # Composite package (all LSPs combined)
│   ├── universalprofile-contracts/   # Universal Profile implementation
│   └── config/                       # Shared build/lint configuration
├── lib/                              # External dependencies (git submodules)
├── node_modules/                     # NPM dependencies
├── tests/                            # Root-level foundry tests
├── template/                         # Contract templates
├── foundry.toml                      # Foundry configuration with profiles
├── package.json                      # Root monorepo package definition
├── turbo.json                        # Turbo build orchestration config
├── remappings.txt                    # Solidity import path remappings
└── README.md                         # Project overview
```

## Directory Purposes

**Package Structure (each lsp\*-contracts/ package contains):**

- `contracts/` - Solidity source files
  - Core implementations: `LSP[N].sol`, `LSP[N]Core.sol`
  - Init abstracts: `LSP[N]InitAbstract.sol`
  - Concrete variants: `LSP[N]Init.sol` (for proxy deployment)
  - Extensions: `extensions/` subdirectory with optional feature abstracts
  - Interfaces: `ILSP[N].sol` files
  - Constants: `LSP[N]Constants.sol`
  - Errors: `LSP[N]Errors.sol`
  - Mocks: `Mocks/` for testing contracts
- `foundry/` or `tests/` - Foundry test files (\*.t.sol)
- `ignition/` - Hardhat Ignition deployment modules (if present)
- `types/` - Generated TypeScript type definitions
- `artifacts/` - Compiled contract ABIs and metadata
- `package.json` - Individual package configuration

**Main Composite Package:**

- Location: `packages/lsp-smart-contracts/`
- Purpose: Re-exports all LSP standards in one package
- Contains: `contracts/` with references to all standards plus `UniversalProfile.sol`

**Shared Configuration:**

- Location: `config/`
- Contains:
  - `eslint-config-custom/` - ESLint rules
  - `hardhat-packager-v3/` - Hardhat plugin for packaging
  - `tsconfig/` - Shared TypeScript configuration

## Key File Locations

**Entry Points:**

- `packages/lsp7-contracts/contracts/LSP7DigitalAsset.sol`: Abstract base for LSP7 tokens (fungible)
- `packages/lsp7-contracts/contracts/LSP7CustomizableToken.sol`: Concrete LSP7 with all common extensions
- `packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol`: Abstract base for LSP8 NFTs
- `packages/lsp0-contracts/contracts/LSP0ERC725Account.sol`: Account contract main entry
- `packages/lsp0-contracts/contracts/LSP0ERC725AccountCore.sol`: Core account logic
- `packages/universalprofile-contracts/contracts/UniversalProfile.sol`: Universal Profile composite contract
- `packages/lsp6-contracts/contracts/LSP6KeyManager.sol`: Key Manager for permissions
- `packages/lsp-smart-contracts/contracts/UniversalProfile.sol`: Universal Profile re-export

**Configuration:**

- `foundry.toml`: Foundry compiler profiles per package (solc version, optimizer, test directories)
- `package.json`: Workspace root and individual package manifests
- `turbo.json`: Build pipeline and task orchestration
- `remappings.txt`: Solidity import path aliases (e.g., `@lukso/lsp7-contracts/=packages/lsp7-contracts/`)
- `hardhat.config.ts` (in each package): Hardhat build and test configuration

**Core Logic:**

- `packages/lsp7-contracts/contracts/LSP7DigitalAsset.sol` (898 lines): Token storage, balances, operators, transfer logic
- `packages/lsp0-contracts/contracts/LSP0ERC725AccountCore.sol` (~500 lines): Account execution, ERC725X/Y, LSP1/LSP17/LSP20
- `packages/lsp6-contracts/contracts/LSP6KeyManagerCore.sol`: Permission verification (**Important: controllers' permissions are not stored in the LSP6KeyManager contract, but under specific ERC725Y data keys of the user's Universal Profile contract linked to its Key Manager**)
- `packages/lsp17contractextension-contracts/contracts/LSP17Extendable.sol`: Fallback delegation to extensions

**Testing:**

- `packages/lsp7-contracts/foundry/`: Foundry tests for LSP7 (test structure: TestName.t.sol)
- `packages/lsp7-contracts/tests/`: Hardhat tests (if present)
- `packages/lsp-smart-contracts/tests/foundry/`: Composite tests
- `packages/lsp0-contracts/foundry/TwoStepOwnership.t.sol`: Sample test structure

## Naming Conventions

**Files:**

- Core implementations: `LSP[Number].sol` (e.g., `LSP7DigitalAsset.sol`)
- Core abstracts: `LSP[Number]Core.sol` (e.g., `LSP0ERC725AccountCore.sol`)
- Proxy-compatible abstracts: `LSP[Number]InitAbstract.sol`
- Concrete proxy implementations: `LSP[Number]Init.sol`
- Interfaces: `ILSP[Number].sol`
- Constants: `LSP[Number]Constants.sol`
- Errors: `LSP[Number]Errors.sol`
- Extensions: `LSP[Number][FeatureName].sol` or in `extensions/LSP[Number][FeatureName]/` subdirectory
- Preset/customizable: `LSP[Number]CustomizableToken.sol`
- Tests (Foundry): `TestDescription.t.sol`
- Tests (Hardhat): `testDescription.test.ts` or `test/description.test.ts`

**Directories:**

- Standard packages: `lsp[number]-contracts/` (e.g., `lsp7-contracts/`)
- Extension subdirectories: `extensions/LSP[Number][Feature]/` (e.g., `extensions/LSP7Allowlist/`, `extensions/LSP7CappedBalance/`)
- Mock contracts: `contracts/Mocks/`
- Modules (LSP6): `LSP6Modules/` for permission checking modules

## Where to Add New Code

**New Token Extension (e.g., LSP7 Burnable):**

- Primary code: `packages/lsp7-contracts/contracts/extensions/LSP7[FeatureName]/LSP7[FeatureName]Abstract.sol` (abstract base)
- Init variant: `packages/lsp7-contracts/contracts/extensions/LSP7[FeatureName]/LSP7[FeatureName]InitAbstract.sol`
- Interface: `packages/lsp7-contracts/contracts/extensions/LSP7[FeatureName]/ILSP7[FeatureName].sol`
- Errors: `packages/lsp7-contracts/contracts/extensions/LSP7[FeatureName]/LSP7[FeatureName]Errors.sol`
- Constants: `packages/lsp7-contracts/contracts/extensions/LSP7[FeatureName]/LSP7[FeatureName]Constants.sol` (if needed)
- Tests: `packages/lsp7-contracts/foundry/LSP7[FeatureName].t.sol`

**New LSP Standard Package:**

- Create directory: `packages/lsp[XX]-contracts/`
- Structure: `contracts/ILSP[XX].sol`, `contracts/LSP[XX]Core.sol`, `contracts/LSP[XX].sol`, `contracts/LSP[XX]InitAbstract.sol`
- Include: `package.json`, `foundry.toml` profile, `hardhat.config.ts`, `tsconfig.json`
- Add profile to root `foundry.toml` with source/test paths
- Tests in: `packages/lsp[XX]-contracts/foundry/`

**New Storage Extension or Module (e.g., LSP6 permission module):**

- Location: `packages/lsp6-contracts/contracts/LSP6Modules/` for LSP6 modules
- Pattern: Use abstract contract, follow existing module naming: `LSP6Module[Purpose].sol`
- Include error definitions and interface

**Utilities and Helpers:**

- Shared library functions: `packages/lsp[related-package]/contracts/LSP[XX]Utils.sol`
- Type definitions: `types/index.ts` in relevant package
- Constants re-export: Update relevant `Constants.sol`

**Test Fixtures and Mocks:**

- Mock implementations: `packages/[package]/contracts/Mocks/`
- Foundry helpers: Create at top of test file or in helper contract
- Test data: Define in test file or in separate `TestHelpers.sol` file

## Special Directories

**artifacts/:**

- Purpose: Compiled contract ABIs, deployment metadata, and build artifacts
- Generated: Yes (by hardhat/foundry build)
- Committed: Yes (ABI snapshots for version control)

**forge-cache/ and cache/:**

- Purpose: Forge and hardhat compilation cache
- Generated: Yes (automatically)
- Committed: No (in .gitignore)

**node_modules/:**

- Purpose: NPM dependencies
- Generated: Yes (npm install)
- Committed: No (in .gitignore)

**lib/ (via git submodules):**

- Purpose: External Solidity dependencies
- Generated: No (manually added via git submodule)
- Committed: Yes (.gitmodules tracks submodule refs)

**types/:**

- Purpose: Generated TypeScript type definitions from ABIs
- Generated: Yes (by build tools)
- Committed: Yes (typechain artifacts)

**devdocs/ and userdocs/:**

- Purpose: Generated documentation from natspec comments
- Generated: Yes (by dodoc)
- Committed: Yes (documentation snapshot)

---

_Structure analysis: 2026-02-25_
