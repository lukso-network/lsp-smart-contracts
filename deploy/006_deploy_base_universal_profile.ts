import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseUniversalProfile: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("UniversalProfileInit", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("2500000000"), // in wei
    log: true,
  });

  /** @todo call `initialize()` */
};

export default deployBaseUniversalProfile;
deployBaseUniversalProfile.tags = ["UniversalProfileInit"];
