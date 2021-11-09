import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLSP8NFT: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("LSP8", {
    from: owner,
    args: ["LSP8 NFT", "LSP8", owner],
    gasLimit: 3_000_000,
    log: true,
  });
};

export default deployLSP8NFT;
deployLSP8NFT.tags = ["LSP8", "standards"];
