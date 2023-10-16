import { ethers } from 'hardhat';

const factoryAddress = '0xBe3E134983E1e2545E607637604f195BEd3b5815';
const implementationContract = '0x0000000000e6300463CDbbF7ECF223a63397C489';
// salt with random 32 bytes
const salt = ethers.utils.randomBytes(32);

async function main() {
  const [mainController] = await ethers.getSigners();

  const universalProfileFactory = await ethers.getContractAt(
    'UniversalProfile4337Factory',
    factoryAddress,
  );

  const address = await universalProfileFactory.getAddress(
    implementationContract,
    mainController.address,
    salt,
  );

  console.log('address', address);
  console.log('salt', ethers.utils.hexlify(salt));
}

main();
