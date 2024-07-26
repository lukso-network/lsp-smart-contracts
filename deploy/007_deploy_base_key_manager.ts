import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { SALT } from './salt';

const deployBaseKeyManagerDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP6KeyManagerInit', {
    from: deployer,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployBaseKeyManagerDeterministic;
deployBaseKeyManagerDeterministic.tags = ['LSP6KeyManagerInit', 'base'];
