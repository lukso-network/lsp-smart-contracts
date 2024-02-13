import { expect } from 'chai';
import { ethers } from 'hardhat';

// setup
import { LSP6InternalsTestContext } from '../../utils/context';
import { setupKeyManagerHelper } from '../../utils/fixtures';
import { ALL_PERMISSIONS, ERC725YDataKeys } from '../../../constants';

export const testSetDataInternals = (buildContext: () => Promise<LSP6InternalsTestContext>) => {
  let context: LSP6InternalsTestContext;

  before(async () => {
    context = await buildContext();

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
    ];

    const permissionValues = [ALL_PERMISSIONS];

    await setupKeyManagerHelper(context, permissionKeys, permissionValues);
  });

  describe('`_verifyCanSetData(...)` array', () => {
    describe('when providing a `setData(bytes32[],bytes[])` array payload', () => {
      describe('when there is not the same number of dataKeys[] and dataValues[] in each arrays', () => {
        it('should revert with error `...` if the dataValues is < (less than) dataKeys', async () => {
          const dataKeys = [
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
          ];

          const dataValues = [
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
          ];

          await expect(
            context.keyManagerInternalTester.verifyCanSetData(
              context.mainController.address,
              ALL_PERMISSIONS,
              dataKeys,
              dataValues,
            ),
          ).to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            'ERC725Y_DataKeysValuesLengthMismatch',
          );
        });

        it('should revert with error `...` if the dataValues > (greater than) dataKeys', async () => {
          const dataKeys = [
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
          ];

          const dataValues = [
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
          ];

          await expect(
            context.keyManagerInternalTester.verifyCanSetData(
              context.mainController.address,
              ALL_PERMISSIONS,
              dataKeys,
              dataValues,
            ),
          ).to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            'ERC725Y_DataKeysValuesLengthMismatch',
          );
        });
      });

      describe('when there is the same number of dataKeys[] and dataValues[] in each array', () => {
        it('should pass', async () => {
          const dataKeys = [
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            ethers.utils.hexlify(ethers.utils.randomBytes(32)),
          ];

          const dataValues = [
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
            ethers.utils.hexlify(ethers.utils.randomBytes(10)),
          ];

          await expect(
            context.keyManagerInternalTester.verifyCanSetData(
              context.mainController.address,
              ALL_PERMISSIONS,
              dataKeys,
              dataValues,
            ),
          ).to.not.be.reverted;
        });
      });
    });
  });
};
