import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { BigNumber, ContractTransaction } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, PERMISSIONS, OPERATION_TYPES, LSP25_VERSION } from '../../../constants';

import { LSP6KeyManager, LSP6KeyManager__factory } from '../../../types';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';
import { EIP191Signer } from '@lukso/eip191-signer.js';
import { LOCAL_PRIVATE_KEYS } from '../../utils/helpers';

export const shouldBehaveLikePermissionChangeOwner = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let canChangeOwner: SignerWithAddress, cannotChangeOwner: SignerWithAddress;

  let newKeyManager: LSP6KeyManager;

  let transferOwnershipPayload: string;
  let resetOwnershipPayload: string;

  let permissionsKeys: string[];
  let permissionsValues: string[];

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('20'));

    canChangeOwner = context.accounts[1];
    cannotChangeOwner = context.accounts[2];

    newKeyManager = await new LSP6KeyManager__factory(context.mainController).deploy(
      context.universalProfile.address,
    );

    transferOwnershipPayload = context.universalProfile.interface.encodeFunctionData(
      'transferOwnership',
      [newKeyManager.address],
    );

    resetOwnershipPayload = context.universalProfile.interface.encodeFunctionData(
      'transferOwnership',
      [ethers.constants.AddressZero],
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
      const transferOwnershipPayload = context.universalProfile.interface.encodeFunctionData(
        'transferOwnership',
        [context.universalProfile.address],
      );

      await expect(
        context.keyManager.connect(canChangeOwner).execute(transferOwnershipPayload),
      ).to.be.revertedWithCustomError(
        context.universalProfile,
        'LSP14CannotTransferOwnershipToSelf',
      );
    });
  });

  describe('when calling `transferOwnership(...)` with a new KeyManager address as parameter', () => {
    describe('when caller does not have permissions CHANGEOWNER', () => {
      it('should revert', async () => {
        await expect(
          context.keyManager.connect(cannotChangeOwner).execute(transferOwnershipPayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(cannotChangeOwner.address, 'TRANSFEROWNERSHIP');
      });
    });

    describe('when caller has ALL PERMISSIONS', () => {
      before('`transferOwnership(...)` to new Key Manager', async () => {
        await context.keyManager.connect(context.mainController).execute(transferOwnershipPayload);
      });

      after('reset ownership', async () => {
        await context.keyManager.connect(context.mainController).execute(resetOwnershipPayload);
      });

      it('should have set newKeyManager as pendingOwner', async () => {
        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(newKeyManager.address);
      });

      it('owner should remain the current KeyManager', async () => {
        const ownerBefore = await context.universalProfile.owner();

        const transferOwnershipPayload = context.universalProfile.interface.encodeFunctionData(
          'transferOwnership',
          [newKeyManager.address],
        );

        await context.keyManager.connect(context.mainController).execute(transferOwnershipPayload);

        const ownerAfter = await context.universalProfile.owner();

        expect(ownerBefore).to.equal(context.keyManager.address);
        expect(ownerAfter).to.equal(context.keyManager.address);
      });

      describe('it should still be possible to call onlyOwner functions via the old KeyManager', () => {
        it('setData(...)', async () => {
          const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
          const value = '0xabcd';

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });

        it('execute(...) - LYX transfer', async () => {
          const recipient = context.accounts[8];
          const amount = ethers.utils.parseEther('3');

          const payload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            recipient.address,
            amount,
            '0x',
          ]);

          await expect(
            context.keyManager.connect(context.mainController).execute(payload),
          ).to.changeEtherBalances([context.universalProfile, recipient], [`-${amount}`, amount]);
        });
      });

      it('should override the pendingOwner when transferOwnership(...) is called twice', async () => {
        const overridenPendingOwner = ethers.Wallet.createRandom().address;

        await context.keyManager
          .connect(context.mainController)
          .execute(
            context.universalProfile.interface.encodeFunctionData('transferOwnership', [
              overridenPendingOwner,
            ]),
          );

        // checksum the address of the pendingOwner fetched from the storage
        const pendingOwner = ethers.utils.getAddress(await context.universalProfile.pendingOwner());
        expect(pendingOwner).to.equal(overridenPendingOwner);
      });
    });

    describe('when caller has only CHANGEOWNER permission', () => {
      before('`transferOwnership(...)` to new KeyManager', async () => {
        await context.keyManager.connect(canChangeOwner).execute(transferOwnershipPayload);
      });

      after('reset ownership', async () => {
        await context.keyManager.connect(context.mainController).execute(resetOwnershipPayload);
      });

      it('should have set newKeyManager as pendingOwner', async () => {
        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(newKeyManager.address);
      });

      it('owner should remain the current KeyManager', async () => {
        const ownerBefore = await context.universalProfile.owner();

        const transferOwnershipPayload = context.universalProfile.interface.encodeFunctionData(
          'transferOwnership',
          [newKeyManager.address],
        );

        await context.keyManager.connect(canChangeOwner).execute(transferOwnershipPayload);

        const ownerAfter = await context.universalProfile.owner();

        expect(ownerBefore).to.equal(context.keyManager.address);
        expect(ownerAfter).to.equal(context.keyManager.address);
      });

      it('should override the pendingOwner when transferOwnership(...) is called twice', async () => {
        const overridenPendingOwner = await new LSP6KeyManager__factory(
          context.mainController,
        ).deploy(context.universalProfile.address);

        await context.keyManager
          .connect(canChangeOwner)
          .execute(
            context.universalProfile.interface.encodeFunctionData('transferOwnership', [
              overridenPendingOwner.address,
            ]),
          );

        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).to.equal(overridenPendingOwner.address);
      });
    });
  });

  describe('when calling acceptOwnership(...) from a KeyManager that is not the pendingOwner', () => {
    before('`transferOwnership(...)` to new Key Manager', async () => {
      await context.keyManager.connect(context.mainController).execute(transferOwnershipPayload);
    });

    it('should revert', async () => {
      const notPendingKeyManager = await new LSP6KeyManager__factory(context.accounts[5]).deploy(
        context.universalProfile.address,
      );

      const payload = context.universalProfile.interface.getSighash('acceptOwnership');

      await expect(notPendingKeyManager.connect(context.mainController).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet')
        .withArgs(notPendingKeyManager.address);
    });
  });

  describe('when calling acceptOwnership(...) via the pending new KeyManager', () => {
    let pendingOwner: string;

    before('`transferOwnership(...)` to new Key Manager', async () => {
      await context.universalProfile
        .connect(context.mainController)
        .transferOwnership(newKeyManager.address);

      pendingOwner = await context.universalProfile.pendingOwner();

      const acceptOwnershipPayload =
        context.universalProfile.interface.getSighash('acceptOwnership');

      await newKeyManager.connect(context.mainController).execute(acceptOwnershipPayload);
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

  describe('after KeyManager has been upgraded via acceptOwnership(...)', () => {
    // to improve readability of tests
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

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          recipient.address,
          amount,
          '0x',
        ]);

        await expect(
          newKeyManager.connect(context.mainController).execute(payload),
        ).to.changeEtherBalances([recipient, context.universalProfile], [amount, `-${amount}`]);
      });
    });
  });

  describe('when calling `renounceOwnership(...)` via the KeyManager', () => {
    describe('when caller has ALL PERMISSIONS', () => {
      describe('using `execute(...)`', () => {
        let renounceOwnershipFirstTx: ContractTransaction;
        let renounceOwnershipSecondTx: ContractTransaction;

        before(async () => {
          const payload = context.universalProfile.interface.getSighash('renounceOwnership');

          // 1st call
          renounceOwnershipFirstTx = await newKeyManager
            .connect(context.mainController)
            .execute(payload);

          // mine 200 blocks
          await network.provider.send('hardhat_mine', [ethers.utils.hexValue(200)]);

          // 2nd call
          renounceOwnershipSecondTx = await newKeyManager
            .connect(context.mainController)
            .execute(payload);
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

      describe('using `executeRelayCall()`', () => {
        let renounceOwnershipFirstTx: ContractTransaction;
        let renounceOwnershipSecondTx: ContractTransaction;

        before(async () => {
          // Build new context as `renounceOwnership()` was used in the previous context
          // ------ Build new context ------
          context = await buildContext();
          await setupKeyManager(context, [], []);
          // -------------------------------

          // ------ General variables for relay call ------
          const payload = context.universalProfile.interface.getSighash('renounceOwnership');
          const eip191Signer = new EIP191Signer();
          const HARDHAT_CHAINID = 31337;
          const validityTimestamps = 0;
          const valueToSend = 0;
          // ----------------------------------------------

          // ------ 1st call ------
          const firstNonce = await context.keyManager.getNonce(context.mainController.address, 0);

          const firstEncodedMessage = ethers.utils.solidityPack(
            ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
            [LSP25_VERSION, HARDHAT_CHAINID, firstNonce, validityTimestamps, valueToSend, payload],
          );

          const firstSignature = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            firstEncodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
          ).signature;

          renounceOwnershipFirstTx = await context.keyManager
            .connect(context.mainController)
            .executeRelayCall(firstSignature, firstNonce, validityTimestamps, payload, {
              value: valueToSend,
            });
          // ----------------------

          // mine 200 blocks
          await network.provider.send('hardhat_mine', [ethers.utils.hexValue(200)]);

          // ------ 2nd call ------
          const secondNonce = await context.keyManager.getNonce(context.mainController.address, 0);

          const secondEncodedMessage = ethers.utils.solidityPack(
            ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
            [LSP25_VERSION, HARDHAT_CHAINID, secondNonce, validityTimestamps, valueToSend, payload],
          );

          const secondSignature = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            secondEncodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
          ).signature;

          renounceOwnershipSecondTx = await context.keyManager
            .connect(context.mainController)
            .executeRelayCall(secondSignature, secondNonce, validityTimestamps, payload, {
              value: valueToSend,
            });
          // ----------------------
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
  });
};
