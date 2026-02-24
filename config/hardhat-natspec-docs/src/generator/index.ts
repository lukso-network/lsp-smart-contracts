export { generateContractMarkdown, generateIndexMarkdown } from './markdown.js';

import * as fs from 'fs/promises';
import * as path from 'path';
import type { ContractNatSpec } from '../extractor/types.js';
import { generateContractMarkdown, generateIndexMarkdown } from './markdown.js';

/**
 * Write all documentation to output directory, splitting into
 * contracts/ and libraries/ subdirectories.
 *
 * @param libraries - Contract names that belong under libraries/
 */
export async function writeDocumentation(
  contracts: ContractNatSpec[],
  outputDir: string,
  libraries: string[],
): Promise<void> {
  // Clean and recreate output directory to remove stale files
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const librarySet = new Set(libraries);
  const contractsDir = path.join(outputDir, 'contracts');
  const librariesDir = path.join(outputDir, 'libraries');

  await fs.mkdir(contractsDir, { recursive: true });

  let libCount = 0;

  // Generate and write each contract into the right subdirectory
  for (const contract of contracts) {
    const content = generateContractMarkdown(contract);
    const fileName = `${contract.contractName}.md`;

    if (librarySet.has(contract.contractName)) {
      await fs.mkdir(librariesDir, { recursive: true });
      await fs.writeFile(path.join(librariesDir, fileName), content, 'utf-8');
      libCount++;
    } else {
      await fs.writeFile(path.join(contractsDir, fileName), content, 'utf-8');
    }
  }

  console.log(
    `[hardhat-natspec-docs] Generated documentation for ${contracts.length - libCount} contracts and ${libCount} libraries in ${outputDir}`,
  );
}
