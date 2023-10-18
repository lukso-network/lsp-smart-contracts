import fs from 'fs';
import { Align, getMarkdownTable, Row } from 'markdown-table-ts';
import hre from 'hardhat';

import { INTERFACE_IDS } from '../constants';

const ercInterfaceDescriptions = {
  ERC165: 'Standard Interface Detection.',
  ERC1271: 'Standard Signature Validation Method for Contracts.',
  ERC725X: 'General executor.',
  ERC725Y: 'General Data key-value store.',
};

const excludedInterfaces = [
  'ERC20',
  'ERC20Metadata',
  'ERC223',
  'ERC721',
  'ERC721Metadata',
  'ERC777',
  'ERC1155',
];

async function main() {
  const interfaces = Object.entries(INTERFACE_IDS);

  const table: Row[] = [];

  // exclude ERC token interfaces
  const filteredInterfaces = interfaces.filter(
    ([contract]) => !excludedInterfaces.includes(contract),
  );

  for (const [contract, interfaceId] of filteredInterfaces) {
    let description = '';

    if (contract.startsWith('ERC')) {
      description = ercInterfaceDescriptions[contract];
    } else {
      const lspInterface = `I${contract}`;

      // adjust the source path for LSP1Delegate, LSP20 and LSP17 contracts
      const folders = {
        LSP1UniversalReceiverDelegate: 'LSP1UniversalReceiver',
        LSP20CallVerifier: 'LSP20CallVerification',
        LSP17Extendable: 'LSP17ContractExtension',
        LSP17Extension: 'LSP17ContractExtension',
      };

      let folder;

      if (
        contract === 'LSP1UniversalReceiverDelegate' ||
        contract.startsWith('LSP17') ||
        contract === 'LSP20CallVerifier'
      ) {
        folder = folders[contract];
      } else {
        folder = contract;
      }

      const source = `contracts/${folder}/${lspInterface}.sol:${lspInterface}`;
      const build = await hre.artifacts.getBuildInfo(source);

      const [path] = source.split(':');

      const devdoc = build?.output?.contracts?.[path]?.[lspInterface]['devdoc'];

      if (!devdoc) {
        // search in the first implementation contract
        const source = `contracts/${folder}/${contract}.sol:${contract}`;
        const build = await hre.artifacts.getBuildInfo(source);

        const [path] = source.split(':');

        const contractDevDoc = build?.output?.contracts?.[path]?.[contract]['devdoc'];

        if (contractDevDoc == undefined) {
          throw new Error(`No devdoc for ${contract}`);
        }

        if (contractDevDoc.hasOwnProperty('title')) {
          description = contractDevDoc.title;
        }
      } else {
        if (devdoc.hasOwnProperty('title')) {
          description = devdoc.title;
        }
      }
    }

    table.push([`**${contract}**`, `\`${interfaceId}\``, description]);
  }

  const result = getMarkdownTable({
    table: {
      head: ['Contract', 'Interface ID', 'Description'],
      body: table,
    },
    alignment: [Align.Left, Align.Center, Align.Left],
  });

  fs.writeFileSync('docs/_interface_ids_table.mdx', result);
}
main();
