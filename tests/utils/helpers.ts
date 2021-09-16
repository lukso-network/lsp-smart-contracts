import { ethers } from "hardhat";
import { Contract, ContractTransaction } from "ethers";

export async function getDeploymentCost(contractOrTransaction: Contract | ContractTransaction) {
  let gasUsed: number;
  let receipt: any;

  if ("deployTransaction" in contractOrTransaction) {
    receipt = await contractOrTransaction.deployTransaction.wait();
  } else {
    receipt = await contractOrTransaction.wait();
  }
  gasUsed = receipt.gasUsed.toNumber();

  return {
    receipt,
    gasUsed,
  };
}

export function getRandomAddresses(count) {
  let base = "0xa56039d89BD9451A1ac94a680a20302da2dE92";

  let addresses = [];
  for (let ii = 10; ii < count + 10; ii++) {
    let randomAddress = "0x" + parseInt(base + ii).toString(16);
    addresses.push(randomAddress);
  }

  return addresses;
}

export function generateKeysAndValues(_elementObject) {
  let keys = [];
  let values = [];
  for (const [_key, _value] of Object.entries(_elementObject)) {
    let key = ethers.utils.toUtf8Bytes(_key);
    let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(_value));

    keys.push(ethers.utils.keccak256(key));
    values.push(value);
  }

  return [keys, values];
}
