import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  AddressRegistry,
  AddressRegistryRequiresERC725,
  AddressRegistryRequiresERC725__factory,
  AddressRegistry__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from '../../types';

describe('Address Registry contracts', () => {
  let addressRegistry: AddressRegistry;
  let accounts: SignerWithAddress[];

  before(async () => {
    accounts = await ethers.getSigners();
    addressRegistry = await new AddressRegistry__factory(accounts[1]).deploy();
  });

  describe('AddressRegistry', () => {
    it('add address', async () => {
      await addressRegistry.addAddress(accounts[1].address);
      expect(await addressRegistry.getAddress(0)).to.equal(accounts[1].address);
    });

    it('add same address', async () => {
      expect(await addressRegistry.containsAddress(accounts[1].address)).to.be.true;

      await addressRegistry.addAddress(accounts[1].address);
      expect(await addressRegistry.getAddress(0)).to.equal(accounts[1].address);
    });

    it('should add and remove address', async () => {
      await addressRegistry.addAddress(accounts[4].address);
      expect(await addressRegistry.containsAddress(accounts[4].address)).to.be.true;

      await addressRegistry.removeAddress(accounts[4].address);
      expect(await addressRegistry.containsAddress(accounts[4].address)).to.be.false;
    });

    it('should give the right count', async () => {
      expect(await addressRegistry.length()).to.equal('1');
      // add new entry
      await addressRegistry.addAddress(accounts[2].address);
      expect(await addressRegistry.length()).to.equal('2');
    });

    it('get correct index', async () => {
      expect(await addressRegistry.getIndex(accounts[1].address)).to.equal('0');
      expect(await addressRegistry.getIndex(accounts[2].address)).to.equal('1');

      await expect(addressRegistry.getIndex(accounts[4].address)).to.be.revertedWith(
        'EnumerableSet: Index not found',
      );
    });

    it('can list all values of the registry', async () => {
      const length = await (await addressRegistry.length()).toNumber();
      const values = [];

      for (let i = 0; i < length; i++) {
        values.push(await addressRegistry.getAddress(i));
      }

      expect(values).to.deep.equal([accounts[1].address, accounts[2].address]);
    });

    it('can get all raw values in one call', async () => {
      expect(await addressRegistry.getAllRawValues()).to.deep.equal([
        '0x000000000000000000000000' + accounts[1].address.replace('0x', '').toLowerCase(),
        '0x000000000000000000000000' + accounts[2].address.replace('0x', '').toLowerCase(),
      ]);
    });
  });

  // Require ERC725
  describe('AddressRegistryRequiresERC725', () => {
    let addressRegistryRequireERC725: AddressRegistryRequiresERC725,
      account: UniversalProfile,
      owner: SignerWithAddress;

    before(async () => {
      owner = accounts[3];
      account = await new UniversalProfile__factory(owner).deploy(owner.address);
      addressRegistryRequireERC725 = await new AddressRegistryRequiresERC725__factory(
        owner,
      ).deploy();
    });

    it('add address', async () => {
      const abi = addressRegistryRequireERC725.interface.encodeFunctionData('addAddress', [
        account.address,
      ]);

      await account.connect(owner).execute(0, addressRegistryRequireERC725.address, 0, abi, {
        gasLimit: 3_000_000,
      });
      expect(await addressRegistryRequireERC725.getAddress(0)).to.equal(account.address);
    });

    it('external account adds address', async () => {
      await addressRegistryRequireERC725.connect(accounts[5]).addAddress(account.address);
      expect(await addressRegistryRequireERC725.getAddress(0)).to.equal(account.address);
    });

    it('remove address', async () => {
      const abi = addressRegistryRequireERC725.interface.encodeFunctionData('removeAddress', [
        account.address,
      ]);

      await account.connect(owner).execute(0, addressRegistryRequireERC725.address, 0, abi);
      expect(await addressRegistryRequireERC725.containsAddress(account.address)).to.equal(false);
    });

    it('should fail if called by a regular address', async () => {
      // simply reverts as no ERC165 is detected
      await expect(addressRegistryRequireERC725.addAddress(accounts[5].address)).to.be.reverted;
    });
  });
});
