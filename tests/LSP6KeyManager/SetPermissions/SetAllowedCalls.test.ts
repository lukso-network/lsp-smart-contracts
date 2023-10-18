import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, PERMISSIONS, INTERFACE_IDS, CALLTYPE } from '../../../constants';

// helpers
import { combineAllowedCalls } from '../../utils/helpers';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

export const shouldBehaveLikeSettingAllowedCalls = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('deleting AllowedCalls', () => {
    let canOnlyAddController: SignerWithAddress, canOnlyEditPermissions: SignerWithAddress;

    let beneficiaryWithPermissions: SignerWithAddress,
      beneficiaryNoPermissions: SignerWithAddress,
      invalidBytes: SignerWithAddress,
      noBytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiaryWithPermissions = context.accounts[3];
      beneficiaryNoPermissions = context.accounts[4];
      invalidBytes = context.accounts[5];
      noBytes = context.accounts[6];

      // prettier-ignore
      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + beneficiaryWithPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + invalidBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + noBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiaryWithPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiaryNoPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + invalidBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + noBytes.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        // beneficiaryWithPermissions
        combineAllowedCalls(
          // allow the beneficiary to transfer value to addresses 0xcafe... and 0xbeef...
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
        // beneficiaryNoPermissions
        combineAllowedCalls(
          // allow the beneficiary to transfer value to addresses 0xcafe... and 0xbeef...
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
        // invalidBytes
        '0xbadbadbadbad',
        // noBytes
        '0x',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has permission ADD_CONTROLLER', () => {
      describe('when controller in `AddressPermissions:AllowedCalls:<controller>` has some permissions', () => {
        it('should revert and not be allowed to clear the list of allowed calls', async () => {
          const dataKey =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiaryWithPermissions.address.substring(2);
          const dataValue = '0x';

          const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
            dataKey,
            dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(setDataPayload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });
      });

      describe('when controller in `AddressPermissions:AllowedCalls:<controller>` has no permissions', () => {
        it('should pass and clear the list of allowed calls', async () => {
          const dataKey =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiaryNoPermissions.address.substring(2);
          const dataValue = '0x';

          const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
            dataKey,
            dataValue,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(setDataPayload);

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
        });
      });
    });

    describe('when caller has EDIT_PERMISSIONS', () => {
      describe('when controller in `AddressPermissions:AllowedCalls:<controller>` has some permissions', () => {
        it('should allow to clear the list of allowed calls', async () => {
          const dataKey =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiaryWithPermissions.address.substring(2);
          const dataValue = '0x';

          const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
            dataKey,
            dataValue,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(setDataPayload);

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
        });
      });

      describe('when controller in `AddressPermissions:AllowedCalls:<controller>` has no permissions', () => {
        it('should revert and not allow to clear the list of allowed calls', async () => {
          const dataKey =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiaryNoPermissions.address.substring(2);
          const dataValue = '0x';

          const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
            dataKey,
            dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(setDataPayload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });
      });
    });
  });

  describe('setting Allowed Calls -> Addresses', () => {
    let canOnlyAddController: SignerWithAddress, canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      // prettier-ignore
      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero40Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero40Bytes.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        combineAllowedCalls(
          // allow the beneficiary to transfer value to addresses 0xcafe... and 0xbeef...
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
        '0x11223344',
        // CompactBytesArray of allowed calls: length = 0, value = `bytes32(0)`
        '0x00000000000000000000000000000000000000000000000000000000000000000000',
        // CompactBytesArray: length = 0, value = `bytes32(0)` + 4 x extra 0 bytes
        '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has permission ADDCONTROLLER', () => {
      describe('when the controller to edit the AllowedCalls for has some permissions', () => {
        it('should fail when trying to edit existing allowed addresses for an address', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.VALUE, CALLTYPE.VALUE],
            [
              '0xcafecafecafecafecafecafecafecafecafecafe',
              '0xca11ca11ca11ca11ca11ca11ca11ca11ca11ca11',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        it('should fail with NotAuthorised -> when beneficiary address had an invalid bytes32[CompactBytesArray]', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            invalidBeneficiary.address.substring(2);

          // try to set for the invalidBeneficiary some allowed calls
          // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
          const value = combineAllowedCalls(
            [CALLTYPE.VALUE, CALLTYPE.VALUE],
            [
              '0xcafecafecafecafecafecafecafecafecafecafe',
              '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        describe('when beneficiary (= controller) had 00 bytes set initially as allowed calls (e.g: allowed calls disabled)', () => {
          it('should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero32Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.VALUE, CALLTYPE.VALUE],
              [
                '0xcafecafecafecafecafecafecafecafecafecafe',
                '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
              ],
              ['0xffffffff', '0xffffffff'],
              ['0xffffffff', '0xffffffff'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });

          it('should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero40Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.VALUE, CALLTYPE.VALUE],
              [
                '0xcafecafecafecafecafecafecafecafecafecafe',
                '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
              ],
              ['0xffffffff', '0xffffffff'],
              ['0xffffffff', '0xffffffff'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        it('should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          // set for the newController some allowed calls
          // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
          const value = combineAllowedCalls(
            [CALLTYPE.VALUE, CALLTYPE.VALUE],
            [
              '0xcafecafecafecafecafecafecafecafecafecafe',
              '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('when setting an invalid bytes28[CompactBytesArray] for a new beneficiary', () => {
        it('should revert with error when value = random bytes', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = '0xbadbadbadbad';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes32[CompactBytesArray] (not enough bytes, missing the first length bytes)', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = '0x00000001cafecafecafecafecafecafecafecafecafecafeffffffffffffffff';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });

    describe('when caller has permission EDITPERMISSIONS', () => {
      it('should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...', async () => {
        const newController = ethers.Wallet.createRandom();

        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        // try to set for the newController some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        const value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
      });

      it('should pass when trying to edit existing allowed addresses for an address', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        // edit the allowed calls of the beneficiary
        // still transfering values to 2 x addresses
        // change 2nd address 0xbeef... to 0xf00d...
        const value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xf00df00df00df00df00df00df00df00df00df00d',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('should pass when address had an invalid bytes28[CompactBytesArray] initially', async () => {
        const key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        // set some allowed calls for the beneficiary
        const value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      // even if the controller had some 00 bytes set as allowed calls, it is not considered as it does not have any allowed calls set
      // but rather that its allowed calls are "disabled"
      describe('when beneficiary (= controller) had 00 bytes set initially as allowed calls (e.g: allowed calls disabled)', () => {
        it('should pass when address had 32 x 0 bytes set initially as allowed calls', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            zero32Bytes.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.VALUE, CALLTYPE.VALUE],
            [
              '0xcafecafecafecafecafecafecafecafecafecafe',
              '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('should pass when address had 40 x 0 bytes set initially as allowed addresses', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            zero40Bytes.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.VALUE, CALLTYPE.VALUE],
            [
              '0xcafecafecafecafecafecafecafecafecafecafe',
              '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xffffffff', '0xffffffff'],
          );

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

      describe('when changing the list of allowed calls from existing ANY:<address>:ANY to an invalid value', () => {
        it('should revert with error when value = random bytes', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = '0xbadbadbadbad';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing the first length byte)', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = '0x00000001cafecafecafecafecafecafecafecafecafecafeffffffffffffffff';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });
  });

  describe('setting Allowed Calls -> Functions', () => {
    let canOnlyAddController: SignerWithAddress, canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      // prettier-ignore
      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero40Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero40Bytes.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xbeefbeef'],
        ),
        '0x11223344',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has permission ADDCONTROLLER', () => {
      describe('when controller to edit Allowed Calls for has some permissions set', () => {
        it('should fail when trying to edit existing allowed functions for an address', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = combineAllowedCalls(
            // allow beneficiary to make a CALL to only function selectors 0xcafecafe and 0xf00df00d
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xcafecafe', '0xf00df00d'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        it('should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompactBytesArray] initially', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            invalidBeneficiary.address.substring(2);

          const value = combineAllowedCalls(
            // allow beneficiary to make a CALL to only function selectors 0xcafecafe and 0xf00df00d
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xcafecafe', '0xf00df00d'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        // even if the controller had some 00 bytes set as allowed calls, it is not considered as it does not have any allowed calls set
        // but rather that its allowed calls are "disabled"
        describe('when beneficiary (= controller) had 00 bytes set initially as allowed calls (e.g: allowed calls disabled)', () => {
          it('should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero32Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              ['0xffffffff', '0xffffffff'],
              ['0xcafecafe', '0xca11ca11'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });

          it('should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero40Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              ['0xffffffff', '0xffffffff'],
              ['0xcafecafe', '0xca11ca11'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        it('should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = combineAllowedCalls(
            // allow beneficiary to CALL only function selectors 0xcafecafe and 0xf00df00d
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xcafecafe', '0xf00df00d'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('when setting an invalid bytes28[CompactBytesArray] for a new beneficiary', () => {
        it('should fail when setting an invalid bytes28[CompactBytesArray] (= random bytes)', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = '0xbadbadbadbad';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should fail when setting an invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = '0x00000002ffffffffffffffffffffffffffffffffffffffffffffffffcafecafe';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });

    describe('when caller has EDITPERMISSIONS', () => {
      describe('when controller to edit Allowed Calls for has some permissions set', () => {
        it('should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = combineAllowedCalls(
            // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xcafecafe', '0xbeefbeef'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should pass when trying to edit existing allowed bytes4 selectors under ANY:ANY:<selector>', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = combineAllowedCalls(
            // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xcafecafe', '0xbeefbeef'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('should pass when address had an invalid bytes28[CompactBytesArray] initially', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            invalidBeneficiary.address.substring(2);

          const value = combineAllowedCalls(
            // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            ['0xffffffff', '0xffffffff'],
            ['0xcafecafe', '0xbeefbeef'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        describe('when beneficiary (= controller) had 00 bytes set initially as allowed calls (e.g: allowed calls disabled)', () => {
          it('should pass when address had 32 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero32Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              ['0xffffffff', '0xffffffff'],
              ['0xcafecafe', '0xbeefbeef'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should pass when address had 40 x 0 bytes set initially as allowed functions', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero40Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              ['0xffffffff', '0xffffffff'],
              ['0xcafecafe', '0xbeefbeef'],
            );

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
      });

      describe('when changing the list of selectors in allowed calls from existing ANY:ANY:<selector> to an invalid value', () => {
        it('should revert with error when value = random bytes', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = '0xbadbadbadbad';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = '0x00000002ffffffffffffffffffffffffffffffffffffffffffffffffcafecafe';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });
  });

  describe('setting Allowed Calls -> Standards', () => {
    let canOnlyAddController: SignerWithAddress, canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      // prettier-ignore
      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero40Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero40Bytes.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        combineAllowedCalls(
          // allow beneficiary controller to CALL any functions
          // on any LSP7 or ERC20 contracts
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ['0xffffffff', '0xffffffff'],
        ),
        '0x11223344',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has ADDCONTROLLER', () => {
      describe('when controller to edit Allowed Calls for has some permissions', () => {
        it('should fail when trying to edit existing allowed standards for an address', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              // add NFT standards (new LSP8 + old ERC721)
              // in the list of allowed calls for the beneficiary controller
              // (in addition to token contracts LSP7 + ERC20)
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
              INTERFACE_IDS.ERC721,
            ],
            ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        it('should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompactBytesArray] initially', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            invalidBeneficiary.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              // add NFT standards (new LSP8 + old ERC721)
              // in the list of allowed calls for the beneficiary controller
              // (in addition to token standards LSP7 + ERC20)
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
              INTERFACE_IDS.ERC721,
            ],
            ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
        });

        // even if the controller had some 00 bytes set as allowed calls, it is not considered as it does not have any allowed calls set
        // but rather that its allowed calls are "disabled"
        describe('when beneficiary (= controller) had 00 bytes set initially as allowed calls (e.g: allowed calls disabled)', () => {
          it('should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero32Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              [
                INTERFACE_IDS.LSP7DigitalAsset,
                INTERFACE_IDS.ERC20,
                INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
                INTERFACE_IDS.ERC721,
              ],
              ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });

          it('should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero40Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              [
                INTERFACE_IDS.LSP7DigitalAsset,
                INTERFACE_IDS.ERC20,
                INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
                INTERFACE_IDS.ERC721,
              ],
              ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });
        });

        it('should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = combineAllowedCalls(
            [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              // add NFT standards (new LSP8 + old ERC721)
              // in the list of allowed calls for the beneficiary controller
              // (in addition to token standards LSP7 + ERC20)
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
              INTERFACE_IDS.ERC721,
            ],
            ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('when setting an invalid bytes28[CompactBytesArray] of allowed calls for a new beneficiary', () => {
        it('should fail when setting an bytes28[CompactBytesArray] (= random bytes)', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = '0xbadbadbadbad';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should fail when setting an invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = '0x00000002ffffffffffffffffffffffffffffffffffffffffcafecafeffffffff';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });

    describe('when caller has EDITPERMISSIONS', () => {
      describe('when controller to edit Allowed Calls for has some permissions', () => {
        it('should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...', async () => {
          const newController = ethers.Wallet.createRandom();

          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          const value = combineAllowedCalls(
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            // try to add in the list of allowed calls for the beneficiary controller
            // the rights to CALL any LSP7 or ERC20 token contract
            // (NB: just the AllowedCalls, not the permission CALL)
            [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
            ['0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });

        it('should pass when trying to edit existing allowed standards for an address', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              // add NFT standards (new LSP8 + old ERC721)
              // in the list of allowed calls for the beneficiary controller
              // (in addition to token standards LSP7 + ERC20)
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
              INTERFACE_IDS.ERC721,
            ],
            ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('should pass when address had an invalid bytes28[CompactBytesArray] initially', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            invalidBeneficiary.address.substring(2);

          const value = combineAllowedCalls(
            [CALLTYPE.CALL, CALLTYPE.CALL],
            [
              '0xffffffffffffffffffffffffffffffffffffffff',
              '0xffffffffffffffffffffffffffffffffffffffff',
            ],
            [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
            ['0xffffffff', '0xffffffff'],
          );

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        // even if the controller had some 00 bytes set as allowed calls, it is not considered as it does not have any allowed calls set
        // but rather that its allowed calls are "disabled"
        describe('when beneficiary (= controller) had 00 bytes set initially as allowed calls (e.g: allowed calls disabled)', () => {
          it('should pass when address had 32 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero32Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
              ['0xffffffff', '0xffffffff'],
            );

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should pass when address had 40 x 0 bytes set initially as allowed calls', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              zero40Bytes.address.substring(2);

            const value = combineAllowedCalls(
              [CALLTYPE.CALL, CALLTYPE.CALL],
              [
                '0xffffffffffffffffffffffffffffffffffffffff',
                '0xffffffffffffffffffffffffffffffffffffffff',
              ],
              [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
              ['0xffffffff', '0xffffffff'],
            );

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
      });

      describe('when changing the list of interface IDs in allowed calls <standard>:ANY:ANY to an invalid value', () => {
        it('should revert with error when value = random bytes', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = '0xbadbadbadbad';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          const value = '0x00000002ffffffffffffffffffffffffffffffffffffffffcafecafeffffffff';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });
  });
};
