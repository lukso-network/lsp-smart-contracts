import { expect } from 'chai';

// setup
import { LSP6InternalsTestContext } from '../../utils/context.js';
import { setupKeyManagerHelper } from '../../utils/fixtures.js';
import { ERC725YDataKeys } from '../../../constants.js';
import { ALL_PERMISSIONS } from '@lukso/lsp6-contracts';
import { hexlify, randomBytes } from 'ethers';

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
          const dataKeys = [hexlify(randomBytes(32)), hexlify(randomBytes(32))];

          const dataValues = [
            hexlify(randomBytes(10)),
            hexlify(randomBytes(10)),
            hexlify(randomBytes(10)),
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
            hexlify(randomBytes(32)),
            hexlify(randomBytes(32)),
            hexlify(randomBytes(32)),
          ];

          const dataValues = [hexlify(randomBytes(10)), hexlify(randomBytes(10))];

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
            hexlify(randomBytes(32)),
            hexlify(randomBytes(32)),
            hexlify(randomBytes(32)),
          ];

          const dataValues = [
            hexlify(randomBytes(10)),
            hexlify(randomBytes(10)),
            hexlify(randomBytes(10)),
          ];

          await expect(
            context.keyManagerInternalTester.verifyCanSetData(
              context.mainController.address,
              ALL_PERMISSIONS,
              dataKeys,
              dataValues,
            ),
          ).to.not.revert(context.ethers);
        });
      });
    });
  });
};
