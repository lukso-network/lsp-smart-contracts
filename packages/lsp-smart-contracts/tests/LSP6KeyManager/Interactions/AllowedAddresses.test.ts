import { expect } from 'chai';
import { network } from 'hardhat';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { TargetContract, TargetContract__factory } from '../../../types/ethers-contracts/index.js';

// constants
import {
  ERC725YDataKeys,
  OPERATION_TYPES,
  ALL_PERMISSIONS,
  PERMISSIONS,
  CALLTYPE,
} from '../../../constants.js';

// setup
import { LSP6TestContext } from '../../utils/context.js';
import { setupKeyManager } from '../../utils/fixtures.js';

// helpers
import {
  EMPTY_PAYLOAD,
  getRandomAddresses,
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from '../../utils/helpers.js';

export const shouldBehaveLikeAllowedAddresses = (buildContext: () => Promise<LSP6TestContext>) => {
  let ethers: HardhatEthers;
  let context: LSP6TestContext;

  let canCallOnlyTwoAddresses: HardhatEthersSigner, invalidEncodedAllowedCalls: HardhatEthersSigner;

  let allowedEOA: HardhatEthersSigner,
    notAllowedEOA: HardhatEthersSigner,
    allowedTargetContract: TargetContract,
    notAllowedTargetContract: TargetContract;

  const invalidEncodedAllowedCallsValue = '0xbadbadbadbad';

  before(async () => {
    ({ ethers } = await network.connect());
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
      [allowedEOA.address, await allowedTargetContract.getAddress()],
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
      to: await context.universalProfile.getAddress(),
      value: ethers.parseEther('10'),
    });
  });

  describe('when caller has ALL_DEFAULT_PERMISSIONS + no ALLOWED ADDRESSES set', () => {
    describe('it should be allowed to interact with any address', () => {
      const randomAddresses = getRandomAddresses(5);

      randomAddresses.forEach((recipient) => {
        it(`sending 1 LYX to EOA ${recipient}`, async () => {
          const amount = ethers.parseEther('1');

          const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            recipient,
            amount,
            EMPTY_PAYLOAD,
          ]);

          await expect(
            context.keyManager.connect(context.mainController).execute(transferPayload),
          ).to.changeEtherBalances(
            context.ethers,
            [context.universalProfile, recipient],
            [`-${amount}`, amount],
          );
        });
      });
    });
  });

  describe('when caller has 2 x addresses set under `AllowedCalls`', () => {
    it('should be allowed to send LYX to an allowed address (= EOA)', async () => {
      const amount = ethers.parseEther('1');

      const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        allowedEOA.address,
        amount,
        EMPTY_PAYLOAD,
      ]);

      await expect(
        context.keyManager.connect(canCallOnlyTwoAddresses).execute(transferPayload),
      ).to.changeEtherBalances(
        context.ethers,
        [context.universalProfile, allowedEOA.address],
        [`-${amount}`, amount],
      );
    });

    it('should be allowed to interact with an allowed address (= contract)', async () => {
      const argument = 'new name';

      const targetContractPayload = allowedTargetContract.interface.encodeFunctionData('setName', [
        argument,
      ]);

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        await allowedTargetContract.getAddress(),
        0,
        targetContractPayload,
      ]);

      await context.keyManager.connect(canCallOnlyTwoAddresses).execute(payload);

      const result = await allowedTargetContract.getName();
      expect(result).to.equal(argument);
    });

    it('should revert when sending LYX to a non-allowed address (= EOA)', async () => {
      const initialBalanceUP = await ethers.provider.getBalance(
        await context.universalProfile.getAddress(),
      );
      const initialBalanceRecipient = await ethers.provider.getBalance(notAllowedEOA.address);

      const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        notAllowedEOA.address,
        ethers.parseEther('1'),
        EMPTY_PAYLOAD,
      ]);

      await expect(context.keyManager.connect(canCallOnlyTwoAddresses).execute(transferPayload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
        .withArgs(canCallOnlyTwoAddresses.address, notAllowedEOA.address, '0x00000000');

      const newBalanceUP = await ethers.provider.getBalance(
        await context.universalProfile.getAddress(),
      );
      const newBalanceRecipient = await ethers.provider.getBalance(notAllowedEOA.address);

      expect(newBalanceUP).to.equal(initialBalanceUP);
      expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
    });

    it('should revert when interacting with an non-allowed address (= contract)', async () => {
      const argument = 'new name';

      const targetContractPayload = notAllowedTargetContract.interface.encodeFunctionData(
        'setName',
        [argument],
      );

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        await notAllowedTargetContract.getAddress(),
        0,
        targetContractPayload,
      ]);

      await expect(context.keyManager.connect(canCallOnlyTwoAddresses).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
        .withArgs(
          canCallOnlyTwoAddresses.address,
          await notAllowedTargetContract.getAddress(),
          notAllowedTargetContract.interface.getFunction('setName').selector,
        );
    });
  });

  describe('when caller has an invalid abi-encoded array set for ALLOWED ADDRESSES', () => {
    describe('it should not allow to interact with any address', () => {
      const randomAddresses = getRandomAddresses(5);

      randomAddresses.forEach((recipient) => {
        it(`-> should revert when sending 1 LYX to EOA ${recipient}`, async () => {
          await ethers.provider.getBalance(await context.universalProfile.getAddress());
          await ethers.provider.getBalance(recipient);

          const amount = ethers.parseEther('1');

          const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            recipient,
            amount,
            EMPTY_PAYLOAD,
          ]);

          await expect(
            context.keyManager.connect(invalidEncodedAllowedCalls).execute(transferPayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidEncodedAllowedCalls')
            .withArgs(invalidEncodedAllowedCallsValue);
        });
      });
    });
  });
};
