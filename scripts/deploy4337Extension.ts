import { ethers } from 'hardhat';

const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

async function main() {
  const gasPrice = await ethers.provider.getGasPrice();
  const extensionFactory = await ethers.getContractFactory('Extension4337');
  const extension = await extensionFactory.deploy(entryPointAddress, { gasPrice });

  await extension.deployed();

  console.log('extension deployed to:', extension.address);

  // 0xFbA87339e43d1b1Ad0DcFE889A39489AF753962c
}

main();
