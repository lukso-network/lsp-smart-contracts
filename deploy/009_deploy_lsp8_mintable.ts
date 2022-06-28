import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployLSP8Mintable: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP8Mintable", {
    from: owner,
    args: ["LSP8 Mintable", "LSP8M", owner],
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei,
    log: true,
  });
};

export default deployLSP8Mintable;
deployLSP8Mintable.tags = ["LSP8Mintable", "standard"];
