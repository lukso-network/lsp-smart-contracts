import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';

// types
import {
  LSP6KeyManager,
  UniversalProfile,
  UniversalReceiverDelegateVaultSetter__factory,
  UniversalReceiverDelegateVaultReentrantA__factory,
  UniversalReceiverDelegateVaultReentrantB__factory,
  UniversalReceiverDelegateVaultMalicious__factory,
  LSP9Vault,
} from '../../typechain';

// helpers
import { ARRAY_LENGTH, abiCoder, combineAllowedCalls } from '../utils/helpers';

// fixtures
import { callPayload } from '../utils/fixtures';

// constants
import { ERC725YDataKeys, INTERFACE_IDS, SupportedStandards, LSP1_TYPE_IDS } from '../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

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
  initialFunding?: number | bigint;
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
      const dataKey = ethers.keccak256(ethers.toUtf8Bytes('some data key'));
      const dataValue = ethers.hexlify(ethers.toUtf8Bytes('some value'));

      await context.lsp9Vault.connect(context.accounts.owner).setData(dataKey, dataValue);

      const result = await context.lsp9Vault.getData(dataKey);
      expect(result).to.equal(dataValue);
    });

    it("non-owner shouldn't be able to setData", async () => {
      const dataKey = ethers.keccak256(ethers.toUtf8Bytes('some data key'));
      const dataValue = ethers.hexlify(ethers.toUtf8Bytes('some value'));

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
          await lsp1UniversalReceiverDelegateVaultSetter.getAddress(),
        );

      const dataKey = ethers.keccak256(ethers.toUtf8Bytes('some data key'));
      const dataValue = ethers.hexlify(ethers.toUtf8Bytes('some value'));

      await expect(
        lsp1UniversalReceiverDelegateVaultSetter
          .connect(context.accounts.anyone)
          .universalReceiverDelegate(await context.lsp9Vault.getAddress(), dataKey, dataValue),
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
          await lsp1UniversalReceiverDelegateVaultReentrantA.getAddress(),
        );

      const typeId = ethers.hexlify(ethers.randomBytes(32));
      const data = ethers.hexlify(ethers.randomBytes(64));

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

      const typeId = ethers.hexlify(ethers.randomBytes(32));
      const data = ethers.hexlify(ethers.randomBytes(64));

      await context.lsp9Vault
        .connect(context.accounts.owner)
        .setData(
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix + typeId.substring(2, 42),
          await lsp1UniversalReceiverDelegateVaultReentrantB.getAddress(),
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
            await lsp1UniversalReceiverDelegateVaultMalicious.getAddress(),
          );
      });
      describe('when testing LSP1 Keys', () => {
        describe('when the owner is setting data', () => {
          describe('using setData', () => {
            it('should pass', async () => {
              const key =
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
                ethers.hexlify(ethers.randomBytes(20)).substring(2);

              const value = '0xaabbccdd';

              await context.lsp9Vault.connect(context.accounts.owner).setData(key, value);

              const result = await context.lsp9Vault.getData(key);
              expect(result).to.equal(value);
            });
          });

          describe('using setData Array', () => {
            it('should pass', async () => {
              const key1 = ethers.hexlify(ethers.randomBytes(32));
              const value1 = ethers.hexlify(ethers.randomBytes(5));

              const key2 =
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
                ethers.hexlify(ethers.randomBytes(20)).substring(2);

              const value2 = ethers.hexlify(ethers.randomBytes(5));

              const keys = [key1, key2];
              const values = [value1, value2];

              await context.lsp9Vault.connect(context.accounts.owner).setDataBatch(keys, values);

              const result = await context.lsp9Vault.getDataBatch(keys);

              expect(result).to.deep.equal(values);
            });
          });
        });

        describe('when the URD is setting data', () => {
          describe('using setData', () => {
            it('should revert', async () => {
              const typeId = ethers.solidityPackedKeccak256(['string'], ['setData']);

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
              const typeId = ethers.solidityPackedKeccak256(['string'], ['setData[]']);

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
                ethers.hexlify(ethers.randomBytes(20)).substring(2);

              const value = '0xaabbccdd';

              await context.lsp9Vault.connect(context.accounts.owner).setData(key, value);

              const result = await context.lsp9Vault.getData(key);
              expect(result).to.equal(value);
            });
          });

          describe('using setData Array', () => {
            it('should pass', async () => {
              const key1 = ethers.hexlify(ethers.randomBytes(32));
              const value1 = ethers.hexlify(ethers.randomBytes(5));

              const key2 =
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                ethers.hexlify(ethers.randomBytes(20)).substring(2);

              const value2 = ethers.hexlify(ethers.randomBytes(5));

              const keys = [key1, key2];
              const values = [value1, value2];

              await context.lsp9Vault.connect(context.accounts.owner).setDataBatch(keys, values);

              const result = await context.lsp9Vault.getDataBatch(keys);

              expect(result).to.deep.equal(values);
            });
          });
        });

        describe('when the URD is setting data', () => {
          describe('using setData', () => {
            it('should revert', async () => {
              const typeId = ethers.solidityPackedKeccak256(['string'], ['setData']);

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
              const typeId = ethers.solidityPackedKeccak256(['string'], ['setData[]']);

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
                ethers.hexlify(ethers.randomBytes(20)).substring(2);

              const value = '0xaabbccdd';

              await context.lsp9Vault.connect(context.accounts.owner).setData(key, value);

              const result = await context.lsp9Vault.getData(key);
              expect(result).to.equal(value);
            });
          });

          describe('using setData Array', () => {
            it('should pass', async () => {
              const key1 = ethers.hexlify(ethers.randomBytes(32));
              const value1 = ethers.hexlify(ethers.randomBytes(5));

              const key2 =
                ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
                ethers.hexlify(ethers.randomBytes(20)).substring(2);

              const value2 = ethers.hexlify(ethers.randomBytes(5));

              const keys = [key1, key2];
              const values = [value1, value2];

              await context.lsp9Vault.connect(context.accounts.owner).setDataBatch(keys, values);

              const result = await context.lsp9Vault.getDataBatch(keys);

              expect(result).to.deep.equal(values);
            });
          });
        });

        describe('when the URD is setting data', () => {
          describe('using setData', () => {
            it('should revert', async () => {
              const typeId = ethers.solidityPackedKeccak256(['string'], ['setData']);

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
              const typeId = ethers.solidityPackedKeccak256(['string'], ['setData[]']);

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
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(200));

        await expect(context.lsp9Vault.setData(key, value))
          .to.emit(context.lsp9Vault, 'DataChanged')
          .withArgs(key, value);

        const result = await context.lsp9Vault.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value more than 256 bytes', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(500));

        await expect(context.lsp9Vault.setData(key, value))
          .to.emit(context.lsp9Vault, 'DataChanged')
          .withArgs(key, value);

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
            to: await context.lsp9Vault.getAddress(),
            value: amount,
          })
        ).to.not.emit(context.lsp9Vault, "UniversalReceiver");
      });
    });

    describe('when setting a data key with a value exactly 256 bytes long', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
        const value = ethers.hexlify(ethers.randomBytes(256));

        await expect(context.lsp9Vault.setData(key, value))
          .to.emit(context.lsp9Vault, 'DataChanged')
          .withArgs(key, value);

        const result = await context.lsp9Vault.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('When sending value to setData', () => {
      it('should revert when sending value to setData(..)', async () => {
        const value = ethers.parseEther('2');
        const txParams = {
          dataKey: ethers.solidityPackedKeccak256(['string'], ['FirstDataKey']),
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
        const value = ethers.parseEther('2');
        const txParams = {
          dataKey: [ethers.solidityPackedKeccak256(['string'], ['FirstDataKey'])],
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
          .transferOwnership(context.universalProfile.target);

        const acceptOwnershipSelector =
          context.universalProfile.interface.getFunction('acceptOwnership').selector;

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          context.lsp9Vault.target,
          0,
          acceptOwnershipSelector,
        ]);

        const tx = await context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(executePayload);

        await tx.wait();
      });

      it('should register lsp10 keys of the vault on the profile', async () => {
        const arrayLength = await context.universalProfile.getData(
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
        );

        expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
      });
    });

    describe('when using batchCalls function', () => {
      before(async () => {
        await context.accounts.friend.sendTransaction({
          value: 1000,
          to: await context.lsp9Vault.getAddress(),
        });
      });

      describe('when non-owner is calling', () => {
        it('shoud revert', async () => {
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

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
              const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
              const value = ethers.hexlify(ethers.randomBytes(500));

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
                [0, await context.lsp9Vault.getAddress(), 0, multiCallPayload],
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
                [0, await context.lsp9Vault.getAddress(), 0, multiCallPayload],
              );

              await expect(() =>
                context.lsp6KeyManager.connect(context.accounts.owner).execute(executePayloadUP),
              ).to.changeEtherBalances(
                [await context.lsp9Vault.getAddress(), context.accounts.random.address],
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

              const key = ethers.keccak256(ethers.toUtf8Bytes('A new key'));
              const value = ethers.hexlify(ethers.randomBytes(10));

              const setDataPayload = context.lsp9Vault.interface.encodeFunctionData('setData', [
                key,
                value,
              ]);

              const transferOwnershipPayload = context.lsp9Vault.interface.encodeFunctionData(
                'transferOwnership',
                [context.accounts.anyone.address],
              );

              expect(await context.lsp9Vault.pendingOwner()).to.equal(ethers.ZeroAddress);

              const multiCallPayload = context.lsp9Vault.interface.encodeFunctionData(
                'batchCalls',
                [[executePayload, setDataPayload, transferOwnershipPayload]],
              );

              const executePayloadUP = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [0, await context.lsp9Vault.getAddress(), 0, multiCallPayload],
              );

              await expect(() =>
                context.lsp6KeyManager.connect(context.accounts.owner).execute(executePayloadUP),
              ).to.changeEtherBalances(
                [await context.lsp9Vault.getAddress(), context.accounts.random.address],
                [`-${amount}`, amount],
              );

              const result = await context.lsp9Vault.getData(key);
              expect(result).to.equal(value);

              expect(await context.lsp9Vault.pendingOwner()).to.equal(
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
              [await context.lsp9Vault.getAddress()],
              ['0xffffffff'],
              ['0xffffffff'],
            ),
          ],
        ]);

        await context.lsp6KeyManager.connect(context.accounts.owner).execute(payload);
      });

      it('should allow friend to talk to the vault', async () => {
        const dataKey = ethers.keccak256(ethers.toUtf8Bytes('some data key'));
        const dataValue = ethers.hexlify(ethers.toUtf8Bytes('some value'));

        const payload = context.lsp9Vault.interface.encodeFunctionData('setData', [
          dataKey,
          dataValue,
        ]);
        await context.lsp6KeyManager
          .connect(context.accounts.friend)
          .execute(
            callPayload(context.universalProfile, await context.lsp9Vault.getAddress(), payload),
          );

        const res = await context.lsp9Vault.getData(dataKey);
        expect(res).to.equal(dataValue);
      });

      it('should fail when friend is interacting with other contracts', async () => {
        const dataKey = ethers.keccak256(ethers.toUtf8Bytes('some data key'));
        const dataValue = ethers.hexlify(ethers.toUtf8Bytes('some value'));

        const payload = context.universalProfile.interface.encodeFunctionData('setData', [
          dataKey,
          dataValue,
        ]);

        const disallowedAddress = ethers.getAddress(await context.universalProfile.getAddress());

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.friend)
            .execute(
              callPayload(
                context.universalProfile,
                await context.universalProfile.getAddress(),
                payload,
              ),
            ),
        )
          .to.be.revertedWithCustomError(context.lsp6KeyManager, 'NotAllowedCall')
          .withArgs(
            context.accounts.friend.address,
            disallowedAddress,
            context.universalProfile.interface.getFunction('setData').selector,
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
          .transferOwnership(await context.universalProfile.getAddress());

        await expect(transferOwnership)
          .to.emit(context.universalProfile, 'UniversalReceiver')
          .withArgs(
            await context.lsp9Vault.getAddress(),
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferStarted,
            abiCoder.encode(
              ['address', 'address'],
              [context.accounts.owner.address, await context.universalProfile.getAddress()],
            ),
            abiCoder.encode(
              ['bytes', 'bytes'],
              [ethers.hexlify(ethers.toUtf8Bytes('LSP1: typeId out of scope')), '0x'],
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
        const values = Array(3).fill(ethers.toBigInt('1'));
        const datas = Array(3).fill('0x');

        const msgValue = ethers.parseEther('10');

        const tx = await context.lsp9Vault.executeBatch(operationsType, recipients, values, datas, {
          value: msgValue,
        });

        await expect(tx)
          .to.emit(context.lsp9Vault, 'UniversalReceiver')
          .withArgs(
            context.deployParams.newOwner,
            msgValue,
            LSP1_TYPE_IDS.LSP9ValueReceived,
            context.universalProfile.interface.getFunction('executeBatch').selector,
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
        const values = Array(3).fill(ethers.toBigInt(1));
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
  initializeTransaction: ContractTransactionResponse;
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
