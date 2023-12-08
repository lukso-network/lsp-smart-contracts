import { ethers } from 'hardhat';

import { LSP8CompatibleERC721Tester__factory } from '../../../types';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8CompatibleERC721,
  shouldInitializeLikeLSP8CompatibleERC721,
  LSP8CompatibleERC721TestContext,
} from '../LSP8CompatibleERC721.behaviour';
import { LSP4_TOKEN_TYPES, LSP8_TOKEN_ID_FORMAT } from '../../../constants';

describe('LSP8CompatibleERC721 with constructor', () => {
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
      name: 'Compat for ERC721',
      symbol: 'NFT',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
      lsp4MetadataValue,
    };

    const lsp8CompatibleERC721 = await new LSP8CompatibleERC721Tester__factory(
      accounts.owner,
    ).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
      deployParams.lsp4MetadataValue,
    );

    return { accounts, lsp8CompatibleERC721, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8CompatibleERC721TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8CompatibleERC721(async () => {
        const { lsp8CompatibleERC721, deployParams } = context;

        return {
          lsp8CompatibleERC721,
          deployParams,
          initializeTransaction: context.lsp8CompatibleERC721.deployTransaction,
        };
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8CompatibleERC721(buildTestContext);
  });
});
