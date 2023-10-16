import { ethers } from 'hardhat';

async function main() {
  const gasPrice = await ethers.provider.getGasPrice();
  const KeyManagerFactory = await ethers.getContractFactory('LSP6KeyManagerSingleton');
  const factory = await KeyManagerFactory.deploy({});
  await factory.deployed();

  console.log('UniversalProfile4337Factory deployed to:', factory.address);

  // 0x37Fe474AB76eAFeaf77F7c214aC8c98FdDAac2D8
}

main();
