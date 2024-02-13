import { expect } from 'chai';
import { ethers } from 'hardhat';

// setup
import { LSP6InternalsTestContext } from '../../utils/context';
import { setupKeyManagerHelper } from '../../utils/fixtures';
import { ALL_PERMISSIONS, ERC725YDataKeys, OPERATION_TYPES } from '../../../constants';
import { abiCoder } from '../../utils/helpers';

export const testExecuteInternals = (buildContext: () => Promise<LSP6InternalsTestContext>) => {
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

  describe('`_verifyPermissions(address,uint256,bytes)`', () => {
    it('should pass when the function is called with valid parameters', async () => {
      const executeParameters = {
        operationType: OPERATION_TYPES.CALL,
        to: context.accounts[3].address,
        value: ethers.utils.parseEther('5'),
        data: '0xcafecafecafecafe',
      };

      const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
        executeParameters.operationType,
        executeParameters.to,
        executeParameters.value,
        executeParameters.data,
      ]);

      await expect(
        context.keyManagerInternalTester.verifyPermissions(
          context.mainController.address,
          calldata,
        ),
      ).to.not.be.reverted;
    });

    it('should revert if the address param is not left padded with 12 x `00` bytes', async () => {
      const executeParameters = {
        operationType: OPERATION_TYPES.CALL,
        to: context.accounts[3].address,
        value: ethers.utils.parseEther('5'),
        data: '0xcafecafecafecafe',
      };

      const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
        executeParameters.operationType,
        executeParameters.to,
        executeParameters.value,
        executeParameters.data,
      ]);

      const abiEncodedAddress = abiCoder.encode(['address'], [executeParameters.to]);

      const invalidPart = 'deadbeefdeadbeefdeadbeef';
      const addressPart = executeParameters.to.toLowerCase().substring(2);

      const invalidCalldata = calldata.replace(
        abiEncodedAddress.substring(2),
        invalidPart + addressPart,
      );

      // `abi.decode` will fail to decode an `address` type not padded with `00` on the left,
      // resulting in a revert without any error data
      await expect(
        context.keyManagerInternalTester.verifyPermissions(
          context.mainController.address,
          invalidCalldata,
        ),
      ).to.be.reverted;
    });
  });
};
