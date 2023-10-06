import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, PERMISSIONS } from '../../../constants';

// helpers
import { encodeCompactBytesArray } from '../../utils/helpers';
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

export const shouldBehaveLikeSetAllowedERC725YDataKeys = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('setting Allowed ERC725YDataKeys', () => {
    let canOnlyAddController: SignerWithAddress, canOnlyEditPermissions: SignerWithAddress;

    let beneficiaryWithPermissions: SignerWithAddress,
      beneficiaryNoPermissions: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiaryWithPermissions = context.accounts[3];
      beneficiaryNoPermissions = context.accounts[4];
      invalidBeneficiary = context.accounts[5];
      zero32Bytes = context.accounts[6];
      zero40Bytes = context.accounts[7];

      // prettier-ignore
      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + beneficiaryWithPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + zero40Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] + beneficiaryWithPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] + beneficiaryNoPermissions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] + invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] + zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] + zero40Bytes.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.SETDATA,
        PERMISSIONS.SETDATA,
        PERMISSIONS.SETDATA,
        PERMISSIONS.SETDATA,
        encodeCompactBytesArray([
          ERC725YDataKeys.LSP3['LSP3Profile'],
          // prettier-ignore
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
        ]),
        encodeCompactBytesArray([
          ethers.utils.hexlify(ethers.utils.randomBytes(32)),
          ethers.utils.hexlify(ethers.utils.randomBytes(32)),
        ]),
        '0x11223344',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000',
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when caller has ADDCONTROLLER', () => {
      describe('when controller / beneficiary had some permissions set', () => {
        describe('when beneficiary had some ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...', () => {
          it('should fail when adding an extra allowed ERC725Y data key', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = encodeCompactBytesArray([
              ERC725YDataKeys.LSP3['LSP3Profile'],
              // prettier-ignore
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
              // prettier-ignore
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
            ]);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });

          it('should fail when removing an allowed ERC725Y data key', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = encodeCompactBytesArray([ERC725YDataKeys.LSP3['LSP3Profile']]);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });

          it('should fail when trying to clear the CompactedBytesArray completely', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = '0x';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddController.address, 'EDITPERMISSIONS');
          });

          it('should fail when setting an invalid CompactedBytesArray', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = '0xbadbadbadbad';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(
                context.keyManager,
                'InvalidEncodedAllowedERC725YDataKeys',
              )
              .withArgs(value, "couldn't VALIDATE the data value");
          });
        });

        describe('when beneficiary had no ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...', () => {
          it('should pass when setting a valid CompactedBytesArray', async () => {
            const newController = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              newController.address.substr(2);

            const value = encodeCompactBytesArray([
              // prettier-ignore
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Profile Key 1")),
              // prettier-ignore
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Profile Key 2")),
            ]);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyAddController).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should fail when setting an invalid CompactedBytesArray (random bytes)', async () => {
            const newController = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              newController.address.substr(2);

            const value = '0xbadbadbadbad';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyAddController).execute(payload))
              .to.be.revertedWithCustomError(
                context.keyManager,
                'InvalidEncodedAllowedERC725YDataKeys',
              )
              .withArgs(value, "couldn't VALIDATE the data value");
          });
        });
      });

      describe('when controller / beneficiary had no permissions set', () => {
        it('should pass and edit the list of Allowed ERC725Y Data Keys', async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
            beneficiaryNoPermissions.address.substring(2);

          const value = encodeCompactBytesArray([
            ERC725YDataKeys.LSP3['LSP3Profile'],
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
          ]);

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(canOnlyAddController).execute(payload);

          expect(await context.universalProfile.getData(key)).to.equal(value);
        });
      });
    });

    describe('when caller has EDITPERMISSIONS', () => {
      describe('when controller / beneficiary had some permissions set', () => {
        describe('when beneficiary had some ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...', () => {
          it('should pass when adding an extra allowed ERC725Y data key', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = encodeCompactBytesArray([
              ERC725YDataKeys.LSP3['LSP3Profile'],
              // prettier-ignore
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
              // prettier-ignore
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
            ]);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should pass when removing an allowed ERC725Y data key', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = encodeCompactBytesArray([ERC725YDataKeys.LSP3['LSP3Profile']]);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await context.keyManager.connect(canOnlyEditPermissions).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });

          it('should pass when trying to clear the CompactedBytesArray completely', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

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

          it('should fail when setting an invalid CompactedBytesArray', async () => {
            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              beneficiaryWithPermissions.address.substring(2);

            const value = '0xbadbadbadbad';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
              .to.be.revertedWithCustomError(
                context.keyManager,
                'InvalidEncodedAllowedERC725YDataKeys',
              )
              .withArgs(value, "couldn't VALIDATE the data value");
          });
        });

        describe('when beneficiary had no ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...', () => {
          it('should fail and not authorize to add a list of allowed ERC725Y data keys (not authorised)', async () => {
            const newController = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              newController.address.substr(2);

            const value = encodeCompactBytesArray([
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Custom Key 1')),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Custom Key 2')),
            ]);

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
          });

          it('should fail when setting an invalid CompactedBytesArray', async () => {
            const newController = ethers.Wallet.createRandom();

            const key =
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              newController.address.substr(2);

            const value = '0xbadbadbadbad';

            const payload = context.universalProfile.interface.encodeFunctionData('setData', [
              key,
              value,
            ]);

            await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
              .to.be.revertedWithCustomError(
                context.keyManager,
                'InvalidEncodedAllowedERC725YDataKeys',
              )
              .withArgs(value, "couldn't VALIDATE the data value");
          });
        });
      });

      describe('when controller / beneficiary had no permissions set', () => {
        it("should revert with error `NotAuthorised('ADDCONTROLLER')` when trying to add a list of allowed ERC725Y data keys", async () => {
          const key =
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
            beneficiaryNoPermissions.address.substring(2);

          const value = encodeCompactBytesArray([
            ERC725YDataKeys.LSP3['LSP3Profile'],
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
          ]);

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(context.keyManager.connect(canOnlyEditPermissions).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyEditPermissions.address, 'ADDCONTROLLER');
        });
      });
    });
  });
};
