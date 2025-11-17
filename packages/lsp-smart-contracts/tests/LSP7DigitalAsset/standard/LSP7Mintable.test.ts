import {
  type LSP7Mintable,
  LSP7Mintable__factory,
} from '../../../../lsp7-contracts/types/ethers-contracts/index.js';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour.js';
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7Mintable,
  type LSP7MintableTestContext,
  type LSP7MintableDeployParams,
} from '../LSP7Mintable.behaviour.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP7Mintable with constructor', () => {
  const buildTestContext = async (): Promise<LSP7MintableTestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);

    const deployParams: LSP7MintableDeployParams = {
      name: 'LSP7Mintable - deployed with constructor',
      symbol: 'LSP7MNT',
      newOwner: accounts.owner.address,
      isNFT: false,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
      mintable: true,
    };

    const lsp7Mintable: LSP7Mintable = await new LSP7Mintable__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.isNFT,
      deployParams.mintable,
    );

    return { ethers, accounts, lsp7Mintable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP7MintableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP7(async () => {
      const { lsp7Mintable: lsp7, deployParams } = context;
      return {
        lsp7,
        deployParams,
        initializeTransaction: context.lsp7Mintable.deploymentTransaction(),
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP7Mintable(buildTestContext);
  });
});
