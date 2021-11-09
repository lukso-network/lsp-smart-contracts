import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseLSP7Token: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP7Init", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("2500000000"), // in wei
    log: true,
  });

  /**
   * @todo call `initialize("LSP7 Token (Base Contract)", "LSP7Init", owner, false)
   */
};

export default deployBaseLSP7Token;
deployBaseLSP7Token.tags = ["LSP7Init", "proxy"];
