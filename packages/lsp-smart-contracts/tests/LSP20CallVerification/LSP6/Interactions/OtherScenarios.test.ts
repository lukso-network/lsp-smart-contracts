import { expect } from 'chai';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';

import {
  type TargetContract,
  TargetContract__factory,
} from '../../../../types/ethers-contracts/index.js';

// constants
import { ERC725YDataKeys } from '../../../../constants.js';
import { ALL_PERMISSIONS, PERMISSIONS } from '@lukso/lsp6-contracts';

// setup
import type { LSP6TestContext } from '../../../utils/context.js';
import { setupKeyManager } from '../../../utils/fixtures.js';

export const otherTestScenarios = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let addressCanMakeCall: HardhatEthersSigner;
  let targetContract: TargetContract;

  before(async () => {
    context = await buildContext();

    addressCanMakeCall = context.accounts[4];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    const permissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanMakeCall.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS, PERMISSIONS.CALL];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe('wrong operation type', () => {
    it('Should revert because of wrong operation type when caller has ALL PERMISSIONS', async () => {
      const targetPayload = targetContract.interface.encodeFunctionData('setName', ['new name']);

      const INVALID_OPERATION_TYPE = 8;

      await expect(
        context.universalProfile
          .connect(context.mainController)
          .execute(INVALID_OPERATION_TYPE, await targetContract.getAddress(), 0, targetPayload),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_UnknownOperationType');
    });

    it('Should revert because of wrong operation type when caller has not ALL PERMISSIONS', async () => {
      const targetPayload = targetContract.interface.encodeFunctionData('setName', ['new name']);

      const INVALID_OPERATION_TYPE = 8;

      await expect(
        context.universalProfile
          .connect(addressCanMakeCall)
          .execute(INVALID_OPERATION_TYPE, await targetContract.getAddress(), 0, targetPayload),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_UnknownOperationType');
    });
  });

  describe('When interacting via `batchCalls(...)`', () => {
    it('should to set data key properly when calldata is `setData(bytes32,bytes)`', async () => {
      const dataKey = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
      const dataValue = '0xbeefbeef';

      const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
        dataKey,
        dataValue,
      ]);

      await context.universalProfile.batchCalls([setDataPayload]);

      expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
    });
  });
};
