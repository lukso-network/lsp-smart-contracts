import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployUniversalReceiverDelegate: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("UniversalReceiverDelegate", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("5000000000"), // in wei
    log: true,
  });
};

export default deployUniversalReceiverDelegate;
deployUniversalReceiverDelegate.tags = ["UniversalReceiverDelegate", "standard"];
