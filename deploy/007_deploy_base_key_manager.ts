import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseKeyManager: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const UniversalProfileInit = await deployments.get("UniversalProfileInit");

  await deploy("KeyManagerInit", {
    from: owner,
    gasLimit: 3_500_000,
    gasPrice: ethers.BigNumber.from("2500000000"), // in wei
    log: true,
  });

  /** @todo call `initialize()` */
};

export default deployBaseKeyManager;
deployBaseKeyManager.tags = ["KeyManagerInit", "proxy"];
deployBaseKeyManager.dependencies = ["UniversalProfileInit"];
