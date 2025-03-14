import { expect } from 'chai';
import { ethers } from 'hardhat';

// types
import { BytesLike } from 'ethers';

// constants
import { ERC725YDataKeys } from '../../../constants';
import { ALL_PERMISSIONS } from '@lukso/lsp6-contracts';

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
import { LSP20ReentrantContract__factory } from '../../../typechain';
import { provider } from '../../utils/helpers';

export const testERC725XExecuteToERC725XExecute = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
  buildReentrancyContext: (context: LSP6TestContext) => Promise<ReentrancyContext>,
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;

  before(async () => {
    context = await buildContext(ethers.parseEther('10'));
    reentrancyContext = await buildReentrancyContext(context);
  });

  describe('when reentering and transferring value', () => {
    let executeCalldata: {
      operationType: number;
      to: string;
      value: number;
      data: BytesLike;
    };

    before(async () => {
      const reentrantCall = new LSP20ReentrantContract__factory().interface.encodeFunctionData(
        'callThatReenters',
        ['TRANSFERVALUE'],
      );

      executeCalldata = {
        operationType: 0,
        to: await reentrancyContext.reentrantContract.getAddress(),
        value: 0,
        data: reentrantCall,
      };
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

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .execute(
              executeCalldata.operationType,
              executeCalldata.to,
              executeCalldata.value,
              executeCalldata.data,
            ),
        )
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
        context.universalProfile
          .connect(reentrancyContext.caller)
          .execute(
            executeCalldata.operationType,
            executeCalldata.to,
            executeCalldata.value,
            executeCalldata.data,
          ),
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

      expect(await provider.getBalance(await context.universalProfile.getAddress())).to.equal(
        ethers.parseEther('10'),
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

      expect(await provider.getBalance(await context.universalProfile.getAddress())).to.equal(
        ethers.parseEther('9'),
      );

      expect(
        await provider.getBalance(await reentrancyContext.reentrantContract.getAddress()),
      ).to.equal(ethers.parseEther('1'));
    });
  });

  describe('when reentering and setting data', () => {
    let executeCalldata: {
      operationType: number;
      to: string;
      value: number;
      data: BytesLike;
    };

    before(async () => {
      const reentrantCall = new LSP20ReentrantContract__factory().interface.encodeFunctionData(
        'callThatReenters',
        ['SETDATA'],
      );

      executeCalldata = {
        operationType: 0,
        to: await reentrancyContext.reentrantContract.getAddress(),
        value: 0,
        data: reentrantCall,
      };
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

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .execute(
              executeCalldata.operationType,
              executeCalldata.to,
              executeCalldata.value,
              executeCalldata.data,
            ),
        )
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
        context.universalProfile
          .connect(reentrancyContext.caller)
          .execute(
            executeCalldata.operationType,
            executeCalldata.to,
            executeCalldata.value,
            executeCalldata.data,
          ),
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

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

      const hardcodedKey = ethers.keccak256(ethers.toUtf8Bytes('SomeRandomTextUsed'));
      const hardcodedValue = ethers.hexlify(ethers.toUtf8Bytes('SomeRandomTextUsed'));

      expect(await context.universalProfile.getData(hardcodedKey)).to.equal(hardcodedValue);
    });
  });

  describe('when reentering and adding permissions', () => {
    let executeCalldata: {
      operationType: number;
      to: string;
      value: number;
      data: BytesLike;
    };

    before(async () => {
      const reentrantCall = new LSP20ReentrantContract__factory().interface.encodeFunctionData(
        'callThatReenters',
        ['ADDCONTROLLER'],
      );

      executeCalldata = {
        operationType: 0,
        to: await reentrancyContext.reentrantContract.getAddress(),
        value: 0,
        data: reentrantCall,
      };
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

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .execute(
              executeCalldata.operationType,
              executeCalldata.to,
              executeCalldata.value,
              executeCalldata.data,
            ),
        )
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

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

      const hardcodedPermissionKey =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        reentrancyContext.newControllerAddress.substring(2);

      expect(await context.universalProfile.getData(hardcodedPermissionKey)).to.equal(
        ALL_PERMISSIONS,
      );
    });
  });

  describe('when reentering and changing permissions', () => {
    let executeCalldata: {
      operationType: number;
      to: string;
      value: number;
      data: BytesLike;
    };

    before(async () => {
      const reentrantCall = new LSP20ReentrantContract__factory().interface.encodeFunctionData(
        'callThatReenters',
        ['EDITPERMISSIONS'],
      );

      executeCalldata = {
        operationType: 0,
        to: await reentrancyContext.reentrantContract.getAddress(),
        value: 0,
        data: reentrantCall,
      };
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

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .execute(
              executeCalldata.operationType,
              executeCalldata.to,
              executeCalldata.value,
              executeCalldata.data,
            ),
        )
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

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

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
    let executeCalldata: {
      operationType: number;
      to: string;
      value: number;
      data: BytesLike;
    };

    before(async () => {
      const reentrantCall = new LSP20ReentrantContract__factory().interface.encodeFunctionData(
        'callThatReenters',
        ['ADDUNIVERSALRECEIVERDELEGATE'],
      );

      executeCalldata = {
        operationType: 0,
        to: await reentrancyContext.reentrantContract.getAddress(),
        value: 0,
        data: reentrantCall,
      };
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

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .execute(
              executeCalldata.operationType,
              executeCalldata.to,
              executeCalldata.value,
              executeCalldata.data,
            ),
        )
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

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

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
    let executeCalldata: {
      operationType: number;
      to: string;
      value: number;
      data: BytesLike;
    };

    before(async () => {
      const reentrantCall = new LSP20ReentrantContract__factory().interface.encodeFunctionData(
        'callThatReenters',
        ['CHANGEUNIVERSALRECEIVERDELEGATE'],
      );

      executeCalldata = {
        operationType: 0,
        to: await reentrancyContext.reentrantContract.getAddress(),
        value: 0,
        data: reentrantCall,
      };
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

        await expect(
          context.universalProfile
            .connect(reentrancyContext.caller)
            .execute(
              executeCalldata.operationType,
              executeCalldata.to,
              executeCalldata.value,
              executeCalldata.data,
            ),
        )
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

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

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
