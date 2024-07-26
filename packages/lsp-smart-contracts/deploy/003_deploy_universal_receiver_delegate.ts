import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { SALT } from './salt';

const deployUniversalReceiverDelegateUPDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP1UniversalReceiverDelegateUP', {
    from: deployer,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployUniversalReceiverDelegateUPDeterministic;
deployUniversalReceiverDelegateUPDeterministic.tags = ['LSP1UniversalReceiverDelegateUP', 'base'];
