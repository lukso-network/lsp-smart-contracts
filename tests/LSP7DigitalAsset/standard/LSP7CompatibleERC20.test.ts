import { ethers } from 'hardhat';

import { LSP7CompatibleERC20Tester__factory } from '../../../types';

import {
  getNamedAccounts,
  LSP7CompatibleERC20TestContext,
  shouldInitializeLikeLSP7CompatibleERC20,
  shouldBehaveLikeLSP7CompatibleERC20,
} from '../LSP7CompatibleERC20.behaviour';

describe('LSP7CompatibleERC20 with constructor', () => {
  const buildTestContext = async (): Promise<LSP7CompatibleERC20TestContext> => {
    const accounts = await getNamedAccounts();
    const initialSupply = ethers.BigNumber.from('1000');
    const deployParams = {
      name: 'Compat for ERC20',
      symbol: 'NFT',
      newOwner: accounts.owner.address,
    };

    const lsp7CompatibleERC20 = await new LSP7CompatibleERC20Tester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
    );

    return {
      accounts,
      lsp7CompatibleERC20,
      deployParams,
      initialSupply,
    };
  };

  describe('when deploying the contract', () => {
    let context: LSP7CompatibleERC20TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP7CompatibleERC20(async () => {
        const { lsp7CompatibleERC20, deployParams } = context;
        return {
          lsp7CompatibleERC20,
          deployParams,
          initializeTransaction: context.lsp7CompatibleERC20.deployTransaction,
        };
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP7CompatibleERC20(buildTestContext);
  });
});
