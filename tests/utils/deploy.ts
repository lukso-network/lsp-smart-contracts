import { ethers } from "hardhat";
import { Contract, ContractTransaction } from "ethers";

export async function getDeploymentCost(
  contractOrTransaction: Contract | ContractTransaction
) {
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
