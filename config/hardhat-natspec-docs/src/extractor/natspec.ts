import * as fs from 'fs/promises';
import * as path from 'path';
import type { ContractNatSpec, DevDoc, UserDoc, AbiItem } from './types.js';

// Type for the artifacts object from Hardhat Runtime Environment
type Artifacts = {
  getAllFullyQualifiedNames(): Promise<ReadonlySet<string>>;
  readArtifact(name: string): Promise<{
    buildInfoId?: string;
    inputSourceName?: string;
  }>;
};

interface ExtractOptions {
  include: string[];
  exclude: string[];
}

/**
 * Extract NatSpec documentation for all matching contracts
 */
export async function extractNatSpec(
  artifacts: Artifacts,
  artifactsPath: string,
  options: ExtractOptions,
): Promise<ContractNatSpec[]> {
  const results: ContractNatSpec[] = [];

  // Get all fully qualified contract names
  const contractNames = await artifacts.getAllFullyQualifiedNames();

  for (const fqName of contractNames) {
    // fqName format: "sourcePath:contractName"
    const [sourcePath, contractName] = fqName.split(':');

    // Check include/exclude filters
    if (!matchesFilters(sourcePath, options.include, options.exclude)) {
      continue;
    }

    try {
      const natspec = await extractContractNatSpec(
        artifacts,
        artifactsPath,
        sourcePath,
        contractName,
      );
      if (natspec) {
        results.push(natspec);
      }
    } catch (error) {
      console.warn(
        `[hardhat-natspec-docs] Warning: Could not extract NatSpec for ${fqName}:`,
        error,
      );
    }
  }

  return results;
}

/**
 * Extract NatSpec for a single contract
 */
async function extractContractNatSpec(
  artifacts: Artifacts,
  artifactsPath: string,
  sourcePath: string,
  contractName: string,
): Promise<ContractNatSpec | null> {
  // Read the artifact to get buildInfoId
  const artifact = await artifacts.readArtifact(`${sourcePath}:${contractName}`);

  if (!artifact.buildInfoId) {
    console.warn(`[hardhat-natspec-docs] No buildInfoId for ${contractName}`);
    return null;
  }

  // Read the build-info output file
  const buildInfoOutputPath = path.join(
    artifactsPath,
    'build-info',
    `${artifact.buildInfoId}.output.json`,
  );

  let buildInfoOutput: any;
  try {
    const content = await fs.readFile(buildInfoOutputPath, 'utf-8');
    buildInfoOutput = JSON.parse(content);
  } catch (error) {
    console.warn(`[hardhat-natspec-docs] Could not read build-info for ${contractName}:`, error);
    return null;
  }

  // Navigate to the contract output
  const contractOutput = buildInfoOutput?.output?.contracts?.[sourcePath]?.[contractName];

  if (!contractOutput) {
    console.warn(`[hardhat-natspec-docs] No output found for ${sourcePath}:${contractName}`);
    return null;
  }

  // Extract devdoc, userdoc, and abi
  const devdoc: DevDoc = contractOutput.devdoc ?? { kind: 'dev', version: 1, methods: {} };
  const userdoc: UserDoc = contractOutput.userdoc ?? { kind: 'user', version: 1, methods: {} };
  const abi: AbiItem[] = contractOutput.abi ?? [];

  return {
    contractName,
    sourcePath,
    devdoc,
    userdoc,
    abi,
  };
}

/**
 * Check if a source path matches include/exclude filters
 */
function matchesFilters(sourcePath: string, include: string[], exclude: string[]): boolean {
  // If include is empty or contains '**/*', include all
  const shouldInclude =
    include.length === 0 || include.some((pattern) => matchGlob(sourcePath, pattern));

  if (!shouldInclude) {
    return false;
  }

  // Check exclude patterns
  const shouldExclude = exclude.some((pattern) => matchGlob(sourcePath, pattern));

  return !shouldExclude;
}

/**
 * Simple glob matching (supports * and **)
 */
function matchGlob(str: string, pattern: string): boolean {
  // Convert glob to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '<<<GLOBSTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<GLOBSTAR>>>/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(str);
}
