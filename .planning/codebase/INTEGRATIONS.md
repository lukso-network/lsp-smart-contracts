# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**Contract Standards & Libraries:**

- ERC725 Standard - Via `@erc725/smart-contracts-v8` (8.0.1)
- JS library for ERC725Y/LSP2 fetching, encoding / decoding utilities: `@erc725/erc725.js` (0.28.2)
- Core LUKSO standard implementation in Solidity for generic data storage and executors

- OpenZeppelin Contracts - Via `@openzeppelin/contracts` (4.9.3)
- Used for base contract interfaces and utilities
- Imported in LSP0ERC725Account and other standards

- LSP Standards Suite - Internal packages
- 27 LSP-specific contract packages (LSP0, LSP1, LSP2, LSP6, LSP7, LSP8, LSP9, etc.)
- Published to npm registry
- Interdependencies managed via package.json

**Blockchain Interaction:**

- ethers.js - Via `ethers` (6.15.0)
- Contract interaction and transaction handling
- Used in tests and deployment scripts
- Client: `@nomicfoundation/hardhat-ethers` (3.0.0)

**EIP Standards:**

- EIP191 Signing - Via `@lukso/eip191-signer.js` (0.2.5)
- Signature generation and verification for off-chain data

## Data Storage

**Databases:**

- None - Codebase is smart contracts only
- Contract state stored on-chain in EVM storage
- Storage layout validation enabled in Solidity compilation

**File Storage:**

- Artifacts: Local filesystem
  - Location: `packages/lsp-smart-contracts/artifacts/` (compiled contract ABIs and bytecode)
  - Location: `packages/*/contracts/foundry_artifacts/` (Foundry output)
- Source Control: Git + GitHub repository
  - Repository: `github.com/lukso-network/lsp-smart-contracts`

**Caching:**

- Turbo build cache - Local file system (`cache/` and `.turbo/`)
- Forge cache - Local directory (`forge-cache/`)

## Authentication & Identity

**Auth Provider:**

- No centralized auth provider
- Environment-based credential management:
  - `CONTRACT_VERIFICATION_TESTNET_PK` - Private key for testnet deployments
  - `CONTRACT_VERIFICATION_MAINNET_PK` - Private key for mainnet deployments
  - `MYTHX_API_KEY` - Security analysis service authentication
- Private keys managed via `.env` files (not committed to git)

## Monitoring & Observability

**Security Analysis:**

- Mythx - Smart contract security analysis
  - Integration: GitHub Actions workflow (`.github/workflows/mythx-analysis.yml`)
  - CLI: `mythx-cli` (Python-based)
  - Trigger: Manual workflow dispatch
  - Authentication: `MYTHX_API_KEY` environment variable
  - Requirement: Python 3.8+, solc-select for compiler management

**Error Tracking:**

- None detected - no external error tracking service

**Logs:**

- Local/console only
  - Hardhat task logging
  - Foundry test output

## CI/CD & Deployment

**Version Control:**

- GitHub - Repository hosting and workflow orchestration

**CI Pipeline:**

- GitHub Actions workflows:
  - `build-lint-test.yml` - Node build, ESLint, Hardhat tests
  - `foundry-tests.yml` - Foundry Solidity test execution
  - `coverage.yml` - Test coverage measurement
  - `gas-benchmark.yml` - Gas usage comparison
  - `mythx-analysis.yml` - Security analysis (manual trigger)
  - `release.yml` - Automated releases to npm
  - `solc_version.yml` - Solidity compiler version checks
  - `spellcheck.yaml` - Documentation spell checking

**Release Management:**

- Release-Please Action - Automated versioning and changelog generation
  - Tool: `google-github-actions/release-please-action` v3
  - Package: `@lukso/lsp-smart-contracts`
  - Branch: Triggers on pushes to `main`
  - NPM Publishing: Automated via GitHub Actions
  - Token: `NPM_PUBLISH_KEY` secret

**Build Orchestration:**

- Turborepo - Monorepo task orchestration
  - Caching strategy: Enabled for build, test, and foundry tasks
  - Global dependencies: `.env.local` files

## Environment Configuration

**Required Environment Variables:**

- `COVERAGE` - Boolean flag for coverage collection (used in Hardhat testing)
- `CONTRACT_VERIFICATION_TESTNET_PK` - Testnet private key (for deployment verification)
- `CONTRACT_VERIFICATION_MAINNET_PK` - Mainnet private key (for deployment verification)
- `MYTHX_API_KEY` - Security analysis API authentication

**Node Configuration:**

- Node 22.0.0+ enforced via `package.json` engines field
- Supported OS: darwin, linux
- Supported CPU: x64, arm64

**Secrets Location:**

- `.env` files (local, not committed) - Managed per developer
- GitHub Secrets (for CI/CD):
  - `NPM_PUBLISH_KEY` - npm registry token
  - `MYTHX_API_KEY` - MythX security analysis service
  - Testnet/Mainnet PKs via environment during workflow execution

## Webhooks & Callbacks

**Incoming:**

- None detected - Smart contracts are passive (event-based)

**Outgoing:**

- GitHub Release Webhooks - Triggered after release-please creates releases
- npm Registry - Published packages trigger downstream CI in dependent projects

## Contract Event Broadcasting

**Standard Events:**

- ERC725 events emitted by contracts (DataChanged, DataCleared, etc.)
- LSP7 Transfer events
- LSP8 Transfer events
- Execution events from Universal Profile
- Key Manager permission events

**Off-chain Indexing:**

- No built-in indexing service (assumed to be handled by external indexers like The Graph)

## External Verification

**Block Explorers:**

- Assumed LUKSO block explorer for contract verification
- No explicit configuration detected in codebase

---

_Integration audit: 2026-02-25_
