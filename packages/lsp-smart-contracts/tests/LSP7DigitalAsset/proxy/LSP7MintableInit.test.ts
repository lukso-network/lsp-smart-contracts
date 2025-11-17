import { expect } from 'chai';
import type { HardhatEthers } from '@nomicfoundation/hardhat-ethers/types';

import {
  type LSP7MintableInit,
  LSP7MintableInit__factory,
} from '../../../../lsp7-contracts/types/ethers-contracts/index.js';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour.js';
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7Mintable,
  type LSP7MintableTestContext,
  type LSP7MintableDeployParams,
} from '../LSP7Mintable.behaviour.js';

import { deployProxy } from '../../utils/fixtures.js';
import { ERC725YDataKeys } from '../../../constants.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP7MintableInit with proxy', () => {
  const buildTestContext = async () => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);

    const deployParams: LSP7MintableDeployParams = {
      name: 'LSP7 Mintable - deployed with proxy',
      symbol: 'LSP7 MNTBL',
      newOwner: accounts.owner.address,
      isNFT: false,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
      mintable: true,
    };

    const LSP7MintableInit: LSP7MintableInit = await new LSP7MintableInit__factory(
      accounts.owner,
    ).deploy();

    const lsp7MintableProxy = await deployProxy(
      await LSP7MintableInit.getAddress(),
      accounts.owner,
    );
    const lsp7Mintable: LSP7MintableInit = LSP7MintableInit.attach(
      lsp7MintableProxy,
    ) as LSP7MintableInit;

    return { ethers, accounts, lsp7Mintable, deployParams };
  };

  const initializeProxy = async (context: LSP7MintableTestContext) => {
    return context.lsp7Mintable['initialize(string,string,address,uint256,bool,bool)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.isNFT,
      context.deployParams.mintable,
    );
  };

  describe('when deploying the base implementation contract', () => {
    let ethers: HardhatEthers;

    before(async () => {
      const { network } = await import('hardhat');
      ({ ethers } = await network.connect());
    });

    it('should have initialized the tokenName + tokenSymbol to "" and contract owner to `address(0)`', async () => {
      const accounts = await ethers.getSigners();

      const lsp7MintableInit = await new LSP7MintableInit__factory(accounts[0]).deploy();

      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenName)).to.equal('0x');
      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenSymbol)).to.equal('0x');
      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4Metadata)).to.equal('0x');
      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenType)).to.equal('0x');

      expect(await lsp7MintableInit.owner()).to.equal(ethers.ZeroAddress);
    });

    it('prevent any address from calling the initialize(...) function on the implementation', async () => {
      const accounts = await ethers.getSigners();

      const lsp7MintableInit = await new LSP7MintableInit__factory(accounts[0]).deploy();

      const randomCaller = accounts[1];

      await expect(
        lsp7MintableInit.initialize('XXXXXXXXXXX', 'XXX', randomCaller.address, 12345, false, true),
      ).to.be.revertedWith('Initializable: contract is already initialized');
    });
  });

  describe('when deploying the contract as proxy', () => {
    let context: LSP7MintableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP7(async () => {
        const { lsp7Mintable: lsp7, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp7,
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

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP7Mintable(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
