import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseUniversalReceiverDelegate: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP1UniversalReceiverDelegateInit", {
    from: owner,
    log: true,
    gasPrice: ethers.BigNumber.from("20000000000"), // in wei
  });

  const UniversalReceiverDelegateInit = await ethers.getContractFactory(
    "LSP1UniversalReceiverDelegateInit"
  );
  const universalReceiverDelegate = UniversalReceiverDelegateInit.attach(deployResult.address);

  await universalReceiverDelegate.initialize();
};

export default deployBaseUniversalReceiverDelegate;
deployBaseUniversalReceiverDelegate.tags = ["LSP1UniversalReceiverDelegateInit", "base"];
