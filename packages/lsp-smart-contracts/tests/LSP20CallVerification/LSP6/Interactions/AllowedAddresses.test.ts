import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { TargetContract, TargetContract__factory } from '../../../../types';

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
} from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import {
  provider,
  EMPTY_PAYLOAD,
  getRandomAddresses,
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from '../../../utils/helpers';

export const shouldBehaveLikeAllowedAddresses = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let canCallOnlyTwoAddresses: SignerWithAddress, invalidEncodedAllowedCalls: SignerWithAddress;

  let allowedEOA: SignerWithAddress,
    notAllowedEOA: SignerWithAddress,
    allowedTargetContract: TargetContract,
    notAllowedTargetContract: TargetContract;
  const invalidEncodedAllowedCallsValue = '0xbadbadbadbad';

  before(async () => {
    context = await buildContext();

    canCallOnlyTwoAddresses = context.accounts[1];
    invalidEncodedAllowedCalls = context.accounts[2];

    allowedEOA = context.accounts[3];
    notAllowedEOA = context.accounts[4];

    allowedTargetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    notAllowedTargetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    const permissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        canCallOnlyTwoAddresses.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        canCallOnlyTwoAddresses.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        invalidEncodedAllowedCalls.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        invalidEncodedAllowedCalls.address.substring(2),
    ];

    const encodedAllowedCalls = combineAllowedCalls(
      [
        combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
        combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
      ],
      [allowedEOA.address, allowedTargetContract.address],
      ['0xffffffff', '0xffffffff'],
      ['0xffffffff', '0xffffffff'],
    );

    const permissionsValues = [
      ALL_PERMISSIONS,
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      encodedAllowedCalls,
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      invalidEncodedAllowedCallsValue,
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);

    await context.mainController.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther('10'),
    });
  });

  describe('when caller has ALL_DEFAULT_PERMISSIONS + no ALLOWED ADDRESSES set', () => {
    describe('it should be allowed to interact with any address', () => {
      const randomAddresses = getRandomAddresses(5);

      randomAddresses.forEach((recipient) => {
        it(`sending 1 LYX to EOA ${recipient}`, async () => {
          const initialBalanceUP = await provider.getBalance(context.universalProfile.address);
          const initialBalanceEOA = await provider.getBalance(recipient);

          const amount = ethers.utils.parseEther('1');

          await context.universalProfile
            .connect(context.mainController)
            .execute(OPERATION_TYPES.CALL, recipient, amount, EMPTY_PAYLOAD);

          const newBalanceUP = await provider.getBalance(context.universalProfile.address);
          expect(newBalanceUP).to.be.lt(initialBalanceUP);

          const newBalanceEOA = await provider.getBalance(recipient);
          expect(newBalanceEOA).to.be.gt(initialBalanceEOA);
        });
      });
    });
  });

  describe('when caller has 2 x addresses set under `AllowedCalls`', () => {
    it('should be allowed to send LYX to an allowed address (= EOA)', async () => {
      const initialBalanceUP = await provider.getBalance(context.universalProfile.address);
      const initialBalanceEOA = await provider.getBalance(allowedEOA.address);

      const amount = ethers.utils.parseEther('1');

      await context.universalProfile
        .connect(canCallOnlyTwoAddresses)
        .execute(OPERATION_TYPES.CALL, allowedEOA.address, amount, EMPTY_PAYLOAD);

      const newBalanceUP = await provider.getBalance(context.universalProfile.address);
      expect(newBalanceUP).to.be.lt(initialBalanceUP);

      const newBalanceEOA = await provider.getBalance(allowedEOA.address);
      expect(newBalanceEOA).to.be.gt(initialBalanceEOA);
    });

    it('should be allowed to interact with an allowed address (= contract)', async () => {
      const argument = 'new name';

      const targetContractPayload = allowedTargetContract.interface.encodeFunctionData('setName', [
        argument,
      ]);

      await context.universalProfile
        .connect(canCallOnlyTwoAddresses)
        .execute(OPERATION_TYPES.CALL, allowedTargetContract.address, 0, targetContractPayload);

      const result = await allowedTargetContract.callStatic.getName();
      expect(result).to.equal(argument);
    });

    it('should revert when sending LYX to a non-allowed address (= EOA)', async () => {
      const initialBalanceUP = await provider.getBalance(context.universalProfile.address);
      const initialBalanceRecipient = await provider.getBalance(notAllowedEOA.address);

      await expect(
        context.universalProfile
          .connect(canCallOnlyTwoAddresses)
          .execute(
            OPERATION_TYPES.CALL,
            notAllowedEOA.address,
            ethers.utils.parseEther('1'),
            EMPTY_PAYLOAD,
          ),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
        .withArgs(canCallOnlyTwoAddresses.address, notAllowedEOA.address, '0x00000000');

      const newBalanceUP = await provider.getBalance(context.universalProfile.address);
      const newBalanceRecipient = await provider.getBalance(notAllowedEOA.address);

      expect(newBalanceUP).to.equal(initialBalanceUP);
      expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
    });

    it('should revert when interacting with an non-allowed address (= contract)', async () => {
      const argument = 'new name';

      const targetContractPayload = notAllowedTargetContract.interface.encodeFunctionData(
        'setName',
        [argument],
      );

      await expect(
        context.universalProfile
          .connect(canCallOnlyTwoAddresses)
          .execute(
            OPERATION_TYPES.CALL,
            notAllowedTargetContract.address,
            0,
            targetContractPayload,
          ),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
        .withArgs(
          canCallOnlyTwoAddresses.address,
          notAllowedTargetContract.address,
          notAllowedTargetContract.interface.getSighash('setName'),
        );
    });
  });

  describe('when caller has an invalid abi-encoded array set for ALLOWED ADDRESSES', () => {
    describe('it should not allow to interact with any address', () => {
      const randomAddresses = getRandomAddresses(5);

      randomAddresses.forEach((recipient) => {
        it(`-> should revert when sending 1 LYX to EOA ${recipient}`, async () => {
          await provider.getBalance(context.universalProfile.address);
          await provider.getBalance(recipient);

          const amount = ethers.utils.parseEther('1');

          await expect(
            context.universalProfile
              .connect(invalidEncodedAllowedCalls)
              .execute(OPERATION_TYPES.CALL, recipient, amount, EMPTY_PAYLOAD),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(invalidEncodedAllowedCallsValue);
        });
      });
    });
  });
};
