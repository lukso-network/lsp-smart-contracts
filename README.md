# universalprofile-smart-contracts

The reference implementation for universal profiles smart contracts.

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## Overview

### Installation

#### via NPM

Universal Profile smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/universalprofile-smart-contracts).

```bash
npm install @lukso/universalprofile-smart-contracts --save
```

#### via cloning the repository

Alternatively can also pull the repository and install its dependencies to use the smart contracts.

```bash
$ git clone https://github.com/lukso-network/universalprofile-smart-contracts.git
$ cd ./universalprofile-smart-contracts

# make sure to download the ERC725 submodule
$ git submodule update --init --recursive
$ npm install
$ cd ./submodules/ERC725/implementations && npm install
```

### Usage

#### in Javascript

You can use the contracts by importing them as follow:

```javascript
import UniversalProfile from "@lukso/universalprofile-smart-contracts/build/contracts/UniversalProfile.json";

const UniversalProfileContract = new this.web3.eth.Contract(UniversalProfile.abi, "", defaultOptions);
```

#### in Solidity

```solidity
import UniversalProfile from "@lukso/universalprofile-smart-contracts/build/contracts/UniversalProfile.sol";
```

## Testing

Jest contract tests are defined under the tests directory. To run all the tests, run:

```bash
$ npm test
```
