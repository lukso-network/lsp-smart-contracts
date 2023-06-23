import { ethers, config } from 'hardhat';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, './.env') });

const wallet = new ethers.Wallet(process.env.CONTRACT_VERIFICATION_TESTNET_PK);
const deployerAddress = wallet.address;

const provider = new ethers.providers.JsonRpcProvider(config.networks.luksoTestnet['url']);

// the CI deploys all the contracts, so we need to make sure that the deployer has enough balance
const MINIMUM_DEPLOYER_BALANCE = ethers.utils.parseUnits('1.0', 'ether');

async function main() {
  const deployerBalance = await provider.getBalance(deployerAddress);

  if (deployerBalance.lt(MINIMUM_DEPLOYER_BALANCE)) {
    throw new Error(
      `❌ Deployer balance is too low. Please fund the deployer address ${deployerAddress} on LUKSO Testnet with at least ${MINIMUM_DEPLOYER_BALANCE} LYXe`,
    );
  } else {
    console.log(
      `✅ Deployer balance sufficient to deploy + verify contracts on LUKSO Testnet. 
      Deployer address: ${deployerAddress}
      Balance: ${ethers.utils.formatEther(deployerBalance)} LYXe`,
    );
  }
}
main();
