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
    log: true,
    gasLimit: 5_000_000,
    gasPrice: ethers.BigNumber.from("20000000000"), // in wei
  });

  const KeyManagerInit = await ethers.getContractFactory("KeyManagerInit");
  const keyManagerInit = await KeyManagerInit.attach(deployResult.address);

  await keyManagerInit.initialize(ethers.constants.AddressZero);
};

export default deployBaseKeyManager;
deployBaseKeyManager.tags = ["KeyManagerInit", "base"];
