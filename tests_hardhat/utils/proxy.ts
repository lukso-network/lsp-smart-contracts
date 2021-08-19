import { ContractFactory, Signer } from "ethers";
// prettier-ignore
/**
 * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *                      10 x hex Opcodes to copy runtime code
 *                           into memory and return it
 *                             |                  |
 * //                          V                  V            */
const runtimeCodeTemplate = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

async function deployProxy(masterContractFactory: ContractFactory, masterAddress: string, deployer: Signer) {
  const proxyRuntimeCode = runtimeCodeTemplate.replace(
    "bebebebebebebebebebebebebebebebebebebebe",
    masterAddress.substr(2)
  );

  const tx = await deployer.sendTransaction({
    data: proxyRuntimeCode,
  });
  const txReceipt = await tx.wait();

  let proxyContract = await masterContractFactory.deploy(txReceipt.contractAddress);
  return proxyContract;
}

module.exports = {
  runtimeCodeTemplate,
  deployProxy,
};
