# LSP Smart Contracts &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp-smart-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp-smart-contracts) [![Coverage Status](https://coveralls.io/repos/github/lukso-network/lsp-smart-contracts/badge.svg?branch=develop)](https://coveralls.io/github/lukso-network/lsp-smart-contracts?branch=develop) [![All Contributors](https://img.shields.io/badge/all_contributors-17-orange.svg?style=flat-square)](#contributors-)

The smart contracts reference implementation of the [LUKSO Standard Proposals (LSPs)](https://github.com/lukso-network/LIPs/tree/main/LSPs).

For more information see [Documentation](https://docs.lukso.tech/contracts/introduction) on _[docs.lukso.tech](https://docs.lukso.tech/standards/introduction)._

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## Packages

This repo contains packages for the Solidity implementation of the LSP smart contracts.

| Package                                                                                  | NPM                                                                                                                                                                          | Description                      |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [`@lukso/lsp0-contracts`](./packages/lsp0-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp0-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp0-contracts)                                     | LSP0 ERC725Account               |
| [`@lukso/lsp1-contracts`](./packages/lsp1-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp1-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp1-contracts)                                     | LSP1 Universal Receiver          |
| [`@lukso/lsp1delegate-contracts`](./packages/lsp1delegate-contracts)                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp1delegate-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp1delegate-contracts)                     | LSP1 Universal Receiver Delegate |
| [`@lukso/lsp2-contracts`](./packages/lsp2-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp2-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp2-contracts)                                     | LSP2 ERC725Y JSON Schema         |
| [`@lukso/lsp3-contracts`](./packages/lsp3-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp3-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp3-contracts)                                     | LSP3 Profile Metadata            |
| [`@lukso/lsp4-contracts`](./packages/lsp4-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp4-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp4-contracts)                                     | LSP4 Digital Asset Metadata      |
| [`@lukso/lsp5-contracts`](./packages/lsp5-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp5-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp5-contracts)                                     | LSP5 Received Assets             |
| [`@lukso/lsp6-contracts`](./packages/lsp6-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp6-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp6-contracts)                                     | LSP6 Key Manager                 |
| [`@lukso/lsp7-contracts`](./packages/lsp7-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp7-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp7-contracts)                                     | LSP7 Digital Asset               |
| [`@lukso/lsp8-contracts`](./packages/lsp8-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp8-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp8-contracts)                                     | LSP8 Identifiable Digital Asset  |
| [`@lukso/lsp9-contracts`](./packages/lsp9-contracts)                                     | [![npm version](https://img.shields.io/npm/v/@lukso/lsp9-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp9-contracts)                                     | LSP9 Vault                       |
| [`@lukso/lsp10-contracts`](./packages/lsp10-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp10-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp10-contracts)                                   | LSP10 Received Vaults            |
| [`@lukso/lsp11-contracts`](./packages/lsp11-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp11-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp11-contracts)                                   | LSP11 Social Recovery            |
| [`@lukso/lsp12-contracts`](./packages/lsp12-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp12-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp12-contracts)                                   | LSP12 Issued Assets              |
| [`@lukso/lsp14-contracts`](./packages/lsp14-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp14-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp14-contracts)                                   | LSP14 Ownable 2 Step             |
| [`@lukso/lsp16-contracts`](./packages/lsp16-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp16-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp16-contracts)                                   | LSP16 Universal Factory          |
| [`@lukso/lsp17-contracts`](./packages/lsp17-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp17-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp17-contracts)                                   | LSP17 Extensions Package         |
| [`@lukso/lsp17contractextension-contracts`](./packages/lsp17contractextension-contracts) | [![npm version](https://img.shields.io/npm/v/@lukso/lsp17contractextension-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp17contractextension-contracts) | LSP17 Contract Extension Package |
| [`@lukso/lsp20-contracts`](./packages/lsp20-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp20-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp20-contracts)                                   | LSP20 Call Verification          |
| [`@lukso/lsp23-contracts`](./packages/lsp23-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp23-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp23-contracts)                                   | LSP23 Linked Contracts Factory   |
| [`@lukso/lsp25-contracts`](./packages/lsp25-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp25-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp25-contracts)                                   | LSP25 Execute Relay Call         |
| [`@lukso/lsp26-contracts`](./packages/lsp26-contracts)                                   | [![npm version](https://img.shields.io/npm/v/@lukso/lsp26-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp26-contracts)                                   | LSP26 Follower System            |
| [`@lukso/universalprofile-contracts`](./packages/universalprofile-contracts)             | [![npm version](https://img.shields.io/npm/v/@lukso/universalprofile-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/universalprofile-contracts)             | Universal Profile                |

## Installation

### npm

All the LSP smart contracts are available as **npm packages**. You can either install all the LSP smart contracts by installing [`@lukso/lsp-smart-contracts`](https://www.npmjs.com/package/@lukso/lsp-smart-contracts)
or install the specific LSP that you might want from the list above. For instance, `@lukso/lsp7-contracts` to install only the LSP7 token contracts.

```bash
# Install all the LSPs
npm install @lukso/lsp-smart-contracts

# Install only the LSP7 tokens
npm install @lukso/lsp7-contracts
```

### cloning the repository

Alternatively you can also clone the repository and install its dependencies to start using the smart contracts.

```bash
$ git clone https://github.com/lukso-network/lsp-smart-contracts.git
$ cd ./lsp-smart-contracts
$ npm install
```

## Usage

See the `README.md` file of each individual package to learn more.

## Testing

For detailed instructions on how to run tests, please refer to our [Testing Guide](./tests/README.md).

### Deployment via hardhat

You can find more infos on how to deploy the contracts via hardhat in the [DEPLOYMENT](./packages/lsp-smart-contracts/DEPLOYMENT.md) page.

---

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
- MiloTruck, 2023-11-31, Final Result: [MiloTruck_audit_2023_11_31.pdf](./audits/MiloTruck_audit_2023_11_31.pdf)
- MiloTruck, 2024-01-24, Final Result: [MiloTruck_audit_2024_01_24.pdf](./audits/MiloTruck_audit_2024_01_24.pdf)

## Contribute

The implementation contracts of the [LSPs](https://github.com/lukso-network/LIPs) exist thanks to their contributors. There are many ways you can participate and help build high quality software. Check out the [contribution guidelines](./CONTRIBUTING.md)!

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
