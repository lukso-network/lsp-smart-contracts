import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { SALT } from './salt';

const deployBaseLSP8Mintable: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy('LSP8MintableInit', {
    from: owner,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployBaseLSP8Mintable;
deployBaseLSP8Mintable.tags = ['LSP8MintableInit', 'base'];
