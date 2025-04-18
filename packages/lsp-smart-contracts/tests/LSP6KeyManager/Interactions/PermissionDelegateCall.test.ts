import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys } from '../../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { ALL_PERMISSIONS, PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

// helpers
import { combineAllowedCalls } from '../../utils/helpers';

export const shouldBehaveLikePermissionDelegateCall = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let ERC725YDelegateCall__factory;

  before(async () => {
    ERC725YDelegateCall__factory = await ethers.getContractFactory('DelegateCallTester');
  });

  describe('when trying to make a DELEGATECALL via UP, DELEGATECALL is disallowed', () => {
    let addressCanDelegateCall: SignerWithAddress, addressCannotDelegateCall: SignerWithAddress;

    let erc725YDelegateCallContract;

    before(async () => {
      context = await buildContext();

      addressCanDelegateCall = context.accounts[1];
      addressCannotDelegateCall = context.accounts[2];

      erc725YDelegateCallContract = await ERC725YDelegateCall__factory.connect(
        context.accounts[0],
      ).deploy(await context.universalProfile.getAddress());

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

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.DELEGATECALL,
        await erc725YDelegateCallContract.getAddress(),
        0,
        delegateCallPayload,
      ]);

      await expect(
        context.keyManager.connect(context.mainController).execute(executePayload),
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

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.DELEGATECALL,
        await erc725YDelegateCallContract.getAddress(),
        0,
        delegateCallPayload,
      ]);

      await expect(
        context.keyManager.connect(addressCanDelegateCall).execute(executePayload),
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

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.DELEGATECALL,
        await erc725YDelegateCallContract.getAddress(),
        0,
        delegateCallPayload,
      ]);

      await expect(
        context.keyManager.connect(addressCannotDelegateCall).execute(executePayload),
      ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');
    });
  });

  describe('when caller has permission SUPER_DELEGATECALL + 2 x allowed addresses', () => {
    let caller: SignerWithAddress;

    let allowedDelegateCallContracts;

    before(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      allowedDelegateCallContracts = [
        await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
          context.accounts[0].address,
        ),
        await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
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
          [
            await allowedDelegateCallContracts[0].getAddress(),
            await allowedDelegateCallContracts[1].getAddress(),
          ],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when calling a disallowed contract', () => {
      let randomContracts;

      before(async () => {
        randomContracts = [
          await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
            context.accounts[0].address,
          ),
          await ERC725YDelegateCall__factory.connect(context.accounts[0]).deploy(
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

            const executePayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [
                OPERATION_TYPES.DELEGATECALL,
                await randomContracts[ii].getAddress(),
                0,
                delegateCallPayload,
              ],
            );

            await expect(
              context.keyManager.connect(caller).execute(executePayload),
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

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.DELEGATECALL,
          await allowedDelegateCallContracts[0].getAddress(),
          0,
          delegateCallPayload,
        ]);

        await expect(
          context.keyManager.connect(caller).execute(executePayload),
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

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.DELEGATECALL,
          await allowedDelegateCallContracts[1].getAddress(),
          0,
          delegateCallPayload,
        ]);

        await expect(
          context.keyManager.connect(caller).execute(executePayload),
        ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');

        // prettier-ignore
        const newStorage = await context.universalProfile.getData(key);
        expect(newStorage).to.equal('0x');
      });
    });
  });
};
