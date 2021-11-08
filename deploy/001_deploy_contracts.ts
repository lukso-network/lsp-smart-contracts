import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { owner } = await getNamedAccounts();
  await deploy("UniversalProfile", {
    from: owner,
    args: [owner],
    log: true,
  });
};

export default func;
func.tags = ["UniversalProfile"];
