import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

const deployLSP8MintableDeterministic: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner: deployer } = await getNamedAccounts();

  await deploy('LSP8Mintable', {
    from: deployer,
    args: ['LSP8 Mintable', 'LSP8M', deployer, LSP4_TOKEN_TYPES.NFT, LSP8_TOKEN_ID_FORMAT.NUMBER],
    log: true,
  });
};

export default deployLSP8MintableDeterministic;
deployLSP8MintableDeterministic.tags = ['LSP8Mintable', 'standard'];
