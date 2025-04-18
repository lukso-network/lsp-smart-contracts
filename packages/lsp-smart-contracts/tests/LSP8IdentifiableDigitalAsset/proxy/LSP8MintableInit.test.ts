import { ethers } from 'hardhat';
import { expect } from 'chai';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8Mintable,
  LSP8MintableTestContext,
  getNamedAccounts,
} from '../LSP8Mintable.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { ERC725YDataKeys } from '../../../constants';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

describe('LSP8MintableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 Mintable - deployed with proxy',
      symbol: 'MNTBL',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };

    const LSP8MintableInit__factory = await ethers.getContractFactory(
      'LSP8MintableInit',
      accounts.owner,
    );

    const LSP8MintableInit = await LSP8MintableInit__factory.deploy();

    const lsp8MintableProxy = await deployProxy(
      await LSP8MintableInit.getAddress(),
      accounts.owner,
    );
    const lsp8Mintable = LSP8MintableInit.attach(lsp8MintableProxy);

    return { accounts, lsp8Mintable, deployParams };
  };

  const initializeProxy = async (context: LSP8MintableTestContext) => {
    return context.lsp8Mintable['initialize(string,string,address,uint256,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.lsp8TokenIdFormat,
    );
  };

  describe('when deploying the base implementation contract', () => {
    it('should have initialized the tokenName + tokenSymbol to "" and contract owner to `address(0)`', async () => {
      const accounts = await ethers.getSigners();

      const LSP8MintableInit__factory = await ethers.getContractFactory(
        'LSP8MintableInit',
        accounts[0],
      );

      const lsp8MintableInit = await LSP8MintableInit__factory.deploy();

      expect(await lsp8MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenName)).to.equal('0x');
      expect(await lsp8MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenSymbol)).to.equal('0x');
      expect(await lsp8MintableInit.getData(ERC725YDataKeys.LSP4.LSP4Metadata)).to.equal('0x');
      expect(await lsp8MintableInit.getData(ERC725YDataKeys.LSP4.LSP4TokenType)).to.equal('0x');
      expect(await lsp8MintableInit.getData(ERC725YDataKeys.LSP8.LSP8TokenIdFormat)).to.equal('0x');

      expect(await lsp8MintableInit.owner()).to.equal(ethers.ZeroAddress);
    });

    it('prevent any address from calling the initialize(...) function on the implementation', async () => {
      const accounts = await ethers.getSigners();

      const LSP8MintableInit__factory = await ethers.getContractFactory(
        'LSP8MintableInit',
        accounts[0],
      );

      const lsp8Mintable = await LSP8MintableInit__factory.deploy();

      const randomCaller = accounts[1];

      await expect(
        lsp8Mintable['initialize(string,string,address,uint256,uint256)'](
          'XXXXXXXXXXX',
          'XXX',
          randomCaller.address,
          0,
          12345,
        ),
      ).to.be.revertedWith('Initializable: contract is already initialized');
    });
  });

  describe('when deploying the contract as proxy', () => {
    let context: LSP8MintableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8(async () => {
        const { lsp8Mintable: lsp8, deployParams } = context;
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

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8Mintable(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);
        return context;
      }),
    );
  });
});
