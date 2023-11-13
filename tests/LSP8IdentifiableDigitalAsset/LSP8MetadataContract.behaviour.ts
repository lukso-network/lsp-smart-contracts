import { expect } from 'chai';
import { hexDataSlice, hexZeroPad, solidityPack, zeroPad } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

import { LSP8MetadataContract, LSP8MetadataContract__factory } from '../../types';
import { ERC725YDataKeys } from '../../constants';
import { abiCoder } from '../utils/helpers';

type LSP8MetadataContractTokenIdTypAddressTestContext = {
  lsp8MetadataContract: LSP8MetadataContract;
  deployParams: {
    contractOwner: SignerWithAddress;
    referenceContract: string; // TODO: improve type to use address
  };
};

const shouldInitializeLikeLSP8MetadataContractTokenIdTypeAddress = () =>
  //   buildContext: () => Promise<LSP8MetadataContractTokenIdTypAddressTestContext>,
  {
    // let context: LSP8MetadataContractTokenIdTypAddressTestContext;
    let lsp8MetadataContract: LSP8MetadataContract;

    let deployParams: {
      contractOwner: SignerWithAddress;
      referenceContract: string; // TODO: improve type to use address
    };

    before('setup', async () => {
      const accounts = await ethers.getSigners();

      deployParams = {
        contractOwner: accounts[0],
        referenceContract: ethers.Wallet.createRandom().address, // TODO: improve type to use address
      };

      lsp8MetadataContract = await new LSP8MetadataContract__factory(accounts[0]).deploy(
        deployParams.contractOwner.address,
        deployParams.referenceContract,
      );
    });

    describe('should have set the `LSP8ReferenceContract` data key correctly', () => {
      it('value must be 52 bytes long', async () => {
        const lsp8ReferenceContractValue = await lsp8MetadataContract.getData(
          ERC725YDataKeys.LSP8.LSP8ReferenceContract,
        );

        const numberOfBytes = (lsp8ReferenceContractValue.length - 2) / 2; // 0x is 2 bytes, 2 characters make 1 byte
        expect(numberOfBytes).to.equal(52);

        // bytes32 tokenId (= the address of this LSP8 Metadata contract)
        // should be padded with zeros on the right
        const tokenIdAddressRightPaddedAsBytes32 = lsp8MetadataContract.address + '00'.repeat(12);

        const expectedValue = solidityPack(
          ['address', 'bytes32'],
          [deployParams.referenceContract, tokenIdAddressRightPaddedAsBytes32],
        );
        expect(lsp8ReferenceContractValue).to.equal(expectedValue);
      });

      it('first 20 bytes must be the `address` of the reference contract provided on deployment', async () => {
        const lsp8ReferenceContractValue = await lsp8MetadataContract.getData(
          ERC725YDataKeys.LSP8.LSP8ReferenceContract,
        );

        const first20Bytes = hexDataSlice(lsp8ReferenceContractValue, 0, 20);
        expect(ethers.utils.getAddress(first20Bytes)).to.equal(deployParams.referenceContract);
      });

      it('next 32 bytes must be the `tokenId` = the address of this metadata contract, right padded with 12 zeros', async () => {
        const lsp8ReferenceContractValue = await lsp8MetadataContract.getData(
          ERC725YDataKeys.LSP8.LSP8ReferenceContract,
        );

        const last32Bytes = hexDataSlice(lsp8ReferenceContractValue, 20, 52);
        const expectedValue = lsp8MetadataContract.address.toLocaleLowerCase() + '00'.repeat(12);
        expect(last32Bytes).to.equal(expectedValue);
      });
    });
  };

const shouldBehaveLikeLSP8MetadataContractTokenIdTypeAddress = () =>
  //   buildContext: () => Promise<LSP8MetadataContractTokenIdTypAddressTestContext>,
  {
    let lsp8MetadataContract: LSP8MetadataContract;

    let deployParams: {
      contractOwner: SignerWithAddress;
      referenceContract: string; // TODO: improve type to use address
    };

    before('setup', async () => {
      const accounts = await ethers.getSigners();

      deployParams = {
        contractOwner: accounts[0],
        referenceContract: ethers.Wallet.createRandom().address, // TODO: improve type to use address
      };

      lsp8MetadataContract = await new LSP8MetadataContract__factory(accounts[0]).deploy(
        deployParams.contractOwner.address,
        deployParams.referenceContract,
      );
    });

    it('should not allow owner to update the `LSP8ReferenceContract` data key', async () => {
      await expect(
        lsp8MetadataContract.setData(ERC725YDataKeys.LSP8.LSP8ReferenceContract, '0xdeadbeef'),
      ).to.be.revertedWithCustomError(lsp8MetadataContract, 'LSP8ReferenceContractNotEditable');
    });
  };

describe('testing LSP8MetadataContract', () => {
  shouldInitializeLikeLSP8MetadataContractTokenIdTypeAddress();
  shouldBehaveLikeLSP8MetadataContractTokenIdTypeAddress();
});
