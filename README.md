
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

Each [LSP] define a set of constants values, such as [ERC165 interface IDs](https://docs.lukso.tech/standards/smart-contracts/interface-ids/) (for Interface Standards) or ERC725Y data keys (for Metadata Standards). These values are part of the npm package and can be imported as shown below.


```js
const { 
    INTERFACE_IDS,
    SupportedStandards,
    ERC725YKeys,
    PERMISSIONS
} = require("@lukos/lsp-smart-contracts/constants.js");

// get the ERC165 Interface ID for a LSP Interface Standard
const LSP8_INTERFACE_ID = INTERFACE_IDS.LSP8;

// get the key or value for a LSP Metadata Standard
const SUPPORTED_STANDARD_LSP3_DATA_KEY = SupportedStandards.LSP3UniversalProfile.key;
const SUPPORTED_STANDARD_LSP3_DATA_VALUE = SupportedStandards.LSP3UniversalProfile.value;

// access an ERC725Y data key defined in a LSP
const LSP1_DELEGATE_DATA_KEY = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate;

// get the permission value of a LSP6 - Key Manager permission
const LSP6_PERMISSION_CALL = PERMISSIONS.CALL;
```


Below is a list of available constants defined in `constants.js`

| Name | Description |
|:-----|:------------|
| `INTERFACE_IDS`  | A list of [ERC165 interface IDs](https://docs.lukso.tech/standards/smart-contracts/interface-ids/) as `bytes4` values. Useful to [detect LSP Interface Standards]. <br/> Includes LSP interface IDs (from LSP0 to LSP9), ClaimOwnership interface ID and legacy ERC Token Standards. |
| `SupportedStandards`  | A list of data key-value pairs as `bytes32` values. Useful to [detect LSP Metadata Standards]. <br/> Available values are `SupportedStandards:{StandardName}` values are: [`LSP3UniversalProfile`](https://docs.lukso.tech/standards/universal-profile/lsp3-universal-profile-metadata#supportedstandardslsp3universalprofile), [`LSP4DigitalAsset`](https://docs.lukso.tech/standards/nft-2.0/LSP4-Digital-Asset-Metadata#supportedstandardslsp4digitalasset) and `LSP9Vault` |
| `ERC725YKeys`  | A list of ERC725Y data keys defined in the specification of an LSP. Current data keys available are from [LSP0], [LSP3], [LSP4], [LSP5], [LSP6] and [LSP10] |
| `BasicUPSetup_Schema`  | 3 x ERC725Y data keys that are useful to create a basic Universal Profile: `LSP3Profile`, `LSP1UniversalReceiverDelegate`, `LSP3IssuedAssets[]`  |
| `PERMISSIONS`  | A list of `bytes32` hex values that represent the [permissions defined in LSP6](https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager#permissions).  |
| `ALL_PERMISSIONS_SET`  | A `bytes32` hex value that include all the permissions defined in LSP6, **excluding DELEGATECALL** |
| `EventSignatures`  | A list of `bytes32` hex value of Event Signatures defined in each LSPs.  |

[LSP]: <https://github.com/lukso-network/LIPs/tree/main/LSPs>
[LSP0]: <https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md#erc725y-data-keys>
[LSP3]: <https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725y-data-keys>
[LSP4]: <https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#erc725y-data-keys>
[LSP5]: <https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-5-ReceivedAssets.md#erc725y-data-keys>
[LSP6]: <https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md#erc725y-data-keys>
[LSP10]: <https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-10-ReceivedVaults.md#lsp10vaults>
[detect LSP Interface Standards]: <https://docs.lukso.tech/standards/standard-detection#interface-detection>
[detect LSP Metadata Standards]: <https://docs.lukso.tech/standards/standard-detection#metadata-detection>