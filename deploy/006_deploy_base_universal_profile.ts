import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployBaseUniversalProfile: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy('UniversalProfileInit', {
    from: owner,
    log: true,
    gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
  });
};

export default deployBaseUniversalProfile;
deployBaseUniversalProfile.tags = ['UniversalProfileInit', 'base'];
