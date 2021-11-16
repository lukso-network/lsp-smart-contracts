import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployUniversalReceiverDelegate: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP1UniversalReceiverDelegate", {
    from: owner,
    gasPrice: ethers.BigNumber.from("20000000000"), // in wei
    log: true,
  });
};

export default deployUniversalReceiverDelegate;
deployUniversalReceiverDelegate.tags = ["LSP1UniversalReceiverDelegate", "standard"];
