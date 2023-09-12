import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { LSP8BurnableTester, LSP8BurnableTester__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

type LSP8BurnableTestContext = {
  accounts: SignerWithAddress[];
  lsp8Burnable: LSP8BurnableTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    tokenIdType: number;
  };
};

describe('LSP8Burnable with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      name: 'LSP8 Burnable - deployed with constructor',
      symbol: 'BRN',
      newOwner: accounts[0].address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
    };

    const lsp8Burnable = await new LSP8BurnableTester__factory(accounts[0]).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.tokenIdType,
    );

    return { accounts, lsp8Burnable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8BurnableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { lsp8Burnable: lsp8, deployParams } = context;

      return {
        lsp8,
        deployParams,
        initializeTransaction: context.lsp8Burnable.deployTransaction,
      };
    });
  });
});
