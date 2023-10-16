import { ethers } from 'hardhat';

import 'dotenv/config';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { getUserOpHash } from './helpers';

const BUNDLER_RPC = 'http://localhost:4337';
const INFINITISM_RPC = 'https://bundler-wp6f6rym5q-ez.a.run.app/rpc';

const UNIVERSAL_PROFILE_ADDRESS = 'cool ';
// 0x81B880eA7A931d6a8b0Fe2B0Ca4090AF85172eed
const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const PVT_KEY = process.env.PVT_KEY as string;

async function main() {
  const universalProfile = await ethers.getContractAt(
    'UniversalProfile',
    UNIVERSAL_PROFILE_ADDRESS,
  );

  const entryPointContract = await ethers.getContractAt('IEntryPoint', entryPointAddress);

  const [deployer] = await ethers.getSigners();

  const deployerKeyAsUint192 = ethers.BigNumber.from(deployer.address).toHexString();

  const nonce = await entryPointContract.getNonce(UNIVERSAL_PROFILE_ADDRESS, deployerKeyAsUint192);

  console.log('nonce', nonce);

  const balance = await entryPointContract.balanceOf('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  console.log('balance', balance.toString());

  const lsp3Data =
    '0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35';

  const executeBytes = universalProfile.interface.encodeFunctionData('setData', [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    lsp3Data,
  ]);

  const signer = new ethers.Wallet(PVT_KEY);

  const provider = new ethers.providers.JsonRpcProvider(INFINITISM_RPC);

  // const nonce = 0;
  const verificationGasLimit = 700000;
  const preVerificationGas = 150000;
  const callGasLimit = 1_000_000;
  const maxFeePerGas = 1_000_000_000;
  const maxPriorityFeePerGas = 1_000_000_000;
  const chainId = 4201;

  const getUserOpHashHex = getUserOpHash(
    UNIVERSAL_PROFILE_ADDRESS,
    nonce,
    '0x', // initCode
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
    sender: UNIVERSAL_PROFILE_ADDRESS,
    nonce: ethers.utils.defaultAbiCoder.encode(['uint256'], [nonce]), // uint256 of nonce
    initCode: '0x', // initCode
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
