import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLSP7Token: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP7", {
    from: owner,
    args: ["LSP7 Token", "LSP7", owner, false],
    gasLimit: 3_000_000,
    log: true,
  });
};

export default deployLSP7Token;
deployLSP7Token.tags = ["LSP7", "standards"];
