import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, PERMISSIONS, INTERFACE_IDS, CALLTYPE } from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import { combineAllowedCalls } from '../../../utils/helpers';

export const shouldBehaveLikeSetAllowedCalls = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  describe('deleting AllowedCalls', () => {
    let canOnlyAddController: SignerWithAddress, canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress;
    let invalidBytes: SignerWithAddress;
    let noBytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBytes = context.accounts[4];
      noBytes = context.accounts[5];

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + invalidBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + noBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + invalidBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + noBytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
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
        '0xbadbadbadbad',
        '0x',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has ADD permission', () => {
      it('should revert and not be allowed to clear the list of allowed calls for an address', async () => {
        const dataKey =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);
        const dataValue = '0x';

        await expect(
          context.universalProfile.connect(canOnlyAddController).setData(dataKey, dataValue),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });
    });

    describe('when caller has CHANGE permission', () => {
      it('should allow to clear the list of allowed calls for an address', async () => {
        const dataKey =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);
        const dataValue = '0x';

        await context.universalProfile.connect(canOnlyEditPermissions).setData(dataKey, dataValue);

        const result = await context.universalProfile.getData(dataKey);
        expect(result).to.equal(dataValue);
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

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
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
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has permission ADDCONTROLLER', () => {
      it('should fail when trying to edit existing allowed addresses for an address', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xca11ca11ca11ca11ca11ca11ca11ca11ca11ca11',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      it('should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompatBytesArray]', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        // try to set for the invalidBeneficiary some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      it('should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]', async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        // set for the newController some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyAddController).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      describe('when setting an invalid bytes28[CompactBytesArray] for a new beneficiary', () => {
        it('should revert with error when value = random bytes', async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          let value = '0xbadbadbadbad';

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing the first length bytes)', async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          let value = '0xffffffffcafecafecafecafecafecafecafecafecafecafeffffffff';

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });

    describe('when caller has permission EDITPERMISSIONS', () => {
      it('should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...', async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        // try to set for the newController some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
      });

      it('should pass when trying to edit existing allowed addresses for an address', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        // edit the allowed calls of the beneficiary
        // still transfering values to 2 x addresses
        // change 2nd address 0xbeef... to 0xf00d...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xf00df00df00df00df00df00df00df00df00df00d',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('should pass when address had an invalid bytes28[CompactBytesArray] initially', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        // set some allowed calls for the beneficiary
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should pass when address had 32 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should pass when address had 40 x 0 bytes set initially as allowed addresses', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            '0xcafecafecafecafecafecafecafecafecafecafe',
            '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      describe('when changing the list of allowed calls from existing ANY:<address>:ANY to an invalid value', () => {
        it('should revert with error when value = random bytes', async () => {
          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          let value = '0xbadbadbadbad';

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing the first length byte)', async () => {
          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          let value = '0xffffffffcafecafecafecafecafecafecafecafecafecafeffffffff';

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
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

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
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
      it('should fail when trying to edit existing allowed functions for an address', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to make a CALL to only function selectors 0xcafecafe and 0xf00df00d
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xf00df00d'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      it('should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompactBytesArray] initially', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to make a CALL to only function selectors 0xcafecafe and 0xf00df00d
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xf00df00d'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xca11ca11'],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xca11ca11'],
        );

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      it('should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]', async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xf00df00d
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xf00df00d'],
        );

        await context.universalProfile.connect(canOnlyAddController).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      describe('when setting an invalid bytes28[CompactBytesArray] for a new beneficiary', () => {
        it('should fail when setting an invalid bytes28[CompactBytesArray] (= random bytes)', async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          let value = '0xbadbadbadbad';

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should fail when setting an invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          let value = '0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe';

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });

    describe('when caller has EDITPERMISSIONS', () => {
      it('should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...', async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xbeefbeef'],
        );

        await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
      });

      it('should pass when trying to edit existing allowed bytes4 selectors under ANY:ANY:<selector>', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xbeefbeef'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('should pass when address had an invalid bytes28[CompactBytesArray] initially', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xbeefbeef'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should pass when address had 32 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xbeefbeef'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should pass when address had 40 x 0 bytes set initially as allowed functions', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xcafecafe', '0xbeefbeef'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      describe('when changing the list of selectors in allowed calls from existing ANY:ANY:<selector> to an invalid value', () => {
        it('should revert with error when value = random bytes', async () => {
          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          let value = '0xbadbadbadbad';

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          let value = '0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe';

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
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

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
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
      it('should fail when trying to edit existing allowed standards for an address', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
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

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      it('should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompactBytesArray] initially', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
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

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
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

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
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

        await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
      });

      it('should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]', async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        let value = combineAllowedCalls(
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

        await context.universalProfile.connect(canOnlyAddController).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      describe('when setting an invalid bytes28[CompactBytesArray] of allowed calls for a new beneficiary', () => {
        it('should fail when setting an bytes28[CompactBytesArray] (= random bytes)', async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          let value = '0xbadbadbadbad';

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should fail when setting an invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            newController.address.substr(2);

          let value = '0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe';

          await expect(context.universalProfile.connect(canOnlyAddController).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });

    describe('when caller has EDITPERMISSIONS', () => {
      it('should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...', async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + newController.address.substr(2);

        let value = combineAllowedCalls(
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

        await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
      });

      it('should pass when trying to edit existing allowed standards for an address', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
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

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('should pass when address had an invalid bytes28[CompactBytesArray] initially', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should pass when address had 32 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip('should pass when address had 40 x 0 bytes set initially as allowed calls', async () => {
        let key =
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ['0xffffffff', '0xffffffff'],
        );

        await context.universalProfile.connect(canOnlyEditPermissions).setData(key, value);

        // prettier-ignore
        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      describe('when changing the list of interface IDs in allowed calls <standard>:ANY:ANY to an invalid value', () => {
        it('should revert with error when value = random bytes', async () => {
          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          let value = '0xbadbadbadbad';

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });

        it('should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)', async () => {
          let key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            beneficiary.address.substring(2);

          let value = '0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe';

          await expect(context.universalProfile.connect(canOnlyEditPermissions).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(value);
        });
      });
    });
  });
};
