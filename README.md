
<p align="center">
  <a href="https://www.npmjs.com/package/@lukso/lsp-smart-contracts">
    <img alt="Version" src="https://badge.fury.io/js/@lukso%2Flsp-smart-contracts.svg" />
  </a>
</p>

# LSP Smart Contracts

The smart contracts reference implementation of the [LUKSO Standard Proposals (LSPs)](https://github.com/lukso-network/LIPs/tree/main/LSPs).

For more information see [Documentation](https://docs.lukso.tech/standards/smart-contracts/introduction) on *[docs.lukso.tech](https://docs.lukso.tech/standards/introduction).*

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## **Overview**

### Installation

#### npm

LSP smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/lsp-smart-contracts).

```bash
npm install @lukso/lsp-smart-contracts
```

#### cloning the repository

Alternatively you can also clone the repository and install its dependencies to start using the smart contracts.

```bash
$ git clone https://github.com/lukso-network/lsp-smart-contracts.git
$ cd ./lsp-smart-contracts
$ npm install
```

## Usage

#### in Javascript

You can use the contracts JSON ABI by importing them as follow:

```javascript
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";

const myContract = new this.web3.eth.Contract(LSP0ERC725Account.abi, "", defaultOptions);
```

#### in Solidity

```sol
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract MyAccount is LSP0ERC725Account {
  constructor(address _newOwner) LSP0ERC725Account(_newOwner) {
    
  }
}
```


### Testing

Jest contract tests are defined under the tests directory. To run all the tests, run:

```bash
$ npm test
```


### Deployment via hardhat

You can find more infos on how to deploy the contracts via hardhat in the [DEPLOYMENT](./DEPLOYMENT.md) page.

### Available Constants

> See [*docs.lukso.tech > Standard Detection*](https://docs.lukso.tech/standards/standard-detection) for the difference between Interface Standard and Metadata Standard. 

Every [LUKSO Standards Proposals](https://github.com/lukso-network/LIPs) define a set of constants values, such as [ERC165 interface IDs](https://docs.lukso.tech/standards/smart-contracts/interface-ids/) (for Interface Standards) or ERC725Y data keys (for Metadata Standards). These values are part of the npm package and can be imported as shown below.

```js
const { ERC725YKeys } = require("@lukos/lsp-smart-contracts/constants.js");

const LSP1_DELEGATE_DATA_KEY = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate;
```

```ts
import { ERC725YKeys } from "./package/constants.js";

const LSP1_DELEGATE_DATA_KEY = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate;
```

Below is a list of available constants defined in `constants.js`

| Name | Description |
|:-----|:------------|
| `INTERFACE_IDS`  | A list of ERC165 interface IDs as `bytes4` values. Useful to detect LSP Interface Standards. <br/> Includes LSP interface IDs (from LSP0 to LSP9), ClaimOwnership interface ID + legacy ERC Token Standards. |
| `SupportedStandards`  | A list of data key-value pairs as `bytes32` values. Useful to dtect LSP Metadata Standards. <br/> Available constants are: `LSP3UniversalProfile`, `LSP4DigitalAsset` and `LSP9Vault` |
| `ERC725YKeys`  | A list of ERC725Y data keys defined in the specification of an LSP. Current data keys available are from LSP0, LSP3, LSP4, LSP5, LSP6 and LSP10 |
| `BasicUPSetup_Schema`  | 3 x ERC725Y data keys that are useful to create a basic Universal Profile: `LSP3Profile`, `LSP1UniversalReceiverDelegate`, `LSP3IssuedAssets[]`  |
| `ALL_PERMISSIONS_SET`  | A `bytes32` hex value that include all the permissions defined in LSP6, **excluding DELEGATECALL** |
| `PERMISSIONS`  | A list of `bytes32` hex values that represent the permissions defined in LSP6.  |
| `EventSignatures`  | A list of `bytes32` hex value of Event Signatures defined in each LSPs.  |






