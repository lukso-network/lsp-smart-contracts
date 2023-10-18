import { ethers } from 'hardhat';

export function combinePermissions(..._permissions: string[]) {
  let result: bigint = BigInt(0);

  _permissions.forEach((permission) => {
    const permissionAsBN = BigInt(permission);
    result += permissionAsBN;
  });

  return ethers.zeroPadValue('0x' + result.toString(16), 32);
}

export function getUserOpHash(
  sender: string,
  nonce: number,
  initCode: string,
  callData: string,
  callGasLimit: number,
  verificationGasLimit: number,
  preVerificationGas: number,
  maxFeePerGas: number,
  maxPriorityFeePerGas: number,
  paymasterAndData: string,
  entryPoint: string,
  chainId: number,
) {
  const packed = ethers.utils.defaultAbiCoder.encode(
    [
      'address',
      'uint256',
      'bytes32',
      'bytes32',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'bytes32',
    ],
    [
      sender,
      nonce,
      ethers.utils.keccak256(initCode),
      ethers.utils.keccak256(callData),
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      ethers.utils.keccak256(paymasterAndData),
      // 0,
    ],
  );

  const enc = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256'],
    [ethers.utils.keccak256(packed), entryPoint, chainId],
  );

  return ethers.utils.keccak256(enc);
}
