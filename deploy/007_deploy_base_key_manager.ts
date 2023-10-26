import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
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
    gasLimit: 5_000_000,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    deterministicDeployment: SALT,
  });
};

export default deployBaseKeyManagerDeterministic;
deployBaseKeyManagerDeterministic.tags = ['LSP6KeyManagerInit', 'base'];
