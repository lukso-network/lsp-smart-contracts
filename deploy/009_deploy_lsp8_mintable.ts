import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployLSP8MintableDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP8Mintable', {
    from: deployer,
    args: ['LSP8 Mintable', 'LSP8M', deployer],
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei,
    log: true,
    deterministicDeployment: true,
  });
};

export default deployLSP8MintableDeterministic;
deployLSP8MintableDeterministic.tags = ['LSP8Mintable', 'standard'];
