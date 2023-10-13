import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BytesLike } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  LSP6KeyManager,
  LSP6KeyManager__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
  LSP7Tester__factory,
  LSP8Mintable,
  LSP0ERC725Account__factory,
} from '../../types';

import { ERC725YDataKeys, ALL_PERMISSIONS, PERMISSIONS, ERC1271_VALUES } from '../../constants';
import { ARRAY_LENGTH, encodeCompactBytesArray } from '../utils/helpers';

export type LSP6ControlledToken = {
  accounts: SignerWithAddress[];
  token: LSP7Mintable | LSP8Mintable;
  keyManager: LSP6KeyManager;
  mainController: SignerWithAddress;
};

const buildContext = async () => {
  const accounts = await ethers.getSigners();

  const lsp7 = await new LSP7Mintable__factory(accounts[0]).deploy(
    'name',
    'symbol',
    accounts[0].address,
    true,
  );

  const keyManager = await new LSP6KeyManager__factory(accounts[0]).deploy(lsp7.address);

  const keys = [
    ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
    ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + accounts[0].address.substring(2),
  ];

  const values = [ARRAY_LENGTH.ONE, accounts[0].address, ALL_PERMISSIONS];

  await lsp7.connect(accounts[0]).setDataBatch(keys, values);
  await lsp7.connect(accounts[0]).transferOwnership(keyManager.address);

  return {
    accounts,
    token: lsp7,
    keyManager,
    mainController: accounts[0],
  };
};

const addControllerWithPermission = async (
  context: LSP6ControlledToken,
  account: SignerWithAddress,
  arrayLength,
  arrayIndex: BytesLike,
  permissions: BytesLike,
) => {
  const keys = [
    ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
    ERC725YDataKeys.LSP6['AddressPermissions[]'].index + arrayIndex,
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + account.address.substring(2),
  ];

  const values = [arrayLength, account.address, permissions];

  const payload = context.token.interface.encodeFunctionData('setDataBatch', [keys, values]);

  await context.keyManager.connect(context.mainController).execute(payload);
};

describe('When deploying LSP7 with LSP6 as owner', () => {
  let context: LSP6ControlledToken;

  let newOwner: SignerWithAddress;
  let anotherNewOwner: SignerWithAddress;

  let addressCanChangeOwner: SignerWithAddress;
  let addressCanEditPermissions: SignerWithAddress;
  let addressCanAddController: SignerWithAddress;
  let addressCanSetData: SignerWithAddress;
  let addressCanSign: SignerWithAddress;

  before(async () => {
    context = await buildContext();

    newOwner = context.accounts[1];
    anotherNewOwner = context.accounts[2];

    addressCanChangeOwner = context.accounts[1];
    addressCanEditPermissions = context.accounts[2];
    addressCanAddController = context.accounts[3];
    addressCanSetData = context.accounts[4];
    addressCanSign = context.accounts[5];
  });

  it('should have lsp6 as owner of the lsp7', async () => {
    expect(await context.token.owner()).to.equal(context.keyManager.address);
  });

  it('should set the necessary controller permissions correctly', async () => {
    const keys = [
      ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
      ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
    ];

    const values = [ARRAY_LENGTH.ONE, context.mainController.address, ALL_PERMISSIONS];

    expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
  });

  describe('when trying to call mint(..) function on  in LSP7 through LSP6', () => {
    it('should revert because function does not exist on LSP6', async () => {
      const LSP7 = context.token as LSP7Mintable;
      const mintPayload = LSP7.interface.encodeFunctionData('mint', [
        context.mainController.address,
        1,
        true,
        '0x',
      ]);

      await expect(context.keyManager.connect(context.mainController).execute(mintPayload))
        .to.be.revertedWithCustomError(context.keyManager, 'InvalidERC725Function')
        .withArgs(mintPayload.substring(0, 10));
    });
  });

  describe('using renounceOwnership(..) in LSP7 through LSP6', () => {
    it('should pass', async () => {
      const renounceOwnershipPayload =
        context.token.interface.encodeFunctionData('renounceOwnership');

      await context.keyManager.connect(context.mainController).execute(renounceOwnershipPayload);

      expect(await context.token.owner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe('using transferOwnership(..) in LSP7 through LSP6', () => {
    before("previous token contract's ownership was renounced, build new context", async () => {
      context = await buildContext();
    });

    it('should change the owner of LSP7 contract', async () => {
      const LSP7 = context.token as LSP7Mintable;
      const transferOwnershipPayload = LSP7.interface.encodeFunctionData('transferOwnership', [
        newOwner.address,
      ]);

      await context.keyManager.connect(context.mainController).execute(transferOwnershipPayload);

      expect(await context.token.owner()).to.equal(newOwner.address);
    });

    it("`setData(...)` -> should revert with 'caller is not the owner' error.", async () => {
      const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString'));
      const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('SecondRandomString'));
      const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

      await expect(
        context.keyManager.connect(context.mainController).execute(payload),
      ).to.be.revertedWithCustomError(context.token, 'OwnableCallerNotTheOwner');
    });

    it('should allow the new owner to call setData(..)', async () => {
      const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString'));
      const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('SecondRandomString'));

      await context.token.connect(newOwner).setData(key, value);

      expect(await context.token.getData(key)).to.equal(value);
    });

    it("`mint(..)` -> should revert with 'InvalidERC725Function' error.", async () => {
      const LSP7 = context.token as LSP7Mintable;
      const mintPayload = LSP7.interface.encodeFunctionData('mint', [
        context.mainController.address,
        1,
        true,
        '0x',
      ]);

      await expect(context.keyManager.connect(context.mainController).execute(mintPayload))
        .to.be.revertedWithCustomError(context.keyManager, 'InvalidERC725Function')
        .withArgs(mintPayload.substring(0, 10));
    });

    it('should allow the new owner to call mint(..)', async () => {
      const LSP7 = context.token as LSP7Mintable;

      await LSP7.connect(newOwner).mint(context.mainController.address, 1, true, '0x');

      expect(await LSP7.balanceOf(context.mainController.address)).to.equal(1);
    });

    it("`transferOwnership(..)` -> should revert with 'caller is not the owner' error.", async () => {
      const transferOwnershipPayload = context.token.interface.encodeFunctionData(
        'transferOwnership',
        [context.accounts[1].address],
      );

      await expect(
        context.keyManager.connect(context.mainController).execute(transferOwnershipPayload),
      ).to.be.revertedWithCustomError(context.token, 'OwnableCallerNotTheOwner');
    });

    it('should allow the new owner to call transferOwnership(..)', async () => {
      await context.token.connect(newOwner).transferOwnership(anotherNewOwner.address);

      expect(await context.token.owner()).to.equal(anotherNewOwner.address);
    });

    it("`renounceOwnership(..)` -> should revert with 'caller is not the owner' error.", async () => {
      const renounceOwnershipPayload =
        context.token.interface.encodeFunctionData('renounceOwnership');

      await expect(
        context.keyManager.connect(context.mainController).execute(renounceOwnershipPayload),
      ).to.be.revertedWithCustomError(context.token, 'OwnableCallerNotTheOwner');
    });

    it('should allow the new owner to call renounceOwnership(..)', async () => {
      await context.token.connect(anotherNewOwner).renounceOwnership();

      expect(await context.token.owner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe('using setData(..) in lSP7 through LSP6', () => {
    before(async () => {
      context = await buildContext();
    });

    describe('testing CHANGEOWNER permission', () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanChangeOwner,
          ARRAY_LENGTH.TWO,
          '0'.repeat(31) + '1',
          PERMISSIONS.CHANGEOWNER,
        );
      });

      it('should add the new controller without changing other controllers', async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '1',
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanChangeOwner.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.TWO,
          context.mainController.address,
          addressCanChangeOwner.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
        ];

        expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
      });

      it("should revert if the caller doesn't have CHANGEOWNER permission when using `transferOwnership(..)`", async () => {
        const transferOwnershipPayload = context.token.interface.encodeFunctionData(
          'transferOwnership',
          [addressCanChangeOwner.address],
        );

        expect(
          context.keyManager.connect(addressCanEditPermissions).execute(transferOwnershipPayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet')
          .withArgs(addressCanEditPermissions.address);
      });

      it('should change the owner of LSP7 contract when using `transferOwnership(..)`', async () => {
        const transferOwnershipPayload = context.token.interface.encodeFunctionData(
          'transferOwnership',
          [addressCanChangeOwner.address],
        );

        await context.keyManager.connect(addressCanChangeOwner).execute(transferOwnershipPayload);

        expect(await context.token.owner()).to.equal(addressCanChangeOwner.address);
      });

      after(async () => {
        await context.token
          .connect(addressCanChangeOwner)
          .transferOwnership(context.keyManager.address);
      });
    });

    describe('testing EDITPERMISSIONS permission', () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanEditPermissions,
          ARRAY_LENGTH.THREE,
          '0'.repeat(31) + '2',
          PERMISSIONS.EDITPERMISSIONS,
        );
      });

      it('should add the new controller without changing other controllers', async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '1',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '2',
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanChangeOwner.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanEditPermissions.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.THREE,
          context.mainController.address,
          addressCanChangeOwner.address,
          addressCanEditPermissions.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.EDITPERMISSIONS,
        ];

        expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
      });

      it("should revert if caller doesn't have EDITPERMISSIONS permission", async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2);
        const value = PERMISSIONS.CALL;
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await expect(context.keyManager.connect(addressCanChangeOwner).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCanChangeOwner.address, 'EDITPERMISSIONS');
      });

      it('should change ALL_PERMISSIONS to CALL permission of the address', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2);
        const value = PERMISSIONS.CALL;
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await context.keyManager.connect(addressCanEditPermissions).execute(payload);

        expect(await context.token.getData(key)).to.equal(value);
      });

      it('should add back ALL_PERMISSIONS of the address', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2);
        const value = ALL_PERMISSIONS;
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await context.keyManager.connect(addressCanEditPermissions).execute(payload);

        expect(await context.token.getData(key)).to.equal(value);
      });
    });

    describe('testing ADDCONTROLLER permission', () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanAddController,
          ARRAY_LENGTH.FOUR,
          '0'.repeat(31) + '3',
          PERMISSIONS.ADDCONTROLLER,
        );
      });

      it('should add the new controller without changing other controllers', async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '1',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '2',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '3',
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanChangeOwner.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanEditPermissions.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanAddController.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.FOUR,
          context.mainController.address,
          addressCanChangeOwner.address,
          addressCanEditPermissions.address,
          addressCanAddController.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.EDITPERMISSIONS,
          PERMISSIONS.ADDCONTROLLER,
        ];

        expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
      });

      it('should be allowed to add a new controller with some permissions', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanSetData.address.substring(2);
        const value = ALL_PERMISSIONS;
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await context.keyManager.connect(addressCanAddController).execute(payload);

        expect(await context.token.getData(key)).to.equal(value);
      });

      it('should not be authorized to edit permissions of an existing controller (e.g: removing permissions)', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanSetData.address.substring(2);
        const value = '0x';
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await expect(context.keyManager.connect(addressCanAddController).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCanAddController.address, 'EDITPERMISSIONS');
      });

      after(async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanSetData.address.substring(2);
        const value = '0x';
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await context.keyManager.connect(context.mainController).execute(payload);
      });
    });

    describe('testing SETDATA permission', () => {
      const firstRandomSringKey = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('FirstRandomString'),
      );
      const secondRandomSringKey = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('SecondRandomString'),
      );
      const notAllowedKey = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('Not Allowed ERC725Y data key'),
      );

      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanSetData,
          ARRAY_LENGTH.FIVE,
          '0'.repeat(31) + '4',
          PERMISSIONS.SETDATA,
        );
      });

      it('should add the new controller without changing other controllers', async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '1',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '2',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '3',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '4',
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanChangeOwner.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanEditPermissions.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanAddController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanSetData.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.FIVE,
          context.mainController.address,
          addressCanChangeOwner.address,
          addressCanEditPermissions.address,
          addressCanAddController.address,
          addressCanSetData.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.EDITPERMISSIONS,
          PERMISSIONS.ADDCONTROLLER,
          PERMISSIONS.SETDATA,
        ];

        expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
      });

      it('should not allow second controller to use setData without AllowedERC725YDataKeys', async () => {
        const key = firstRandomSringKey;
        const value = secondRandomSringKey;
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await expect(context.keyManager.connect(addressCanSetData).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed')
          .withArgs(addressCanSetData.address);
      });

      it('should restrict second controller with AllowedERC725YDataKeys', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          addressCanSetData.address.substring(2);
        const value = encodeCompactBytesArray([firstRandomSringKey.substring(0, 34)]);
        const payload = context.token.interface.encodeFunctionData('setData', [key, value]);

        await context.keyManager.connect(context.mainController).execute(payload);

        expect(await context.token.getData(key)).to.equal(value);
      });

      it('should change allowed keys', async () => {
        const keys = [
          firstRandomSringKey,
          firstRandomSringKey.substring(0, 34) + '0'.repeat(31) + '0',
          firstRandomSringKey.substring(0, 34) + '0'.repeat(31) + '1',
          firstRandomSringKey.substring(0, 34) + '0'.repeat(31) + '2',
          firstRandomSringKey.substring(0, 34) + '0'.repeat(31) + '3',
        ];
        const values = [
          ARRAY_LENGTH.FOUR,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString0')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString1')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString2')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString3')),
        ];
        const payload = context.token.interface.encodeFunctionData('setDataBatch', [keys, values]);

        await context.keyManager.connect(addressCanSetData).execute(payload);

        expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
      });

      it('should revert when trying to change a key that is not allowed', async () => {
        const keys = [
          notAllowedKey,
          notAllowedKey.substring(0, 34) + '0'.repeat(31) + '0',
          notAllowedKey.substring(0, 34) + '0'.repeat(31) + '1',
          notAllowedKey.substring(0, 34) + '0'.repeat(31) + '2',
          notAllowedKey.substring(0, 34) + '0'.repeat(31) + '3',
        ];
        const values = [
          ARRAY_LENGTH.FOUR,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString0')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString1')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString2')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FirstRandomString3')),
        ];
        const payload = context.token.interface.encodeFunctionData('setDataBatch', [keys, values]);

        await expect(context.keyManager.connect(addressCanSetData).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedERC725YDataKey')
          .withArgs(addressCanSetData.address, notAllowedKey);
      });
    });

    /**
     * Testing the following permissions is skipped because
     * execute(..) is not available in a token contract.
     *
     * CALL
     * STATICCALL
     * DELEGATECALL
     * DEPLOY
     * TRANSFERVALUE
     */
    describe('when trying to call execute(..) function on LSP7 through LSP6', () => {
      it('should revert because function does not exist on LSP7', async () => {
        // deploying a dummy token contract with public mint function
        const newTokenContract = await new LSP7Tester__factory(context.mainController).deploy(
          'NewTokenName',
          'NewTokenSymbol',
          context.mainController.address,
        );
        // creating a payload to mint tokens in the new contract
        const mintPayload = newTokenContract.interface.encodeFunctionData('mint', [
          context.mainController.address,
          1000,
          true,
          '0x',
        ]);

        const payload = LSP0ERC725Account__factory.createInterface().encodeFunctionData('execute', [
          0,
          newTokenContract.address,
          0,
          mintPayload,
        ]);

        await expect(
          context.keyManager.connect(context.mainController).execute(payload),
        ).to.be.revertedWithCustomError(newTokenContract, 'NoExtensionFoundForFunctionSelector');
      });
    });

    describe('testing SIGN permission', () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanSign,
          ARRAY_LENGTH.SIX,
          '0'.repeat(31) + '5',
          PERMISSIONS.SIGN,
        );
      });

      it('should add the new controller without changing other controllers', async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '0',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '1',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '2',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '3',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '4',
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '0'.repeat(31) + '5',
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanChangeOwner.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanEditPermissions.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanAddController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanSetData.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressCanSign.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.SIX,
          context.mainController.address,
          addressCanChangeOwner.address,
          addressCanEditPermissions.address,
          addressCanAddController.address,
          addressCanSetData.address,
          addressCanSign.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.EDITPERMISSIONS,
          PERMISSIONS.ADDCONTROLLER,
          PERMISSIONS.SETDATA,
          PERMISSIONS.SIGN,
        ];

        expect(await context.token.getDataBatch(keys)).to.deep.equal(values);
      });

      it('should be allowed to sign messages for the token contract', async () => {
        const dataHash = ethers.utils.hashMessage('Some random message');
        const signature = await addressCanSign.signMessage('Some random message');
        const validityOfTheSig = await context.keyManager.isValidSignature(dataHash, signature);

        expect(validityOfTheSig).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });

      it('should not be allowed to sign messages for the token contract', async () => {
        const dataHash = ethers.utils.hashMessage('Some random message');
        const signature = await addressCanChangeOwner.signMessage('Some random message');
        const validityOfTheSig = await context.keyManager.isValidSignature(dataHash, signature);

        expect(validityOfTheSig).to.equal(ERC1271_VALUES.FAIL_VALUE);
      });
    });
  });
});
