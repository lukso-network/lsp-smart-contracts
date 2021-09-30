import { ethers } from "hardhat";
import { Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  ERC725Utils,
  ERC725Utils__factory,
  KeyManager__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../../build/types";
import { LSP3AccountLibraryAddresses } from "../../build/types/factories/LSP3Account__factory";

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

export async function deployUniversalProfile(erc725Utils: ERC725Utils, owner: SignerWithAddress) {
  return await new UniversalProfile__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    owner
  ).deploy(owner.address);
}

export async function deployKeyManager(
  erc725Utils: ERC725Utils,
  owner: SignerWithAddress,
  universalProfile: UniversalProfile
) {
  return await new KeyManager__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    owner
  ).deploy(universalProfile.address);
}
export async function deployUniversalReceiver() {}
