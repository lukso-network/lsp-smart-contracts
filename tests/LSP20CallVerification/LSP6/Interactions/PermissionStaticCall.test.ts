import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { TargetContract, TargetContract__factory } from '../../../../types';

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  OPERATION_TYPES,
  CALLTYPE,
} from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import { abiCoder, combineAllowedCalls, combineCallTypes } from '../../../utils/helpers';

export const shouldBehaveLikePermissionStaticCall = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let addressCanMakeStaticCall: SignerWithAddress,
    addressCannotMakeStaticCall: SignerWithAddress,
    addressCanMakeStaticCallNoAllowedCalls: SignerWithAddress;

  let targetContract: TargetContract;

  before(async () => {
    context = await buildContext();

    addressCanMakeStaticCall = context.accounts[1];
    addressCannotMakeStaticCall = context.accounts[2];
    addressCanMakeStaticCallNoAllowedCalls = context.accounts[3];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanMakeStaticCall.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        addressCanMakeStaticCall.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCannotMakeStaticCall.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanMakeStaticCallNoAllowedCalls.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      PERMISSIONS.STATICCALL,
      combineAllowedCalls(
        [combineCallTypes(CALLTYPE.STATICCALL, CALLTYPE.VALUE)],
        [targetContract.address],
        ['0xffffffff'],
        ['0xffffffff'],
      ),
      PERMISSIONS.SETDATA,
      PERMISSIONS.STATICCALL,
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe('when caller has ALL PERMISSIONS', () => {
    it('should pass and return data', async () => {
      const expectedName = await targetContract.callStatic.getName();

      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      const result = await context.universalProfile
        .connect(context.mainController)
        .callStatic.execute(
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        );

      const [decodedResult] = abiCoder.decode(['string'], result);
      expect(decodedResult).to.equal(expectedName);
    });
  });

  describe('when caller has permission STATICCALL + some allowed calls', () => {
    it('should pass and return data', async () => {
      const expectedName = await targetContract.callStatic.getName();

      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      const result = await context.universalProfile
        .connect(addressCanMakeStaticCall)
        .callStatic.execute(
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        );

      const [decodedResult] = abiCoder.decode(['string'], result);
      expect(decodedResult).to.equal(expectedName);
    });

    it('should revert when trying to change state at the target contract', async () => {
      const initialValue = await targetContract.callStatic.getName();

      const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
        'modified name',
      ]);

      await expect(
        context.universalProfile
          .connect(addressCanMakeStaticCall)
          .execute(OPERATION_TYPES.STATICCALL, targetContract.address, 0, targetContractPayload),
      ).to.be.reverted;

      // ensure state hasn't changed.
      const newValue = await targetContract.callStatic.getName();
      expect(initialValue).to.equal(newValue);
    });

    it('should revert when caller try to make a CALL', async () => {
      const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
        'modified name',
      ]);

      await expect(
        context.universalProfile
          .connect(addressCanMakeStaticCall)
          .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCanMakeStaticCall.address, 'CALL');
    });
  });

  describe('when caller has permission STATICCALL + no allowed calls', () => {
    it('should revert with `NotAllowedCall` error', async () => {
      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      await expect(
        context.universalProfile
          .connect(addressCanMakeStaticCallNoAllowedCalls)
          .callStatic.execute(
            OPERATION_TYPES.STATICCALL,
            targetContract.address,
            0,
            targetContractPayload,
          ),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
        .withArgs(addressCanMakeStaticCallNoAllowedCalls.address);
    });
  });

  describe('when caller does not have permission STATICCALL', () => {
    it('should revert', async () => {
      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      await expect(
        context.universalProfile
          .connect(addressCannotMakeStaticCall)
          .execute(OPERATION_TYPES.STATICCALL, targetContract.address, 0, targetContractPayload),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCannotMakeStaticCall.address, 'STATICCALL');
    });
  });

  describe('when caller has permission STATICCALL + 2 x allowed addresses', () => {
    let caller: SignerWithAddress;
    let allowedTargetContracts: [TargetContract, TargetContract];

    before(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      allowedTargetContracts = [
        await new TargetContract__factory(context.accounts[0]).deploy(),
        await new TargetContract__factory(context.accounts[0]).deploy(),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.STATICCALL,
        combineAllowedCalls(
          [CALLTYPE.STATICCALL, CALLTYPE.STATICCALL],
          [allowedTargetContracts[0].address, allowedTargetContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    it('should revert when trying to interact with a non-allowed address', async () => {
      const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

      await expect(
        context.universalProfile
          .connect(caller)
          .execute(
            OPERATION_TYPES.STATICCALL,
            targetContract.address,
            0,
            targetContract.interface.getSighash('getName'),
          ),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
        .withArgs(
          caller.address,
          targetContract.address,
          targetContract.interface.getSighash('getName'),
        );
    });

    describe('when interacting with 1st allowed contract', () => {
      it('should allow to call view function -> getName()', async () => {
        const targetContract = allowedTargetContracts[0];

        const name = await targetContract.getName();

        const result = await context.universalProfile
          .connect(caller)
          .callStatic.execute(
            OPERATION_TYPES.STATICCALL,
            targetContract.address,
            0,
            targetContract.interface.getSighash('getName'),
          );

        const [decodedResult] = abiCoder.decode(['string'], result);
        expect(decodedResult).to.equal(name);
      });

      it('should allow to call view function -> getNumber()', async () => {
        const targetContract = allowedTargetContracts[0];

        const number = await targetContract.getNumber();

        const result = await context.universalProfile
          .connect(caller)
          .callStatic.execute(
            OPERATION_TYPES.STATICCALL,
            targetContract.address,
            0,
            targetContract.interface.getSighash('getNumber'),
          );

        const [decodedResult] = abiCoder.decode(['uint256'], result);
        expect(decodedResult).to.equal(number);
      });

      it('should revert when calling state changing function -> setName(string)', async () => {
        const targetContract = allowedTargetContracts[0];

        const targetPayload = targetContract.interface.encodeFunctionData('setName', ['new name']);

        await expect(
          context.universalProfile
            .connect(caller)
            .callStatic.execute(
              OPERATION_TYPES.STATICCALL,
              targetContract.address,
              0,
              targetPayload,
            ),
        ).to.be.reverted;
      });

      it('should revert when calling state changing function -> setNumber(uint256)', async () => {
        const targetContract = allowedTargetContracts[0];

        const targetPayload = targetContract.interface.encodeFunctionData('setNumber', [12345]);

        await expect(
          context.universalProfile
            .connect(caller)
            .callStatic.execute(
              OPERATION_TYPES.STATICCALL,
              targetContract.address,
              0,
              targetPayload,
            ),
        ).to.be.reverted;
      });
    });

    describe('when interacting with 2nd allowed contract', () => {
      it('should allow to interact with 2nd allowed contract - getName()', async () => {
        const targetContract = allowedTargetContracts[1];

        const name = await targetContract.getName();

        const result = await context.universalProfile
          .connect(caller)
          .callStatic.execute(
            OPERATION_TYPES.STATICCALL,
            targetContract.address,
            0,
            targetContract.interface.getSighash('getName'),
          );

        const [decodedResult] = abiCoder.decode(['string'], result);
        expect(decodedResult).to.equal(name);
      });

      it('should allow to interact with 2nd allowed contract - getNumber()', async () => {
        const targetContract = allowedTargetContracts[1];

        const number = await targetContract.getNumber();

        const result = await context.universalProfile
          .connect(caller)
          .callStatic.execute(
            OPERATION_TYPES.STATICCALL,
            targetContract.address,
            0,
            targetContract.interface.getSighash('getNumber'),
          );

        const [decodedResult] = abiCoder.decode(['uint256'], result);
        expect(decodedResult).to.equal(number);
      });

      it('should revert when calling state changing function -> setName(string)', async () => {
        const targetContract = allowedTargetContracts[1];

        const targetPayload = targetContract.interface.encodeFunctionData('setName', ['new name']);

        await expect(
          context.universalProfile
            .connect(caller)
            .callStatic.execute(
              OPERATION_TYPES.STATICCALL,
              targetContract.address,
              0,
              targetPayload,
            ),
        ).to.be.reverted;
      });

      it('should revert when calling state changing function -> setNumber(uint256)', async () => {
        const targetContract = allowedTargetContracts[1];

        const targetPayload = targetContract.interface.encodeFunctionData('setNumber', [12345]);

        await expect(
          context.universalProfile
            .connect(caller)
            .callStatic.execute(
              OPERATION_TYPES.STATICCALL,
              targetContract.address,
              0,
              targetPayload,
            ),
        ).to.be.reverted;
      });
    });
  });

  describe('when caller has permission SUPER_STATICCALL + 2 allowed addresses', () => {
    let caller: SignerWithAddress;
    let allowedTargetContracts: [TargetContract, TargetContract];

    before(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      allowedTargetContracts = [
        await new TargetContract__factory(context.accounts[0]).deploy(),
        await new TargetContract__factory(context.accounts[0]).deploy(),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.SUPER_STATICCALL,
        combineAllowedCalls(
          ['00000004', '00000004'],
          [allowedTargetContracts[0].address, allowedTargetContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('it should bypass allowed addresses check + allow to interact with any contract', () => {
      for (let ii = 1; ii <= 5; ii++) {
        it(`e.g: Target Contract nb ${ii}`, async () => {
          const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

          const name = await targetContract.getName();

          const result = await context.universalProfile
            .connect(caller)
            .callStatic.execute(
              OPERATION_TYPES.STATICCALL,
              targetContract.address,
              0,
              targetContract.interface.getSighash('getName'),
            );

          const [decodedResult] = abiCoder.decode(['string'], result);
          expect(decodedResult).to.equal(name);
        });
      }
    });
  });
};
