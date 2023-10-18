import { ethers } from 'hardhat';

import { LSP8CappedSupplyTester__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8CappedSupply,
  LSP8CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP8CappedSupply.behaviour';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

describe('LSP8CappedSupply with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 capped supply - deployed with constructor',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
      tokenSupplyCap: ethers.BigNumber.from('2'),
    };
    const lsp8CappedSupply = await new LSP8CappedSupplyTester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.tokenIdType,
      deployParams.tokenSupplyCap,
    );

    return { accounts, lsp8CappedSupply, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8CappedSupplyTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { lsp8CappedSupply: lsp8, deployParams } = context;

      return {
        lsp8,
        deployParams,
        initializeTransaction: context.lsp8CappedSupply.deployTransaction,
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8CappedSupply(buildTestContext);
  });
});
