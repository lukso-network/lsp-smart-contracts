import { expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
// LSP7 + LSP8
import { LSP7DigitalAsset, LSP8IdentifiableDigitalAsset, LSP9Vault } from '../../typechain';

// constants
import { ERC725YDataKeys } from '../../constants';
import { abiCoder } from '../utils/helpers';

export type LS4DigitalAssetMetadataTestContext = {
  accounts: SignerWithAddress[];
  contract: LSP7DigitalAsset | LSP8IdentifiableDigitalAsset | LSP9Vault;
  deployParams: { owner: SignerWithAddress; lsp4TokenType: number };
};

export const shouldBehaveLikeLSP4DigitalAssetMetadata = (
  buildContext: () => Promise<LS4DigitalAssetMetadataTestContext>,
) => {
  let context: LS4DigitalAssetMetadataTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when setting data on ERC725Y storage', () => {
    describe('when sending value while setting data', () => {
      it('should revert with `setData`', async () => {
        const msgValue = ethers.parseEther('2');
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(256));

        await expect(
          context.contract
            .connect(context.deployParams.owner)
            .setData(key, value, { value: msgValue }),
        ).to.be.revertedWithCustomError(context.contract, 'ERC725Y_MsgValueDisallowed');
      });

      it('should revert with `setDataBatch`', async () => {
        const msgValue = ethers.parseEther('2');
        const key = [ethers.keccak256(ethers.toUtf8Bytes('My Key'))];
        const value = [ethers.hexlify(ethers.randomBytes(256))];

        await expect(
          context.contract
            .connect(context.deployParams.owner)
            .setDataBatch(key, value, { value: msgValue }),
        ).to.be.revertedWithCustomError(context.contract, 'ERC725Y_MsgValueDisallowed');
      });
    });

    it('should revert when trying to edit Token Name', async () => {
      const key = ERC725YDataKeys.LSP4['LSP4TokenName'];
      const value = ethers.hexlify(ethers.toUtf8Bytes('Overriden Token Name'));

      expect(
        context.contract.connect(context.deployParams.owner).setData(key, value),
      ).to.be.revertedWithCustomError(context.contract, 'LSP4TokenNameNotEditable');
    });

    it('should revert when trying to edit Token Symbol', async () => {
      const key = ERC725YDataKeys.LSP4['LSP4TokenSymbol'];
      const value = ethers.hexlify(ethers.toUtf8Bytes('BAD'));

      expect(
        context.contract.connect(context.deployParams.owner).setData(key, value),
      ).to.be.revertedWithCustomError(context.contract, 'LSP4TokenSymbolNotEditable');
    });

    it('should revert when trying to edit Token Type', async () => {
      const key = ERC725YDataKeys.LSP4['LSP4TokenType'];
      const value = abiCoder.encode(['uint256'], [12345]);

      expect(
        context.contract.connect(context.deployParams.owner).setData(key, value),
      ).to.be.revertedWithCustomError(context.contract, 'LSP4TokenTypeNotEditable');
    });

    describe('when setting a data key with a value less than 256 bytes', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(200));

        await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
          .to.emit(context.contract, 'DataChanged')
          .withArgs(key, value);

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value more than 256 bytes', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(500));

        await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
          .to.emit(context.contract, 'DataChanged')
          .withArgs(key, value);

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value exactly 256 bytes long', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(256));

        await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
          .to.emit(context.contract, 'DataChanged')
          .withArgs(key, value);

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });
    });
  });
};
