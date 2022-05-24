
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

You can access interface IDs and other constants, using the `constants.js` file from the [lsp-smart-contracts package](https://www.npmjs.com/package/@lukso/lsp-smart-contracts).
You can find all accessible constants in the [`constants.js` file](https://github.com/lukso-network/lsp-smart-contracts/blob/main/constants.js).


```js
const {
    INTERFACE_IDS,
    ERC1271,
    OPERATIONS,
    SupportedStandards,
    ERC725YKeys,
    BasicUPSetup_Schema,
    PERMISSIONS,
    ALL_PERMISSIONS,
    EventSignatures,
} = require("@lukso/lsp-smart-contracts/constants.js");
```