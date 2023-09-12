import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  LSP8CompatibleERC721InitTester__factory,
  LSP8CompatibleERC721MintableInit__factory,
} from '../../../types';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8CompatibleERC721,
  shouldInitializeLikeLSP8CompatibleERC721,
  LSP8CompatibleERC721TestContext,
} from '../LSP8CompatibleERC721.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

describe('LSP8CompatibleERC721Init with proxy', () => {
  const buildTestContext = async (): Promise<LSP8CompatibleERC721TestContext> => {
    const accounts = await getNamedAccounts();

    const tokenUriHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('ipfs://some-cid'));
    const tokenUriHash = ethers.utils.keccak256(tokenUriHex);
    const hashSig = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('keccak256(utf8)'));
    const lsp4MetadataValue = `${hashSig.slice(0, 10)}${tokenUriHash.replace(
      /^0x/,
      '',
    )}${tokenUriHex.replace(/^0x/, '')}`;

    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      newOwner: accounts.owner.address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
      lsp4MetadataValue,
    };

    const lsp8CompatibleERC721TesterInit = await new LSP8CompatibleERC721InitTester__factory(
      accounts.owner,
    ).deploy();
    const lsp8CompatibleERC721Proxy = await deployProxy(
      lsp8CompatibleERC721TesterInit.address,
      accounts.owner,
    );
    const lsp8CompatibleERC721 = lsp8CompatibleERC721TesterInit.attach(lsp8CompatibleERC721Proxy);

    return { accounts, lsp8CompatibleERC721, deployParams };
  };

  const initializeProxy = async (context: LSP8CompatibleERC721TestContext) => {
    return context.lsp8CompatibleERC721['initialize(string,string,address,uint256,bytes)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.tokenIdType,
      context.deployParams.lsp4MetadataValue,
    );
  };

  describe('when deploying the base implementation contract', () => {
    it('LSP8CompatibleERC721Init: prevent any address from calling the initialize(...) function on the implementation', async () => {
      const accounts = await ethers.getSigners();

      const lsp8CompatibilityForERC721TesterInit =
        await new LSP8CompatibleERC721InitTester__factory(accounts[0]).deploy();

      const randomCaller = accounts[1];

      await expect(
        lsp8CompatibilityForERC721TesterInit['initialize(string,string,address,uint256,bytes)'](
          'XXXXXXXXXXX',
          'XXX',
          randomCaller.address,
          0,
          '0x',
        ),
      ).to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('LSP8CompatibleERC721MintableInit: prevent any address from calling the initialize(...) function on the implementation', async () => {
      const accounts = await ethers.getSigners();

      const lsp8CompatibleERC721MintableInit = await new LSP8CompatibleERC721MintableInit__factory(
        accounts[0],
      ).deploy();

      const randomCaller = accounts[1];

      await expect(
        lsp8CompatibleERC721MintableInit.initialize('XXXXXXXXXXX', 'XXX', randomCaller.address, 0),
      ).to.be.revertedWith('Initializable: contract is already initialized');
    });
  });

  describe('when deploying the contract as proxy', () => {
    let context: LSP8CompatibleERC721TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8CompatibleERC721(async () => {
        const { lsp8CompatibleERC721, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp8CompatibleERC721,
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
    shouldBehaveLikeLSP8CompatibleERC721(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
