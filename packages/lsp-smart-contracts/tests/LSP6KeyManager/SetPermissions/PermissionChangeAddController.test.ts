import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, ALL_PERMISSIONS, PERMISSIONS } from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

// helpers
import { combinePermissions, encodeCompactBytesArray } from '../../utils/helpers';

async function setupPermissions(
  context: LSP6TestContext,
  permissionsKeys: string[],
  permissionValues: string[],
) {
  const setupPayload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
    permissionsKeys,
    permissionValues,
  ]);

  await context.keyManager.connect(context.mainController).execute(setupPayload);
}

/**
 * @dev fixture to reset all the permissions to 0x
 */
async function resetPermissions(context: LSP6TestContext, permissionsKeys: string[]) {
  const teardownPayload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
    permissionsKeys,
    Array(permissionsKeys.length).fill('0x'),
  ]);

  await context.keyManager.connect(context.mainController).execute(teardownPayload);
}

export const shouldBehaveLikePermissionChangeOrAddController = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let permissionKeys: string[] = [];
  let permissionValues: string[] = [];

  let permissionArrayKeys: string[] = [];
  let permissionArrayValues: string[] = [];

  // addresses with not 32 bytes long permissions value set
  // used to check that the caller editing the permissions value for these controllers requires the permission ADDCONTROLLER,
  const callerHasAllPermissionsTestCase = {
    addressWith16BytesHexPermissionsLength: '',
    addressWith40BytesHexPermsissionsLength: '',
  };

  const callerHasAddControllerTestCase = {
    addressWith16BytesHexPermissionsLength: '',
    addressWith40BytesHexPermsissionsLength: '',
  };

  const callerHasEditPermissionsTestCase = {
    addressWith16BytesHexPermissionsLength: '',
    addressWith40BytesHexPermsissionsLength: '',
  };

  const callerHasSetDataTestCase = {
    addressWith16BytesHexPermissionsLength: '',
    addressWith40BytesHexPermsissionsLength: '',
  };

  before('setup', async () => {
    context = await buildContext();

    callerHasAllPermissionsTestCase.addressWith16BytesHexPermissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasAllPermissionsTestCase.addressWith40BytesHexPermsissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasAddControllerTestCase.addressWith16BytesHexPermissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasAddControllerTestCase.addressWith40BytesHexPermsissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasEditPermissionsTestCase.addressWith16BytesHexPermissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasEditPermissionsTestCase.addressWith40BytesHexPermsissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasSetDataTestCase.addressWith16BytesHexPermissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    callerHasSetDataTestCase.addressWith40BytesHexPermsissionsLength =
      ethers.Wallet.createRandom().address.toLowerCase();

    const firstSetupPermissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasAllPermissionsTestCase.addressWith16BytesHexPermissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasAllPermissionsTestCase.addressWith40BytesHexPermsissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasAddControllerTestCase.addressWith16BytesHexPermissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasAddControllerTestCase.addressWith40BytesHexPermsissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasEditPermissionsTestCase.addressWith16BytesHexPermissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasEditPermissionsTestCase.addressWith40BytesHexPermsissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasSetDataTestCase.addressWith16BytesHexPermissionsLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        callerHasSetDataTestCase.addressWith40BytesHexPermsissionsLength.substring(2),
    ];

    // We need to setup these first from the start, as the setup and teardown in the tests reset the permissions via the Key Manager,
    // as the Key Manager will revert with custom error `InvalidDataValuesForDataKeys(AddressPermissions:Permissions:<controller>, invalidPermissionValue)`
    const firstSetupPermissionsValues = [
      // 16 bytes long hex string = not 32 bytes long = equivalent to No Permissions Set
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      // 40 bytes long hex string = not 32 bytes long = equivalent to No Permissions Set
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      // same for other controllers (just repeated)
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ];

    await setupKeyManager(
      context,
      [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ...firstSetupPermissionsKeys,
      ],
      [ALL_PERMISSIONS, ...firstSetupPermissionsValues],
    );
  });

  describe('setting permissions keys (EDIT vs ADD Permissions)', () => {
    // this data key is hardcoded to be removed in teardown
    const permissionArrayIndexToAdd =
      ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000006';

    // this data key is hardcoded for readability
    const permissionArrayIndexToEdit =
      ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000004';

    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress,
      canOnlySetData: SignerWithAddress,
      // addresses being used to CHANGE (= edit) permissions
      addressToEditPermissions: SignerWithAddress,
      addressWithZeroHexPermissions: SignerWithAddress;

    before('prepare permissions data keys', async () => {
      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];
      canOnlySetData = context.accounts[3];
      addressToEditPermissions = context.accounts[4];
      addressWithZeroHexPermissions = context.accounts[5];

      permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlySetData.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressToEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressWithZeroHexPermissions.address.substring(2),
      ];

      permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.SETDATA,
        // placeholder permission
        PERMISSIONS.TRANSFERVALUE,
        // `bytes32(0)` = similar to empty, or 'no permissions set'
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ];

      permissionArrayKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000000',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000001',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000002',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000003',
        permissionArrayIndexToEdit,
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000005',
      ];

      permissionArrayValues = [
        ethers.utils.hexZeroPad(ethers.utils.hexlify(6), 16),
        context.mainController.address,
        canOnlyAddController.address,
        canOnlyEditPermissions.address,
        canOnlySetData.address,
        addressToEditPermissions.address,
        addressWithZeroHexPermissions.address,
      ];
    });

    describe('when setting one permission key', () => {
      describe('when caller is an address with ALL PERMISSIONS', () => {
        // ----------------------
        // because we are editing ther permissions of a controller,
        // we need to setup + teardown for each describe blocks
        // related to each controller making the change
        before('setup permissions', async () => {
          // setup AddressPersmissions:Permissions:<controllers>
          await setupPermissions(context, permissionKeys, permissionValues);

          // setup AddressPermissions[]
          await setupPermissions(context, permissionArrayKeys, permissionArrayValues);
        });

        after('reset permissions', async () => {
          await resetPermissions(context, [
            ...permissionKeys,
            ...permissionArrayKeys,
            permissionArrayIndexToAdd,
          ]);
        });

        it('should be allowed to ADD a permission', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            newController.address.substr(2);

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            PERMISSIONS.SETDATA,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(PERMISSIONS.SETDATA);
        });

        it('should be allowed to EDIT a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('should be allowed to ADD a new controller if this address has a 16 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasAllPermissionsTestCase.addressWith16BytesHexPermissionsLength.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);
          expect(await context.universalProfile.getData(key)).to.equal(value);
        });

        it('should be allowed to ADD a new controller if this address has a 40 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasAllPermissionsTestCase.addressWith40BytesHexPermsissionsLength.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);
          expect(await context.universalProfile.getData(key)).to.equal(value);
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it('should be allowed to increment the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(context.mainController).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should be allowed to decrement the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(context.mainController).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        describe('when adding a new address at index -> AddressPermissions[6]', () => {
          it('should be allowed to set a 20 bytes long address', async () => {
            const key = permissionArrayIndexToAdd;
            const value = ethers.Wallet.createRandom().address.toLowerCase();

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(context.mainController).execute(payload);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key = permissionArrayIndexToAdd;
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(context.mainController).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key = permissionArrayIndexToAdd;
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(context.mainController).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when editing the value stored at index -> AddressPermissions[4]', () => {
          it('should be allowed to set a new 20 bytes long address', async () => {
            const randomWallet = ethers.Wallet.createRandom();

            const key = permissionArrayIndexToEdit;

            const value = randomWallet.address;

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(context.mainController).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key = permissionArrayIndexToEdit;
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(context.mainController).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key = permissionArrayIndexToEdit;
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(context.mainController).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should pass', async () => {
            const key = permissionArrayIndexToEdit;

            const value = '0x';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(context.mainController).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        // this include any permission data key that start with bytes6(keccak256('AddressPermissions'))
        describe('if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key', () => {
          it('should revert', async () => {
            const beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            const key = '0x4b80742de2bf9e659ba40000' + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            const value = '0x0000000000000000000000000000000000000000000000000000000000000008';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(context.mainController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotRecognisedPermissionKey')
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe('when caller is an address with permission ADDCONTROLLER', () => {
        // ----------------------
        // because we are editing ther permissions of a controller,
        // we need to setup + teardown for each describe blocks
        // related to each controller making the change
        before('setup permissions', async () => {
          // setup AddressPersmissions:Permissions:<controllers>
          await setupPermissions(context, permissionKeys, permissionValues);

          // setup AddressPermissions[]
          await setupPermissions(context, permissionArrayKeys, permissionArrayValues);
        });

        after('reset permissions', async () => {
          // teardown in one batch `setData(bytes32[])` for efficiency
          await resetPermissions(context, [
            ...permissionKeys,
            ...permissionArrayKeys,
            permissionArrayIndexToAdd,
          ]);
        });

        it('should be allowed to ADD a new controller', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            newController.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('should not be allowed to EDIT a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        it('should be allowed to ADD a new controller if this address has a 16 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasAddControllerTestCase.addressWith16BytesHexPermissionsLength.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);
          expect(await context.universalProfile.getData(key)).to.equal(value);
        });

        it('should be allowed to ADD a new controller if this address has a 40 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasAddControllerTestCase.addressWith40BytesHexPermsissionsLength.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);
          expect(await context.universalProfile.getData(key)).to.equal(value);
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it('should be allowed to increment the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyAddController).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should not be allowed to decrement the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        describe('when adding a new address at index -> AddressPermissions[6]', () => {
          it('should be allowed to set a new 20 bytes long address', async () => {
            const key = permissionArrayIndexToAdd;

            const value = ethers.Wallet.createRandom().address.toLowerCase();

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyAddController).execute(payload);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key = permissionArrayIndexToAdd;
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key = permissionArrayIndexToAdd;
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when editing the value stored at index -> AddressPermissions[4]', () => {
          it('should not be allowed to set an address', async () => {
            const randomWallet = ethers.Wallet.createRandom();

            const key = permissionArrayIndexToEdit;

            const value = randomWallet.address;

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should not be allowed to remove an address', async () => {
            const key = permissionArrayIndexToEdit;

            const value = '0x';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        describe('if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key', () => {
          it('should revert when trying to set a non-standard LSP6 permission data key', async () => {
            // this include any permission data key that start with bytes8(keccak256('AddressPermissions'))
            const beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            const key = '0x4b80742de2bf9e659ba40000' + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            const value = '0x0000000000000000000000000000000000000000000000000000000000000008';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotRecognisedPermissionKey')
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe('when caller is an address with permission EDITPERMISSIONS', () => {
        // ----------------------
        // because we are editing ther permissions of a controller,
        // we need to setup + teardown for each describe blocks
        // related to each controller making the change
        before('setup permissions', async () => {
          // setup AddressPersmissions:Permissions:<controllers>
          await setupPermissions(context, permissionKeys, permissionValues);

          // setup AddressPermissions[]
          await setupPermissions(context, permissionArrayKeys, permissionArrayValues);
        });

        after('reset permissions', async () => {
          await resetPermissions(context, [
            ...permissionKeys,
            ...permissionArrayKeys,
            permissionArrayIndexToAdd,
          ]);
        });

        it('should not be allowed to ADD a new controller', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            newController.address.substr(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to ADD a new controller if this address had 32 x 0 bytes (0x0000...0000) already as permission value', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressWithZeroHexPermissions.address.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to ADD a new controller if this address has a 16 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasEditPermissionsTestCase.addressWith16BytesHexPermissionsLength.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to ADD a new controller if this address has a 40 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasEditPermissionsTestCase.addressWith40BytesHexPermsissionsLength.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should be allowed to EDIT the existing permissions of a controller', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it("should not be allowed to increment the 'AddressPermissions[]' key (length)", async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
          });

          it("should be allowed to decrement the 'AddressPermissions[]' key (length)", async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        describe('when adding a new address at index -> AddressPermissions[6]', () => {
          it('should not be allowed', async () => {
            const key = permissionArrayIndexToAdd;
            const value = ethers.Wallet.createRandom().address.toLowerCase();

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
          });
        });

        describe('when editing the value stored at index -> AddressPermissions[4]', () => {
          it('should be allowed', async () => {
            const randomWallet = ethers.Wallet.createRandom();

            const key = permissionArrayIndexToEdit;

            const value = randomWallet.address;

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key = permissionArrayIndexToEdit;
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key = permissionArrayIndexToEdit;
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]
            const setupPayload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              randomValue,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(setupPayload))
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should pass', async () => {
            const key = permissionArrayIndexToEdit;

            const value = '0x';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        describe('if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key', () => {
          it('should revert when trying to set a non-standard LSP6 permission data key', async () => {
            // this include any permission data key that start with bytes8(keccak256('AddressPermissions'))
            const beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            const key = '0x4b80742de2bf9e659ba40000' + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            const value = '0x0000000000000000000000000000000000000000000000000000000000000008';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotRecognisedPermissionKey')
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe('when caller is an address with permission SETDATA', () => {
        // ----------------------
        // because we are editing ther permissions of a controller,
        // we need to setup + teardown for each describe blocks
        // related to each controller making the change
        before('setup permissions', async () => {
          // setup AddressPersmissions:Permissions:<controllers>
          await setupPermissions(context, permissionKeys, permissionValues);

          // setup AddressPermissions[]
          await setupPermissions(context, permissionArrayKeys, permissionArrayValues);
        });

        after('reset permissions', async () => {
          await resetPermissions(context, [
            ...permissionKeys,
            ...permissionArrayKeys,
            permissionArrayIndexToAdd,
          ]);
        });

        it('should not be allowed to ADD a permission', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            newController.address.substr(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressWithZeroHexPermissions.address.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to ADD a new controller if this address has a 16 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasSetDataTestCase.addressWith16BytesHexPermissionsLength.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to ADD a new controller if this address has a 40 bytes long bytes value already set under its permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            callerHasSetDataTestCase.addressWith40BytesHexPermsissionsLength.substring(2);
          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to EDIT a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it('should not be allowed to increment the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlySetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
          });

          it('should not be allowed to decrement the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlySetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should revert', async () => {
            const key = permissionArrayIndexToEdit;

            const value = '0x';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlySetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
          });
        });

        it('should not be allowed to add a new controller address at index -> AddressPermissions[6]', async () => {
          const key = permissionArrayIndexToAdd;
          const value = ethers.Wallet.createRandom().address.toLowerCase();

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to edit controller address at index -> AddressPermissions[4]', async () => {
          const randomWallet = ethers.Wallet.createRandom();

          const key = permissionArrayIndexToEdit;

          const value = randomWallet.address;

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
        });

        describe('if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key', () => {
          it('should revert when trying to set a non-standard LSP6 permission data key', async () => {
            // this include any permission data key that start with bytes8(keccak256('AddressPermissions'))
            const beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            const key = '0x4b80742de2bf9e659ba40000' + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            const value = '0x0000000000000000000000000000000000000000000000000000000000000008';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlySetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotRecognisedPermissionKey')
              .withArgs(key.toLowerCase());
          });
        });
      });
    });
  });

  describe('setting mixed keys (SETDATA, CHANGE & ADD Permissions)', () => {
    let canSetDataAndAddController: SignerWithAddress,
      canSetDataAndEditPermissions: SignerWithAddress;
    // addresses being used to CHANGE (= edit) permissions
    let addressesToEditPermissions: [SignerWithAddress, SignerWithAddress];

    const allowedERC725YDataKeys = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Second Key')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Third Key')),
    ];

    let permissionKeys: string[];
    let permissionValues: string[];

    before(async () => {
      canSetDataAndAddController = context.accounts[1];
      canSetDataAndEditPermissions = context.accounts[2];

      addressesToEditPermissions = [context.accounts[3], context.accounts[4]];

      permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canSetDataAndAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          canSetDataAndAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canSetDataAndEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          canSetDataAndEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressesToEditPermissions[0].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressesToEditPermissions[1].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
      ];

      permissionValues = [
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.ADDCONTROLLER),
        encodeCompactBytesArray(allowedERC725YDataKeys),
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.EDITPERMISSIONS),
        encodeCompactBytesArray(allowedERC725YDataKeys),
        // placeholder permission
        PERMISSIONS.TRANSFERVALUE,
        PERMISSIONS.TRANSFERVALUE,
        // AddressPermissions[].length
        ethers.utils.hexZeroPad(ethers.utils.hexlify(5), 16),
      ];
    });

    describe('when setting multiple keys', () => {
      describe('when caller is an address with ALL PERMISSIONS', () => {
        before('setup permissions', async () => {
          await setupPermissions(context, permissionKeys, permissionValues);
        });

        after('reset permissions', async () => {
          await resetPermissions(context, permissionKeys);
        });

        it('(should pass): 2 x keys + add 2 x new permissions', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();
          const newControllerKeyTwo = ethers.Wallet.createRandom();

          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My SecondKey Key')),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyTwo.address.substr(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          // prettier-ignore
          const fetchedResult = await context.universalProfile.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it('(should pass): 2 x keys + change 2 x existing permissions', async () => {
          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My 1st Key')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My 2nd Key')),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          // prettier-ignore
          const fetchedResult = await context.universalProfile.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it('(should pass): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();

          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My SecondKey Key')),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substring(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          // prettier-ignore
          const fetchedResult = await context.universalProfile.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });
      });

      describe('when caller is an address with permission SETDATA + ADDCONTROLLER + 3x Allowed ERC725Y data keys', () => {
        before('setup permissions', async () => {
          await setupPermissions(context, permissionKeys, permissionValues);
        });

        after('reset permissions', async () => {
          await resetPermissions(context, permissionKeys);
        });

        it('(should fail): 2 x allowed data keys + add 2 x new controllers + decrement AddressPermissions[].length by -1', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();
          const newControllerKeyTwo = ethers.Wallet.createRandom();

          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyTwo.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            ethers.utils.hexZeroPad(ethers.utils.hexlify(5), 16),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canSetDataAndAddController.address, 'EDITPERMISSIONS');
        });

        it('(should fail): 2 x allowed data keys + edit permissions of 2 x existing controllers', async () => {
          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canSetDataAndAddController.address, 'EDITPERMISSIONS');
        });

        it('(should fail): 2 x allowed data keys + (add 1 x new controller) + (edit permission of 1 x existing controller)', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();

          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My SecondKey Key')),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substr(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canSetDataAndAddController.address, 'EDITPERMISSIONS');
        });

        it('(should fail): 1 x allowed data key + 1 x NOT allowed data key + 2 x new controllers', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();
          const newControllerKeyTwo = ethers.Wallet.createRandom();

          const NotAllowedERC725YDataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes('Not Allowed Data Key'),
          );

          // prettier-ignore
          const dataKeys = [
            allowedERC725YDataKeys[0],
            NotAllowedERC725YDataKey,
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newControllerKeyTwo.address.substr(2),
          ];

          // prettier-ignore
          const dataValues = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random data for not allowed value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            dataKeys,
            dataValues,
          ]);

          await expect(context.keyManager.connect(canSetDataAndAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedERC725YDataKey')
            .withArgs(canSetDataAndAddController.address, NotAllowedERC725YDataKey);
        });

        it('(should pass): 2 x allowed data keys + add 2 x new controllers', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();
          const newControllerKeyTwo = ethers.Wallet.createRandom();

          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Second Key')),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyTwo.address.substr(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(canSetDataAndAddController).execute(payload);

          expect(await context.universalProfile.getDataBatch(keys)).to.deep.equal(values);
        });

        it('(should pass): 2 x allowed data keys + add 2 x new controllers + increment AddressPermissions[].length by +2', async () => {
          const currentPermissionsArrayLength = await context.universalProfile['getData(bytes32)'](
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          );

          const newPermissionsArrayLength = ethers.BigNumber.from(currentPermissionsArrayLength)
            .add(1)
            .toNumber();

          const newControllerKeyOne = ethers.Wallet.createRandom();
          const newControllerKeyTwo = ethers.Wallet.createRandom();

          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyTwo.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            ethers.utils.hexZeroPad(ethers.utils.hexlify(newPermissionsArrayLength), 16),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(canSetDataAndAddController).execute(payload);

          expect(await context.universalProfile.getDataBatch(keys)).to.deep.equal(values);
        });
      });

      describe('when caller is an address with permission SETDATA + EDITPERMISSIONS + 3x Allowed ERC725Y data keys', () => {
        before('setup permissions', async () => {
          await setupPermissions(context, permissionKeys, permissionValues);
        });

        after('reset permissions', async () => {
          await resetPermissions(context, permissionKeys);
        });

        it('(should fail): 2 x allowed data keys + add 2 x new controllers', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();
          const newControllerKeyTwo = ethers.Wallet.createRandom();

          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyTwo.address.substr(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canSetDataAndEditPermissions.address, 'ADDCONTROLLER');
        });

        it('(should fail): 2 x allowed data keys + increment AddressPermissions[].length by +1', async () => {
          const currentArrayLength = await context.universalProfile['getData(bytes32)'](
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          );

          const newArrayLength = ethers.BigNumber.from(currentArrayLength).add(1).toNumber();

          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            ethers.utils.hexZeroPad(ethers.utils.hexlify(newArrayLength), 16),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canSetDataAndEditPermissions.address, 'ADDCONTROLLER');
        });

        it('(should fail): 2 x allowed data keys + (add 1 x new permission) + (edit permission of 1 x existing controller)', async () => {
          const newControllerKeyOne = ethers.Wallet.createRandom();

          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substr(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canSetDataAndEditPermissions.address, 'ADDCONTROLLER');
        });

        it('(should fail): edit permissions of 2 x existing controllers + (set 1 x allowed data key) + (set 1 x NOT allowed data key)', async () => {
          const NotAllowedERC725YDataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes('Not Allowed Data Key'),
          );

          const keys = [
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[1].address.substring(2),
            allowedERC725YDataKeys[0],
            NotAllowedERC725YDataKey,
          ];

          const values = [
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Random data for not allowed value')),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await expect(context.keyManager.connect(canSetDataAndEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedERC725YDataKey')
            .withArgs(canSetDataAndEditPermissions.address, NotAllowedERC725YDataKey);
        });

        it('(should pass): 2 x allowed data keys + edit permissions of 2 x existing controllers', async () => {
          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(canSetDataAndEditPermissions).execute(payload);

          expect(await context.universalProfile.getDataBatch(keys)).to.deep.equal(values);
        });

        it('(should pass): 2 x allowed data keys + remove 2 x addresses with permissions + decrement AddressPermissions[].length by -2', async () => {
          const keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              addressesToEditPermissions[1].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My First Value')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('My Second Value')),
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 16),
          ];

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            keys,
            values,
          ]);

          await context.keyManager.connect(canSetDataAndEditPermissions).execute(payload);

          expect(await context.universalProfile.getDataBatch(keys)).to.deep.equal(values);
        });
      });
    });
  });
};
