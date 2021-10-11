import { ContractFactory, SignerWithAddress } from "ethers";
import {
  ERC725Utils,
  LSP3AccountInit,
  LSP3AccountInit__factory,
  KeyManagerInit__factory,
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

export async function deployBaseLSP3Account(erc725Utils: ERC725Utils, deployer: SignerWithAddress) {
  return await new LSP3AccountInit__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    deployer
  ).deploy();
}

export async function attachLSP3AccountProxy(
  erc725Utils: ERC725Utils,
  deployer: SignerWithAddress,
  proxyAddress: string
) {
  return await new LSP3AccountInit__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    deployer
  ).attach(proxyAddress);
}

export async function deployBaseKeyManager(erc725Utils: ERC725Utils, deployer: SignerWithAddress) {
  return await new KeyManagerInit__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    deployer
  ).deploy();
}

export async function attachKeyManagerProxy(
  erc725Utils: ERC725Utils,
  deployer: SignerWithAddress,
  proxyAddress: string
) {
  return await new KeyManagerInit__factory(
    { "contracts/Utils/ERC725Utils.sol:ERC725Utils": erc725Utils.address },
    deployer
  ).attach(proxyAddress);
}

async function deployBaseUniversalReceiver() {}

async function deployBaseUniversalReceiverDelegate() {}
