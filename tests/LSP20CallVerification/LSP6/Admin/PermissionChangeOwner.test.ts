import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { BigNumber, ContractTransaction } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, PERMISSIONS, OPERATION_TYPES } from '../../../../constants';

import { LSP6KeyManager, LSP6KeyManager__factory } from '../../../../types';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import { provider } from '../../../utils/helpers';

export const shouldBehaveLikePermissionChangeOwner = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let canChangeOwner: SignerWithAddress, cannotChangeOwner: SignerWithAddress;

  let newKeyManager: LSP6KeyManager;

  let permissionsKeys: string[];
  let permissionsValues: string[];

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('10'));

    canChangeOwner = context.accounts[1];
    cannotChangeOwner = context.accounts[2];

    newKeyManager = await new LSP6KeyManager__factory(context.mainController).deploy(
      context.universalProfile.address,
    );

    permissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canChangeOwner.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        cannotChangeOwner.address.substring(2),
    ];

    permissionsValues = [PERMISSIONS.CHANGEOWNER, PERMISSIONS.SETDATA];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe('when calling `transferOwnership(...)` with the target address as parameter', () => {
    it('should revert', async () => {
      await expect(
        context.universalProfile
          .connect(canChangeOwner)
          .transferOwnership(context.universalProfile.address),
      ).to.be.revertedWithCustomError(
        context.universalProfile,
        'LSP14CannotTransferOwnershipToSelf',
      );
    });
  });

  describe('when calling `transferOwnership(...)` with a new KeyManager address as parameter', () => {
    describe('when caller does not have have CHANGEOWNER permission', () => {
      it('should revert', async () => {
        await expect(
          context.universalProfile
            .connect(cannotChangeOwner)
            .transferOwnership(newKeyManager.address),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(cannotChangeOwner.address, 'TRANSFEROWNERSHIP');
      });
    });

    describe('when caller has ALL PERMISSIONS', () => {
      before('`transferOwnership(...)` to new Key Manager', async () => {
        await context.universalProfile
          .connect(context.mainController)
          .transferOwnership(newKeyManager.address);
      });

      after('reset ownership', async () => {
        await context.universalProfile
          .connect(context.mainController)
          .transferOwnership(ethers.constants.AddressZero);
      });

      it('should have set newKeyManager as pendingOwner', async () => {
        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(newKeyManager.address);
      });

      it('owner should remain the current KeyManager', async () => {
        const ownerBefore = await context.universalProfile.owner();

        await context.universalProfile
          .connect(context.mainController)
          .transferOwnership(newKeyManager.address);

        const ownerAfter = await context.universalProfile.owner();

        expect(ownerBefore).to.equal(context.keyManager.address);
        expect(ownerAfter).to.equal(context.keyManager.address);
      });

      describe('it should still be possible to call onlyOwner functions via the old KeyManager', () => {
        it('setData(...)', async () => {
          const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
          const value = '0xabcd';

          await context.universalProfile.connect(context.mainController).setData(key, value);

          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('execute(...) - LYX transfer', async () => {
          const recipient = context.accounts[8];
          const amount = ethers.utils.parseEther('3');

          const recipientBalanceBefore = await provider.getBalance(recipient.address);
          const accountBalanceBefore = await provider.getBalance(context.universalProfile.address);

          await context.universalProfile
            .connect(context.mainController)
            .execute(OPERATION_TYPES.CALL, recipient.address, amount, '0x');

          const recipientBalanceAfter = await provider.getBalance(recipient.address);
          const accountBalanceAfter = await provider.getBalance(context.universalProfile.address);

          // recipient balance should have gone up
          expect(recipientBalanceAfter).to.be.gt(recipientBalanceBefore);

          // account balance should have gone down
          expect(accountBalanceAfter).to.be.lt(accountBalanceBefore);
        });
      });

      it('should override the pendingOwner when transferOwnership(...) is called twice', async () => {
        const overridenPendingOwner = ethers.Wallet.createRandom().address;

        await context.universalProfile
          .connect(context.mainController)
          .transferOwnership(overridenPendingOwner);

        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(overridenPendingOwner);
      });
    });

    describe('when caller has only CHANGE0OWNER permission', () => {
      before('`transferOwnership(...)` to new KeyManager', async () => {
        await context.universalProfile
          .connect(canChangeOwner)
          .transferOwnership(newKeyManager.address);
      });

      after('reset ownership', async () => {
        await context.universalProfile
          .connect(context.mainController)
          .transferOwnership(ethers.constants.AddressZero);
      });

      it('should have set newKeyManager as pendingOwner', async () => {
        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(newKeyManager.address);
      });

      it('owner should remain the current KeyManager', async () => {
        const ownerBefore = await context.universalProfile.owner();

        await context.universalProfile
          .connect(canChangeOwner)
          .transferOwnership(newKeyManager.address);

        const ownerAfter = await context.universalProfile.owner();

        expect(ownerBefore).to.equal(context.keyManager.address);
        expect(ownerAfter).to.equal(context.keyManager.address);
      });

      it('should override the pendingOwner when transferOwnership(...) is called twice', async () => {
        const overridenPendingOwner = await new LSP6KeyManager__factory(
          context.mainController,
        ).deploy(context.universalProfile.address);

        await context.universalProfile
          .connect(canChangeOwner)
          .transferOwnership(overridenPendingOwner.address);

        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(overridenPendingOwner.address);
      });
    });
  });

  describe('when calling acceptOwnership(...) from a KeyManager that is not the pendingOwner', () => {
    it('should revert', async () => {
      const notPendingKeyManager = await new LSP6KeyManager__factory(context.accounts[5]).deploy(
        context.universalProfile.address,
      );

      const pendignOwner = await context.universalProfile.pendingOwner();

      const payload = context.universalProfile.interface.getSighash('acceptOwnership');

      await expect(notPendingKeyManager.connect(context.mainController).execute(payload))
        .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
        .withArgs(pendignOwner);
    });
  });

  describe('when calling acceptOwnership(...) directly on the contract', () => {
    let pendingOwner: string;

    describe('when pending owner is a new Key Manager', () => {
      before(async () => {
        await context.universalProfile
          .connect(context.mainController)
          .transferOwnership(newKeyManager.address);

        pendingOwner = await context.universalProfile.pendingOwner();
      });

      it('should not let you accept ownership if controller does not have permission `CHANGEOWNER`', async () => {
        await expect(context.universalProfile.connect(cannotChangeOwner).acceptOwnership())
          .to.be.revertedWithCustomError(newKeyManager, 'NotAuthorised')
          .withArgs(cannotChangeOwner.address, 'TRANSFEROWNERSHIP');
      });

      it('should let you accept ownership if controller has permission', async () => {
        await context.universalProfile.connect(canChangeOwner).acceptOwnership();

        expect(await context.universalProfile.owner()).to.equal(newKeyManager.address);
      });

      it("should have change the account's owner to the pendingOwner (= pending KeyManager)", async () => {
        const updatedOwner = await context.universalProfile.owner();
        expect(updatedOwner).to.equal(pendingOwner);
      });

      it('should have cleared the pendingOwner after transfering ownership', async () => {
        const newPendingOwner = await context.universalProfile.pendingOwner();
        expect(newPendingOwner).to.equal(ethers.constants.AddressZero);
      });
    });
  });

  describe('after KeyManager has been upgraded via acceptOwnership(...)', () => {
    let oldKeyManager: LSP6KeyManager;

    before(async () => {
      oldKeyManager = context.keyManager;
    });

    describe('old KeyManager should not be allowed to call onlyOwner functions anymore', () => {
      it('should revert with error `NoPermissionsSet` when calling `setData(...)`', async () => {
        const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
        const value = '0xabcd';

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await expect(oldKeyManager.connect(context.mainController).execute(payload))
          .to.be.revertedWithCustomError(newKeyManager, 'NoPermissionsSet')
          .withArgs(oldKeyManager.address);
      });

      it('should revert with error `NoPermissionsSet` when calling `execute(...)`', async () => {
        const recipient = context.accounts[3];
        const amount = ethers.utils.parseEther('3');

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          recipient.address,
          amount,
          '0x',
        ]);

        await expect(oldKeyManager.connect(context.mainController).execute(payload))
          .to.be.revertedWithCustomError(newKeyManager, 'NoPermissionsSet')
          .withArgs(oldKeyManager.address);
      });
    });

    describe('new Key Manager should be allowed to call onlyOwner functions', () => {
      it('setData(...)', async () => {
        const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
        const value = '0xabcd';

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await newKeyManager.connect(context.mainController).execute(payload);

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('execute(...) - LYX transfer', async () => {
        const recipient = context.accounts[3];
        const amount = ethers.utils.parseEther('3');

        const recipientBalanceBefore = await provider.getBalance(recipient.address);
        const accountBalanceBefore = await provider.getBalance(context.universalProfile.address);

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          recipient.address,
          amount,
          '0x',
        ]);

        await newKeyManager.connect(context.mainController).execute(payload);

        const recipientBalanceAfter = await provider.getBalance(recipient.address);
        const accountBalanceAfter = await provider.getBalance(context.universalProfile.address);

        // recipient balance should have gone up
        expect(recipientBalanceAfter).to.be.gt(recipientBalanceBefore);

        // account balance should have gone down
        expect(accountBalanceAfter).to.be.lt(accountBalanceBefore);
      });
    });
  });

  describe('when calling `renounceOwnership(...)`', () => {
    describe('caller has ALL PERMISSIONS`', async () => {
      let renounceOwnershipFirstTx: ContractTransaction;
      let renounceOwnershipSecondTx: ContractTransaction;

      before(async () => {
        // 1st call
        renounceOwnershipFirstTx = await context.universalProfile
          .connect(context.mainController)
          .renounceOwnership();

        // mine 200 blocks
        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(200)]);

        // 2nd call
        renounceOwnershipSecondTx = await context.universalProfile
          .connect(context.mainController)
          .renounceOwnership();
      });

      it('should emit `RenounceOwnershipStarted` on first call', async () => {
        await expect(renounceOwnershipFirstTx).to.emit(
          context.universalProfile,
          'RenounceOwnershipStarted',
        );
      });

      it('should emit `OwnershipRenounced` on second call', async () => {
        await expect(renounceOwnershipSecondTx).to.emit(
          context.universalProfile,
          'OwnershipRenounced',
        );
      });

      it('should clear the `pendingOwner` and set it to `AddressZero`', async () => {
        expect(await context.universalProfile.pendingOwner()).to.equal(
          ethers.constants.AddressZero,
        );
      });

      it('should update the owner to `AddressZero`', async () => {
        expect(await context.universalProfile.owner()).to.equal(ethers.constants.AddressZero);
      });
    });
  });
};
