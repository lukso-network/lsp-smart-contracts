import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { SALT } from './salt';

const deployBaseLSP7MintableDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('LSP7MintableInit', {
    from: deployer,
    gasPrice,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployBaseLSP7MintableDeterministic;
deployBaseLSP7MintableDeterministic.tags = ['LSP7MintableInit', 'base'];
