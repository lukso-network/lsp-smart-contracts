import { expect } from 'chai';
import { ethers, network, artifacts } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  LSP0ERC725Account,
  UPWithInstantAcceptOwnership__factory,
  UPWithInstantAcceptOwnership,
} from '../../types';

// constants
import { OPERATION_TYPES } from '../../constants';

// helpers
import { provider } from '../utils/helpers';
import { BigNumber, ContractTransaction } from 'ethers';

export type LSP14CombinedWithLSP20TestContext = {
  accounts: SignerWithAddress[];
  contract: LSP0ERC725Account;
  deployParams: { owner: SignerWithAddress };
  onlyOwnerCustomError: string;
};

export const shouldBehaveLikeLSP14WithLSP20 = (
  buildContext: (initialFunding?: number | BigNumber) => Promise<LSP14CombinedWithLSP20TestContext>,
) => {
  let context: LSP14CombinedWithLSP20TestContext;
  let newOwner: SignerWithAddress;

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('50'));
    newOwner = context.accounts[1];
  });

  describe('when owner call transferOwnership(...)', () => {
    before(async () => {
      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(newOwner.address);
    });

    it('should have set the pendingOwner', async () => {
      const pendingOwner = await context.contract.pendingOwner();
      expect(pendingOwner).to.equal(newOwner.address);
    });

    it('owner should remain the current owner', async () => {
      const newOwner = ethers.Wallet.createRandom();

      const ownerBefore = await context.contract.owner();

      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(newOwner.address);

      const ownerAfter = await context.contract.owner();

      expect(ownerBefore).to.equal(ownerAfter);
    });

    it('should override the pendingOwner when transferOwnership(...) is called twice', async () => {
      const overridenNewOwner = ethers.Wallet.createRandom();

      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(overridenNewOwner.address);

      const pendingOwner = await context.contract.pendingOwner();
      expect(pendingOwner).to.equal(overridenNewOwner.address);
    });

    it('should revert when transferring Ownership to the contract itself', async () => {
      await expect(
        context.contract
          .connect(context.deployParams.owner)
          .transferOwnership(context.contract.address),
      ).to.be.revertedWithCustomError(context.contract, 'LSP14CannotTransferOwnershipToSelf');
    });

    describe('it should still be allowed to call onlyOwner functions', () => {
      it('setData(...)', async () => {
        const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
        const value = '0xabcd';

        await context.contract.connect(context.deployParams.owner).setData(key, value);

        const result = await context.contract.getData(key);
        expect(result).to.equal(value);
      });

      it('execute(...) - LYX transfer', async () => {
        const recipient = context.accounts[3];
        const amount = ethers.utils.parseEther('3');

        const recipientBalanceBefore = await provider.getBalance(recipient.address);
        const accountBalanceBefore = await provider.getBalance(context.contract.address);

        await context.contract
          .connect(context.deployParams.owner)
          .execute(OPERATION_TYPES.CALL, recipient.address, amount, '0x');

        const recipientBalanceAfter = await provider.getBalance(recipient.address);
        const accountBalanceAfter = await provider.getBalance(context.contract.address);

        // recipient balance should have gone up
        expect(recipientBalanceAfter).to.be.gt(recipientBalanceBefore);

        // account balance should have gone down
        expect(accountBalanceAfter).to.be.lt(accountBalanceBefore);
      });
    });

    describe('when `acceptOwnership(...)` is called in the same tx as `transferOwnership(...)`', () => {
      let upWithCustomURD: UPWithInstantAcceptOwnership;

      before(async () => {
        upWithCustomURD = await new UPWithInstantAcceptOwnership__factory(
          context.accounts[0],
        ).deploy(context.accounts[0].address);
      });

      it("should revert (e.g: if `universalReceiver(...)` function of `newOwner` calls directly `acceptOwnership(...)')", async () => {
        await expect(
          context.contract
            .connect(context.deployParams.owner)
            .transferOwnership(upWithCustomURD.address),
        ).to.be.revertedWithCustomError(
          context.contract,
          'LSP14MustAcceptOwnershipInSeparateTransaction',
        );
      });
    });

    after(async () => {
      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(newOwner.address);
    });
  });

  describe('when non-owner call transferOwnership(...)', () => {
    it('should revert', async () => {
      const randomAddress = context.accounts[2];

      await expect(context.contract.connect(randomAddress).transferOwnership(randomAddress.address))
        .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
        .withArgs(context.deployParams.owner.address);
    });
  });

  describe('when calling acceptOwnership(...)', () => {
    it('should revert when caller is not the pending owner', async () => {
      const pendingOwner = await context.contract.pendingOwner();
      await expect(context.contract.connect(context.accounts[2]).acceptOwnership())
        .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
        .withArgs(pendingOwner);
    });

    describe('when caller is the pending owner', () => {
      let pendingOwner: string;
      let acceptOwnershipTx: ContractTransaction;

      before(async () => {
        pendingOwner = await context.contract.pendingOwner();
        acceptOwnershipTx = await context.contract.connect(newOwner).acceptOwnership();
      });

      it('should change the contract owner to the pendingOwner', async () => {
        const updatedOwner = await context.contract.owner();
        expect(updatedOwner).to.equal(pendingOwner);
      });

      it('should have cleared the pendingOwner after transferring ownership', async () => {
        const newPendingOwner = await context.contract.pendingOwner();
        expect(newPendingOwner).to.equal(ethers.constants.AddressZero);
      });

      it('should have emitted a OwnershipTransferred event', async () => {
        await expect(acceptOwnershipTx).to.emit(context.contract, 'OwnershipTransferred').withArgs(
          context.deployParams.owner.address, // previous owner
          newOwner.address, // new owner
        );
      });
    });

    describe('after pendingOwner has claimed ownership', () => {
      let previousOwner: SignerWithAddress;

      before(async () => {
        previousOwner = context.deployParams.owner;
      });

      describe('previous owner should not be allowed anymore to call onlyOwner functions', () => {
        it('should revert when calling `setData(...)`', async () => {
          const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
          const value = '0xabcd';

          await expect(context.contract.connect(previousOwner).setData(key, value))
            .to.be.to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
            .withArgs(newOwner.address);
        });

        it('should revert when calling `execute(...)`', async () => {
          const recipient = context.accounts[3];
          const amount = ethers.utils.parseEther('3');

          await expect(
            context.contract
              .connect(previousOwner)
              .execute(OPERATION_TYPES.CALL, recipient.address, amount, '0x'),
          )
            .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
            .withArgs(newOwner.address);
        });

        it('should revert when calling `renounceOwnership(...)`', async () => {
          await expect(context.contract.connect(previousOwner).renounceOwnership())
            .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
            .withArgs(newOwner.address);
        });
      });

      describe('new owner should be allowed to call onlyOwner functions', () => {
        it('setData(...)', async () => {
          const key = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
          const value = '0xabcd';

          await context.contract.connect(newOwner).setData(key, value);

          const result = await context.contract.getData(key);
          expect(result).to.equal(value);
        });

        it('execute(...) - LYX transfer', async () => {
          const recipient = context.accounts[3];
          const amount = ethers.utils.parseEther('3');

          await expect(() =>
            context.contract
              .connect(newOwner)
              .execute(OPERATION_TYPES.CALL, recipient.address, amount, '0x'),
          ).to.changeEtherBalances(
            [context.contract.address, recipient.address],
            [
              `-${amount}`, // account balance should have gone down
              amount, // recipient balance should have gone up
            ],
          );
        });
      });
    });
  });

  describe('renounceOwnership(...)', () => {
    describe('when calling renounceOwnership() with a non-owner account', () => {
      it('should revert with custom message', async () => {
        const tx = context.contract.connect(context.accounts[5]).renounceOwnership();

        await expect(tx)
          .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
          .withArgs(newOwner.address);
      });
    });

    describe('when calling renounceOwnership() the first time', () => {
      let currentOwner: SignerWithAddress;
      let renounceOwnershipTx: ContractTransaction;

      let anotherOwner: string;

      before(async () => {
        context = await buildContext(ethers.utils.parseEther('20'));

        currentOwner = context.accounts[0];

        anotherOwner = context.accounts[3].address;

        // used to check that `renounceOwnership` clears the pendingOwner
        await context.contract.connect(currentOwner).transferOwnership(anotherOwner);

        // mine 1,000 blocks
        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(1000)]);

        renounceOwnershipTx = await context.contract.connect(currentOwner).renounceOwnership();

        await renounceOwnershipTx.wait();
      });

      it('should instantiate the renounceOwnership process correctly', async () => {
        const _renounceOwnershipStartedAtAfterSlotNumber = Number.parseInt(
          (
            await artifacts.getBuildInfo(
              'contracts/LSP0ERC725Account/LSP0ERC725Account.sol:LSP0ERC725Account',
            )
          )?.output.contracts[
            'contracts/LSP0ERC725Account/LSP0ERC725Account.sol'
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          ].LSP0ERC725Account.storageLayout.storage.filter((elem) => {
            if (elem.label === '_renounceOwnershipStartedAt') return elem;
          })[0].slot,
        );

        const _renounceOwnershipStartedAtAfter = await provider.getStorageAt(
          context.contract.address,
          _renounceOwnershipStartedAtAfterSlotNumber,
        );

        expect(ethers.BigNumber.from(_renounceOwnershipStartedAtAfter).toNumber()).to.equal(
          renounceOwnershipTx.blockNumber,
        );
      });

      it('should have emitted a RenounceOwnershipStarted event', async () => {
        await expect(renounceOwnershipTx).to.emit(context.contract, 'RenounceOwnershipStarted');
      });

      it('should not change the current owner', async () => {
        expect(await context.contract.owner()).to.equal(currentOwner.address);
      });

      it('should reset the pendingOwner', async () => {
        expect(await context.contract.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });

      describe('currentOwner should still be able to interact with contract before confirming', () => {
        it('`setData(...)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Random Key'));
          const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Random Value'));

          await context.contract.connect(currentOwner).setData(key, value);

          const result = await context.contract.getData(key);

          expect(result).to.equal(value);
        });

        it('transfer LYX via `execute(...)`', async () => {
          const recipient = context.accounts[3].address;
          const amount = ethers.utils.parseEther('3');

          // verify that balances have been updated
          await expect(() =>
            context.contract
              .connect(currentOwner)
              .execute(OPERATION_TYPES.CALL, recipient, amount, '0x'),
          ).to.changeEtherBalances([context.contract.address, recipient], [`-${amount}`, amount]);
        });
      });
    });

    describe('when calling renounceOwnership() the second time', () => {
      before(async () => {
        context = await buildContext(ethers.utils.parseEther('20'));
      });

      it('should revert if called in the delay period', async () => {
        const renounceOwnershipOnce = await context.contract
          .connect(context.deployParams.owner)
          .renounceOwnership();

        const renounceOwnershipOnceReceipt = await renounceOwnershipOnce.wait();

        // skip 98 blocks, but not enough to reach the delay period
        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(98)]);

        await expect(context.contract.connect(context.deployParams.owner).renounceOwnership())
          .to.be.revertedWithCustomError(context.contract, 'LSP14NotInRenounceOwnershipInterval')
          .withArgs(
            renounceOwnershipOnceReceipt.blockNumber + 200,
            renounceOwnershipOnceReceipt.blockNumber + 400,
          );

        expect(await context.contract.owner()).to.equal(context.deployParams.owner.address);

        // skip 500 blocks for the next test
        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(500)]);
      });

      it('should initialize again if the confirmation period passed', async () => {
        const _renounceOwnershipStartedAtAfterSlotNumber = Number.parseInt(
          (
            await artifacts.getBuildInfo(
              'contracts/LSP0ERC725Account/LSP0ERC725Account.sol:LSP0ERC725Account',
            )
          )?.output.contracts[
            'contracts/LSP0ERC725Account/LSP0ERC725Account.sol'
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          ].LSP0ERC725Account.storageLayout.storage.filter((elem) => {
            if (elem.label === '_renounceOwnershipStartedAt') return elem;
          })[0].slot,
        );

        await context.contract.connect(context.deployParams.owner).renounceOwnership();

        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(400)]); // skip 400 blocks

        const tx = await context.contract.connect(context.deployParams.owner).renounceOwnership();

        await tx.wait();

        const _renounceOwnershipStartedAtAfter = await provider.getStorageAt(
          context.contract.address,
          _renounceOwnershipStartedAtAfterSlotNumber,
        );

        expect(ethers.BigNumber.from(_renounceOwnershipStartedAtAfter).toNumber()).to.equal(
          tx.blockNumber,
        );
      });

      describe('when called after the delay and before the confirmation period end', () => {
        let renounceOwnershipSecondTx: ContractTransaction;

        before(async () => {
          context = await buildContext(ethers.utils.parseEther('20'));

          // Call renounceOwnership for the first time
          await context.contract.connect(context.deployParams.owner).renounceOwnership();

          // Skip 199 block to reach the time where renouncing ownership can happen
          await network.provider.send('hardhat_mine', [ethers.utils.hexValue(199)]);

          renounceOwnershipSecondTx = await context.contract
            .connect(context.deployParams.owner)
            .renounceOwnership();
        });

        it('should have emitted a OwnershipTransferred event', async () => {
          await expect(renounceOwnershipSecondTx)
            .to.emit(context.contract, 'OwnershipTransferred')
            .withArgs(context.deployParams.owner.address, ethers.constants.AddressZero);

          expect(await context.contract.owner()).to.equal(ethers.constants.AddressZero);
        });

        it('should have emitted a OwnershipRenounced event', async () => {
          await expect(renounceOwnershipSecondTx).to.emit(context.contract, 'OwnershipRenounced');

          expect(await context.contract.owner()).to.equal(ethers.constants.AddressZero);
        });

        it('owner should now be address(0)', async () => {
          expect(await context.contract.owner()).to.equal(ethers.constants.AddressZero);
        });

        it('should have reset the `_renounceOwnershipStartedAt` state variable to zero', async () => {
          const _renounceOwnershipStartedAtAfterSlotNumber = Number.parseInt(
            (
              await artifacts.getBuildInfo(
                'contracts/LSP0ERC725Account/LSP0ERC725Account.sol:LSP0ERC725Account',
              )
            )?.output.contracts[
              'contracts/LSP0ERC725Account/LSP0ERC725Account.sol'
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
            ].LSP0ERC725Account.storageLayout.storage.filter((elem) => {
              if (elem.label === '_renounceOwnershipStartedAt') return elem;
            })[0].slot,
          );

          const _renounceOwnershipStartedAtAfter = await provider.getStorageAt(
            context.contract.address,
            _renounceOwnershipStartedAtAfterSlotNumber,
          );

          expect(ethers.BigNumber.from(_renounceOwnershipStartedAtAfter).toNumber()).to.equal(0);
        });

        describe('currentOwner should not be able to interact with contract anymore after confirming', () => {
          it('`setData(...)`', async () => {
            const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Random Key'));
            const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Random Value'));

            await expect(context.contract.connect(context.deployParams.owner).setData(key, value))
              .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
              .withArgs(ethers.constants.AddressZero);
          });

          it('transfer LYX via `execute(...)`', async () => {
            const recipient = context.accounts[3].address;
            const amount = ethers.utils.parseEther('3');

            await expect(
              context.contract
                .connect(context.deployParams.owner)
                .execute(OPERATION_TYPES.CALL, recipient, amount, '0x'),
            )
              .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
              .withArgs(ethers.constants.AddressZero);
          });
        });
      });

      describe('if there was a pendingOwner set before confirming `renounceOwnership(...)', () => {
        let newOwner: SignerWithAddress;

        before(async () => {
          context = await buildContext(ethers.utils.parseEther('20'));

          // transferOwnership to a new owner
          newOwner = context.accounts[3];

          await context.contract
            .connect(context.deployParams.owner)
            .transferOwnership(newOwner.address);

          // Call renounceOwnership for the first time
          await context.contract.connect(context.deployParams.owner).renounceOwnership();

          // Skip 199 block to reach the time where renouncing ownership can happen
          await network.provider.send('hardhat_mine', [ethers.utils.hexValue(199)]);

          // Call renounceOwnership for the second time
          await context.contract.connect(context.deployParams.owner).renounceOwnership();
        });

        it('should reset the pendingOwner whenever renounceOwnership(..) is confirmed', async () => {
          expect(await context.contract.pendingOwner()).to.equal(ethers.constants.AddressZero);
        });

        it('previous pendingOwner should not be able to call acceptOwnership(...) anymore', async () => {
          const pendingOwner = await context.contract.pendingOwner();
          await expect(context.contract.connect(newOwner).acceptOwnership())
            .to.be.revertedWithCustomError(context.contract, 'LSP20EOACannotVerifyCall')
            .withArgs(pendingOwner);
        });
      });
    });
  });

  describe('when calling `renounceOwnership()` when `block.number` is less than 400 blocks (RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY + RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD)`', () => {
    before(async () => {
      context = await buildContext();

      // Simulate a scenario where we are at just few hundred blocks after the blockchain started
      // (few hundred blocks after genesis)
      await network.provider.send('hardhat_mine', [ethers.utils.hexValue(138)]);
    });

    it('should instantiate the renounceOwnership process in 2 steps correctly', async () => {
      const _renounceOwnershipStartedAtAfterSlotNumber = Number.parseInt(
        (
          await artifacts.getBuildInfo(
            'contracts/LSP0ERC725Account/LSP0ERC725Account.sol:LSP0ERC725Account',
          )
        )?.output.contracts[
          'contracts/LSP0ERC725Account/LSP0ERC725Account.sol'
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        ].LSP0ERC725Account.storageLayout.storage.filter((elem) => {
          if (elem.label === '_renounceOwnershipStartedAt') return elem;
        })[0].slot,
      );

      const renounceOwnershipTx = await context.contract
        .connect(context.deployParams.owner)
        .renounceOwnership();

      await renounceOwnershipTx.wait();

      const _renounceOwnershipStartedAtAfter = await provider.getStorageAt(
        context.contract.address,
        _renounceOwnershipStartedAtAfterSlotNumber,
      );

      expect(ethers.BigNumber.from(_renounceOwnershipStartedAtAfter)).to.equal(
        renounceOwnershipTx.blockNumber,
      );

      expect(await context.contract.owner()).to.equal(context.deployParams.owner.address);
    });
  });
};
