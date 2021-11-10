import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseUniversalProfile: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("UniversalProfileInit", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("10000000000"), // in wei
    log: true,
  });

  const UniversalProfileInit = await ethers.getContractFactory("UniversalProfileInit");
  const universalProfileInit = await UniversalProfileInit.attach(deployResult.address);

  await universalProfileInit.initialize(ethers.constants.AddressZero, {
    gasPrice: ethers.BigNumber.from("10000000000"),
    gasLimit: 3_000_000,
  });
};

export default deployBaseUniversalProfile;
deployBaseUniversalProfile.tags = ["UniversalProfileInit"];
