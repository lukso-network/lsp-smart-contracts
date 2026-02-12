import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import { extractNatSpec } from '../extractor/index.js';
import { writeDocumentation } from '../generator/index.js';

interface DocsTaskArgs {
  output?: string;
}

const docsAction: NewTaskActionFunction<DocsTaskArgs> = async (args, hre) => {
  const config = hre.config.natspecDocs;
  const outputDir = args.output ?? config.outputDir;
  
  console.log('[hardhat-natspec-docs] Extracting NatSpec documentation...');
  
  // Get artifacts path from Hardhat runtime
  const artifactsPath = hre.config.paths.artifacts;
  
  // Extract NatSpec from build artifacts
  const contracts = await extractNatSpec(
    hre.artifacts,
    artifactsPath,
    {
      include: config.include,
      exclude: config.exclude,
    },
  );
  
  if (contracts.length === 0) {
    console.log('[hardhat-natspec-docs] No contracts found matching filters');
    return;
  }
  
  console.log(`[hardhat-natspec-docs] Found ${contracts.length} contracts`);
  
  // Generate and write documentation
  await writeDocumentation(contracts, outputDir);
  
  console.log(`[hardhat-natspec-docs] Documentation generated in ${outputDir}/`);
};

export default docsAction;
