import { ethers } from 'hardhat';

async function main() {
  const UniversalProfileFactory = await ethers.getContractFactory('UniversalProfileInit');
  const universalProfile = await UniversalProfileFactory.deploy();
  console.log(universalProfile);
  await universalProfile.deployed();

  console.log('universalProfile deployed to:', universalProfile.address);

  // 0xBe3E134983E1e2545E607637604f195BEd3b5815
}

main();
