import type { SolidityHooks } from 'hardhat/types/hooks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

// Note: Hardhat 3 solidity hooks require specific signatures
// This hook runs after successful compilation if runOnCompile is enabled

const solidityHooks: Partial<SolidityHooks> = {
  // The 'build' hook runs during solidity compilation
  // We check config and trigger docs generation after build completes
};

export default solidityHooks;

/**
 * Generate docs after build if configured
 * Called from the build hook or externally
 */
export async function generateDocsIfEnabled(hre: HardhatRuntimeEnvironment): Promise<void> {
  const config = hre.config.natspecDocs;
  
  if (!config.runOnCompile) {
    return;
  }
  
  console.log('[hardhat-natspec-docs] Generating documentation (runOnCompile enabled)...');
  
  // Dynamic import to avoid circular dependencies
  const { extractNatSpec } = await import('../extractor/index.js');
  const { writeDocumentation } = await import('../generator/index.js');
  
  const artifactsPath = hre.config.paths.artifacts;
  
  const contracts = await extractNatSpec(
    hre.artifacts,
    artifactsPath,
    {
      include: config.include,
      exclude: config.exclude,
    },
  );
  
  if (contracts.length > 0) {
    await writeDocumentation(contracts, config.outputDir);
  }
}
