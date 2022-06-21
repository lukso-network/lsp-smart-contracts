import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployUniversalReceiverDelegateUP: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP1UniversalReceiverDelegateUP", {
    from: owner,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    log: true,
  });
};

export default deployUniversalReceiverDelegateUP;
deployUniversalReceiverDelegateUP.tags = ["LSP1UniversalReceiverDelegateUP"];
