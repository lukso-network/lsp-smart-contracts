import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployUniversalReceiverDelegateVaultDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP1UniversalReceiverDelegateVault', {
    from: deployer,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    log: true,
    deterministicDeployment: true,
  });
};

export default deployUniversalReceiverDelegateVaultDeterministic;
deployUniversalReceiverDelegateVaultDeterministic.tags = ['LSP1UniversalReceiverDelegateVault'];
