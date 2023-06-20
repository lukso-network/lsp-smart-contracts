import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployBaseKeyManager: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy('LSP6KeyManagerInit', {
    from: owner,
    log: true,
    gasLimit: 5_000_000,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
  });
};

export default deployBaseKeyManager;
deployBaseKeyManager.tags = ['LSP6KeyManagerInit', 'base'];
