import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { SALT } from './salt';

const deployBaseUniversalProfileDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('UniversalProfileInit', {
    from: deployer,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployBaseUniversalProfileDeterministic;
deployBaseUniversalProfileDeterministic.tags = ['UniversalProfileInit', 'base'];
