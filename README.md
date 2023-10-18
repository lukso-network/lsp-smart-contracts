# LSP Smart Contracts &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp-smart-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp-smart-contracts) [![Coverage Status](https://coveralls.io/repos/github/lukso-network/lsp-smart-contracts/badge.svg?branch=develop)](https://coveralls.io/github/lukso-network/lsp-smart-contracts?branch=develop) [![All Contributors](https://img.shields.io/badge/all_contributors-17-orange.svg?style=flat-square)](#contributors-)

The smart contracts reference implementation of the [LUKSO Standard Proposals (LSPs)](https://github.com/lukso-network/LIPs/tree/main/LSPs).

For more information see [Documentation](https://docs.lukso.tech/standards/smart-contracts/introduction) on _[docs.lukso.tech](https://docs.lukso.tech/standards/introduction)._

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## Installation

### npm

LSP smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/lsp-smart-contracts).

```bash
npm install @lukso/lsp-smart-contracts
```

### cloning the repository

Alternatively you can also clone the repository and install its dependencies to start using the smart contracts.

```bash
$ git clone https://github.com/lukso-network/lsp-smart-contracts.git
$ cd ./lsp-smart-contracts
$ npm install
```

## Usage

### in Javascript

You can use the contracts JSON ABI by importing them as follow:

```javascript
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";

const myContract = new web3.eth.Contract(
  LSP0ERC725Account.abi,
  "",
  defaultOptions
);
```

### in Solidity

```sol
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract MyAccount is LSP0ERC725Account {
  constructor(address _newOwner) LSP0ERC725Account(_newOwner) {}
}
```

### Deployment via hardhat

You can find more infos on how to deploy the contracts via hardhat in the [DEPLOYMENT](./DEPLOYMENT.md) page.

## Available Constants & Types

The [`@lukso/lsp-smart-contracts` npm package](https://www.npmjs.com/package/@lukso/lsp-smart-contracts) contains useful constants such as Interface IDs or ERC725Y Data Keys related to the LSP Standards. You can import and access them as follow:

```ts
import {
  INTERFACE_IDS,
  ERC1271,
  OPERATIONS,
  SupportedStandards,
  ERC725YDataKeys,
  PERMISSIONS,
  ALL_PERMISSIONS,
  LSP8_TOKEN_ID_TYPES,
  LSP25_VERSION,
  ErrorSelectors,
  EventSigHashes,
  FunctionSelectors,
  ContractsDocs,
  StateVariables,
} from "@lukso/lsp-smart-contracts";
```

> **Note:** we also export it as `@lukso/lsp-smart-contracts/constants` or `@lukso/lsp-smart-contracts/constants.js` to keep it backward compatible.

It also includes constant values [Array data keys](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#Array) to retrieve both the array length and for index access.

```js
'LSP5ReceivedAssets[]': {
    length: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
    index: '0x6460ee3c0aac563ccbf76d6e1d07bada',
},
```

### Note for Hardhat Typescript projects

If you are trying to import the constants in a Hardhat project that uses Typescript, you will need to import the constants from the `dist` folder directly, as shown in the code snippet:

```js
import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts/dist/constants.cjs.js";

// This will raise an error if you have ES Lint enabled,
// but will allow you to import the constants in a Hardhat + Typescript based project.
const LSP0InterfaceId = INTERFACE_IDS.LSP0ERC725Account;
```

See the [issue related to Hardhat Typescript + ES Modules](https://hardhat.org/hardhat-runner/docs/advanced/using-esm#esm-and-typescript-projects) in the Hardhat docs for more infos.

### Typescript types

The following additional typescript types are also available, including types for the JSON format of the LSP3 Profile and LSP4 Digital Asset metadata.

```ts
import {
  LSP2ArrayKey,
  LSPSupportedStandard,
  LSP6PermissionName,
  LSP3ProfileMetadataJSON,
  LSP3ProfileMetadata,
  LSP4DigitalAssetMetadataJSON,
  LSP4DigitalAssetMetadata,
  ImageMetadata,
  LinkMetadata,
  AssetMetadata,
} from "@lukso/lsp-smart-contracts/constants";
```

## Audits

> **NB:** dates of the audit reports use the american date format YYYY-MM-DD.

The following audits and formal verification were conducted. All high-level issues were addressed, or were not deemed as critical.

- Chainsulting Audit, 2022-07-06, Final Result: [Chainsulting_audit_06_07_2022.pdf](./audits/Chainsulting_audit_2022_07_06.pdf)
- Quantstamp Audit, 2022-09-07, Final Result: [Quantstamp_audit_07_09_2022.pdf](./audits/Quantstamp_audit_2022_09_07.pdf)
- Watchpug Audit, 2022-10-20, Final Result: [Watchpug_audit_20_10_2022.pdf](./audits/Watchpug_audit_2022_10_20.pdf)
- Watchpug Audit, 2022-12-15, Final Result: [Watchpug_audit_15_12_2022.pdf](./audits/Watchpug_audit_2022_12_15.pdf)
- Runtime Verification - Formal Verification, 2023-02-20, Final Result: [RuntimeVerification_formalVerification_2023_02_20.pdf](./audits/RuntimeVerification_formalVerification_2023_02_20.pdf)
- Trust Audit, 2023-04-13, Final Result: [Trust_audit_2023_04_13.pdf](./audits/Trust_audit_2023_04_13.pdf)
- Watchpug Audit, 2023-04-21, Final Result: [Watchpug_audit_2023_04_21.pdf](./audits/Watchpug_audit_2023_04_21.pdf)
- Code4Rena Audit Contest, 2023-06-30 to 2023-07-14, Final Result: [See Code4Rena audit report on Code4rena.com website](https://code4rena.com/reports/2023-06-lukso)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CJ42"><img src="https://avatars.githubusercontent.com/u/31145285?v=4?s=50" width="50px;" alt="Jean Cvllr"/><br /><sub><b>Jean Cvllr</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=CJ42" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/YamenMerhi"><img src="https://avatars.githubusercontent.com/u/86341666?v=4?s=50" width="50px;" alt="Yamen Merhi"/><br /><sub><b>Yamen Merhi</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=YamenMerhi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://lukso.network/"><img src="https://avatars.githubusercontent.com/u/232662?v=4?s=50" width="50px;" alt="Fabian Vogelsteller"/><br /><sub><b>Fabian Vogelsteller</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=frozeman" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/b00ste"><img src="https://avatars.githubusercontent.com/u/62855857?v=4?s=50" width="50px;" alt="b00ste.lyx"/><br /><sub><b>b00ste.lyx</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=b00ste" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.mattgstevens.com/"><img src="https://avatars.githubusercontent.com/u/2363636?v=4?s=50" width="50px;" alt="Matthew Stevens"/><br /><sub><b>Matthew Stevens</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=mattgstevens" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://rryter.ch/"><img src="https://avatars.githubusercontent.com/u/798709?v=4?s=50" width="50px;" alt="Reto Ryter"/><br /><sub><b>Reto Ryter</b></sub></a><br /><a href="#tool-rryter" title="Tools">🔧</a> <a href="#infra-rryter" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CallumGrindle"><img src="https://avatars.githubusercontent.com/u/54543428?v=4?s=50" width="50px;" alt="Callum Grindle"/><br /><sub><b>Callum Grindle</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/pulls?q=is%3Apr+reviewed-by%3ACallumGrindle" title="Reviewed Pull Requests">👀</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/skimaharvey"><img src="https://avatars.githubusercontent.com/u/64636974?v=4?s=50" width="50px;" alt="Skima Harvey"/><br /><sub><b>Skima Harvey</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=skimaharvey" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://stackoverflow.com/users/7210237/jenea-vranceanu"><img src="https://avatars.githubusercontent.com/u/36865532?v=4?s=50" width="50px;" alt="Jenea Vranceanu"/><br /><sub><b>Jenea Vranceanu</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=JeneaVranceanu" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.hugomasclet.com/"><img src="https://avatars.githubusercontent.com/u/477945?v=4?s=50" width="50px;" alt="Hugo Masclet"/><br /><sub><b>Hugo Masclet</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/pulls?q=is%3Apr+reviewed-by%3AHugoo" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=Hugoo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Leondroids"><img src="https://avatars.githubusercontent.com/u/11769769?v=4?s=50" width="50px;" alt="Leondroid"/><br /><sub><b>Leondroid</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/pulls?q=is%3Apr+reviewed-by%3ALeondroids" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lucasmt"><img src="https://avatars.githubusercontent.com/u/36549752?v=4?s=50" width="50px;" alt="lucasmt"/><br /><sub><b>lucasmt</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/issues?q=author%3Alucasmt" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/qian-hu"><img src="https://avatars.githubusercontent.com/u/88806138?v=4?s=50" width="50px;" alt="qian-hu"/><br /><sub><b>qian-hu</b></sub></a><br /><a href="#security-qian-hu" title="Security">🛡️</a> <a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/issues?q=author%3Aqian-hu" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/magalimorin18"><img src="https://avatars.githubusercontent.com/u/51906903?v=4?s=50" width="50px;" alt="Magali Morin"/><br /><sub><b>Magali Morin</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=magalimorin18" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Hugo0"><img src="https://avatars.githubusercontent.com/u/12943235?v=4?s=50" width="50px;" alt="Hugo Montenegro"/><br /><sub><b>Hugo Montenegro</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=Hugo0" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://lykhonis.com/"><img src="https://avatars.githubusercontent.com/u/881338?v=4?s=50" width="50px;" alt="Volodymyr Lykhonis"/><br /><sub><b>Volodymyr Lykhonis</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=lykhonis" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://onahprosperity.github.io/"><img src="https://avatars.githubusercontent.com/u/40717516?v=4?s=50" width="50px;" alt="Prosperity"/><br /><sub><b>Prosperity</b></sub></a><br /><a href="https://github.com/Fabian Vogelsteller/lsp-smart-contracts/commits?author=OnahProsperity" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://michael.standen.link/"><img src="https://avatars.githubusercontent.com/u/1460552?v=4?s=50" width="50px;" alt="Michael Standen"/><br /><sub><b>Michael Standen</b></sub></a><br /><a href="https://github.com/lukso-network/lsp-smart-contracts/commits?author=ScreamingHawk" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
