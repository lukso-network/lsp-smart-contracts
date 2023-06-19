import { expect } from 'chai';
import { ethers } from 'hardhat';
import { EIP191Signer } from '@lukso/eip191-signer.js';

import {
  EIP191SignerTester__factory,
  UniversalProfile__factory,
  LSP6KeyManager__factory,
} from '../../types';

describe('EIP191Signer', () => {
  describe('when using `toDataWithIntendedValidator(...)`', () => {
    it('should return the same hash than the EIP191Signer library', async () => {
      const data = 'example';

      const accounts = await ethers.getSigners();
      const owner = accounts[0];

      const universalProfile = await new UniversalProfile__factory(owner).deploy(owner.address);
      const keyManager = await new LSP6KeyManager__factory(accounts[0]).deploy(
        universalProfile.address,
      );

      const eip191SignerContract = await new EIP191SignerTester__factory(accounts[0]).deploy();
      const eip191SignerLib = new EIP191Signer();

      const libraryResult = eip191SignerLib.hashDataWithIntendedValidator(keyManager.address, data);

      const solidityResult = await eip191SignerContract.toDataWithIntendedValidator(
        keyManager.address,
        ethers.utils.toUtf8Bytes(data),
      );

      expect(solidityResult).to.equal(libraryResult);
    });
  });
});
