import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { LSP8BurnableInitTester, LSP8BurnableInitTester__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

type LSP8BurnableInitTestContext = {
  accounts: SignerWithAddress[];
  lsp8Burnable: LSP8BurnableInitTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    tokenIdType: number;
  };
};

describe('LSP8BurnableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      name: 'LSP8 Burnable - deployed with constructor',
      symbol: 'BRN',
      newOwner: accounts[0].address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
    };

    const lsp8BurnableImplementation = await new LSP8BurnableInitTester__factory(
      accounts[0],
    ).deploy();
    const lsp8BurnableProxy = await deployProxy(lsp8BurnableImplementation.address, accounts[0]);
    const lsp8Burnable = lsp8BurnableImplementation.attach(lsp8BurnableProxy);

    return { accounts, lsp8Burnable, deployParams };
  };

  const initializeProxy = async (context: LSP8BurnableInitTestContext) => {
    return context.lsp8Burnable.initialize(
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.tokenIdType,
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
