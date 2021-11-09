import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployUniversalReceiverDelegate: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("UniversalReceiverDelegate", {
    from: owner,
    gasLimit: 3_000_000,
    log: true,
  });
};

export default deployUniversalReceiverDelegate;
deployUniversalReceiverDelegate.tags = ["UniversalReceiverDelegate", "standard"];
