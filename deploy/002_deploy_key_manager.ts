import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployKeyManager: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const UniversalProfile = await deployments.get("UniversalProfile");

  await deploy("KeyManager", {
    from: owner,
    args: [UniversalProfile.address],
    gasLimit: 3_000_000,
    log: true,
  });
};

export default deployKeyManager;
deployKeyManager.tags = ["KeyManager", "standard"];
deployKeyManager.dependencies = ["UniversalProfile"];
