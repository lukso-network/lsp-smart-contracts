<p align="center">
  <a href="https://www.npmjs.com/package/@lukso/universalprofile-smart-contracts">
    <img alt="Version" src="https://badge.fury.io/js/@lukso%2Funiversalprofile-smart-contracts.svg" />
  </a>
</p>

# lsp-universalprofile-smart-contracts

The reference implementation for universal profiles smart contracts.

For more information see [Documentation](https://docs.lukso.tech/standards/Universal-Profiles)

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## **Overview**

### Installation

#### npm

Universal Profile smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/universalprofile-smart-contracts).

```bash
npm install @lukso/universalprofile-smart-contracts --save
```

#### cloning the repository

Alternatively you can also clone the repository and install its dependencies to start using the smart contracts.

```bash
$ git clone https://github.com/lukso-network/lsp-universalprofile-smart-contracts.git
$ cd ./lsp-universalprofile-smart-contracts

# make sure to download the ERC725 submodule
$ git submodule update --init --recursive
$ npm install
$ cd ./submodules/ERC725/implementations && npm install
```

## Usage

#### in Javascript

You can use the contracts JSON ABI by importing them as follow:

```javascript
import UniversalProfile from "@lukso/universalprofile-smart-contracts/build/artifacts/UniversalProfile.json";

const UniversalProfileContract = new this.web3.eth.Contract(UniversalProfile.abi, "", defaultOptions);
```

#### in Solidity

```solidity
import UniversalProfile from "@lukso/universalprofile-smart-contracts/contracts/LSP3-UniversalProfile.sol";
```

## **Contribute**
_Please check the [CONTRIBUTE](./CONTRIBUTING.md) page_ 
