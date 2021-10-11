import { ethers } from "hardhat";
import { Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  ERC725Utils,
  KeyManager__factory,
  LSP3Account,
  LSP3Account__factory,
} from "../../build/types";

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

export async function deployLSP3Account(erc725Utils: ERC725Utils, owner: SignerWithAddress) {
  return await new LSP3Account__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    owner
  ).deploy(owner.address);
}

export async function deployKeyManager(
  erc725Utils: ERC725Utils,
  owner: SignerWithAddress,
  lsp3Account: LSP3Account
) {
  return await new KeyManager__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    owner
  ).deploy(lsp3Account.address);
}
export async function deployUniversalReceiver() {}
