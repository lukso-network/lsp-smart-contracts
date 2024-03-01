import { ethers } from 'hardhat';
import { Create2Factory } from './Create2Factory';
import { EntryPoint__factory, EntryPoint } from '@account-abstraction/contracts';

export const AddressZero = ethers.ZeroAddress;

export function callDataCost(data: string): number {
  return ethers
    .getBytes(data)
    .map((x) => (x === 0 ? 4 : 16))
    .reduce((sum, x) => sum + x);
}

export async function deployEntryPoint(provider = ethers.provider): Promise<EntryPoint> {
  const create2factory = new Create2Factory(provider as any);
  const addr = await create2factory.deploy(
    EntryPoint__factory.bytecode,
    0,
    process.env.COVERAGE != null ? BigInt(20e6) : BigInt(8e6),
  );
  return EntryPoint__factory.connect(addr, await provider.getSigner());
}

export async function getBalance(address: string): Promise<number> {
  const balance = await ethers.provider.getBalance(address);
  return parseInt(balance.toString());
}

export async function isDeployed(addr: string): Promise<boolean> {
  const code = await ethers.provider.getCode(addr);
  return code.length > 2;
}
