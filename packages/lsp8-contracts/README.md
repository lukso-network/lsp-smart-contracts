# LSP8 Identifiable Digital Asset &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp8-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp8-contracts)

> The contracts [`LSP8Votes`](contracts/extensions/LSP8Votes/LSP8Votes.sol) and [`LSP8VotesInitAbstract`](contracts/extensions/LSP8Votes/LSP8VotesInitAbstract.sol) have not been formally audited by an external third party and are not recommended to be used in production without undergoing an independent security audit.

npm package for the LSP8 Identifiable Digital Asset standard (NFTs token IDs).

## Installation

```console
npm install @lukso/lsp8-contracts
```

## Available Constants & Types

The `@lukso/lsp8-contracts` npm package contains useful constants such as interface IDs or ERC725Y data keys related to the LSP8 Standard. You can import and access them as follows.

In JavaScript.

```javascript
import {
  INTERFACE_ID_LSP8,
  INTERFACE_ID_LSP8_PREVIOUS,
  LSP8DataKeys,
  LSP8_TYPE_IDS,
  LSP8_TOKEN_ID_FORMAT,
} from "@lukso/lsp8-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP8,
  _INTERFACEID_LSP8_V0_12_0,
  _INTERFACEID_LSP8_V0_14_0,
  _LSP8_TOKENID_FORMAT_KEY,
  _LSP8_TOKEN_METADATA_BASE_URI,
  _LSP8_REFERENCE_CONTRACT,
  _TYPEID_LSP8_TOKENSSENDER,
  _TYPEID_LSP8_TOKENSRECIPIENT,
  _TYPEID_LSP8_TOKENOPERATOR,
  _LSP8_TOKENID_FORMAT_NUMBER,
  _LSP8_TOKENID_FORMAT_STRING,
  _LSP8_TOKENID_FORMAT_ADDRESS,
  _LSP8_TOKENID_FORMAT_UNIQUE_ID,
  _LSP8_TOKENID_FORMAT_HASH,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_NUMBER,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_STRING,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_ADDRESS,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_UNIQUE_ID,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_HASH
} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
```

## TypeScript types

You can also import the [type-safe ABI](https://abitype.dev/) from the `/abi` path.

```ts
import {
    // standard version
    lsp8IdentifiableDigitalAssetAbi,
    lsp8CappedSupplyAbi,
    lsp8MintableAbi,
    lsp8VotesAbi
    // proxy version
    lsp8CappedSupplyInitAbstractAbi,
    lsp8IdentifiableDigitalAssetInitAbstractAbi,
    lsp8MintableInitAbi,
 } from '@lukso/lsp8-contracts/abi';
```

## Foundry deployment

This package includes two Foundry scripts to deploy the `LSP8CustomizableTokenInit` and `LSP8MintableInit` implementation contracts.

- `scripts/DeployLSP8CustomizableTokenInit.s.sol`
- `scripts/DeployLSP8MintableInit.s.sol`

Set your deployer key first:

```console
export PRIVATE_KEY=0x...
```

## Dry run against LUKSO Testnet

<details>
  <summary><code>LSP8CustomizableTokenInit</code></summary>

```console
FOUNDRY_PROFILE=lsp8 forge script packages/lsp8-contracts/scripts/DeployLSP8CustomizableTokenInit.s.sol:DeployLSP8CustomizableTokenInitScript --rpc-url https://rpc.testnet.lukso.network
```

</details>

<details>
  <summary><code>LSP8MintableInit</code></summary>

```console
FOUNDRY_PROFILE=lsp8 forge script packages/lsp8-contracts/scripts/DeployLSP8MintableInit.s.sol:DeployLSP8MintableInitScript --rpc-url https://rpc.testnet.lukso.network
```

</details>

## Broadcast the deployment

> Use one of the methods described in the [foundry docs](https://www.getfoundry.sh/forge/scripting#providing-a-private-key) to broadcast from a specific address

<details>
  <summary><code>LSP8CustomizableTokenInit</code></summary>

```console
FOUNDRY_PROFILE=lsp8 forge script packages/lsp8-contracts/scripts/DeployLSP8CustomizableTokenInit.s.sol:DeployLSP8CustomizableTokenInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast
```

</details>

<details>
  <summary><code>LSP8MintableInit</code></summary>

```console
FOUNDRY_PROFILE=lsp8 forge script packages/lsp8-contracts/scripts/DeployLSP8MintableInit.s.sol:DeployLSP8MintableInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast
```

</details>

Broadcast and verify on the LUKSO Testnet Blockscout explorer:

<details>
  <summary><code>LSP8CustomizableTokenInit</code></summary>

```console
FOUNDRY_PROFILE=lsp8 forge script packages/lsp8-contracts/scripts/DeployLSP8CustomizableTokenInit.s.sol:DeployLSP8CustomizableTokenInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast --verify --verifier blockscout --verifier-url https://explorer.execution.testnet.lukso.network/api/
```

</details>

<details>
  <summary><code>LSP8MintableInit</code></summary>

```console
FOUNDRY_PROFILE=lsp8 forge script packages/lsp8-contracts/scripts/DeployLSP8MintableInit.s.sol:DeployLSP8MintableInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast --verify --verifier blockscout --verifier-url https://explorer.execution.testnet.lukso.network/api/
```

</details>

## Audits

The **LSP8 Customizable Token** presets and their token extensions listed below were reviewed by the AI auditing tool [Nethermind AI Audit Agent](https://www.nethermind.io/) (May 2026). See the [audit report PDF](../../audits/Nethermind_AI_Audit_Agent_2026_05_19.pdf).

**Presets**

- [`LSP8CustomizableToken`](contracts/presets/LSP8CustomizableToken.sol) (constructor-based deployment)
- [`LSP8CustomizableTokenInit`](contracts/presets/LSP8CustomizableTokenInit.sol) (proxy / upgradeable deployment)
- [`LSP8CustomizableTokenConstants`](contracts/presets/LSP8CustomizableTokenConstants.sol)

**Extensions** (standard and `Init` variants)

- [`AccessControlExtended`](contracts/extensions/AccessControlExtended/)
- [`LSP8Burnable`](contracts/extensions/LSP8Burnable/)
- [`LSP8Mintable`](contracts/extensions/LSP8Mintable/)
- [`LSP8CappedSupply`](contracts/extensions/LSP8CappedSupply/)
- [`LSP8CappedBalance`](contracts/extensions/LSP8CappedBalance/)
- [`LSP8NonTransferable`](contracts/extensions/LSP8NonTransferable/)
- [`LSP8Revokable`](contracts/extensions/LSP8Revokable/)
