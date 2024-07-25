import { task } from 'hardhat/config';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, './.env') });

task(
  'verify-balance',
  'Verify the balance of the EOA deployer address on a provided network',
).setAction(async (taskArgs, hre) => {
  const { ethers } = hre;

  let wallet;

  if (hre.network.name === 'luksoMainnet') {
    wallet = new ethers.Wallet(process.env.CONTRACT_VERIFICATION_MAINNET_PK);
  } else {
    wallet = new ethers.Wallet(process.env.CONTRACT_VERIFICATION_TESTNET_PK);
  }

  // the CI deploys all the contracts, so we need to make sure that the deployer has enough balance
  // each contract to deploy costs around 0.02 - 0.03 LYXe
  const MINIMUM_DEPLOYER_BALANCE = ethers.parseUnits('0.1', 'ether');

  const deployerAddress = wallet.address;

  // Grab network testnet vs mainnet from hardhat config at runtime
  // via `npx hardhat verify-balance --network <luksoTestnet or luksoMainnet>`
  const deployerBalance = await hre.ethers.provider.getBalance(deployerAddress);

  if (deployerBalance < MINIMUM_DEPLOYER_BALANCE) {
    throw new Error(
      `❌ Deployer balance is too low: ${ethers.formatEther(
        deployerBalance,
      )} LYXe left. Please fund the deployer address ${deployerAddress} on LUKSO Testnet.`,
    );
  } else {
    console.log(
      `✅ Deployer balance sufficient to deploy + verify contracts on LUKSO Testnet.
      Deployer address: ${deployerAddress}
      Balance: ${ethers.formatEther(deployerBalance)} LYXe`,
    );
  }
});
