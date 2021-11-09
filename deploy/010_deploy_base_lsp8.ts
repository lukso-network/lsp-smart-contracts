import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseLSP8NFT: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP8Init", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("2500000000"), // in wei
    log: true,
  });

  /**
   * @todo call `initialize("LSP8 NFT (Base Contract)", "LSP8Init", owner)
   */
};

export default deployBaseLSP8NFT;
deployBaseLSP8NFT.tags = ["LSP8Init", "proxy"];
