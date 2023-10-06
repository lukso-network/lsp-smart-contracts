import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { ERC725YDelegateCall, ERC725YDelegateCall__factory } from '../../../../types';

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
import { combineAllowedCalls } from '../../../utils/helpers';

export const shouldBehaveLikePermissionDelegateCall = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('when trying to make a DELEGATECALL via UP, DELEGATECALL is disallowed', () => {
    let addressCanDelegateCall: SignerWithAddress, addressCannotDelegateCall: SignerWithAddress;

    let erc725YDelegateCallContract: ERC725YDelegateCall;

    before(async () => {
      context = await buildContext();

      addressCanDelegateCall = context.accounts[1];
      addressCannotDelegateCall = context.accounts[2];

      erc725YDelegateCallContract = await new ERC725YDelegateCall__factory(
        context.mainController,
      ).deploy(context.universalProfile.address);

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanDelegateCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCannotDelegateCall.address.substring(2),
      ];

      const permissionsValues = [ALL_PERMISSIONS, PERMISSIONS.DELEGATECALL, PERMISSIONS.CALL];

      await setupKeyManager(context, permissionKeys, permissionsValues);
    });

    it('should revert even if caller has ALL PERMISSIONS', async () => {
      const key = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const value = '0xbbbbbbbbbbbbbbbb';

      // first check that nothing is set under this key
      // inside the storage of the calling UP
      const currentStorage = await context.universalProfile.getData(key);
      expect(currentStorage).to.equal('0x');

      // Doing a delegatecall to the setData function of another UP
      // should update the ERC725Y storage of the UP making the delegatecall
      const delegateCallPayload = erc725YDelegateCallContract.interface.encodeFunctionData(
        'updateStorage',
        [key, value],
      );

      await expect(
        context.universalProfile
          .connect(context.mainController)
          .execute(
            OPERATION_TYPES.DELEGATECALL,
            erc725YDelegateCallContract.address,
            0,
            delegateCallPayload,
          ),
      ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');
    });

    it('should revert even if caller has permission DELEGATECALL', async () => {
      const key = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const value = '0xbbbbbbbbbbbbbbbb';

      // first check that nothing is set under this key
      // inside the storage of the calling UP
      const currentStorage = await context.universalProfile.getData(key);
      expect(currentStorage).to.equal('0x');

      // Doing a delegatecall to the setData function of another UP
      // should update the ERC725Y storage of the UP making the delegatecall
      const delegateCallPayload = erc725YDelegateCallContract.interface.encodeFunctionData(
        'updateStorage',
        [key, value],
      );

      await expect(
        context.universalProfile
          .connect(addressCanDelegateCall)
          .execute(
            OPERATION_TYPES.DELEGATECALL,
            erc725YDelegateCallContract.address,
            0,
            delegateCallPayload,
          ),
      ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');
    });

    it('should revert with operation disallowed, even if caller does not have permission DELEGATECALL', async () => {
      const key = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const value = '0xbbbbbbbbbbbbbbbb';

      // first check that nothing is set under this key
      // inside the storage of the calling UP
      const currentStorage = await context.universalProfile.getData(key);
      expect(currentStorage).to.equal('0x');

      // Doing a delegatecall to the setData function of another UP
      // should update the ERC725Y storage of the UP making the delegatecall
      const delegateCallPayload = erc725YDelegateCallContract.interface.encodeFunctionData(
        'setDataBatch',
        [[key], [value]],
      );

      await expect(
        context.universalProfile
          .connect(addressCannotDelegateCall)
          .execute(
            OPERATION_TYPES.DELEGATECALL,
            erc725YDelegateCallContract.address,
            0,
            delegateCallPayload,
          ),
      ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');
    });
  });

  describe('when caller has permission SUPER_DELEGATECALL + 2 x allowed addresses', () => {
    let caller: SignerWithAddress;

    let allowedDelegateCallContracts: [ERC725YDelegateCall, ERC725YDelegateCall];

    before(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      allowedDelegateCallContracts = [
        await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
          context.accounts[0].address,
        ),
        await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
          context.accounts[0].address,
        ),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.SUPER_DELEGATECALL,
        combineAllowedCalls(
          [CALLTYPE.DELEGATECALL, CALLTYPE.DELEGATECALL],
          [allowedDelegateCallContracts[0].address, allowedDelegateCallContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when calling a disallowed contract', () => {
      let randomContracts: ERC725YDelegateCall[];

      before(async () => {
        randomContracts = [
          await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await new ERC725YDelegateCall__factory(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
        ];
      });

      describe('it should revert since DELEGATECALL is disallowed', () => {
        for (let ii = 0; ii < 5; ii++) {
          it(`delegate call to contract nb ${ii}`, async () => {
            const key = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            const value = '0xbbbbbbbbbbbbbbbb';

            const currentStorage = await context.universalProfile['getData(bytes32)'](key);
            expect(currentStorage).to.equal('0x');

            // prettier-ignore
            const delegateCallPayload = randomContracts[ii].interface.encodeFunctionData(
              "updateStorage", [
              key,
              value,
            ]);

            await expect(
              context.universalProfile
                .connect(caller)
                .execute(
                  OPERATION_TYPES.DELEGATECALL,
                  randomContracts[ii].address,
                  0,
                  delegateCallPayload,
                ),
            ).to.be.revertedWithCustomError(
              context.keyManager,
              'DelegateCallDisallowedViaKeyManager',
            );

            // storage should remain unchanged and not set
            const newStorage = await context.universalProfile['getData(bytes32)'](key);
            expect(newStorage).to.equal('0x');
          });
        }
      });
    });

    describe('when calling an allowed contract', () => {
      it('should revert with DELEGATECALL disallowed when trying to interact with the 1st allowed contract', async () => {
        const key = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const value = '0xbbbbbbbbbbbbbbbb';

        // prettier-ignore
        const currentStorage = await context.universalProfile.getData(key);
        expect(currentStorage).to.equal('0x');

        // prettier-ignore
        const delegateCallPayload = allowedDelegateCallContracts[0].interface.encodeFunctionData(
          "updateStorage", [
          key,
          value,
        ]);

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(
              OPERATION_TYPES.DELEGATECALL,
              allowedDelegateCallContracts[0].address,
              0,
              delegateCallPayload,
            ),
        ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');

        // prettier-ignore
        const newStorage = await context.universalProfile.getData(key);
        expect(newStorage).to.equal('0x');
      });

      it('should revert with DELEGATECALL disallowed when trying to interact with the 2nd allowed contract', async () => {
        const key = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const value = '0xbbbbbbbbbbbbbbbb';

        // prettier-ignore
        const currentStorage = await context.universalProfile.getData(key);
        expect(currentStorage).to.equal('0x');

        // prettier-ignore
        const delegateCallPayload = allowedDelegateCallContracts[1].interface.encodeFunctionData(
          "updateStorage", [
          key,
          value,
        ]);

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(
              OPERATION_TYPES.DELEGATECALL,
              allowedDelegateCallContracts[1].address,
              0,
              delegateCallPayload,
            ),
        ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');

        // prettier-ignore
        const newStorage = await context.universalProfile.getData(key);
        expect(newStorage).to.equal('0x');
      });
    });
  });
};
