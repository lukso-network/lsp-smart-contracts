import type { TaskArguments } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import { config as dotenvConfig } from 'dotenv';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { ethers } from 'ethers';

function findEnvFile(): string | null {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    const envPath = resolve(dir, '.env');
    if (existsSync(envPath)) {
      return envPath;
    }
    dir = dirname(dir);
  }
  return null;
}

export default async function (_taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
  // Load .env by searching upward from current directory to find monorepo root
  const envPath = findEnvFile();
  if (envPath) {
    dotenvConfig({ path: envPath });
  }

  const connection = await hre.network.connect();
  const networkName = connection.networkName;

  const privateKey =
    networkName === 'luksoMainnet'
      ? process.env.CONTRACT_DEPLOYER_MAINNET_PK
      : process.env.CONTRACT_DEPLOYER_TESTNET_PK;

  if (!privateKey) {
    throw new Error(`Missing private key for network ${networkName}`);
  }

  const deployer = new ethers.Wallet(privateKey);
  const deployerBalance: string = await connection.provider.request({
    method: 'eth_getBalance',
    params: [deployer.address, 'latest'],
  });

  const deployerBalanceBigInt = BigInt(deployerBalance);

  // The CI deploys all the contracts, so we need to make sure that the deployer has enough balance
  // Each contract to deploy costs around 0.02 - 0.03 LYXe
  const MINIMUM_DEPLOYER_BALANCE = ethers.parseUnits('0.1', 'ether');

  if (deployerBalanceBigInt < MINIMUM_DEPLOYER_BALANCE) {
    throw new Error(
      [
        'Deployer balance too low. Expected: >0.1 LYXe.',
        `Got: ${ethers.formatEther(deployerBalanceBigInt)} LYXe.`,
        `Please fund ${deployer.address}.`,
      ].join(' '),
    );
  }

  console.log(
    `Deployer balance OK: ${ethers.formatEther(deployerBalanceBigInt)} LYXe (${deployer.address})`,
  );
  await connection.close();
}
