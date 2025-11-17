import { expect } from 'chai';
import { hexlify, keccak256, parseEther, toUtf8Bytes, type BytesLike } from 'ethers';

// constants
import { ERC725YDataKeys } from '../../../constants.js';

// setup
import { type LSP6TestContext } from '../../utils/context.js';

// helpers
import {
  // Types
  type ReentrancyContext,
  // Test cases
  transferValueTestCases,
  setDataTestCases,
  addPermissionsTestCases,
  editPermissionsTestCases,
  addUniversalReceiverDelegateTestCases,
  changeUniversalReceiverDelegateTestCases,
  // Functions
  generateExecutePayload,
  loadTestCase,
} from './reentrancyHelpers.js';

export const testSingleExecuteToSingleExecute = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
  buildReentrancyContext: (context: LSP6TestContext) => Promise<ReentrancyContext>,
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;

  before(async () => {
    context = await buildContext(parseEther('10'));
    reentrancyContext = await buildReentrancyContext(context);
  });

  describe('when reentering and transferring value', () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        await context.keyManager.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
        'TRANSFERVALUE',
      );
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
          await reentrancyContext.reentrantContract.getAddress(),
          await reentrancyContext.reentrantContract.getAddress(),
        );

        await expect(context.keyManager.connect(reentrancyContext.caller).execute(executePayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(
            await reentrancyContext.reentrantContract.getAddress(),
            testCase.missingPermission,
          );
      });
    });

    it('should revert if the reentrant contract has the following permissions: REENTRANCY, TRANSFERVALUE & NO AllowedCalls', async () => {
      await loadTestCase(
        'TRANSFERVALUE',
        transferValueTestCases.NoCallsAllowed,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await expect(
        context.keyManager.connect(reentrancyContext.caller).execute(executePayload),
      ).to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed');
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, TRANSFERVALUE & AllowedCalls', async () => {
      await loadTestCase(
        'TRANSFERVALUE',
        transferValueTestCases.ValidCase,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      expect(
        await context.ethers.provider.getBalance(await context.universalProfile.getAddress()),
      ).to.equal(parseEther('10'));

      await context.keyManager.connect(reentrancyContext.caller).execute(executePayload);

      expect(
        await context.ethers.provider.getBalance(await context.universalProfile.getAddress()),
      ).to.equal(parseEther('9'));

      expect(
        await context.ethers.provider.getBalance(
          await reentrancyContext.reentrantContract.getAddress(),
        ),
      ).to.equal(parseEther('1'));
    });
  });

  describe('when reentering and setting data', () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        await context.keyManager.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
        'SETDATA',
      );
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
          await reentrancyContext.reentrantContract.getAddress(),
          await reentrancyContext.reentrantContract.getAddress(),
        );

        await expect(context.keyManager.connect(reentrancyContext.caller).execute(executePayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(
            await reentrancyContext.reentrantContract.getAddress(),
            testCase.missingPermission,
          );
      });
    });

    it('should revert if the reentrant contract has the following permissions: REENTRANCY, SETDATA & NO AllowedERC725YDataKeys', async () => {
      await loadTestCase(
        'SETDATA',
        setDataTestCases.NoERC725YDataKeysAllowed,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await expect(
        context.keyManager.connect(reentrancyContext.caller).execute(executePayload),
      ).to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed');
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, SETDATA & AllowedERC725YDataKeys', async () => {
      await loadTestCase(
        'SETDATA',
        setDataTestCases.ValidCase,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await context.keyManager.connect(reentrancyContext.caller).execute(executePayload);

      const hardcodedKey = keccak256(toUtf8Bytes('SomeRandomTextUsed'));
      const hardcodedValue = hexlify(toUtf8Bytes('SomeRandomTextUsed'));

      expect(await context.universalProfile.getData(hardcodedKey)).to.equal(hardcodedValue);
    });
  });

  describe('when reentering and adding permissions', () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        await context.keyManager.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
        'ADDCONTROLLER',
      );
    });

    addPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'ADDCONTROLLER',
          testCase,
          context,
          await reentrancyContext.reentrantContract.getAddress(),
          await reentrancyContext.reentrantContract.getAddress(),
        );

        await expect(context.keyManager.connect(reentrancyContext.caller).execute(executePayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(
            await reentrancyContext.reentrantContract.getAddress(),
            testCase.missingPermission,
          );
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, ADDCONTROLLER', async () => {
      await loadTestCase(
        'ADDCONTROLLER',
        addPermissionsTestCases.ValidCase,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await context.keyManager.connect(reentrancyContext.caller).execute(executePayload);

      const hardcodedPermissionKey =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        reentrancyContext.newControllerAddress.substring(2);
      const hardcodedPermissionValue =
        '0x0000000000000000000000000000000000000000000000000000000000000010';

      expect(await context.universalProfile.getData(hardcodedPermissionKey)).to.equal(
        hardcodedPermissionValue,
      );
    });
  });

  describe('when reentering and changing permissions', () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        await context.keyManager.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
        'EDITPERMISSIONS',
      );
    });

    editPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'EDITPERMISSIONS',
          testCase,
          context,
          await reentrancyContext.reentrantContract.getAddress(),
          await reentrancyContext.reentrantContract.getAddress(),
        );

        await expect(context.keyManager.connect(reentrancyContext.caller).execute(executePayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(
            await reentrancyContext.reentrantContract.getAddress(),
            testCase.missingPermission,
          );
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, EDITPERMISSIONS', async () => {
      await loadTestCase(
        'EDITPERMISSIONS',
        editPermissionsTestCases.ValidCase,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await context.keyManager.connect(reentrancyContext.caller).execute(executePayload);

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
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        await context.keyManager.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
        'ADDUNIVERSALRECEIVERDELEGATE',
      );
    });

    addUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'ADDUNIVERSALRECEIVERDELEGATE',
          testCase,
          context,
          await reentrancyContext.reentrantContract.getAddress(),
          await reentrancyContext.reentrantContract.getAddress(),
        );

        await expect(context.keyManager.connect(reentrancyContext.caller).execute(executePayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(
            await reentrancyContext.reentrantContract.getAddress(),
            testCase.missingPermission,
          );
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, ADDUNIVERSALRECEIVERDELEGATE', async () => {
      await loadTestCase(
        'ADDUNIVERSALRECEIVERDELEGATE',
        addUniversalReceiverDelegateTestCases.ValidCase,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await context.keyManager.connect(reentrancyContext.caller).execute(executePayload);

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
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        await context.keyManager.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
        'CHANGEUNIVERSALRECEIVERDELEGATE',
      );
    });

    changeUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'CHANGEUNIVERSALRECEIVERDELEGATE',
          testCase,
          context,
          await reentrancyContext.reentrantContract.getAddress(),
          await reentrancyContext.reentrantContract.getAddress(),
        );

        await expect(context.keyManager.connect(reentrancyContext.caller).execute(executePayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(
            await reentrancyContext.reentrantContract.getAddress(),
            testCase.missingPermission,
          );
      });
    });

    it('should pass if the reentrant contract has the following permissions: REENTRANCY, CHANGEUNIVERSALRECEIVERDELEGATE', async () => {
      await loadTestCase(
        'CHANGEUNIVERSALRECEIVERDELEGATE',
        changeUniversalReceiverDelegateTestCases.ValidCase,
        context,
        await reentrancyContext.reentrantContract.getAddress(),
        await reentrancyContext.reentrantContract.getAddress(),
      );

      await context.keyManager.connect(reentrancyContext.caller).execute(executePayload);

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
