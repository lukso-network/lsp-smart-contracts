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
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("5000000000"), // in wei
    log: true,
  });
};

export default deployUniversalProfile;
deployUniversalProfile.tags = ["UniversalProfile"];
