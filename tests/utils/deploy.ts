import { ethers } from "hardhat";
import { Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  ERC725Account,
  ERC725Utils,
  KeyManager,
  KeyManagerHelper,
  UniversalProfile,
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

export async function deployERC725Utils(): Promise<ERC725Utils> {
  const erc725UtilsFactory = await ethers.getContractFactory("ERC725Utils");
  return await erc725UtilsFactory.deploy();
}

export async function deployERC725Account(
  erc725UtilsAddress: string,
  owner: SignerWithAddress
): Promise<ERC725Account> {
  const erc725AccountFactory = await ethers.getContractFactory("ERC725Account", {
    libraries: {
      ERC725Utils: erc725UtilsAddress,
    },
  });
  return await erc725AccountFactory.deploy(owner.address);
}

export async function deployUniversalProfile(
  erc725UtilsAddress: string,
  owner: SignerWithAddress
): Promise<UniversalProfile> {
  const universalProfileFactory = await ethers.getContractFactory("UniversalProfile", {
    libraries: {
      ERC725Utils: erc725UtilsAddress,
    },
  });
  return await universalProfileFactory.deploy(owner.address);
}

export async function deployKeyManager(
  erc725UtilsAddress: string,
  universalProfile: UniversalProfile | ERC725Account
): Promise<KeyManager> {
  const keyManagerFactory = await ethers.getContractFactory("KeyManager", {
    libraries: {
      ERC725Utils: erc725UtilsAddress,
    },
  });

  return await keyManagerFactory.deploy(universalProfile.address);
}

export async function deployUniversalReceiver() {}

// Helper contracts
// used to test internal functions

export async function deployKeyManagerHelper(
  erc725UtilsAddress: string,
  universalProfile: UniversalProfile | ERC725Account
): Promise<KeyManagerHelper> {
  const keyManagerFactory = await ethers.getContractFactory("KeyManagerHelper", {
    libraries: {
      ERC725Utils: erc725UtilsAddress,
    },
  });
  return await keyManagerFactory.deploy(universalProfile.address);
}
