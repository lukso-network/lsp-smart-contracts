import { defineConfig } from '@wagmi/cli';
import fs from 'fs';

const artifacts = fs.readdirSync('./artifacts', {});

const contractsWagmiInputs = artifacts.map((artifact) => {
  const jsonArtifact = JSON.parse(fs.readFileSync(`./artifacts/${artifact}`, 'utf-8'));
  return {
    name: jsonArtifact.contractName,
    abi: jsonArtifact.abi,
  };
});

export default defineConfig({
  out: './abi.ts',
  contracts: contractsWagmiInputs,
  plugins: [],
});
