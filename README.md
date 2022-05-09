
<p align="center">
  <a href="https://www.npmjs.com/package/@lukso/lsp-smart-contracts">
    <img alt="Version" src="https://badge.fury.io/js/@lukso%2Flsp-smart-contracts.svg" />
  </a>
</p>

# lsp-smart-contracts

The reference implementation for universal profiles smart contracts.

For more information see [Documentation](https://docs.lukso.tech/standards/smart-contracts/introduction) on *[docs.lukso.tech](https://docs.lukso.tech/standards/introduction).*

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## **Overview**

### Installation

#### npm

Universal Profile smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/lsp-smart-contracts).

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
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";

const myContract = new this.web3.eth.Contract(UniversalProfile.abi, "", defaultOptions);
```

#### in Solidity

```sol
import "@lukso/lsp-smart-contracts/contracts/UniversalProfile.sol";

contract MyUP is UniversalProfile {
  constructor(address _newOwner) UniversalProfile(_newOwner) {
    
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
