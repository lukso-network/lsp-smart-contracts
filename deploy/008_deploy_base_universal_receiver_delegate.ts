import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseUniversalReceiverDelegate: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("UniversalReceiverDelegateInit", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("10000000000"), // in wei
    log: true,
  });

  const UniversalReceiverDelegateInit = await ethers.getContractFactory(
    "UniversalReceiverDelegateInit"
  );
  const universalReceiverDelegate = UniversalReceiverDelegateInit.attach(deployResult.address);

  await universalReceiverDelegate.initialize({
    gasPrice: ethers.BigNumber.from("10000000000"),
    gasLimit: 3_000_000,
  });
};

export default deployBaseUniversalReceiverDelegate;
deployBaseUniversalReceiverDelegate.tags = ["UniversalReceiverDelegateInit", "proxy"];
