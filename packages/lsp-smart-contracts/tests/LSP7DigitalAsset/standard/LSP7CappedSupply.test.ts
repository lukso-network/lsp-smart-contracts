import { ethers } from 'hardhat';

import { LSP7CappedSupplyTester__factory } from '../../../typechain';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP7CappedSupply,
  LSP7CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP7CappedSupply.behaviour';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP7CappedSupply with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP7 capped supply - deployed with constructor',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
      tokenSupplyCap: ethers.toBigInt('2'),
    };

    const lsp7CappedSupply = await new LSP7CappedSupplyTester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
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
        initializeTransaction: context.lsp7CappedSupply.deploymentTransaction(),
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP7CappedSupply(buildTestContext);
  });
});
