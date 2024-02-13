import { expect } from 'chai';
import { ethers } from 'hardhat';

//types
import { BigNumber, BytesLike } from 'ethers';
import { SingleReentrancyRelayer__factory } from '../../../types';

// constants
import { ERC725YDataKeys, OPERATION_TYPES } from '../../../constants';

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
  generateSingleRelayPayload,
  loadTestCase,
} from './reentrancyHelpers';

export const testERC725XExecuteToLSP6ExecuteRelayCall = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
  buildReentrancyContext: (context: LSP6TestContext) => Promise<ReentrancyContext>,
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;
  let executeCalldata: {
    operationType: number;
    to: string;
    value: number;
    data: BytesLike;
  };

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('10'));
    reentrancyContext = await buildReentrancyContext(context);

    const reentrantCall = new SingleReentrancyRelayer__factory().interface.encodeFunctionData(
      'relayCallThatReenters',
      [context.keyManager.address],
    );

    executeCalldata = {
      operationType: OPERATION_TYPES.CALL,
      to: reentrancyContext.singleReentarncyRelayer.address,
      value: 0,
      data: reentrantCall,
    };
  });

  describe('when reentering and transferring value', () => {
    before(async () => {
      await generateSingleRelayPayload(
        context.universalProfile,
        context.keyManager,
        'TRANSFERVALUE',
        reentrancyContext.singleReentarncyRelayer,
        reentrancyContext.reentrantSigner,
        reentrancyContext.newControllerAddress,
        reentrancyContext.newURDAddress,
      );
    });

    transferValueTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant signer has the following permission set: PRESENT - ${
        testCase.permissionsText
      }; MISSING - ${testCase.missingPermission}; AllowedCalls - ${
        testCase.allowedCalls ? 'YES' : 'NO'
      }`, async () => {
        await loadTestCase(
          'TRANSFERVALUE',
          testCase,
          context,
          reentrancyContext.reentrantSigner.address,
          reentrancyContext.singleReentarncyRelayer.address,
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
          .withArgs(reentrancyContext.reentrantSigner.address, testCase.missingPermission);
      });
    });

    it('should revert if the reentrant signer has the following permissions: REENTRANCY, TRANSFERVALUE & NO AllowedCalls', async () => {
      await loadTestCase(
        'TRANSFERVALUE',
        transferValueTestCases.NoCallsAllowed,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
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

    it('should pass if the reentrant signer has the following permissions: REENTRANCY, TRANSFERVALUE & AllowedCalls', async () => {
      await loadTestCase(
        'TRANSFERVALUE',
        transferValueTestCases.ValidCase,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
      );

      expect(
        await context.universalProfile.provider.getBalance(context.universalProfile.address),
      ).to.equal(ethers.utils.parseEther('10'));

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

      expect(
        await context.universalProfile.provider.getBalance(context.universalProfile.address),
      ).to.equal(ethers.utils.parseEther('9'));

      expect(
        await context.universalProfile.provider.getBalance(
          reentrancyContext.singleReentarncyRelayer.address,
        ),
      ).to.equal(ethers.utils.parseEther('1'));
    });
  });

  describe('when reentering and setting data', () => {
    before(async () => {
      await generateSingleRelayPayload(
        context.universalProfile,
        context.keyManager,
        'SETDATA',
        reentrancyContext.singleReentarncyRelayer,
        reentrancyContext.reentrantSigner,
        reentrancyContext.newControllerAddress,
        reentrancyContext.newURDAddress,
      );
    });

    setDataTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant signer has the following permission set: PRESENT - ${
        testCase.permissionsText
      }; MISSING - ${testCase.missingPermission}; AllowedERC725YDataKeys - ${
        testCase.allowedERC725YDataKeys ? 'YES' : 'NO'
      }`, async () => {
        await loadTestCase(
          'SETDATA',
          testCase,
          context,
          reentrancyContext.reentrantSigner.address,
          reentrancyContext.singleReentarncyRelayer.address,
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
          .withArgs(reentrancyContext.reentrantSigner.address, testCase.missingPermission);
      });
    });

    it('should revert if the reentrant signer has the following permissions: REENTRANCY, SETDATA & NO AllowedERC725YDataKeys', async () => {
      await loadTestCase(
        'SETDATA',
        setDataTestCases.NoERC725YDataKeysAllowed,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
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

    it('should pass if the reentrant signer has the following permissions: REENTRANCY, SETDATA & AllowedERC725YDataKeys', async () => {
      await loadTestCase(
        'SETDATA',
        setDataTestCases.ValidCase,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
      );

      await context.universalProfile
        .connect(reentrancyContext.caller)
        .execute(
          executeCalldata.operationType,
          executeCalldata.to,
          executeCalldata.value,
          executeCalldata.data,
        );

      const hardcodedKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('SomeRandomTextUsed'));
      const hardcodedValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('SomeRandomTextUsed'));

      expect(await context.universalProfile.getData(hardcodedKey)).to.equal(hardcodedValue);
    });
  });

  describe('when reentering and adding permissions', () => {
    before(async () => {
      await generateSingleRelayPayload(
        context.universalProfile,
        context.keyManager,
        'ADDCONTROLLER',
        reentrancyContext.singleReentarncyRelayer,
        reentrancyContext.reentrantSigner,
        reentrancyContext.newControllerAddress,
        reentrancyContext.newURDAddress,
      );
    });

    addPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant signer has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'ADDCONTROLLER',
          testCase,
          context,
          reentrancyContext.reentrantSigner.address,
          reentrancyContext.singleReentarncyRelayer.address,
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
          .withArgs(reentrancyContext.reentrantSigner.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant signer has the following permissions: REENTRANCY, ADDCONTROLLER', async () => {
      await loadTestCase(
        'ADDCONTROLLER',
        addPermissionsTestCases.ValidCase,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
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
      const hardcodedPermissionValue =
        '0x0000000000000000000000000000000000000000000000000000000000000010';

      expect(await context.universalProfile.getData(hardcodedPermissionKey)).to.equal(
        hardcodedPermissionValue,
      );
    });
  });

  describe('when reentering and changing permissions', () => {
    before(async () => {
      await generateSingleRelayPayload(
        context.universalProfile,
        context.keyManager,
        'EDITPERMISSIONS',
        reentrancyContext.singleReentarncyRelayer,
        reentrancyContext.reentrantSigner,
        reentrancyContext.newControllerAddress,
        reentrancyContext.newURDAddress,
      );
    });

    editPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant signer has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'EDITPERMISSIONS',
          testCase,
          context,
          reentrancyContext.reentrantSigner.address,
          reentrancyContext.singleReentarncyRelayer.address,
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
          .withArgs(reentrancyContext.reentrantSigner.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant signer has the following permissions: REENTRANCY, EDITPERMISSIONS', async () => {
      await loadTestCase(
        'EDITPERMISSIONS',
        editPermissionsTestCases.ValidCase,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
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
    before(async () => {
      await generateSingleRelayPayload(
        context.universalProfile,
        context.keyManager,
        'ADDUNIVERSALRECEIVERDELEGATE',
        reentrancyContext.singleReentarncyRelayer,
        reentrancyContext.reentrantSigner,
        reentrancyContext.newControllerAddress,
        reentrancyContext.newURDAddress,
      );
    });

    addUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant signer has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'ADDUNIVERSALRECEIVERDELEGATE',
          testCase,
          context,
          reentrancyContext.reentrantSigner.address,
          reentrancyContext.singleReentarncyRelayer.address,
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
          .withArgs(reentrancyContext.reentrantSigner.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant signer has the following permissions: REENTRANCY, ADDUNIVERSALRECEIVERDELEGATE', async () => {
      await loadTestCase(
        'ADDUNIVERSALRECEIVERDELEGATE',
        addUniversalReceiverDelegateTestCases.ValidCase,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
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
    before(async () => {
      await generateSingleRelayPayload(
        context.universalProfile,
        context.keyManager,
        'CHANGEUNIVERSALRECEIVERDELEGATE',
        reentrancyContext.singleReentarncyRelayer,
        reentrancyContext.reentrantSigner,
        reentrancyContext.newControllerAddress,
        reentrancyContext.newURDAddress,
      );
    });

    changeUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant signer has the following permission set: PRESENT - ${testCase.permissionsText}; MISSING - ${testCase.missingPermission};`, async () => {
        await loadTestCase(
          'CHANGEUNIVERSALRECEIVERDELEGATE',
          testCase,
          context,
          reentrancyContext.reentrantSigner.address,
          reentrancyContext.singleReentarncyRelayer.address,
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
          .withArgs(reentrancyContext.reentrantSigner.address, testCase.missingPermission);
      });
    });

    it('should pass if the reentrant signer has the following permissions: REENTRANCY, CHANGEUNIVERSALRECEIVERDELEGATE', async () => {
      await loadTestCase(
        'CHANGEUNIVERSALRECEIVERDELEGATE',
        changeUniversalReceiverDelegateTestCases.ValidCase,
        context,
        reentrancyContext.reentrantSigner.address,
        reentrancyContext.singleReentarncyRelayer.address,
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
