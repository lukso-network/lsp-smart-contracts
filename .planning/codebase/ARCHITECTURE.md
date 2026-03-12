# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** Modular Solidity Smart Contracts implementing LUKSO Standard Proposals (LSPs)

**Key Characteristics:**

- Multi-package monorepo architecture with independent LSP implementations
- Abstract base classes with paired concrete and proxy-compatible InitAbstract variants
- Extension-based composition pattern for adding optional features (Mintable, Burnable, CappedSupply, etc.)
- Proxy-compatible initialization pattern using OpenZeppelin's Initializable
- Modular permission system (LSP6 Key Manager) for access control
- Universal Receiver pattern (LSP1) for event notification and delegation
- Contract extension mechanism (LSP17) for fallback function delegation

## Layers

**Core Standards Layer (LSP0, LSP1):**

- Purpose: Define foundational standards for account abstraction and notifications system
- Location: `packages/lsp0-contracts/contracts/`, `packages/lsp1-contracts/contracts/`
- Contains: Interface definitions (ILSP\*.sol), Core implementations, Constants
- Depends on: @erc725/smart-contracts, OpenZeppelin contracts
- Used by: All higher-level LSP implementations

**Metadata Standards Layer (LSP2, LSP3, LSP4, LSP5, LSP10, LSP12)**

- Purpose: Define core metadata standard (LSP2) that defines how ERC725Y data keys are structured (interpreted, encoded and decoded), and standardized data keys with their own standard schemas (LSP3, 4, 5, 10 and 12)
- Location: `packages/lsp2-contracts/contracts/`, `packages/lsp4-contracts/contracts/`
- Contains: Solidity `library` and utility functions to generate data key of various `keyType` and `valueContent` encoding, as well as pre-defined Constant file with standardized data keys.
- Depends on: @erc725/smart-contracts, OpenZeppelin contracts
- Used by: All higher-level LSP implementations

**Digital Asset Layer (LSP7, LSP8):**

- Purpose: Implement fungible (LSP7) and non-fungible (LSP8) token standards
- Location: `packages/lsp7-contracts/contracts/`, `packages/lsp8-contracts/contracts/`
- Contains: Base implementations (LSP7DigitalAsset, LSP8IdentifiableDigitalAsset), extension abstracts, concrete implementations
- Depends on: LSP4 (metadata), LSP1 (universal receiver), LSP17 (extensions)
- Used by: Universal Profile, custom token implementations

**Permissions & Ownership Management Layer (LSP6, LSP14, LSP20):**

- Purpose: Provide core features for permissions management and safe contract ownership management
- Location: `packages/lsp0-contracts/contracts/LSP0ERC725AccountCore.sol`, `packages/lsp6-contracts/contracts/LSP6KeyManagerCore.sol`, `packages/lsp14-contracts/contracts/`
- Contains: Account implementation (LSP0), Key Manager for permission verification (LSP6), Two-step ownership transfer (LSP14)
- LSP14 (Ownable2Step): Security-critical pattern requiring explicit acceptance of ownership. Transfer initiates with `transferOwnership()`, completes with `acceptOwnership()` by the pending owner. Prevents accidental transfers to wrong addresses.
- Depends on: ERC725X/Y, LSP17, LSP20 (call verification)
- Used by: Universal Profile, permission-based operations, all ownable contracts in the ecosystem

**Extension System (LSP17, LSP20, LSP25):**

- Purpose: Enable function delegation, call verification and relay/meta-transactions
- Location: `packages/lsp17contractextension-contracts/contracts/LSP17Extendable.sol`, `packages/lsp20-contracts/contracts/`, `packages/lsp25-contracts/contracts/`
- Contains: Fallback handlers, extension registry, call verification, relay execution
- LSP17: Uses `call` (NOT `delegatecall`) - extensions run in their own context, not the caller's. This is a critical security distinction.
- LSP20: Call verification interface for authorization checks (Key Manager implements this)
- LSP25 (Execute Relay Call): Meta-transaction pattern enabling gasless transactions. Users sign payloads off-chain; relayers submit transactions and pay gas. Fundamental to the UP onboarding experience where new users can interact without holding native tokens.
- Depends on: Core ERC165 for interface detection
- Used by: LSP0 (account), LSP7/LSP8 (tokens), LSP6 (key manager), relay services

**Composite Layer (UniversalProfile, LSP9 Vault):**

- Purpose: Combine core components into complete user-facing contracts
- Location: `packages/universalprofile-contracts/contracts/UniversalProfile.sol`, `packages/lsp-smart-contracts/contracts/UniversalProfile.sol`, `packages/lsp9-contracts/contracts/`
- Contains: Preconfigured implementations combining LSP0, LSP4, LSP6, LSP17, LSP20
- Depends on: All underlying LSP standards
- Used by: End users, dApps

**Factory & Utilities (LSP16, LSP23):**

- Purpose: Contract creation and linked deployment to guarantee same address across chains (architecturally significant for multi-chain UP portability)
- Location: `packages/lsp16-contracts/contracts/LSP16UniversalFactory.sol`, `packages/lsp23-contracts/contracts/`
- Contains: Factory patterns for deterministic deployment of standard or proxy contracts with CREATE2.
- Depends on: no dependencies
- Used by: Deployment infrastructure

## Data Flow

**Token Transfer Flow (LSP7 Example):**

1. External call to `transfer()` on LSP7DigitalAsset
2. Internal validation (balance check, operator verification)
3. Storage update via inherited storage patterns
4. LSP1 Universal Receiver notification to sender (LSP7TokensSender)
5. LSP1 Universal Receiver notification to recipient (LSP7TokensRecipient)
6. Event emission (Transfer)

**Account Execution Flow (for LSP0ERC725Account):**

1. User calls any specific function like `setData(bytes32,bytes)`, `execute(uint256,address,uint256,bytes)` on LSP0ERC725Account
2. LSP0 uses LSP20 `_verifyCall()` to check back with the Key Manager for authorization
3. Key Manager verifies caller's permissions against ERC725Y / LSP6 permission data keys
4. LSP0 performs the execution (create, call, staticcall, delegatecall via ERC725X) or setting data (via ERC725Y)
5. If function selector not found in LSP0, fallback triggers LSP17 extension lookup
6. Return result or revert with error

Note: LSP1 Universal Receiver notifications are NOT triggered by LSP0 execute() itself - they occur within the _called_ contracts (e.g., when a token transfer happens, the token contract triggers LSP1 on sender/recipient).

**State Management:**

- **ERC725Y key-value store is THE core state model** for LUKSO accounts. All metadata lives in a single `mapping(bytes32 => bytes)` with standardized data keys. This IS explicit state aggregation - the whole point of ERC725Y.
- LSP2 defines how data keys are structured (singleton, array, mapping, mapping with grouping). All other LSPs (LSP3, LSP4, LSP5, LSP6, LSP10, LSP12) define standardized keys that follow LSP2 encoding.
- Token state (LSP7/LSP8) uses traditional Solidity storage patterns (balance mappings, etc.) rather than ERC725Y, since tokens are separate contracts from accounts.
- Extension state added via abstract contracts (e.g., LSP7CappedBalanceAbstract stores cap values)
- Composition via multiple inheritance for token extensions

**Received Assets/Vaults Registration Flow (LSP5/LSP10):**

When a Universal Profile receives tokens or vaults, the LSP1UniversalReceiverDelegate automatically:

1. Receives notification via `universalReceiver(typeId, data)`
2. Detects asset/vault transfer typeIds (LSP7TokensRecipient, LSP8TokensRecipient, LSP9VaultRecipient)
3. Registers the asset address in the UP's ERC725Y storage under LSP5 (ReceivedAssets) or LSP10 (ReceivedVaults) data keys
4. Maintains array-based registry: `LSP5ReceivedAssets[]` length + individual entries

This automatic registration is what makes Universal Profiles "aware" of their holdings.

## Key Abstractions

**Abstract Base Pattern:**

- Purpose: Provide implementation templates for both native and proxy-based deployment
- Examples: `LSP7DigitalAsset.sol`, `LSP0ERC725AccountCore.sol`, `LSP6KeyManagerCore.sol`
- Pattern: Core implementation is abstract; concrete class inherits from abstract + Version mixin

**InitAbstract Pattern:**

- Purpose: Enable proxy-compatible initialization
- Examples: `LSP7DigitalAssetInitAbstract.sol`, `LSP0ERC725AccountInitAbstract.sol`
- Pattern: Inherits from both Initializable and Core abstract; `_initialize()` function uses `onlyInitializing` modifier

**Extension Mixin Pattern:**

- Purpose: Compose optional functionality without modifying core token logic
- Examples: `LSP7MintableAbstract.sol`, `LSP7BurnableAbstract.sol`, `LSP7CappedBalanceAbstract.sol`, `LSP7AllowlistAbstract.sol`
- Pattern: Each extension is abstract contract extending LSP7DigitalAsset; features combined through multiple inheritance in concrete class (e.g., `LSP7CustomizableToken`)

**Preset/Customizable Contracts:**

- Purpose: Pre-configured implementations combining common extension sets
- Examples: `LSP7CustomizableToken.sol` (combines Mintable, Burnable, CappedBalance, CappedSupply, NonTransferable, Allowlist)
- Pattern: Concrete class inherits from multiple extension abstracts

**Constants Pattern:**

- Purpose: Centralize magic values and interface IDs
- Examples: `LSP7Constants.sol`, `LSP0Constants.sol` (define `_INTERFACEID_LSP7`, `_TYPEID_LSP7_TOKENOPERATOR`, etc.)
- Pattern: Library or contract with public constant bytes/bytes32 values

**Errors Pattern:**

- Purpose: Custom error definitions for efficient gas usage
- Examples: `LSP7Errors.sol`, `LSP6Errors.sol` (define custom error types)
- Pattern: Interface or contract with error type definitions

## Entry Points

**LSP7DigitalAsset Token Operations:**

- Location: `packages/lsp7-contracts/contracts/LSP7DigitalAsset.sol`
- Triggers: User calls transfer/approve functions
- Responsibilities: Manage token balances, operators, and LSP1 notifications

**LSP0ERC725Account Execute:**

- Location: `packages/lsp0-contracts/contracts/LSP0ERC725AccountCore.sol`
- Triggers: Owner or authorized Key Manager calls execute
- Responsibilities: Route calls to target contracts, handle LSP1 notifications, support ERC725X operations

**LSP6KeyManager Permission Check:**

- Location: `packages/lsp6-contracts/contracts/LSP6KeyManagerCore.sol`
- Triggers: Key Manager is called as intermediate controller
- Responsibilities: Verify caller permissions, verify function call permissions, decode and authorize call data

**LSP1UniversalReceiver Notification:**

- Location: `packages/lsp-smart-contracts/contracts/LSP1UniversalReceiver/` and `packages/lsp1-contracts/contracts/`
- Triggers: Other contracts call universalReceiver with typeId
- Responsibilities: Delegate to registered UniversalReceiverDelegate if available, otherwise store or process notification

**LSP17 Fallback Extension:**

- Location: `packages/lsp17contractextension-contracts/contracts/LSP17Extendable.sol`
- Triggers: Call to undefined function selector
- Responsibilities: Lookup extension contract for function selector. If one is set, call to LSP17 extension contract (via low level `call`)

## Error Handling

**Strategy:** Custom errors with descriptive names, early validation with require/revert

**Patterns:**

- Zero-address checks: `if (address == address(0)) revert InvalidAddress();`
- Balance validation: `if (amount > balance) revert AmountExceedsBalance();`
- Permission checks: Delegated to LSP6 or enforced via `onlyOwner` modifiers
- Operator validation: `if (msg.sender != owner && !isOperator) revert NotAuthorized();`
- Extension validation: `if (extension == address(0)) revert NoExtensionFound();`

## Cross-Cutting Concerns

**Logging:** Event emissions for all state changes

- Transfer events: `Transfer(from, to, amount, data)`
- Approval events: `Approval(owner, operator, allowance)`
- Ownership events: `OwnershipTransferred(oldOwner, newOwner)`

**Validation:** Multi-stage validation

- Pre-execution checks (e.g., balance, permissions)
- LSP1 receiver checks (contract must implement ILSP1 if notifying)
- Post-execution effects (LSP1 notifications may revert entire transaction)

**Authentication:** Multi-tier approach

- Direct owner calls (rare in production - typically Key Manager is owner)
- Delegated calls through LSP6 Key Manager with granular permission verification
- LSP20 call verification for bi-directional authorization (account checks back with Key Manager)
- LSP25 relay execution for gas-sponsored/meta-transactions (signature-based auth)
- LSP14 two-step ownership transfer for secure ownership changes

**Extensibility:**

- LSP17 allows adding new function signatures via extension contracts
- Modular extension abstracts allow mix-and-match feature composition
- Upgradeable pattern via InitAbstract + proxy for post-deployment changes

---

_Architecture analysis: 2026-02-25_
