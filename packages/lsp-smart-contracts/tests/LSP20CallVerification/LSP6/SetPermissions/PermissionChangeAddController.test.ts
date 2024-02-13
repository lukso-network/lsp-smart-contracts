import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, ALL_PERMISSIONS, PERMISSIONS } from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import { combinePermissions, encodeCompactBytesArray } from '../../../utils/helpers';

async function setupPermissions(
  context: LSP6TestContext,
  permissionsKeys: string[],
  permissionValues: string[],
) {
  await context.universalProfile
    .connect(context.mainController)
    .setDataBatch(permissionsKeys, permissionValues);
}

/**
 * @dev fixture to reset all the permissions to 0x
 */
async function resetPermissions(context: LSP6TestContext, permissionsKeys: string[]) {
  await context.universalProfile
    .connect(context.mainController)
    .setDataBatch(permissionsKeys, Array(permissionsKeys.length).fill('0x'));
}

export const shouldBehaveLikePermissionChangeOrAddController = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let permissionKeys: string[] = [];
  let permissionValues: string[] = [];

  let permissionArrayKeys: string[] = [];
  let permissionArrayValues: string[] = [];

  before('setup', async () => {
    context = await buildContext();

    await setupKeyManager(
      context,
      [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
      ],
      [ALL_PERMISSIONS],
    );
  });

  describe('setting permissions keys (EDIT vs ADD Permissions)', () => {
    // this data key is hardcoded to be removed in teardown
    const permissionArrayIndexToAdd =
      ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000006';

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
        // 0x0000... = similar to empty, or 'no permissions set'
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ];

      permissionArrayKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000000',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000001',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000002',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000003',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000004',
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

          await context.universalProfile
            .connect(context.mainController)
            .setData(key, PERMISSIONS.SETDATA);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(PERMISSIONS.SETDATA);
        });

        it('should be allowed to CHANGE a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          await context.universalProfile.connect(context.mainController).setData(key, value);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it('should be allowed to increment the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await context.universalProfile.connect(context.mainController).setData(key, value);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should be allowed to decrement the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await context.universalProfile.connect(context.mainController).setData(key, value);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        describe('when adding a new address at index -> AddressPermissions[6]', () => {
          it('should be allowed to set a 20 bytes long address', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const value = ethers.Wallet.createRandom().address.toLowerCase();

            await context.universalProfile.connect(context.mainController).setData(key, value);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(context.mainController).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(context.mainController).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when editing the value stored at index -> AddressPermissions[4]', () => {
          it('should be allowed to set a new 20 bytes long address', async () => {
            const randomWallet = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = randomWallet.address;

            await context.universalProfile.connect(context.mainController).setData(key, value);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(context.mainController).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(context.mainController).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should pass', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = '0x';

            await context.universalProfile.connect(context.mainController).setData(key, value);

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

            await expect(
              context.universalProfile.connect(context.mainController).setData(key, value),
            )
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

          await context.universalProfile.connect(canOnlyAddController).setData(key, value);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('should not be allowed to EDIT a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it('should be allowed to increment the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await context.universalProfile.connect(canOnlyAddController).setData(key, value);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should not be allowed to decrement the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        describe('when adding a new address at index -> AddressPermissions[6]', () => {
          it('should be allowed to set a new 20 bytes long address', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const value = ethers.Wallet.createRandom().address.toLowerCase();

            await context.universalProfile.connect(canOnlyAddController).setData(key, value);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(canOnlyAddController).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            await expect(
              context.universalProfile.connect(canOnlyAddController).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when editing the value stored at index -> AddressPermissions[4]', () => {
          it('should not be allowed to set an address', async () => {
            const randomWallet = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = randomWallet.address;

            await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should not be allowed to remove an address', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = '0x';

            await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
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

            await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
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

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressWithZeroHexPermissions.address.substring(2);
          const value = PERMISSIONS.SETDATA;

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should be allowed to CHANGE a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

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

            await expect(
              context.universalProfile.connect(canOnlyEditPermissions).setData(key, value),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
          });

          it("should be allowed to decrement the 'AddressPermissions[]' key (length)", async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        describe('when adding a new address at index -> AddressPermissions[6]', () => {
          it('should not be allowed', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000006';
            const value = ethers.Wallet.createRandom().address.toLowerCase();

            await expect(
              context.universalProfile.connect(canOnlyEditPermissions).setData(key, value),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
          });
        });

        describe('when editing the value stored at index -> AddressPermissions[4]', () => {
          it('should be allowed', async () => {
            const randomWallet = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = randomWallet.address;

            await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it('should revert when setting a random 10 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';
            const randomValue = '0xcafecafecafecafecafe';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(canOnlyEditPermissions).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });

          it('should revert when setting a random 30 bytes value', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';
            const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile.connect(canOnlyEditPermissions).setData(key, randomValue),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
              .withArgs(key, randomValue);
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should pass', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = '0x';

            await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

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

            await expect(
              context.universalProfile.connect(canOnlyEditPermissions).setData(key, value),
            )
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

          await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressWithZeroHexPermissions.address.substring(2);
          const value = PERMISSIONS.SETDATA;

          await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to CHANGE a permission', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            addressToEditPermissions.address.substring(2);

          const value = PERMISSIONS.SETDATA;

          await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
        });

        describe('when editing `AddressPermissions[]` array length', () => {
          it('should not be allowed to increment the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).add(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
          });

          it('should not be allowed to decrement the length', async () => {
            const key = ERC725YDataKeys.LSP6['AddressPermissions[]'].length;

            const currentLength = await context.universalProfile['getData(bytes32)'](key);

            const newLength = ethers.BigNumber.from(currentLength).sub(1).toNumber();

            const value = ethers.utils.hexZeroPad(ethers.utils.hexlify(newLength), 16);

            await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
          });
        });

        describe('when removing the address at index -> AddressPermissions[4]', () => {
          it('should revert', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000004';

            const value = '0x';

            await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'EDITPERMISSIONS');
          });
        });

        it('should not be allowed to add a new address at index -> AddressPermissions[6]', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000006';
          const value = ethers.Wallet.createRandom().address.toLowerCase();

          await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDCONTROLLER');
        });

        it('should not be allowed to edit key at index -> AddressPermissions[4]', async () => {
          const randomWallet = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000004';

          const value = randomWallet.address;

          await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
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

            await expect(context.universalProfile.connect(canOnlySetData).setData(key, value))
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

          await context.universalProfile.connect(context.mainController).setDataBatch(keys, values);

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

          await context.universalProfile.connect(context.mainController).setDataBatch(keys, values);

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

          await context.universalProfile.connect(context.mainController).setDataBatch(keys, values);

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

          await expect(
            context.universalProfile.connect(canSetDataAndAddController).setDataBatch(keys, values),
          )
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

          await expect(
            context.universalProfile.connect(canSetDataAndAddController).setDataBatch(keys, values),
          )
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

          await expect(
            context.universalProfile.connect(canSetDataAndAddController).setDataBatch(keys, values),
          )
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

          await expect(
            context.universalProfile
              .connect(canSetDataAndAddController)
              .setDataBatch(dataKeys, dataValues),
          )
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

          await context.universalProfile
            .connect(canSetDataAndAddController)
            .setDataBatch(keys, values);

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

          await context.universalProfile
            .connect(canSetDataAndAddController)
            .setDataBatch(keys, values);

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

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              .setDataBatch(keys, values),
          )
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

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              .setDataBatch(keys, values),
          )
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

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              .setDataBatch(keys, values),
          )
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

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              .setDataBatch(keys, values),
          )
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

          await context.universalProfile
            .connect(canSetDataAndEditPermissions)
            .setDataBatch(keys, values);

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

          await context.universalProfile
            .connect(canSetDataAndEditPermissions)
            .setDataBatch(keys, values);

          expect(await context.universalProfile.getDataBatch(keys)).to.deep.equal(values);
        });
      });
    });
  });
};
