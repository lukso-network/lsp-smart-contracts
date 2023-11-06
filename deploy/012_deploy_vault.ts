import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployVault: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('LSP9Vault', {
    from: owner,
    args: [owner],
    gasPrice,
    log: true,
  });
};

export default deployVault;
deployVault.tags = ['LSP9Vault'];
