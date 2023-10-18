import { ethers } from 'hardhat';
import { ERC725YDataKeys, ALL_PERMISSIONS } from '../constants';

const UP_ADDRESS = '0xAfdD83ccdED29F3696383Ce6D2420DA27d4aac13';
const KM_ADDRESS = '0x4e74B605bDABa2651FdD49d6751303a67e33B7C7';

async function main() {
  const gasPrice = await ethers.provider.getGasPrice();
  const oneGwei = BigInt(1e9);
  const gasPriceIncrease = gasPrice.add(oneGwei);

  const [deployer] = await ethers.getSigners();
  console.log('Deployer: ', deployer.address);

  const universalProfile = await ethers.getContractAt('UniversalProfile', UP_ADDRESS);
  const keyManager = await ethers.getContractAt('LSP6KeyManagerSingleton', KM_ADDRESS);

  const pendingOwner = await universalProfile.pendingOwner();
  console.log('Pending owner: ', pendingOwner);
  // return;

  // transfer ownership of UP to KM
  if (pendingOwner !== KM_ADDRESS) {
    const tx = await universalProfile.transferOwnership(KM_ADDRESS, {
      gasPrice: gasPriceIncrease,
    });

    await tx.wait();

    console.log('Ownership transferred to: ', KM_ADDRESS);
  }

  // give permissions to KM
  const permissionTx = await universalProfile.setData(
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + deployer.address.slice(2),
    ALL_PERMISSIONS,
    { gasPrice: gasPriceIncrease },
  );

  await permissionTx.wait();
  console.log('Permissions given to: ', KM_ADDRESS);

  // accept ownership of UP

  const acceptOwnershipBytes = universalProfile.interface.encodeFunctionData('acceptOwnership');

  const tx2 = await keyManager.execute(universalProfile.address, acceptOwnershipBytes, {
    gasPrice: gasPriceIncrease,
  });

  await tx2.wait();

  console.log('Ownership accepted by: ', KM_ADDRESS);

  // remove permissions from KM
  const removePermissionTx = await universalProfile.setData(
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + KM_ADDRESS.slice(2),
    '0x',
    { gasPrice: gasPriceIncrease },
  );
  await removePermissionTx.wait();
  console.log('Permissions removed from: ', KM_ADDRESS);

  // 0x1B60E7796bdB5153B329C526902Dd104f763101B
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
