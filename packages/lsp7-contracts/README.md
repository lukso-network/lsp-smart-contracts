# LSP7 Digital Asset &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp7-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp7-contracts)

> The contracts [`LSP7Votes`](contracts/extensions/LSP7Votes/LSP7Votes.sol) and [`LSP7VotesInitAbstract`](contracts/extensions/LSP7Votes/LSP7VotesInitAbstract.sol) have not been formally audited by an external third party and are not recommended to be used in production without undergoing an independent security audit.

npm package for the LSP7 Digital Asset standard (fungible token).

## Installation

```console
npm install @lukso/lsp7-contracts
```

## Available Constants & Types

The `@lukso/lsp7-contracts` npm package contains useful constants such as interface IDs or ERC725Y data keys related to the LSP7 Standard. You can import and access them as follows.

In JavaScript.

```javascript
import {
  INTERFACE_ID_LSP7,
  INTERFACE_ID_LSP7_PREVIOUS,
  LSP7_TYPE_IDS,
} from "@lukso/lsp7-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP7,
  _INTERFACEID_LSP7_V0_12_0,
  _INTERFACEID_LSP7_V0_14_0,
  _TYPEID_LSP7_DELEGATOR,
  _TYPEID_LSP7_DELEGATEE,
  _TYPEID_LSP7_TOKENSSENDER,
  _TYPEID_LSP7_TOKENSRECIPIENT,
  _TYPEID_LSP7_TOKENOPERATOR
} from "@lukso/lsp7-contracts/contracts/LSP7Constants.sol";
```

The `LSP7_TYPE_IDS` object includes type IDs for the following types of notifications:

```console
'LSP7Tokens_SenderNotification';
'LSP7Tokens_RecipientNotification';
'LSP7Tokens_OperatorNotification';
'LSP7Tokens_VotesDelegatorNotification';
'LSP7Tokens_VotesDelegateeNotification';
```

## TypeScript types

You can also import the [type-safe ABI](https://abitype.dev/) from the `/abi` path.

```ts
import {
    // standard version
    lsp7DigitalAssetAbi,
    lsp7CappedSupplyAbi,
    lsp7MintableAbi,
    lsp7VotesAbi
    // proxy version
    lsp7CappedSupplyInitAbstractAbi,
    lsp7DigitalAssetInitAbstractAbi,
    lsp7MintableInitAbi,
 } from '@lukso/lsp7-contracts/abi';
```

## Foundry deployment

This package includes two Foundry scripts to deploy the `LSP7CustomizableTokenInit` and `LSP7MintableInit` implementation contracts.

- `scripts/DeployLSP7CustomizableTokenInit.s.sol`
- `scripts/DeployLSP7MintableInit.s.sol`

Set your deployer key first:

```console
export PRIVATE_KEY=0x...
```

## Dry run against LUKSO Testnet

<details>
  <summary><code>LSP7CustomizableTokenInit</code></summary>

```console
FOUNDRY_PROFILE=lsp7 forge script packages/lsp7-contracts/scripts/DeployLSP7CustomizableTokenInit.s.sol:DeployLSP7CustomizableTokenInitScript --rpc-url https://rpc.testnet.lukso.network
```

</details>

<details>
  <summary><code>LSP7MintableInit</code></summary>

```console
FOUNDRY_PROFILE=lsp7 forge script packages/lsp7-contracts/scripts/DeployLSP7MintableInit.s.sol:DeployLSP7MintableInitScript --rpc-url https://rpc.testnet.lukso.network
```

</details>

## Broadcast the deployment

> Use one of the methods described in the [foundry docs](https://www.getfoundry.sh/forge/scripting#providing-a-private-key) to broadcast from a specific address

<details>
  <summary><code>LSP7CustomizableTokenInit</code></summary>

```console
FOUNDRY_PROFILE=lsp7 forge script packages/lsp7-contracts/scripts/DeployLSP7CustomizableTokenInit.s.sol:DeployLSP7CustomizableTokenInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast
```

</details>

<details>
  <summary><code>LSP7MintableInit</code></summary>

```console
FOUNDRY_PROFILE=lsp7 forge script packages/lsp7-contracts/scripts/DeployLSP7MintableInit.s.sol:DeployLSP7MintableInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast
```

</details>

Broadcast and verify on the LUKSO Testnet Blockscout explorer:

<details>
  <summary><code>LSP7CustomizableTokenInit</code></summary>

```console
FOUNDRY_PROFILE=lsp7 forge script packages/lsp7-contracts/scripts/DeployLSP7CustomizableTokenInit.s.sol:DeployLSP7CustomizableTokenInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast --verify --verifier blockscout --verifier-url https://explorer.execution.testnet.lukso.network/api/
```

</details>

<details>
  <summary><code>LSP7MintableInit</code></summary>

```console
FOUNDRY_PROFILE=lsp7 forge script packages/lsp7-contracts/scripts/DeployLSP7MintableInit.s.sol:DeployLSP7MintableInitScript --rpc-url https://rpc.testnet.lukso.network --broadcast --verify --verifier blockscout --verifier-url https://explorer.execution.testnet.lukso.network/api/
```

</details>

## Audits

The **LSP7 Customizable Token** presets and their token extensions listed below were reviewed by the AI auditing tool [Nethermind AI Audit Agent](https://www.nethermind.io/) (May 2026). See the [audit report PDF](../../audits/Nethermind_AI_Audit_Agent_2026_05_19.pdf).

**Presets**

- [`LSP7CustomizableToken`](contracts/presets/LSP7CustomizableToken.sol) (constructor-based deployment)
- [`LSP7CustomizableTokenInit`](contracts/presets/LSP7CustomizableTokenInit.sol) (proxy / upgradeable deployment)
- [`LSP7CustomizableTokenConstants`](contracts/presets/LSP7CustomizableTokenConstants.sol)

**Extensions** (standard and `Init` variants)

- [`AccessControlExtended`](contracts/extensions/AccessControlExtended/)
- [`LSP7Burnable`](contracts/extensions/LSP7Burnable/)
- [`LSP7Mintable`](contracts/extensions/LSP7Mintable/)
- [`LSP7CappedSupply`](contracts/extensions/LSP7CappedSupply/)
- [`LSP7CappedBalance`](contracts/extensions/LSP7CappedBalance/)
- [`LSP7NonTransferable`](contracts/extensions/LSP7NonTransferable/)
- [`LSP7Revokable`](contracts/extensions/LSP7Revokable/)
