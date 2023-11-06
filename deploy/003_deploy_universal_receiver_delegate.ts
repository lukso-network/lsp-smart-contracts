import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { SALT } from './salt';

const deployUniversalReceiverDelegateUPDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('LSP1UniversalReceiverDelegateUP', {
    from: deployer,
    gasPrice,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployUniversalReceiverDelegateUPDeterministic;
deployUniversalReceiverDelegateUPDeterministic.tags = ['LSP1UniversalReceiverDelegateUP'];
