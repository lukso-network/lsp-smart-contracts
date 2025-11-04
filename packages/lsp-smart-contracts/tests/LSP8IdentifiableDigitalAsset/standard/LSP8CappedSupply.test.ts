import { LSP8CappedSupplyTester__factory } from '../../../types/ethers-contracts/index.js';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour.js';
import {
  getNamedAccounts,
  shouldBehaveLikeLSP8CappedSupply,
  type LSP8CappedSupplyTestContext,
} from '../LSP8CappedSupply.behaviour.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

describe('LSP8CappedSupply with constructor', () => {
  const buildTestContext = async () => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);
    const deployParams = {
      name: 'LSP8 capped supply - deployed with constructor',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
      tokenSupplyCap: ethers.toBigInt('2'),
    };
    const lsp8CappedSupply = await new LSP8CappedSupplyTester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
      deployParams.tokenSupplyCap,
    );

    return { ethers, accounts, lsp8CappedSupply, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8CappedSupplyTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { ethers, lsp8CappedSupply: lsp8, deployParams } = context;

      return {
        ethers,
        lsp8,
        deployParams,
        initializeTransaction: context.lsp8CappedSupply.deploymentTransaction(),
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8CappedSupply(buildTestContext);
  });
});
