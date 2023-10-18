import { ethers } from 'hardhat';
import { ERC725YDataKeys, ALL_PERMISSIONS } from '../constants';

const UP_ADDRESS = '0x1375Ca41d29BA02f264bB9dcF66a6cbB8B9734B4';
const KM_ADDRESS = '0x4e74B605bDABa2651FdD49d6751303a67e33B7C7';
const randomAddress = ethers.Wallet.createRandom().address;

async function main() {
  const [deployer] = await ethers.getSigners();
  const universalProfile = await ethers.getContractAt('UniversalProfile', UP_ADDRESS);
  const keyManager = await ethers.getContractAt('LSP6KeyManagerSingleton', KM_ADDRESS);

  const updatePermissionsBytes = universalProfile.interface.encodeFunctionData('setData', [
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + randomAddress.slice(2),
    '0x',
  ]);

  const tx = await keyManager.execute(universalProfile.address, updatePermissionsBytes);

  await tx.wait();
}

main();
