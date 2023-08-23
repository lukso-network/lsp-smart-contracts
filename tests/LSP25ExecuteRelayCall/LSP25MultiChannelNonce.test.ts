import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP25_VERSION } from '../../constants';
import { LOCAL_PRIVATE_KEYS } from '../utils/helpers';
import { EIP191Signer } from '@lukso/eip191-signer.js';

import { LSP25MultiChannelNonceTester, LSP25MultiChannelNonceTester__factory } from '../../types';

describe('LSP25MultiChannelNonce', () => {
  let contract: LSP25MultiChannelNonceTester;
  let account;

  const HARDHAT_CHAINID = 31337;

  const eip191Signer = new EIP191Signer();
  const signerPrivateKey = LOCAL_PRIVATE_KEYS.ACCOUNT0;

  before(async () => {
    account = (await ethers.getSigners())[0];

    contract = await new LSP25MultiChannelNonceTester__factory(account).deploy();
  });

  describe('testing `_isValidNonce`', () => {
    it('should return `true` when providing a valid nonce', async () => {
      const nonce = await contract.getNonce(account.address, 0);
      const result = await contract.isValidNonce(account.address, nonce);
      expect(result).to.be.true;
    });

    it('should return `false` if the wrong nonce provided', async () => {
      const nonce = await contract.getNonce(account.address, 0);
      const invalidNonce = 35;
      expect(nonce).to.not.equal(invalidNonce); // sanity check

      const result = await contract.isValidNonce(account.address, invalidNonce);
      expect(result).to.be.false;
    });
  });

  describe('testing `_recoverSignerFromLSP25Signature`', () => {
    it('should pass and recover the right address if the data was signed with LSP25 signature format', async () => {
      const channelId = 0;

      const parameters = {
        nonce: await contract.getNonce(account.address, channelId),
        validityTimestamps: 0,
        valueToSend: 0,
        payload: '0xcafecafe',
      };

      const encodedMessage = ethers.utils.solidityPack(
        ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
        [
          LSP25_VERSION,
          HARDHAT_CHAINID,
          parameters.nonce,
          parameters.validityTimestamps,
          parameters.valueToSend,
          parameters.payload,
        ],
      );

      const { signature } = await eip191Signer.signDataWithIntendedValidator(
        contract.address,
        encodedMessage,
        signerPrivateKey,
      );

      const recoveredAddress = await contract.recoverSignerFromLSP25Signature(
        signature,
        parameters.nonce,
        parameters.validityTimestamps,
        parameters.valueToSend,
        parameters.payload,
      );
      expect(recoveredAddress).to.equal(account.address);
    });

    it('should return the wrong address if the data was signed with version different than 25', async () => {
      const channelId = 0;

      const parameters = {
        nonce: await contract.getNonce(account.address, channelId),
        validityTimestamps: 0,
        valueToSend: 0,
        payload: '0xcafecafe',
      };

      const encodedMessage = ethers.utils.solidityPack(
        ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
        [
          12345, // incorrect version number
          HARDHAT_CHAINID,
          parameters.nonce,
          parameters.validityTimestamps,
          parameters.valueToSend,
          parameters.payload,
        ],
      );

      const { signature } = await eip191Signer.signDataWithIntendedValidator(
        contract.address,
        encodedMessage,
        signerPrivateKey,
      );

      const recoveredAddress = await contract.recoverSignerFromLSP25Signature(
        signature,
        parameters.nonce,
        parameters.validityTimestamps,
        parameters.valueToSend,
        parameters.payload,
      );
      expect(recoveredAddress).to.not.equal(account.address);
    });

    it('should return the wrong address if the data was signed with an invalid nonce', async () => {
      const parameters = {
        nonce: 12345,
        validityTimestamps: 0,
        valueToSend: 0,
        payload: '0xcafecafe',
      };

      const encodedMessage = ethers.utils.solidityPack(
        ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
        [
          12345, // incorrect version number
          HARDHAT_CHAINID,
          parameters.nonce,
          parameters.validityTimestamps,
          parameters.valueToSend,
          parameters.payload,
        ],
      );

      const { signature } = await eip191Signer.signDataWithIntendedValidator(
        contract.address,
        encodedMessage,
        signerPrivateKey,
      );

      const recoveredAddress = await contract.recoverSignerFromLSP25Signature(
        signature,
        parameters.nonce,
        parameters.validityTimestamps,
        parameters.valueToSend,
        parameters.payload,
      );
      expect(recoveredAddress).to.not.equal(account.address);
    });
  });
});
