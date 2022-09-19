import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseVault: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP9VaultInit", {
    from: owner,
    log: true,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
  });

  const LSP9VaultInit = await ethers.getContractFactory("LSP9VaultInit");
  const vaultInit = await LSP9VaultInit.attach(deployResult.address);
};

export default deployBaseVault;
deployBaseVault.tags = ["LSP9VaultInit", "base"];
