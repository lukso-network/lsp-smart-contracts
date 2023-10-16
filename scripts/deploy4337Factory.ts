import { ethers } from 'hardhat';

async function main() {
  const gasPrice = await ethers.provider.getGasPrice();
  const gasLimit = 30_000_000;
  const FactoryFactory = await ethers.getContractFactory('UniversalProfile4337Factory');
  const factory = await FactoryFactory.deploy({ gasPrice, gasLimit });
  console.log(factory);
  await factory.deployed();

  console.log('UniversalProfile4337Factory deployed to:', factory.address);

  // 0xBe3E134983E1e2545E607637604f195BEd3b5815
}

main();
