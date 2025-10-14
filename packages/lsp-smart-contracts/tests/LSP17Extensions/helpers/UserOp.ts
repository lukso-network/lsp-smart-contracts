import {
  getBytes,
  dataSlice,
  keccak256,
  BytesLike,
  toBigInt,
  toBeHex,
  hexlify,
  toNumber,
} from 'ethers';
import { Wallet } from 'ethers';
import { AddressZero, callDataCost } from './utils';
import { ecsign, toRpcSig, keccak256 as keccak256_buffer } from 'ethereumjs-util';
import { Create2Factory } from './Create2Factory';
import { EntryPoint } from '@account-abstraction/contracts';
import { AbiCoder } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import * as typ from './solidityTypes';
import { ethers as hreEther } from 'hardhat';

export interface UserOperation {
  sender: typ.address;
  nonce: typ.uint256;
  initCode: typ.bytes;
  callData: typ.bytes;
  callGasLimit: typ.uint256;
  verificationGasLimit: typ.uint256;
  preVerificationGas: typ.uint256;
  maxFeePerGas: typ.uint256;
  maxPriorityFeePerGas: typ.uint256;
  paymasterAndData: typ.bytes;
  signature: typ.bytes;
}

export function packUserOp(op: UserOperation, forSignature = true): string {
  if (forSignature) {
    // Encoding the UserOperation object fields into a single string for signature
    return AbiCoder.defaultAbiCoder().encode(
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
        op.sender,
        op.nonce,
        keccak256(op.initCode as BytesLike),
        keccak256(op.callData as BytesLike),
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        keccak256(op.paymasterAndData as BytesLike),
      ],
    );
  } else {
    // Encoding the UserOperation object fields into a single string including the signature
    return AbiCoder.defaultAbiCoder().encode(
      [
        'address',
        'uint256',
        'bytes',
        'bytes',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes',
        'bytes',
      ],
      [
        op.sender,
        op.nonce,
        op.initCode,
        op.callData,
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymasterAndData,
        op.signature,
      ],
    );
  }
}

export function getUserOpHash(op: UserOperation, entryPoint: string, chainId: number): string {
  const userOpHash = keccak256(packUserOp(op, true));
  // Encoding the UserOperation hash, entryPoint address, and chainId for final hash computation
  const enc = AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'address', 'uint256'],
    [userOpHash, entryPoint, chainId],
  );
  return keccak256(enc);
}

export const DefaultsForUserOp: UserOperation = {
  sender: AddressZero,
  nonce: 0,
  initCode: '0x',
  callData: '0x',
  callGasLimit: 0,
  verificationGasLimit: 250000,
  preVerificationGas: 21000,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  paymasterAndData: '0x',
  signature: '0x',
};

export function signUserOp(
  op: UserOperation,
  signer: Wallet,
  entryPoint: string,
  chainId: number,
): UserOperation {
  const message = getUserOpHash(op, entryPoint, chainId);
  const msg1 = Buffer.concat([
    Buffer.from('\x19Ethereum Signed Message:\n32', 'ascii'),
    Buffer.from(getBytes(message)),
  ]);

  const sig = ecsign(keccak256_buffer(msg1), Buffer.from(getBytes(signer.privateKey)));
  // that's equivalent of:  await signer.signMessage(message);
  // (but without "async"
  const signedMessage1 = toRpcSig(sig.v, sig.r, sig.s);
  return {
    ...op,
    signature: signedMessage1,
  };
}

export function fillUserOpDefaults(
  op: Partial<UserOperation>,
  defaults = DefaultsForUserOp,
): UserOperation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partial: any = { ...op };

  for (const key in partial) {
    if (partial[key] == null) {
      delete partial[key];
    }
  }
  const filled = { ...defaults, ...partial };
  return filled;
}

// helper to fill structure:
// - default callGasLimit to estimate call from entryPoint to account
// if there is initCode:
//  - calculate sender by eth_call the deployment code
//  - default verificationGasLimit estimateGas of deployment code plus default 100000
// no initCode:
//  - update nonce from account.getNonce()
// entryPoint param is only required to fill in "sender address when specifying "initCode"
// nonce: assume contract as "getNonce()" function, and fill in.
// sender - only in case of construction: fill sender from initCode.
// callGasLimit: VERY crude estimation (by estimating call to account, and add rough entryPoint overhead
// verificationGasLimit: hard-code default at 100k. should add "create2" cost
export async function fillUserOp(
  op: Partial<UserOperation>,
  signer: SignerWithAddress,
  entryPoint?: EntryPoint,
): Promise<UserOperation> {
  const op1 = { ...op };
  const provider = hreEther.provider;
  if (op.initCode != null) {
    const initAddr = dataSlice(op1.initCode as BytesLike, 0, 20);
    const initCallData = dataSlice(op1.initCode as BytesLike, 20);
    if (op1.nonce == null) op1.nonce = 0;
    if (op1.sender == null) {
      if (initAddr.toLowerCase() === Create2Factory.contractAddress.toLowerCase()) {
        const ctr = dataSlice(initCallData, 32);
        const salt = dataSlice(initCallData, 0, 32);
        op1.sender = Create2Factory.getDeployedAddress(ctr, salt);
      } else {
        if (provider == null) throw new Error('no entrypoint/provider');
        op1.sender = await entryPoint.callStatic
          .getSenderAddress(op1.initCode as BytesLike)
          .catch((e) => e.errorArgs.sender);
      }
    }
    if (op1.verificationGasLimit == null) {
      if (provider == null) throw new Error('no entrypoint/provider');
      const initEstimate = await provider.estimateGas({
        from: entryPoint?.target,
        to: initAddr,
        data: initCallData,
        gasLimit: 10e6,
      });
      op1.verificationGasLimit = toBigInt(DefaultsForUserOp.verificationGasLimit) + initEstimate;
    }
  }
  if (op1.nonce == null) {
    if (provider == null) throw new Error('must have entryPoint to autofill nonce');

    const signerKeyAsUint192 = toBeHex(toBigInt(signer.address));

    try {
      op1.nonce = await entryPoint.getNonce(op1.sender, signerKeyAsUint192);
    } catch {
      op1.nonce = 0;
    }
  }
  if (op1.callGasLimit == null && op.callData != null) {
    if (provider == null) throw new Error('must have entryPoint for callGasLimit estimate');
    const gasEtimated = await provider.estimateGas({
      from: entryPoint?.target,
      to: op1.sender,
      data: hexlify(op1.callData as BytesLike),
    });

    op1.callGasLimit = gasEtimated;
  }
  if (op1.maxFeePerGas == null) {
    if (provider == null) throw new Error('must have entryPoint to autofill maxFeePerGas');
    const block = await provider.getBlock('latest');
    op1.maxFeePerGas =
      block.baseFeePerGas +
      BigInt(op1.maxPriorityFeePerGas ?? DefaultsForUserOp.maxPriorityFeePerGas);
  }

  if (op1.maxPriorityFeePerGas == null) {
    op1.maxPriorityFeePerGas = DefaultsForUserOp.maxPriorityFeePerGas;
  }
  const op2 = fillUserOpDefaults(op1);

  if (op2.preVerificationGas.toString() === '0') {
    op2.preVerificationGas = callDataCost(packUserOp(op2, false));
  }
  return op2;
}

export async function fillAndSign(
  op: Partial<UserOperation>,
  signer: SignerWithAddress,
  entryPoint?: EntryPoint,
): Promise<UserOperation> {
  const provider = hreEther.provider;
  const op2 = await fillUserOp(op, signer, entryPoint);

  const chainId = await provider.getNetwork().then((net) => net.chainId);
  const message = getBytes(getUserOpHash(op2, entryPoint.target as string, toNumber(chainId)));

  return {
    ...op2,
    signature: await signer.signMessage(message),
  };
}
