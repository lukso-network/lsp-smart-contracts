import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import { LSP8BurnableInitTester, LSP8BurnableInitTester__factory } from '../../../typechain';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

type LSP8BurnableInitTestContext = {
  accounts: SignerWithAddress[];
  lsp8Burnable: LSP8BurnableInitTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    lsp4TokenType: number;
    lsp8TokenIdFormat: number;
  };
};

describe('LSP8BurnableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      name: 'LSP8 Burnable - deployed with constructor',
      symbol: 'BRN',
      newOwner: accounts[0].address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };

    const lsp8BurnableImplementation = await new LSP8BurnableInitTester__factory(
      accounts[0],
    ).deploy();
    const lsp8BurnableProxy = await deployProxy(
      await lsp8BurnableImplementation.getAddress(),
      accounts[0],
    );
    const lsp8Burnable = lsp8BurnableImplementation.attach(
      lsp8BurnableProxy,
    ) as LSP8BurnableInitTester;

    return { accounts, lsp8Burnable, deployParams };
  };

  const initializeProxy = async (context: LSP8BurnableInitTestContext) => {
    return context.lsp8Burnable.initialize(
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.lsp8TokenIdFormat,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8BurnableInitTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8(async () => {
        const { lsp8Burnable: lsp8, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp8,
          deployParams,
          initializeTransaction,
        };
      });
    });

    describe('when calling initialize more than once', () => {
      it('should revert', async () => {
        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });
  });
});
