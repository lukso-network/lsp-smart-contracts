import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { LSP4_TOKEN_TYPES } from '../constants';

const deployLSP7Mintable: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('LSP7Mintable', {
    from: owner,
    args: ['LSP7 Mintable', 'LSP7M', owner, LSP4_TOKEN_TYPES.TOKEN, false],
    gasPrice,
    log: true,
  });
};

export default deployLSP7Mintable;
deployLSP7Mintable.tags = ['LSP7Mintable', 'standard'];
