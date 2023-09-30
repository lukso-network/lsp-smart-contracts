import { expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// LSP7 + LSP8
import { LSP7DigitalAsset, LSP8IdentifiableDigitalAsset, LSP9Vault } from '../../types';

// constants
import { ERC725YDataKeys } from '../../constants';

export type LS4DigitalAssetMetadataTestContext = {
  accounts: SignerWithAddress[];
  contract: LSP7DigitalAsset | LSP8IdentifiableDigitalAsset | LSP9Vault;
  deployParams: { owner: SignerWithAddress };
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
        const msgValue = ethers.utils.parseEther('2');
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(
          context.contract
            .connect(context.deployParams.owner)
            .setData(key, value, { value: msgValue }),
        ).to.be.revertedWithCustomError(context.contract, 'ERC725Y_MsgValueDisallowed');
      });

      it('should revert with `setDataBatch`', async () => {
        const msgValue = ethers.utils.parseEther('2');
        const key = [ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'))];
        const value = [ethers.utils.hexlify(ethers.utils.randomBytes(256))];

        await expect(
          context.contract
            .connect(context.deployParams.owner)
            .setDataBatch(key, value, { value: msgValue }),
        ).to.be.revertedWithCustomError(context.contract, 'ERC725Y_MsgValueDisallowed');
      });
    });

    it('should revert when trying to edit Token Name', async () => {
      const key = ERC725YDataKeys.LSP4['LSP4TokenName'];
      const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Overriden Token Name'));

      expect(
        context.contract.connect(context.deployParams.owner).setData(key, value),
      ).to.be.revertedWithCustomError(context.contract, 'LSP4TokenNameNotEditable');
    });

    it('should revert when trying to edit Token Symbol', async () => {
      const key = ERC725YDataKeys.LSP4['LSP4TokenSymbol'];
      const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('BAD'));

      expect(
        context.contract.connect(context.deployParams.owner).setData(key, value),
      ).to.be.revertedWithCustomError(context.contract, 'LSP4TokenSymbolNotEditable');
    });

    describe('when setting a data key with a value less than 256 bytes', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(200));

        await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
          .to.emit(context.contract, 'DataChanged')
          .withArgs(key, value);

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value more than 256 bytes', () => {
      it('should emit DataChanged event with only the first 256 bytes of the value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
          .to.emit(context.contract, 'DataChanged')
          .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value exactly 256 bytes long', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
          .to.emit(context.contract, 'DataChanged')
          .withArgs(key, value);

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });
    });
  });
};
