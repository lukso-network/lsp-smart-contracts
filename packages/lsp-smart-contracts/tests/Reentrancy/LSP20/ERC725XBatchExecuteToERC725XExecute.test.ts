import { expect } from 'chai';
import { ethers } from 'hardhat';

//types
import { BigNumber, BytesLike } from 'ethers';

// constants
import { ALL_PERMISSIONS, ERC725YDataKeys } from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';

// helpers
import {
  // Types
  ReentrancyContext,
  // Test cases
  transferValueTestCases,
  setDataTestCases,
  addPermissionsTestCases,
  editPermissionsTestCases,
  addUniversalReceiverDelegateTestCases,
  changeUniversalReceiverDelegateTestCases,
  // Functions
  loadTestCase,
} from './reentrancyHelpers';

import { LSP20ReentrantContract__factory } from '../../../types';
import { Interface } from 'ethers/lib/utils';

export const testERC725XBatchExecuteToERC725XExecute = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
  buildReentrancyContext: (context: LSP6TestContext) => Promise<ReentrancyContext>,
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;
  let reentrantContractInterface: Interface;

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('10'));
    reentrancyContext = await buildReentrancyContext(context);
    reentrantContractInterface = new LSP20ReentrantContract__factory().interface;
  });

  describe('when reentering and transferring value', () => {
    let reentrantCall: BytesLike;

    before(async () => {
      reentrantCall = reentrantContractInterface.encodeFunctionData('callThatReenters', [
        'TRANSFERVALUE',
      ]);
    });

    transferValueTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${
        testCase.permissionsText
      }; MISSING - ${testCase.missingPermission}; AllowedCalls - ${
        testCase.allowedCalls ? 'YES' : 'NO'
      }`, async () => {
        await loadTestCase(
          'TRANSFERVALUE',
          testCase,
          context,
          reentrancyContext.reentrantContract.address,
          reentrancyContext.reentrantContract.address,
        );

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(reentrancyContext.reentrantContract.address, testCase.missingPermission);
      });
    });

    it('should revert if the reentrant contract has the following permissions: REENTRANCY, TRANSFERVALUE & NO AllowedCalls', async () => {
      await loadTestCase(
        'TRANSFERVALUE',
        transferValueTestCases.NoCallsAllowed,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await expect(
        context.universalProfile
          .connect(reentrancyContext.caller)
          .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
      ).to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed');
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, TRANSFERVALUE & AllowedCalls', async () => {
      await loadTestCase(
        'TRANSFERVALUE',
        transferValueTestCases.ValidCase,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      expect(
        await context.universalProfile.provider.getBalance(context.universalProfile.address),
      ).to.equal(ethers.utils.parseEther('10'));

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]);

      expect(
        await context.universalProfile.provider.getBalance(context.universalProfile.address),
      ).to.equal(ethers.utils.parseEther('9'));

      expect(
        await context.universalProfile.provider.getBalance(
          reentrancyContext.reentrantContract.address,
        ),
      ).to.equal(ethers.utils.parseEther('1'));
    });
  });

  describe('when reentering and setting data', () => {
    let reentrantCall: BytesLike;

    before(async () => {
      reentrantCall = reentrantContractInterface.encodeFunctionData('callThatReenters', [
        'SETDATA',
      ]);
    });

    setDataTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${
        testCase.permissionsText
      }; MISSING - ${testCase.missingPermission}; AllowedERC725YDataKeys - ${
        testCase.allowedERC725YDataKeys ? 'YES' : 'NO'
      }`, async () => {
        await loadTestCase(
          'SETDATA',
          testCase,
          context,
          reentrancyContext.reentrantContract.address,
          reentrancyContext.reentrantContract.address,
        );

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(reentrancyContext.reentrantContract.address, testCase.missingPermission);
      });
    });

    it('should revert if the reentrant contract has the following permissions: REENTRANCY, SETDATA & NO AllowedERC725YDataKeys', async () => {
      await loadTestCase(
        'SETDATA',
        setDataTestCases.NoERC725YDataKeysAllowed,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await expect(
        context.universalProfile
          .connect(reentrancyContext.caller)
          .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
      ).to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed');
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, SETDATA & AllowedERC725YDataKeys', async () => {
      await loadTestCase(
        'SETDATA',
        setDataTestCases.ValidCase,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]);

      const hardcodedKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('SomeRandomTextUsed'));
      const hardcodedValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('SomeRandomTextUsed'));

      expect(await context.universalProfile.getData(hardcodedKey)).to.equal(hardcodedValue);
    });
  });

  describe('when reentering and adding permissions', () => {
    let reentrantCall: BytesLike;

    before(async () => {
      reentrantCall = reentrantContractInterface.encodeFunctionData('callThatReenters', [
        'ADDCONTROLLER',
      ]);
    });

    addPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'ADDCONTROLLER',
          testCase,
          context,
          reentrancyContext.reentrantContract.address,
          reentrancyContext.reentrantContract.address,
        );

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(reentrancyContext.reentrantContract.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, ADDCONTROLLER', async () => {
      await loadTestCase(
        'ADDCONTROLLER',
        addPermissionsTestCases.ValidCase,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]);

      const hardcodedPermissionKey =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        reentrancyContext.newControllerAddress.substring(2);

      expect(await context.universalProfile.getData(hardcodedPermissionKey)).to.equal(
        ALL_PERMISSIONS,
      );
    });
  });

  describe('when reentering and changing permissions', () => {
    let reentrantCall: BytesLike;

    before(async () => {
      reentrantCall = reentrantContractInterface.encodeFunctionData('callThatReenters', [
        'EDITPERMISSIONS',
      ]);
    });

    editPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'EDITPERMISSIONS',
          testCase,
          context,
          reentrancyContext.reentrantContract.address,
          reentrancyContext.reentrantContract.address,
        );

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(reentrancyContext.reentrantContract.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, EDITPERMISSIONS', async () => {
      await loadTestCase(
        'EDITPERMISSIONS',
        editPermissionsTestCases.ValidCase,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]);

      const hardcodedPermissionKey =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        reentrancyContext.newControllerAddress.substring(2);
      const hardcodedPermissionValue = '0x';

      expect(await context.universalProfile.getData(hardcodedPermissionKey)).to.equal(
        hardcodedPermissionValue,
      );
    });
  });

  describe('when reentering and adding URD', () => {
    let reentrantCall: BytesLike;

    before(async () => {
      reentrantCall = reentrantContractInterface.encodeFunctionData('callThatReenters', [
        'ADDUNIVERSALRECEIVERDELEGATE',
      ]);
    });

    addUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'ADDUNIVERSALRECEIVERDELEGATE',
          testCase,
          context,
          reentrancyContext.reentrantContract.address,
          reentrancyContext.reentrantContract.address,
        );

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(reentrancyContext.reentrantContract.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, ADDUNIVERSALRECEIVERDELEGATE', async () => {
      await loadTestCase(
        'ADDUNIVERSALRECEIVERDELEGATE',
        addUniversalReceiverDelegateTestCases.ValidCase,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]);

      const hardcodedLSP1Key =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        reentrancyContext.randomLSP1TypeId.substring(2, 42);

      const hardcodedLSP1Value = reentrancyContext.newURDAddress;

      expect(await context.universalProfile.getData(hardcodedLSP1Key)).to.equal(
        hardcodedLSP1Value.toLowerCase(),
      );
    });
  });

  describe('when reentering and changing URD', () => {
    let reentrantCall: BytesLike;

    before(async () => {
      reentrantCall = reentrantContractInterface.encodeFunctionData('callThatReenters', [
        'CHANGEUNIVERSALRECEIVERDELEGATE',
      ]);
    });

    changeUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'CHANGEUNIVERSALRECEIVERDELEGATE',
          testCase,
          context,
          reentrancyContext.reentrantContract.address,
          reentrancyContext.reentrantContract.address,
        );

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(reentrancyContext.reentrantContract.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, CHANGEUNIVERSALRECEIVERDELEGATE', async () => {
      await loadTestCase(
        'CHANGEUNIVERSALRECEIVERDELEGATE',
        changeUniversalReceiverDelegateTestCases.ValidCase,
        context,
        reentrancyContext.reentrantContract.address,
        reentrancyContext.reentrantContract.address,
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .executeBatch([0], [reentrancyContext.reentrantContract.address], [0], [reentrantCall]);

      const hardcodedLSP1Key =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        reentrancyContext.randomLSP1TypeId.substring(2, 42);

      const hardcodedLSP1Value = '0x';

      expect(await context.universalProfile.getData(hardcodedLSP1Key)).to.equal(
        hardcodedLSP1Value.toLowerCase(),
      );
    });
  });
};
