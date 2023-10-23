import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployBaseVaultDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP9VaultInit', {
    from: deployer,
    log: true,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    deterministicDeployment: true,
  });
};

export default deployBaseVaultDeterministic;
deployBaseVaultDeterministic.tags = ['LSP9VaultInit', 'base'];
