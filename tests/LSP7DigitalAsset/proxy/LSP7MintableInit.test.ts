import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP7MintableInit, LSP7MintableInit__factory } from '../../../types';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7Mintable,
  LSP7MintableTestContext,
  LSP7MintableDeployParams,
} from '../LSP7Mintable.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { ERC725YDataKeys } from '../../../constants';

describe('LSP7MintableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();

    const deployParams: LSP7MintableDeployParams = {
      name: 'LSP7 Mintable - deployed with proxy',
      symbol: 'LSP7 MNTBL',
      newOwner: accounts.owner.address,
      isNFT: false,
    };

    const LSP7MintableInit: LSP7MintableInit = await new LSP7MintableInit__factory(
      accounts.owner,
    ).deploy();

    const lsp7MintableProxy = await deployProxy(LSP7MintableInit.address, accounts.owner);
    const lsp7Mintable: LSP7MintableInit = LSP7MintableInit.attach(lsp7MintableProxy);

    return { accounts, lsp7Mintable, deployParams };
  };

  const initializeProxy = async (context: LSP7MintableTestContext) => {
    return context.lsp7Mintable['initialize(string,string,address,bool)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.isNFT,
    );
  };

  describe('when deploying the base implementation contract', () => {
    it('should have initialized the tokenName + tokenSymbol to "" and contract owner to `address(0)`', async () => {
      const accounts = await ethers.getSigners();

      const lsp7MintableInit = await new LSP7MintableInit__factory(accounts[0]).deploy();

      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenName)).to.equal('0x');
      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenSymbol)).to.equal('0x');
      expect(await lsp7MintableInit.getData(ERC725YDataKeys.LSP4.LSP4Metadata)).to.equal('0x');

      expect(await lsp7MintableInit.owner()).to.equal(ethers.constants.AddressZero);
    });

    it('prevent any address from calling the initialize(...) function on the implementation', async () => {
      const accounts = await ethers.getSigners();

      const lsp7MintableInit = await new LSP7MintableInit__factory(accounts[0]).deploy();

      const randomCaller = accounts[1];

      await expect(
        lsp7MintableInit['initialize(string,string,address,bool)'](
          'XXXXXXXXXXX',
          'XXX',
          randomCaller.address,
          false,
        ),
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
