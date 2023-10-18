import { ethers } from 'hardhat';

const factoryAddress = '0x4d259f662F4D7033b4050d349b41613CE9303A6e';
const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

async function main() {
  const gasPrice = await ethers.provider.getGasPrice();
  const factory4337 = await ethers.getContractAt('UniversalProfile4337Factory', factoryAddress);
  const stake = await factory4337.addStake(entryPointAddress, 1, {
    gasPrice,
    value: ethers.utils.parseEther('1'),
  });

  await stake.wait();

  console.log('stake hash:', stake.hash);
}

main();
