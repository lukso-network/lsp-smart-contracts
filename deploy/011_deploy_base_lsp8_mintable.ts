import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseLSP8Mintable: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP8MintableInit", {
    from: owner,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei,
    log: true,
  });

  const LSP8MintableInit = await ethers.getContractFactory("LSP8MintableInit");
  const lsp8MintableInit = await LSP8MintableInit.attach(deployResult.address);
};

export default deployBaseLSP8Mintable;
deployBaseLSP8Mintable.tags = ["LSP8MintableInit", "base"];
