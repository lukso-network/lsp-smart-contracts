import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { SALT } from './salt';

const deployBaseLSP8Mintable: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('LSP8MintableInit', {
    from: owner,
    gasPrice,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployBaseLSP8Mintable;
deployBaseLSP8Mintable.tags = ['LSP8MintableInit', 'base'];
