import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployBaseLSP7Mintable: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy('LSP7MintableInit', {
    from: owner,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei,
    log: true,
  });
};

export default deployBaseLSP7Mintable;
deployBaseLSP7Mintable.tags = ['LSP7MintableInit', 'base'];
