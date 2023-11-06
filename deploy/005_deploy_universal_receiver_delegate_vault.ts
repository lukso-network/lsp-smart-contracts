import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { SALT } from './salt';

const deployUniversalReceiverDelegateVaultDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('LSP1UniversalReceiverDelegateVault', {
    from: deployer,
    gasPrice,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployUniversalReceiverDelegateVaultDeterministic;
deployUniversalReceiverDelegateVaultDeterministic.tags = ['LSP1UniversalReceiverDelegateVault'];
