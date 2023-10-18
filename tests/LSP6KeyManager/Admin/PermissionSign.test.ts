import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EIP191Signer } from '@lukso/eip191-signer.js';

// constants
import { ERC725YDataKeys, ALL_PERMISSIONS, PERMISSIONS, ERC1271_VALUES } from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

import { LOCAL_PRIVATE_KEYS } from '../../utils/helpers';

export const shouldBehaveLikePermissionSign = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress, nonSigner: SignerWithAddress;

  const dataToSign = '0xcafecafe';

  before(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    nonSigner = context.accounts[2];

    const permissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + signer.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + nonSigner.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS, PERMISSIONS.SIGN, PERMISSIONS.CALL];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe('when address has ALL PERMISSIONS', () => {
    describe('should verify the signature, regardless of how it was signed', () => {
      it('e.g: with Ethereum signed message', async () => {
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await signer.signMessage(dataToSign);

        const result = await context.keyManager.callStatic.isValidSignature(messageHash, signature);
        expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });

      it("e.g: with EIP191Signer '\\x19\\x00'", async () => {
        const lsp6Signer = new EIP191Signer();

        const signedMessage = await lsp6Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          dataToSign,
          LOCAL_PRIVATE_KEYS.ACCOUNT0,
        );

        const result = await context.keyManager.callStatic.isValidSignature(
          signedMessage.messageHash,
          signedMessage.signature,
        );
        expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });
    });
  });

  describe('when address has permission SIGN', () => {
    describe('should verify the signature, regardless of how it was signed', () => {
      it('e.g: Ethereum signed message', async () => {
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await signer.signMessage(dataToSign);

        const result = await context.keyManager.callStatic.isValidSignature(messageHash, signature);
        expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });

      it("e.g: with EIP191Signer '\\x19\\x00'", async () => {
        const lsp6Signer = new EIP191Signer();
        const signedMessage = await lsp6Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          dataToSign,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        const result = await context.keyManager.callStatic.isValidSignature(
          signedMessage.messageHash,
          signedMessage.signature,
        );
        expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });
    });
  });

  describe('when address does not have permission SIGN', () => {
    describe('should fail when verifying a signature, regardless of how it was signed', () => {
      it('e.g: with Ethereum signed message', async () => {
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await nonSigner.signMessage(dataToSign);

        const result = await context.keyManager.callStatic.isValidSignature(messageHash, signature);
        expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
      });

      it("e.g: with EIP191Signer '\\x19\\x00'", async () => {
        const lsp6Signer = new EIP191Signer();
        const signedMessage = await lsp6Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          dataToSign,
          LOCAL_PRIVATE_KEYS.ACCOUNT2,
        );

        const result = await context.keyManager.callStatic.isValidSignature(
          signedMessage.messageHash,
          signedMessage.signature,
        );
        expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
      });
    });
  });
};
