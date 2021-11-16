import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployLSP7Token: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP7DigitalAsset", {
    from: owner,
    args: ["LSP7 Token", "LSP7", owner, false],
    gasPrice: ethers.BigNumber.from("20000000000"), // in wei
    log: true,
  });
};

export default deployLSP7Token;
deployLSP7Token.tags = ["LSP7DigitalAsset", "standard"];
