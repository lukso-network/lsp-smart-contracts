import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { TaskArguments } from 'hardhat/types/tasks';
import fs from 'fs-extra';
import path from 'path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function removeEmptyDirectories(dirPath: string): void {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  if (files.length > 0) {
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirectories(fullPath);
      }
    });
    if (fs.readdirSync(dirPath).length === 0) {
      fs.rmdirSync(dirPath);
    }
  } else {
    fs.rmdirSync(dirPath);
  }
}

function shouldKeepArtifact(filePath: string, contractSet: Set<string>): boolean {
  if (filePath.includes('build-info')) return false;

  if (filePath.endsWith('.json')) {
    const basename = path.basename(filePath).replace('.json', '');
    return contractSet.has(basename);
  }

  if (filePath.endsWith('.d.ts')) {
    const basename = path.basename(filePath.replace('.sol/artifacts.d.ts', ''));
    return contractSet.has(basename);
  }

  return false;
}

export default async function (_taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
  const { packager, paths } = hre.config;

  console.log('\n🚀 Starting package preparation...\n');

  if (packager.contracts.length === 0) {
    console.log('⚠️  Warning: No contracts specified in packager.contracts configuration.');
    console.log('   Add contracts to your hardhat.config.ts:');
    console.log("   packager: { contracts: ['MyContract', 'AnotherContract'] }\n");
    return;
  }

  console.log(`📋 Contracts to package: ${packager.contracts.join(', ')}`);
  console.log(`📦 Include typechain-like types: ${packager.includeTypes}\n`);
  if (packager.includeTypes)
    console.log(`📦 Include typechain-like factories: ${packager.includeFactories}\n`);

  // Compile contracts
  await hre.tasks.getTask('compile').run();

  // Prepare artifacts
  const artifactsPath = paths.artifacts;
  if (!fs.existsSync(artifactsPath)) {
    throw new Error(`Artifacts directory not found at ${artifactsPath}`);
  }

  console.log(`📦 Filtering and moving artifacts for ${packager.contracts.length} contract(s)...`);

  const contractsPath = path.join(artifactsPath, 'contracts');
  if (fs.existsSync(contractsPath)) {
    const allArtifacts = getAllFiles(contractsPath);
    const contractSet = new Set(packager.contracts);
    let movedCount = 0;

    // Find and move artifacts for specified contracts to root of artifacts directory
    for (const artifactPath of allArtifacts) {
      if (!artifactPath.endsWith('.json') && !artifactPath.endsWith('.d.ts')) continue;

      if (shouldKeepArtifact(artifactPath, contractSet)) {
        let destFileName: string;

        if (artifactPath.endsWith('.json')) {
          // JSON file: keep the name as is (e.g., ArtifactName.json)
          destFileName = path.basename(artifactPath);
        } else if (artifactPath.endsWith('artifacts.d.ts')) {
          // .d.ts file: rename from artifacts.d.ts to ArtifactName.d.ts
          // Extract contract name from path: .../ContractName.sol/artifacts.d.ts
          const solDir = path.dirname(artifactPath);
          const solFileName = path.basename(solDir);
          const contractName = solFileName.replace('.sol', '');
          destFileName = `${contractName}.d.ts`;
        } else {
          continue;
        }

        const destPath = path.join(artifactsPath, destFileName);
        fs.moveSync(artifactPath, destPath, { overwrite: true });
        movedCount++;
      }
    }

    fs.removeSync(contractsPath);
    fs.removeSync(path.join(artifactsPath, 'build-info'));
    fs.removeSync(path.join(artifactsPath, 'artifacts.d.ts'));

    console.log(
      `✅ Artifacts prepared (moved ${movedCount} files to root, removed contracts directory)`,
    );
  }

  // Prepare typechain-like bindings (in Hardhat v3, these are in the types/ethers-contracts/ folder)

  const typesDir = path.join(
    hre.config.paths.root,
    'typechain' in hre.config &&
      typeof hre.config.typechain === 'object' &&
      hre.config.typechain !== null &&
      'outDir' in hre.config.typechain &&
      typeof hre.config.typechain.outDir === 'string'
      ? hre.config.typechain.outDir
      : 'types/ethers-contracts',
  );
  if (packager.includeTypes && fs.existsSync(typesDir)) {
    console.log('📦 Filtering typechain-like bindings...');

    const contractSet = new Set(packager.contracts);
    const allFiles = fs.readdirSync(typesDir);
    let removedCount = 0;

    for (const file of allFiles) {
      const filePath = path.join(typesDir, file);

      if (file === 'common.ts') continue;

      if (file === 'factories' && fs.statSync(filePath).isDirectory()) {
        if (!packager.includeFactories) {
          fs.removeSync(filePath);
          removedCount++;
        } else {
          const factoryFiles = getAllFiles(filePath);
          for (const factoryFile of factoryFiles) {
            if (factoryFile.endsWith('.ts')) {
              const contractName = path.basename(factoryFile).replace('__factory.ts', '');
              if (!contractSet.has(contractName)) {
                fs.removeSync(factoryFile);
                removedCount++;
              }
            }
          }
          removeEmptyDirectories(filePath);
        }
        continue;
      }

      if (file.endsWith('.ts')) {
        const contractName = path.basename(file, '.ts');
        if (!contractSet.has(contractName)) {
          fs.removeSync(filePath);
          removedCount++;
        }
      }
    }

    console.log(`✅ Typechain-like bindings prepared (removed ${removedCount} binding files)`);
  } else {
    console.log('ℹ️  Typechain not configured. Skipping bindings cleanup.');
  }

  console.log('\n✨ Package preparation complete!\n');
}
