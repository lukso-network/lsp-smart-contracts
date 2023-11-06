import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployUniversalProfile: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const gasPrice = await ethers.provider.getGasPrice();

  await deploy('UniversalProfile', {
    from: owner,
    args: [owner],
    gasPrice,
    log: true,
  });
};

export default deployUniversalProfile;
deployUniversalProfile.tags = ['UniversalProfile'];
