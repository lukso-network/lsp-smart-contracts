import { getBytes } from 'ethers';
import { HardhatEthers } from '@nomicfoundation/hardhat-ethers/types';

import {
  type MockEntryPoint,
  MockEntryPoint__factory,
} from '../../../types/ethers-contracts/index.js';

import { Create2Factory } from './Create2Factory.js';

export function callDataCost(data: string): number {
  return getBytes(data)
    .map((x) => (x === 0 ? 4 : 16))
    .reduce((sum, x) => sum + x);
}

export async function deployEntryPoint(ethers: HardhatEthers): Promise<MockEntryPoint> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signer = await ethers.provider.getSigner();
  const create2factory = new Create2Factory(ethers.provider, signer);
  const addr = await create2factory.deploy(
    MockEntryPoint__factory.bytecode,
    0,
    process.env.COVERAGE != null ? BigInt(20e6) : BigInt(8e6),
  );
  return MockEntryPoint__factory.connect(addr, signer);
}

export async function getBalance(ethers: HardhatEthers, address: string): Promise<number> {
  const balance = await ethers.provider.getBalance(address);
  return parseInt(balance.toString());
}

export async function isDeployed(ethers: HardhatEthers, addr: string): Promise<boolean> {
  const code = await ethers.provider.getCode(addr);
  return code.length > 2;
}
