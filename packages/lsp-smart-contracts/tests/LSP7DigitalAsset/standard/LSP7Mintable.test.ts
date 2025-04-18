import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7Mintable,
  LSP7MintableTestContext,
  LSP7MintableDeployParams,
} from '../LSP7Mintable.behaviour';
import { ethers } from 'hardhat';

describe('LSP7Mintable with constructor', () => {
  const buildTestContext = async (): Promise<LSP7MintableTestContext> => {
    const accounts = await getNamedAccounts();

    const deployParams: LSP7MintableDeployParams = {
      name: 'LSP7Mintable - deployed with constructor',
      symbol: 'LSP7MNT',
      newOwner: accounts.owner.address,
      isNFT: false,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
    };

    const LSP7Mintable__factory = await ethers.getContractFactory('LSP7Mintable', accounts[0]);

    const lsp7Mintable = await LSP7Mintable__factory.deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.isNFT,
    );

    return { accounts, lsp7Mintable, deployParams };
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
