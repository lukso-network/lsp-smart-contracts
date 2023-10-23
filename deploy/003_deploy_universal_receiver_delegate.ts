import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployUniversalReceiverDelegateUPDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP1UniversalReceiverDelegateUP', {
    from: deployer,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    log: true,
    deterministicDeployment: true,
  });
};

export default deployUniversalReceiverDelegateUPDeterministic;
deployUniversalReceiverDelegateUPDeterministic.tags = ['LSP1UniversalReceiverDelegateUP'];
