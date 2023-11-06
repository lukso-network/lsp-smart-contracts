import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { SALT } from './salt';

const deployBaseUniversalProfileDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('UniversalProfileInit', {
    from: deployer,
    log: true,
    gasPrice,
    deterministicDeployment: SALT,
  });
};

export default deployBaseUniversalProfileDeterministic;
deployBaseUniversalProfileDeterministic.tags = ['UniversalProfileInit', 'base'];
