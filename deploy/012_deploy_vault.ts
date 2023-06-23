import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployVault: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy('LSP9Vault', {
    from: owner,
    args: [owner],
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    log: true,
  });
};

export default deployVault;
deployVault.tags = ['LSP9Vault'];
