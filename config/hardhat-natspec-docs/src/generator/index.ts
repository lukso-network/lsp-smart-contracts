export { generateContractMarkdown, generateIndexMarkdown } from './markdown.js';

import * as fs from 'fs/promises';
import * as path from 'path';
import type { ContractNatSpec } from '../extractor/types.js';
import { generateContractMarkdown, generateIndexMarkdown } from './markdown.js';

/**
 * Write all documentation to output directory
 */
export async function writeDocumentation(
  contracts: ContractNatSpec[],
  outputDir: string,
): Promise<void> {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate and write index
  const indexContent = generateIndexMarkdown(contracts);
  await fs.writeFile(path.join(outputDir, 'README.md'), indexContent, 'utf-8');
  
  // Generate and write each contract
  for (const contract of contracts) {
    const content = generateContractMarkdown(contract);
    const fileName = `${contract.contractName}.md`;
    await fs.writeFile(path.join(outputDir, fileName), content, 'utf-8');
  }
  
  console.log(`[hardhat-natspec-docs] Generated documentation for ${contracts.length} contracts in ${outputDir}`);
}
