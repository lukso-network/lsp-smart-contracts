import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployUniversalProfile: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("UniversalProfile", {
    from: owner,
    args: [owner],
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    log: true,
  });
};

export default deployUniversalProfile;
deployUniversalProfile.tags = ["UniversalProfile"];
