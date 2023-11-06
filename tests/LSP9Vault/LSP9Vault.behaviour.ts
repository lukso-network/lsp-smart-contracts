import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import type { TransactionResponse } from '@ethersproject/abstract-provider';
import { expect } from 'chai';

// types
import {
  LSP6KeyManager,
  LSP9Vault,
  UniversalProfile,
  UniversalReceiverDelegateVaultSetter__factory,
  UniversalReceiverDelegateVaultReentrantA__factory,
  UniversalReceiverDelegateVaultReentrantB__factory,
  UniversalReceiverDelegateVaultMalicious__factory,
} from '../../types';

// helpers
import { ARRAY_LENGTH, abiCoder, combineAllowedCalls } from '../utils/helpers';

// fixtures
import { callPayload } from '../utils/fixtures';

// constants
import {
  ERC725YDataKeys,
  INTERFACE_IDS,
  SupportedStandards,
  PERMISSIONS,
  OPERATION_TYPES,
  LSP1_TYPE_IDS,
  CALLTYPE,
} from '../../constants';
import { BigNumber } from 'ethers';

export type LSP9TestAccounts = {
  owner: SignerWithAddress;
  friend: SignerWithAddress;
  random: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP9TestAccounts> => {
  const [owner, friend, random, anyone] = await ethers.getSigners();
  return { owner, friend, random, anyone };
};

export type LSP9DeployParams = {
  newOwner: string;
  initialFunding?: number | BigNumber;
};

export type LSP9TestContext = {
  accounts: LSP9TestAccounts;
  lsp9Vault: LSP9Vault;
  deployParams: LSP9DeployParams;
  universalProfile: UniversalProfile;
  lsp6KeyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP9 = (
  buildContext: (initialFunding?: number) => Promise<LSP9TestContext>,
) => {
  let context: LSP9TestContext;

  before(async () => {
    context = await buildContext(100);
  });

  describe('when testing setting data', () => {
    it('owner should be able to setData', async () => {
      const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('some data key'));
      const dataValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value'));

      await context.lsp9Vault.connect(context.accounts.owner).setData(dataKey, dataValue);

      const result = await context.lsp9Vault.callStatic.getData(dataKey);
      expect(result).to.equal(dataValue);
    });

    it("non-owner shouldn't be able to setData", async () => {
      const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('some data key'));
      const dataValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value'));

      await expect(
        context.lsp9Vault.connect(context.accounts.random).setData(dataKey, dataValue),
      ).to.be.revertedWith('Only Owner or reentered Universal Receiver Delegate allowed');
    });

    it("UniversalReceiverDelegate shouldn't be able to setData in a call not passing by the universalReceiver", async () => {
      // setting UniversalReceiverDelegate that setData
      const lsp1UniversalReceiverDelegateVaultSetter =
        await new UniversalReceiverDelegateVaultSetter__factory(context.accounts.anyone).deploy();

      await context.lsp9Vault
        .connect(context.accounts.owner)
        .setData(
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
          lsp1UniversalReceiverDelegateVaultSetter.address,
        );

      const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('some data key'));
      const dataValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value'));

      await expect(
        lsp1UniversalReceiverDelegateVaultSetter
          .connect(context.accounts.anyone)
          .universalReceiverDelegate(context.lsp9Vault.address, dataKey, dataValue),
      ).to.be.revertedWith('Only Owner or reentered Universal Receiver Delegate allowed');
    });

    it('Main UniversalReceiverDelegate A should be able to setData in a universalReceiver reentrant call', async () => {
      // setting UniversalReceiverDelegate that setData
      const lsp1UniversalReceiverDelegateVaultReentrantA =
        await new UniversalReceiverDelegateVaultReentrantA__factory(
          context.accounts.anyone,
        ).deploy();

      await context.lsp9Vault
        .connect(context.accounts.owner)
        .setData(
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
          lsp1UniversalReceiverDelegateVaultReentrantA.address,
        );

      const typeId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const data = ethers.utils.hexlify(ethers.utils.randomBytes(64));

      const resultBefore = await context.lsp9Vault.getData(data.substring(0, 66));
      expect(resultBefore).to.equal('0x');

      await context.lsp9Vault.connect(context.accounts.anyone).universalReceiver(typeId, data);

      // The universalReceiverDelegate set will set in the storage the first 32 bytes of data as dataKey
      // and the value "aabbccdd" as data value, check the UniversalReceiverDelegateVaultReentrant A contract in helpers

      const resultAfter = await context.lsp9Vault.getData(data.substring(0, 66));
      expect(resultAfter).to.equal('0xaabbccdd');
    });

    it('Mapped UniversalReceiverDelegate B should be able to setData in a universalReceiver reentrant call', async () => {
      // setting UniversalReceiverDelegate that setData
      const lsp1UniversalReceiverDelegateVaultReentrantB =
        await new UniversalReceiverDelegateVaultReentrantB__factory(
          context.accounts.anyone,
        ).deploy();

      const typeId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const data = ethers.utils.hexlify(ethers.utils.randomBytes(64));

      await context.lsp9Vault
        .connect(context.accounts.owner)
        .setData(
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix + typeId.substring(2, 42),
          lsp1UniversalReceiverDelegateVaultReentrantB.address,
        );

      const resultBefore = await context.lsp9Vault.getData(data.substring(0, 66));

      expect(resultBefore).to.equal('0x');

      await context.lsp9Vault.connect(context.accounts.anyone).universalReceiver(typeId, data);

      // The universalReceiverDelegate B set will set in the storage the first 32 bytes of data as dataKey
      // and the value "ddccbbaa" as data value, check the UniversalReceiverDelegateVaultReentrant B contract in helpers

      const resultAfter = await context.lsp9Vault.getData(data.substring(0, 66));
      expect(resultAfter).to.equal('0xddccbbaa');
    });

    describe('when setting LSP1, LSP6, LSP17 dataKeys', () => {
      before(async () => {
        // setting UniversalReceiverDelegate that setData
        const lsp1UniversalReceiverDelegateVaultMalicious =
          await new UniversalReceiverDelegateVaultMalicious__factory(
            context.accounts.anyone,
          ).deploy();

        await context.lsp9Vault
          .connect(context.accounts.owner)
          .setData(
            ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            lsp1UniversalReceiverDelegateVaultMalicious.address,
          );
      });
      describe('when testing LSP1 Keys', () => {
        describe('when the owner is setting data', () => {
          describe('using setData', () => {
            it('should pass', async () => {
              const key =
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
                ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);

              const value = '0xaabbccdd';

              await context.lsp9Vault.connect(context.accounts.owner).setData(key, value);

              const result = await context.lsp9Vault.callStatic['getData(bytes32)'](key);
              expect(result).to.equal(value);
            });
          });

          describe('using setData Array', () => {
            it('should pass', async () => {
              const key1 = ethers.utils.hexlify(ethers.utils.randomBytes(32));
              const value1 = ethers.utils.hexlify(ethers.utils.randomBytes(5));

              const key2 =
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
                ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);

              const value2 = ethers.utils.hexlify(ethers.utils.randomBytes(5));

              const keys = [key1, key2];
              const values = [value1, value2];

              await context.lsp9Vault.connect(context.accounts.owner).setDataBatch(keys, values);

              const result = await context.lsp9Vault.callStatic.getDataBatch(keys);

              expect(result).to.deep.equal(values);
            });
          });
        });

        describe('when the URD is setting data', () => {
          describe('using setData', () => {
            it('should revert', async () => {
              const typeId = ethers.utils.solidityKeccak256(['string'], ['setData']);

              const data = '0x00'; // To set MappedUniversalReceiverDelegate Key

              await expect(context.lsp9Vault.universalReceiver(typeId, data))
                .to.be.revertedWithCustomError(
                  context.lsp9Vault,
                  'LSP1DelegateNotAllowedToSetDataKey',
                )
                .withArgs(
                  ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix + '00'.repeat(20),
                );
            });
          });
          describe('using setData Array', () => {
            it('should revert', async () => {
              const typeId = ethers.utils.solidityKeccak256(['string'], ['setData[]']);

              const data = '0x00'; // To set MappedUniversalReceiverDelegate Key

              await expect(context.lsp9Vault.universalReceiver(typeId, data))
                .to.be.revertedWithCustomError(
                  context.lsp9Vault,
                  'LSP1DelegateNotAllowedToSetDataKey',
                )
                .withArgs(
                  ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix + '00'.repeat(20),
                );
            });
          });
        });
      });

      describe('when testing LSP6 Keys', () => {
        describe('when the owner is setting data', () => {
          describe('using setData', () => {
            it('should pass', async () => {
              const key =
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);

              const value = '0xaabbccdd';

              await context.lsp9Vault.connect(context.accounts.owner).setData(key, value);

              const result = await context.lsp9Vault.callStatic['getData(bytes32)'](key);
              expect(result).to.equal(value);
            });
          });

          describe('using setData Array', () => {
            it('should pass', async () => {
              const key1 = ethers.utils.hexlify(ethers.utils.randomBytes(32));
              const value1 = ethers.utils.hexlify(ethers.utils.randomBytes(5));

              const key2 =
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);

              const value2 = ethers.utils.hexlify(ethers.utils.randomBytes(5));

              const keys = [key1, key2];
              const values = [value1, value2];

              await context.lsp9Vault.connect(context.accounts.owner).setDataBatch(keys, values);

              const result = await context.lsp9Vault.callStatic.getDataBatch(keys);

              expect(result).to.deep.equal(values);
            });
          });
        });

        describe('when the URD is setting data', () => {
          describe('using setData', () => {
            it('should revert', async () => {
              const typeId = ethers.utils.solidityKeccak256(['string'], ['setData']);

              const data = '0x01'; // To set LSP6Permission Key

              await expect(context.lsp9Vault.universalReceiver(typeId, data))
                .to.be.revertedWithCustomError(
                  context.lsp9Vault,
                  'LSP1DelegateNotAllowedToSetDataKey',
                )
                .withArgs(ERC725YDataKeys.LSP6.AddressPermissionsPrefix + '00'.repeat(26));
            });
          });
          describe('using setData Array', () => {
            it('should revert', async () => {
              const typeId = ethers.utils.solidityKeccak256(['string'], ['setData[]']);

              const data = '0x01'; // To set LSP6Permission Key

              await expect(context.lsp9Vault.universalReceiver(typeId, data))
                .to.be.revertedWithCustomError(
                  context.lsp9Vault,
                  'LSP1DelegateNotAllowedToSetDataKey',
                )
                .withArgs(ERC725YDataKeys.LSP6.AddressPermissionsPrefix + '00'.repeat(26));
            });
          });
        });
      });

      describe('when testing LSP17 Keys', () => {
        describe('when the owner is setting data', () => {
          describe('using setData', () => {
            it('should pass', async () => {
              const key =
                ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
                ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);

              const value = '0xaabbccdd';

              await context.lsp9Vault.connect(context.accounts.owner).setData(key, value);

              const result = await context.lsp9Vault.callStatic['getData(bytes32)'](key);
              expect(result).to.equal(value);
            });
          });

          describe('using setData Array', () => {
            it('should pass', async () => {
              const key1 = ethers.utils.hexlify(ethers.utils.randomBytes(32));
              const value1 = ethers.utils.hexlify(ethers.utils.randomBytes(5));

              const key2 =
                ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
                ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);

              const value2 = ethers.utils.hexlify(ethers.utils.randomBytes(5));

              const keys = [key1, key2];
              const values = [value1, value2];

              await context.lsp9Vault.connect(context.accounts.owner).setDataBatch(keys, values);

              const result = await context.lsp9Vault.callStatic.getDataBatch(keys);

              expect(result).to.deep.equal(values);
            });
          });
        });

        describe('when the URD is setting data', () => {
          describe('using setData', () => {
            it('should revert', async () => {
              const typeId = ethers.utils.solidityKeccak256(['string'], ['setData']);

              const data = '0x02'; // To set LSP17Extension Key

              await expect(context.lsp9Vault.universalReceiver(typeId, data))
                .to.be.revertedWithCustomError(
                  context.lsp9Vault,
                  'LSP1DelegateNotAllowedToSetDataKey',
                )
                .withArgs(ERC725YDataKeys.LSP17.LSP17ExtensionPrefix + '00'.repeat(20));
            });
          });
          describe('using setData Array', () => {
            it('should revert', async () => {
              const typeId = ethers.utils.solidityKeccak256(['string'], ['setData[]']);

              const data = '0x02'; // To set LSP17Extension Key

              await expect(context.lsp9Vault.universalReceiver(typeId, data))
                .to.be.revertedWithCustomError(
                  context.lsp9Vault,
                  'LSP1DelegateNotAllowedToSetDataKey',
                )
                .withArgs(ERC725YDataKeys.LSP17.LSP17ExtensionPrefix + '00'.repeat(20));
            });
          });
        });
      });
    });

    describe('when setting a data key with a value less than 256 bytes', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(200));

        await expect(context.lsp9Vault.setData(key, value))
          .to.emit(context.lsp9Vault, 'DataChanged')
          .withArgs(key, value);

        const result = await context.lsp9Vault.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value more than 256 bytes', () => {
      it('should emit DataChanged event with only the first 256 bytes of the value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        await expect(context.lsp9Vault.setData(key, value))
          .to.emit(context.lsp9Vault, 'DataChanged')
          .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

        const result = await context.lsp9Vault.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when calling the contract without any value or data', () => {
      it('should pass and not emit the UniversalReceiver event', async () => {
        const sender = context.accounts.anyone;
        const amount = 0;

        // prettier-ignore
        await expect(
          sender.sendTransaction({
            to: context.lsp9Vault.address,
            value: amount,
          })
        ).to.not.be.reverted
          .to.not.emit(context.lsp9Vault, "UniversalReceiver");
      });
    });

    describe('when setting a data key with a value exactly 256 bytes long', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(context.lsp9Vault.setData(key, value))
          .to.emit(context.lsp9Vault, 'DataChanged')
          .withArgs(key, value);

        const result = await context.lsp9Vault.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('When sending value to setData', () => {
      it('should revert when sending value to setData(..)', async () => {
        const value = ethers.utils.parseEther('2');
        const txParams = {
          dataKey: ethers.utils.solidityKeccak256(['string'], ['FirstDataKey']),
          dataValue: '0xaabbccdd',
        };

        await expect(
          context.lsp9Vault
            .connect(context.accounts.owner)
            .setData(txParams.dataKey, txParams.dataValue, {
              value: value,
            }),
        ).to.be.revertedWithCustomError(context.lsp9Vault, 'ERC725Y_MsgValueDisallowed');
      });

      it('should revert when sending value to setData(..) Array', async () => {
        const value = ethers.utils.parseEther('2');
        const txParams = {
          dataKey: [ethers.utils.solidityKeccak256(['string'], ['FirstDataKey'])],
          dataValue: ['0xaabbccdd'],
        };

        await expect(
          context.lsp9Vault
            .connect(context.accounts.owner)
            .setDataBatch(txParams.dataKey, txParams.dataValue, {
              value: value,
            }),
        ).to.be.revertedWithCustomError(context.lsp9Vault, 'ERC725Y_MsgValueDisallowed');
      });
    });
  });

  describe('when testing execute(...)', () => {
    describe('when executing operation (4) DELEGATECALL', () => {
      it('should revert with unknow operation type custom error', async () => {
        await expect(
          context.lsp9Vault.execute(
            OPERATION_TYPES.DELEGATECALL,
            context.accounts.random.address,
            0,
            '0x',
          ),
        )
          .to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_UnknownOperationType')
          .withArgs(OPERATION_TYPES.DELEGATECALL);
      });
    });
  });

  describe('when using vault with UniversalProfile', () => {
    describe('when transferring ownership of the vault to the universalProfile', () => {
      before(async () => {
        await context.lsp9Vault
          .connect(context.accounts.owner)
          .transferOwnership(context.universalProfile.address);

        const acceptOwnershipSelector =
          context.universalProfile.interface.getSighash('acceptOwnership');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          context.lsp9Vault.address,
          0,
          acceptOwnershipSelector,
        ]);

        await context.lsp6KeyManager.connect(context.accounts.owner).execute(executePayload);
      });

      it('should register lsp10 keys of the vault on the profile', async () => {
        const arrayLength = await context.universalProfile.callStatic['getData(bytes32)'](
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
        );
        expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
      });
    });

    describe('when using batchCalls function', () => {
      before(async () => {
        await context.accounts.friend.sendTransaction({
          value: 1000,
          to: context.lsp9Vault.address,
        });
      });

      describe('when non-owner is calling', () => {
        it('shoud revert', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          const setDataPayload = context.lsp9Vault.interface.encodeFunctionData('setData', [
            key,
            value,
          ]);

          await expect(
            context.lsp9Vault.connect(context.accounts.random).batchCalls([setDataPayload]),
          ).to.be.revertedWith('Only Owner or reentered Universal Receiver Delegate allowed');
        });
      });

      describe('when the owner is calling', () => {
        describe('when executing one function', () => {
          describe('setData', () => {
            it('should pass', async () => {
              const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
              const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

              const setDataPayload = context.lsp9Vault.interface.encodeFunctionData('setData', [
                key,
                value,
              ]);

              const multiCallPayload = context.lsp9Vault.interface.encodeFunctionData(
                'batchCalls',
                [[setDataPayload]],
              );

              const executePayloadUP = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [0, context.lsp9Vault.address, 0, multiCallPayload],
              );

              await context.lsp6KeyManager
                .connect(context.accounts.owner)
                .execute(executePayloadUP);

              const result = await context.lsp9Vault.getData(key);
              expect(result).to.equal(value);
            });
          });

          describe('execute', () => {
            it('should pass', async () => {
              const amount = 20;
              const executePayload = context.lsp9Vault.interface.encodeFunctionData('execute', [
                0,
                context.accounts.random.address,
                amount,
                '0x',
              ]);

              const multiCallPayload = context.lsp9Vault.interface.encodeFunctionData(
                'batchCalls',
                [[executePayload]],
              );

              const executePayloadUP = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [0, context.lsp9Vault.address, 0, multiCallPayload],
              );

              await expect(() =>
                context.lsp6KeyManager.connect(context.accounts.owner).execute(executePayloadUP),
              ).to.changeEtherBalances(
                [context.lsp9Vault.address, context.accounts.random.address],
                [`-${amount}`, amount],
              );
            });
          });
        });

        describe('when executing several functions', () => {
          describe('When transfering lyx, setting data, transferring ownership', () => {
            it('should pass', async () => {
              const amount = 20;
              const executePayload = context.lsp9Vault.interface.encodeFunctionData('execute', [
                0,
                context.accounts.random.address,
                amount,
                '0x',
              ]);

              const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('A new key'));
              const value = ethers.utils.hexlify(ethers.utils.randomBytes(10));

              const setDataPayload = context.lsp9Vault.interface.encodeFunctionData('setData', [
                key,
                value,
              ]);

              const transferOwnershipPayload = context.lsp9Vault.interface.encodeFunctionData(
                'transferOwnership',
                [context.accounts.anyone.address],
              );

              expect(await context.lsp9Vault.callStatic.pendingOwner()).to.equal(
                ethers.constants.AddressZero,
              );

              const multiCallPayload = context.lsp9Vault.interface.encodeFunctionData(
                'batchCalls',
                [[executePayload, setDataPayload, transferOwnershipPayload]],
              );

              const executePayloadUP = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [0, context.lsp9Vault.address, 0, multiCallPayload],
              );

              await expect(() =>
                context.lsp6KeyManager.connect(context.accounts.owner).execute(executePayloadUP),
              ).to.changeEtherBalances(
                [context.lsp9Vault.address, context.accounts.random.address],
                [`-${amount}`, amount],
              );

              const result = await context.lsp9Vault.getData(key);
              expect(result).to.equal(value);

              expect(await context.lsp9Vault.callStatic.pendingOwner()).to.equal(
                context.accounts.anyone.address,
              );
            });
          });
        });
      });
    });

    describe('when restricitng address to only talk to the vault', () => {
      before(async () => {
        const friendPermissions = PERMISSIONS.CALL;
        const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
          [
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts.friend.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              context.accounts.friend.address.substring(2),
          ],
          [
            friendPermissions,
            combineAllowedCalls(
              // TODO: is the bit permission CALL in the allowed call enough for this test?
              [CALLTYPE.CALL],
              [context.lsp9Vault.address],
              ['0xffffffff'],
              ['0xffffffff'],
            ),
          ],
        ]);

        await context.lsp6KeyManager.connect(context.accounts.owner).execute(payload);
      });

      it('should allow friend to talk to the vault', async () => {
        const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('some data key'));
        const dataValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value'));

        const payload = context.lsp9Vault.interface.encodeFunctionData('setData', [
          dataKey,
          dataValue,
        ]);
        await context.lsp6KeyManager
          .connect(context.accounts.friend)
          .execute(callPayload(context.universalProfile, context.lsp9Vault.address, payload));

        const res = await context.lsp9Vault.callStatic.getData(dataKey);
        expect(res).to.equal(dataValue);
      });

      it('should fail when friend is interacting with other contracts', async () => {
        const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('some data key'));
        const dataValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value'));

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          dataKey,
          dataValue,
        ]);

        const disallowedAddress = ethers.utils.getAddress(context.universalProfile.address);

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.friend)
            .execute(
              callPayload(context.universalProfile, context.universalProfile.address, payload),
            ),
        )
          .to.be.revertedWithCustomError(context.lsp6KeyManager, 'NotAllowedCall')
          .withArgs(
            context.accounts.friend.address,
            disallowedAddress,
            context.universalProfile.interface.getSighash('setData'),
          );
      });
    });

    describe('when transferring ownership of the vault', () => {
      before(async () => {
        context = await buildContext();
      });

      it('should emit UniversalReceiver event', async () => {
        const transferOwnership = context.lsp9Vault
          .connect(context.accounts.owner)
          .transferOwnership(context.universalProfile.address);

        await expect(transferOwnership)
          .to.emit(context.universalProfile, 'UniversalReceiver')
          .withArgs(
            context.lsp9Vault.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferStarted,
            abiCoder.encode(
              ['address', 'address'],
              [context.accounts.owner.address, context.universalProfile.address],
            ),
            abiCoder.encode(
              ['bytes', 'bytes'],
              [ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: typeId out of scope')), '0x'],
            ),
          );
      });
    });
  });

  describe('when using the batch `ERC725X.execute(uint256[],address[],uint256[],bytes[])` function', () => {
    describe('when specifying `msg.value`', () => {
      it('should emit a `UniversalReceiver` event', async () => {
        const operationsType = Array(3).fill(OPERATION_TYPES.CALL);
        const recipients = [
          context.accounts.friend.address,
          context.accounts.random.address,
          context.accounts.anyone.address,
        ];
        const values = Array(3).fill(ethers.BigNumber.from('1'));
        const datas = Array(3).fill('0x');

        const msgValue = ethers.utils.parseEther('10');

        const tx = await context.lsp9Vault.executeBatch(operationsType, recipients, values, datas, {
          value: msgValue,
        });

        await expect(tx)
          .to.emit(context.lsp9Vault, 'UniversalReceiver')
          .withArgs(
            context.deployParams.newOwner,
            msgValue,
            LSP1_TYPE_IDS.LSP9ValueReceived,
            context.universalProfile.interface.getSighash('executeBatch'),
            '0x',
          );
      });
    });

    describe('when NOT sending any `msg.value`', () => {
      it('should NOT emit a `UniversalReceiver` event', async () => {
        const operationsType = Array(3).fill(OPERATION_TYPES.CALL);
        const recipients = [
          context.accounts.friend.address,
          context.accounts.random.address,
          context.accounts.anyone.address,
        ];
        const values = Array(3).fill(ethers.BigNumber.from('1'));
        const datas = Array(3).fill('0x');

        const msgValue = 0;

        const tx = await context.lsp9Vault.executeBatch(operationsType, recipients, values, datas, {
          value: msgValue,
        });

        await expect(tx).to.not.emit(context.lsp9Vault, 'UniversalReceiver');
      });
    });
  });
};

export type LSP9InitializeTestContext = {
  lsp9Vault: LSP9Vault;
  initializeTransaction: TransactionResponse;
  deployParams: LSP9DeployParams;
};

export const shouldInitializeLikeLSP9 = (
  buildContext: () => Promise<LSP9InitializeTestContext>,
) => {
  let context: LSP9InitializeTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should have registered the ERC165 interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.ERC165);
      expect(result).to.be.true;
    });

    it('should have registered the ERC725X interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.ERC725X);
      expect(result).to.be.true;
    });

    it('should have registered the ERC725Y interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.ERC725Y);
      expect(result).to.be.true;
    });

    it('should have registered the LSP9 interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.LSP9Vault);
      expect(result).to.be.true;
    });

    it('should have registered the LSP1 interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.LSP1UniversalReceiver);
      expect(result).to.be.true;
    });

    it('should support LSP14Ownable2Step interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.LSP14Ownable2Step);
      expect(result).to.be.true;
    });

    it('should support LSP17Extendable interface', async () => {
      const result = await context.lsp9Vault.supportsInterface(INTERFACE_IDS.LSP17Extendable);
      expect(result).to.be.true;
    });

    it('should have set expected entries with ERC725Y.setData', async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp9Vault, 'DataChanged')
        .withArgs(SupportedStandards.LSP9Vault.key, SupportedStandards.LSP9Vault.value);
      expect(await context.lsp9Vault.getData(SupportedStandards.LSP9Vault.key)).to.equal(
        SupportedStandards.LSP9Vault.value,
      );
    });
  });
};
