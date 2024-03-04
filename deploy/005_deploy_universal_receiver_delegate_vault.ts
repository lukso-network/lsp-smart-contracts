import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { SALT } from './salt';

const deployUniversalReceiverDelegateVaultDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP1UniversalReceiverDelegateVault', {
    from: deployer,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployUniversalReceiverDelegateVaultDeterministic;
deployUniversalReceiverDelegateVaultDeterministic.tags = ['LSP1UniversalReceiverDelegateVault'];
