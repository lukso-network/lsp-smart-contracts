import { ethers } from 'hardhat';

import 'dotenv/config';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { getUserOpHash } from './helpers';

const BUNDLER_RPC = 'http://localhost:4337/';
// const BUNDLER_RPC = 'https://bundler-wp6f6rym5q-ez.a.run.app/rpc';

const UNIVERSAL_PROFILE_ADDRESS = '0xC05EE65D574bb38799Fab4fE7CaB65C050582992';
const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const extension4337 = '0xFbA87339e43d1b1Ad0DcFE889A39489AF753962c';
// const factoryAddress = '0x3717e41333C490B9D38779a4155af7D83960951a';
const factoryAddress = '0x4d259f662F4D7033b4050d349b41613CE9303A6e';
const universalProfileImplementation = '0x5Cd2f69C490Bad0C7Ad1bE3C9899dFff83306755';
const keyManagerSingleton = '0x1336b113fa4e88EF6e934Bd692Bd4Ce18d759407';
// const salt = ethers.utils.randomBytes(32);
const salt = '0x0ab5c7c3031ce60e4b2f0759300b95bbe9f92504fc3520db3ecb7044233623a8';

const PVT_KEY = process.env.PVT_KEY as string;

async function main() {
  const universalProfile = await ethers.getContractAt(
    'UniversalProfile',
    UNIVERSAL_PROFILE_ADDRESS,
  );

  console.log('salt', ethers.utils.hexlify(salt));

  const entryPointContract = await ethers.getContractAt('IEntryPoint', entryPointAddress);

  const [deployer] = await ethers.getSigners();
  console.log('deployer', deployer.address);

  const lsp3Data =
    '0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35';

  const executeBytes = universalProfile.interface.encodeFunctionData('setData', [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    lsp3Data,
  ]);

  const signer = new ethers.Wallet(PVT_KEY);

  const provider = new ethers.providers.JsonRpcProvider(BUNDLER_RPC);

  // const nonce = 0;
  const verificationGasLimit = 700000;
  const preVerificationGas = 150000;
  const callGasLimit = 1_000_000;
  const maxFeePerGas = 1_000_000_000 * 1.1;
  const maxPriorityFeePerGas = 1_000_000_000 * 1.1;
  const chainId = 4201;

  const factory4437 = await ethers.getContractAt('UniversalProfile4337Factory', factoryAddress);
  const addressOfAccount = await factory4437.callStatic.createAccount(
    universalProfileImplementation,
    keyManagerSingleton,
    deployer.address,
    extension4337,
    salt,
  );

  console.log('addressOfAccount', addressOfAccount);

  const calldata = factory4437.interface.encodeFunctionData('createAccount', [
    universalProfileImplementation,
    keyManagerSingleton,
    deployer.address,
    extension4337,
    salt,
  ]);

  const initCode = factoryAddress + calldata.slice(2);

  const deployerKeyAsUint192 = ethers.BigNumber.from(deployer.address).toHexString();

  const nonce = await entryPointContract.getNonce(addressOfAccount, deployerKeyAsUint192);

  const balance = await entryPointContract.balanceOf(addressOfAccount);
  console.log('balance', balance.toString());

  if (balance == 0) {
    const entryPoint = await ethers.getContractAt('IEntryPoint', entryPointAddress);
    const txFund = await entryPoint.depositTo(addressOfAccount, {
      value: ethers.utils.parseEther('0.1'),
      gasPrice: 10,
    });
    await txFund.wait();
    console.log('depositedSuccessfully', txFund.hash);
  }

  const slot = 1;
  const paddedAddress = ethers.utils.hexZeroPad(addressOfAccount, 32);
  const paddedSlot = ethers.utils.hexZeroPad(slot, 32);
  const concatenated = ethers.utils.concat([paddedAddress, paddedSlot]);
  const hash = ethers.utils.keccak256(concatenated);

  console.log('Storage Location:', hash);

  const getUserOpHashHex = getUserOpHash(
    addressOfAccount,
    nonce,
    initCode, // initCode
    executeBytes, // callData for universal profile creation
    callGasLimit,
    verificationGasLimit,
    preVerificationGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    '0x', // paymasterAndData
    entryPointAddress,
    chainId,
  );

  const signature = await signer.signMessage(ethers.utils.arrayify(getUserOpHashHex));

  const userOp: UserOperationStruct = {
    sender: addressOfAccount,
    nonce: ethers.utils.defaultAbiCoder.encode(['uint256'], [nonce]), // uint256 of nonce
    initCode, // initCode
    callData: executeBytes,
    callGasLimit: ethers.utils.defaultAbiCoder.encode(['uint256'], [callGasLimit]),
    verificationGasLimit: ethers.utils.defaultAbiCoder.encode(['uint256'], [verificationGasLimit]),
    preVerificationGas: ethers.utils.defaultAbiCoder.encode(['uint256'], [preVerificationGas]),
    maxFeePerGas: ethers.utils.defaultAbiCoder.encode(['uint256'], [maxFeePerGas]),
    maxPriorityFeePerGas: ethers.utils.defaultAbiCoder.encode(['uint256'], [maxPriorityFeePerGas]),
    paymasterAndData: '0x',
    signature,
  };

  const result = await provider.send('eth_sendUserOperation', [userOp, entryPointAddress]);

  console.log('result', result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
