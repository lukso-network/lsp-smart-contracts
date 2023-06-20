import { ethers } from 'hardhat';

import { LSP7CappedSupplyTester__factory } from '../../../types';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP7CappedSupply,
  LSP7CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP7CappedSupply.behaviour';

describe('LSP7CappedSupply with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP7 capped supply - deployed with constructor',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      tokenSupplyCap: ethers.BigNumber.from('2'),
    };
    const lsp7CappedSupply = await new LSP7CappedSupplyTester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.tokenSupplyCap,
    );

    return { accounts, lsp7CappedSupply, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP7CappedSupplyTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP7(async () => {
      const { lsp7CappedSupply: lsp7, deployParams } = context;

      return {
        lsp7,
        deployParams,
        initializeTransaction: context.lsp7CappedSupply.deployTransaction,
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP7CappedSupply(buildTestContext);
  });
});
