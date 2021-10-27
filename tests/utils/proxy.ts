import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  UniversalProfileInit__factory,
  KeyManagerInit__factory,
  KeyManagerInit,
  UniversalProfileInit,
} from "../../build/types";

// prettier-ignore
/**
 * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *                      10 x hex Opcodes to copy runtime code
 *                           into memory and return it
 *                             |                  |
 * //                          V                  V            */
export const proxyRuntimeCodeTemplate = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

/**
 * Deploy a proxy contract, referencing to baseContractAddress via delegateCall
 *
 * @param baseContractAddress
 * @param deployer
 * @returns
 */
export async function deployProxy(baseContractAddress: string, deployer: SignerWithAddress) {
  // deploy proxy contract
  let proxyRuntimeCode = proxyRuntimeCodeTemplate.replace(
    "bebebebebebebebebebebebebebebebebebebebe",
    baseContractAddress.substr(2)
  );
  let tx = await deployer.sendTransaction({
    data: proxyRuntimeCode,
  });
  let receipt = await tx.wait();

  return receipt.contractAddress;
}

export async function attachUniversalProfileProxy(
  deployer: SignerWithAddress,
  proxyAddress: string
): Promise<UniversalProfileInit> {
  return await new UniversalProfileInit__factory(deployer).attach(proxyAddress);
}

export async function attachKeyManagerProxy(
  deployer: SignerWithAddress,
  proxyAddress: string
): Promise<KeyManagerInit> {
  return await new KeyManagerInit__factory(deployer).attach(proxyAddress);
}
