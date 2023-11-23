import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  LSP8ReferenceContractCollectionInitTester,
  LSP8ReferenceContractCollectionInitTester__factory,
} from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

type LSP8ReferenceContractCollectionInitTesterContext = {
  accounts: SignerWithAddress[];
  lsp8Reference: LSP8ReferenceContractCollectionInitTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    tokenIdType: number;
  };
};

describe('LSP8ReferenceInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      name: 'LSP8 Reference - deployed with constructor',
      symbol: 'BRN',
      newOwner: accounts[0].address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
    };

    const lsp8ReferenceImplementation =
      await new LSP8ReferenceContractCollectionInitTester__factory(accounts[0]).deploy();
    const lsp8ReferenceProxy = await deployProxy(lsp8ReferenceImplementation.address, accounts[0]);
    const lsp8Reference = lsp8ReferenceImplementation.attach(lsp8ReferenceProxy);

    return { accounts, lsp8Reference, deployParams };
  };

  const initializeProxy = async (context: LSP8ReferenceContractCollectionInitTesterContext) => {
    return context.lsp8Reference.initialize(
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.tokenIdType,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8ReferenceContractCollectionInitTesterContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8(async () => {
        const { lsp8Reference: lsp8, deployParams } = context;
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
