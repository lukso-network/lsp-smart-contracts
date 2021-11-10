import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseKeyManager: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("KeyManagerInit", {
    from: owner,
    gasLimit: 3_500_000,
    gasPrice: ethers.BigNumber.from("10000000000"), // in wei
    log: true,
  });

  const KeyManagerInit = await ethers.getContractFactory("KeyManagerInit");
  const keyManagerInit = await KeyManagerInit.attach(deployResult.address);

  await keyManagerInit.initialize(ethers.constants.AddressZero, {
    gasPrice: ethers.BigNumber.from("10000000000"),
    gasLimit: 3_500_000,
  });
};

export default deployBaseKeyManager;
deployBaseKeyManager.tags = ["KeyManagerInit", "proxy"];
deployBaseKeyManager.dependencies = ["UniversalProfileInit"];
