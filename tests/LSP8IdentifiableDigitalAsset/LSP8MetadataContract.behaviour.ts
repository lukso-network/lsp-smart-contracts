import { expect } from 'chai';
import { hexDataSlice, solidityPack } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

import { LSP8MetadataContract } from '../../types';
import { ERC725YDataKeys } from '../../constants';

export type LSP8MetadataContractTestContext = {
  lsp8MetadataContract: LSP8MetadataContract;
  deployParams: {
    contractOwner: SignerWithAddress;
    referenceContract: string;
  };
};

export const shouldInitializeLikeLSP8MetadataContract = (
  buildContext: () => Promise<LSP8MetadataContractTestContext>,
) => {
  let context: LSP8MetadataContractTestContext;

  before('setup', async () => {
    context = await buildContext();
  });

  describe('should have set the `LSP8ReferenceContract` data key correctly', () => {
    it('value must be 52 bytes long', async () => {
      const lsp8ReferenceContractValue = await context.lsp8MetadataContract.getData(
        ERC725YDataKeys.LSP8.LSP8ReferenceContract,
      );

      const numberOfBytes = (lsp8ReferenceContractValue.length - 2) / 2; // 0x is 2 bytes, 2 characters make 1 byte
      expect(numberOfBytes).to.equal(52);

      // bytes32 tokenId (= the address of this LSP8 Metadata contract)
      // should be padded with zeros on the right
      const tokenIdAddressRightPaddedAsBytes32 =
        context.lsp8MetadataContract.address + '00'.repeat(12);

      const expectedValue = solidityPack(
        ['address', 'bytes32'],
        [context.deployParams.referenceContract, tokenIdAddressRightPaddedAsBytes32],
      );
      expect(lsp8ReferenceContractValue).to.equal(expectedValue);
    });

    it('first 20 bytes must be the `address` of the reference contract provided on deployment', async () => {
      const lsp8ReferenceContractValue = await context.lsp8MetadataContract.getData(
        ERC725YDataKeys.LSP8.LSP8ReferenceContract,
      );

      const first20Bytes = hexDataSlice(lsp8ReferenceContractValue, 0, 20);
      expect(ethers.utils.getAddress(first20Bytes)).to.equal(
        context.deployParams.referenceContract,
      );
    });

    it('next 32 bytes must be the `tokenId` = the address of this metadata contract, right padded with 12 zeros', async () => {
      const lsp8ReferenceContractValue = await context.lsp8MetadataContract.getData(
        ERC725YDataKeys.LSP8.LSP8ReferenceContract,
      );

      const last32Bytes = hexDataSlice(lsp8ReferenceContractValue, 20, 52);
      const expectedValue =
        context.lsp8MetadataContract.address.toLocaleLowerCase() + '00'.repeat(12);
      expect(last32Bytes).to.equal(expectedValue);
    });
  });
};

export const shouldBehaveLikeLSP8MetadataContract = (
  buildContext: () => Promise<LSP8MetadataContractTestContext>,
) => {
  let context: LSP8MetadataContractTestContext;

  before('setup', async () => {
    context = await buildContext();
  });

  it('should not allow owner to update the `LSP8ReferenceContract` data key', async () => {
    await expect(
      context.lsp8MetadataContract.setData(
        ERC725YDataKeys.LSP8.LSP8ReferenceContract,
        '0xdeadbeef',
      ),
    ).to.be.revertedWithCustomError(
      context.lsp8MetadataContract,
      'LSP8ReferenceContractNotEditable',
    );
  });
};
