import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployBaseUniversalProfileDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('UniversalProfileInit', {
    from: deployer,
    log: true,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    deterministicDeployment: true,
  });
};

export default deployBaseUniversalProfileDeterministic;
deployBaseUniversalProfileDeterministic.tags = ['UniversalProfileInit', 'base'];
