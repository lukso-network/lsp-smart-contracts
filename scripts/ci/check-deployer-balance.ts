// import { ethers, config } from 'hardhat';
import { task } from 'hardhat/config';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, './.env') });

task(
  'verify-balance',
  'Verify the balance of the EOA deployer address on a provided network',
).setAction(async (taskArgs, hre) => {
  const { ethers } = hre;

  // the CI deploys all the contracts, so we need to make sure that the deployer has enough balance
  // each contract to deploy costs around 0.02 - 0.03 LYXe
  const MINIMUM_DEPLOYER_BALANCE = ethers.utils.parseUnits('0.1', 'ether');

  const wallet = new ethers.Wallet(process.env.CONTRACT_VERIFICATION_TESTNET_PK);
  const deployerAddress = wallet.address;

  // Grab network testnet vs mainnet from hardhat config at runtime
  // via `npx hardhat verify-balance --network <luksoTestnet or luksoMainnet>`
  const deployerBalance = await hre.ethers.provider.getBalance(deployerAddress);

  if (deployerBalance.lt(MINIMUM_DEPLOYER_BALANCE)) {
    throw new Error(
      `❌ Deployer balance is too low: ${ethers.utils.formatEther(
        deployerBalance,
      )} LYXe left. Please fund the deployer address ${deployerAddress} on LUKSO Testnet.`,
    );
  } else {
    console.log(
      `✅ Deployer balance sufficient to deploy + verify contracts on LUKSO Testnet.
      Deployer address: ${deployerAddress}
      Balance: ${ethers.utils.formatEther(deployerBalance)} LYXe`,
    );
  }
});
