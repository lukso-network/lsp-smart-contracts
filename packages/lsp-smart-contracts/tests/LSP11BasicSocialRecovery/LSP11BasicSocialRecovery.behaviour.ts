import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import type { TransactionResponse } from '@ethersproject/abstract-provider';

import { LSP11BasicSocialRecovery, LSP6KeyManager, UniversalProfile } from '../../types';

import { ALL_PERMISSIONS, ERC725YDataKeys, INTERFACE_IDS } from '../../constants';

import { callPayload } from '../utils/fixtures';

export type LSP11TestAccounts = {
  owner: SignerWithAddress;
  addressASelected: SignerWithAddress;
  addressBSelected: SignerWithAddress;
  any: SignerWithAddress;
  random: SignerWithAddress;

  guardian1: SignerWithAddress;
  guardian2: SignerWithAddress;
  guardian3: SignerWithAddress;
  guardian4: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP11TestAccounts> => {
  const [
    owner,
    addressASelected,
    addressBSelected,
    any,
    random,
    guardian1,
    guardian2,
    guardian3,
    guardian4,
  ] = await ethers.getSigners();

  return {
    owner,
    addressASelected,
    addressBSelected,
    any,
    random,
    guardian1,
    guardian2,
    guardian3,
    guardian4,
  };
};

export type LSP11DeployParams = {
  owner: UniversalProfile;
  target: UniversalProfile;
};

export type LSP11TestContext = {
  accounts: LSP11TestAccounts;
  lsp11BasicSocialRecovery: LSP11BasicSocialRecovery;
  deployParams: LSP11DeployParams;
  universalProfile: UniversalProfile;
  lsp6KeyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP11 = (buildContext: () => Promise<LSP11TestContext>) => {
  let context: LSP11TestContext;

  describe('When using the contract as password recovery', () => {
    before(async () => {
      context = await buildContext();
    });

    describe('when testing owner functionalities', () => {
      it('Should revert when non-owner calls `setRecoverySecretHash(..)`', async () => {
        const txParams = {
          hash: ethers.utils.solidityKeccak256(['string'], ['LUKSO']),
        };

        await expect(
          context.lsp11BasicSocialRecovery
            .connect(context.accounts.any)
            .setRecoverySecretHash(txParams.hash),
        ).to.be.revertedWithCustomError(
          context.lsp11BasicSocialRecovery,
          'OwnableCallerNotTheOwner',
        );
      });

      it('Should revert when owner calls `setRecoverySecretHash(..)` with bytes32(0) as secret', async () => {
        const txParams = {
          hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        };

        const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'setRecoverySecretHash',
          [txParams.hash],
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.owner)
            .execute(
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload,
              ),
            ),
        ).to.be.revertedWithCustomError(context.lsp11BasicSocialRecovery, 'SecretHashCannotBeZero');
      });

      it('Should pass when owner calls `setRecoverySecretHash(..)`', async () => {
        const txParams = {
          hash: ethers.utils.solidityKeccak256(['string'], ['LUKSO']),
        };

        const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'setRecoverySecretHash',
          [txParams.hash],
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.owner)
            .execute(
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload,
              ),
            ),
        )
          .to.emit(context.lsp11BasicSocialRecovery, 'SecretHashChanged')
          .withArgs(txParams.hash);
      });
    });

    describe('when testing recovery', () => {
      describe('when providing the wrong plainSecret', () => {
        it('should revert', async () => {
          const txParams = {
            secret: 'NotLUKSO',
            newHash: ethers.utils.solidityKeccak256(['string'], ['UniversalProfiles']),
          };

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(context.accounts.addressASelected)
              .recoverOwnership(
                context.accounts.addressASelected.address,
                txParams.secret,
                txParams.newHash,
              ),
          ).to.be.revertedWithCustomError(context.lsp11BasicSocialRecovery, 'WrongPlainSecret');
        });
      });

      describe('when providing bytes32(0) as newSecretHash', () => {
        it('should revert', async () => {
          const txParams = {
            secret: 'LUKSO',
            newHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          };

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(context.accounts.addressASelected)
              .recoverOwnership(
                context.accounts.addressASelected.address,
                txParams.secret,
                txParams.newHash,
              ),
          ).to.be.revertedWithCustomError(
            context.lsp11BasicSocialRecovery,
            'SecretHashCannotBeZero',
          );
        });
      });

      describe('when providing the correct plainSecret and a valid newHash', () => {
        let recoveryTx;
        let txParams;
        let recoveryCounterBeforeRecovery;
        before(async () => {
          txParams = {
            secret: 'LUKSO',
            newHash: ethers.utils.solidityKeccak256(['string'], ['UniversalProfiles']),
          };

          recoveryCounterBeforeRecovery =
            await context.lsp11BasicSocialRecovery.callStatic.getRecoveryCounter();

          recoveryTx = await context.lsp11BasicSocialRecovery
            .connect(context.accounts.addressASelected)
            .recoverOwnership(
              context.accounts.addressASelected.address,
              txParams.secret,
              txParams.newHash,
            );
        });

        it('should increment the recovery counter', async () => {
          const recoveryCounterAfterRecovery =
            await context.lsp11BasicSocialRecovery.callStatic.getRecoveryCounter();

          expect(recoveryCounterAfterRecovery).to.equal(recoveryCounterBeforeRecovery.add(1));
        });

        it('should emit RecoveryProcessSuccessful event', async () => {
          const guardians = await context.lsp11BasicSocialRecovery.callStatic.getGuardians();

          expect(recoveryTx)
            .to.emit(context.lsp11BasicSocialRecovery, 'RecoveryProcessSuccessful')
            .withArgs(
              recoveryCounterBeforeRecovery,
              context.accounts.addressASelected.address,
              txParams.secret,
              guardians,
            );
        });

        it('should have set the correct AddressPermissions Keys on target', async () => {
          const txParams = {
            permissionArrayKey: ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
            permissionInArrayKey:
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000003',
            permissionMap:
              ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts.addressASelected.address.substr(2),
          };
          const [permissionArrayLength, controllerAddress, controllerPermissions] =
            await context.universalProfile.callStatic.getDataBatch([
              txParams.permissionArrayKey,
              txParams.permissionInArrayKey,
              txParams.permissionMap,
            ]);

          expect(permissionArrayLength).to.equal(
            ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 16),
          );
          expect(ethers.utils.getAddress(controllerAddress)).to.equal(
            context.accounts.addressASelected.address,
          );
          expect(controllerPermissions).to.equal(ALL_PERMISSIONS);
        });
      });
    });

    describe('when testing execution on target after recovery', () => {
      describe('when setting data on the target', () => {
        it('should pass', async () => {
          const txParams = {
            key: ethers.utils.solidityKeccak256(['string'], ['MyKey']),
            value: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('I have access')),
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            txParams.key,
            txParams.value,
          ]);

          await context.lsp6KeyManager.connect(context.accounts.addressASelected).execute(payload);

          const value = await context.universalProfile.callStatic['getData(bytes32)'](txParams.key);

          expect(value).to.equal(txParams.value);
        });
      });
    });
  });

  describe('When using the contract as social recovery', () => {
    before(async () => {
      context = await buildContext();
    });

    describe('when testing owner functionalities', () => {
      it('Should revert when non-owner calls addGuardian function', async () => {
        const txParams = {
          guardianAddress: context.accounts.guardian1.address,
        };
        await expect(
          context.lsp11BasicSocialRecovery
            .connect(context.accounts.any)
            .addGuardian(txParams.guardianAddress),
        ).to.be.revertedWithCustomError(
          context.lsp11BasicSocialRecovery,
          'OwnableCallerNotTheOwner',
        );
      });

      it('Should pass and emit GuardianAdded event when owner calls addGuardian function', async () => {
        const txParams = {
          guardianAddress: context.accounts.guardian1.address,
        };

        const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'addGuardian',
          [txParams.guardianAddress],
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.owner)
            .execute(
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload,
              ),
            ),
        )
          .to.emit(context.lsp11BasicSocialRecovery, 'GuardianAdded')
          .withArgs(txParams.guardianAddress);

        const isGuardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress,
        );

        expect(isGuardian).to.be.true;
      });

      it('Should revert when non-owner calls removeGuardian function', async () => {
        const txParams = {
          guardianAddress: context.accounts.guardian1.address,
        };
        await expect(
          context.lsp11BasicSocialRecovery
            .connect(context.accounts.any)
            .removeGuardian(txParams.guardianAddress),
        ).to.be.revertedWithCustomError(
          context.lsp11BasicSocialRecovery,
          'OwnableCallerNotTheOwner',
        );
      });

      it('Should pass and emit GuardianRemoved event when owner calls removeGuardian function', async () => {
        const txParams = {
          guardianAddress: context.accounts.guardian1.address,
        };

        const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'removeGuardian',
          [txParams.guardianAddress],
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.owner)
            .execute(
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload,
              ),
            ),
        )
          .to.emit(context.lsp11BasicSocialRecovery, 'GuardianRemoved')
          .withArgs(txParams.guardianAddress);

        const isGuardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress,
        );

        expect(isGuardian).to.be.false;
      });

      it('Should revert when non-owner calls `setGuardiansThreshold(..)`', async () => {
        const txParams = {
          newThreshold: 1,
        };

        await expect(
          context.lsp11BasicSocialRecovery
            .connect(context.accounts.any)
            .setGuardiansThreshold(txParams.newThreshold),
        ).to.be.revertedWithCustomError(
          context.lsp11BasicSocialRecovery,
          'OwnableCallerNotTheOwner',
        );
      });

      it('Should pass and emit GuardiansThresholdChanged event when owner `setGuardiansThreshold(..)`', async () => {
        const txParams = {
          newThreshold: 0,
        };

        const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'setGuardiansThreshold',
          [txParams.newThreshold],
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.owner)
            .execute(
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload,
              ),
            ),
        )
          .to.emit(context.lsp11BasicSocialRecovery, 'GuardiansThresholdChanged')
          .withArgs(txParams.newThreshold);

        const guardiansThreshold = (
          await context.lsp11BasicSocialRecovery.callStatic.getGuardiansThreshold()
        ).toNumber();

        expect(guardiansThreshold).to.equal(txParams.newThreshold);
      });

      it('Should revert when non-owner calls `setRecoverySecretHash(..)`', async () => {
        const txParams = {
          hash: ethers.utils.solidityKeccak256(['string'], ['LUKSO']),
        };

        await expect(
          context.lsp11BasicSocialRecovery
            .connect(context.accounts.any)
            .setRecoverySecretHash(txParams.hash),
        ).to.be.revertedWithCustomError(
          context.lsp11BasicSocialRecovery,
          'OwnableCallerNotTheOwner',
        );
      });

      it('Should pass and emit SecretHashChanged event when owner calls `setRecoverySecretHash(..)`', async () => {
        const txParams = {
          hash: ethers.utils.solidityKeccak256(['string'], ['LUKSO']),
        };

        const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'setRecoverySecretHash',
          [txParams.hash],
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.owner)
            .execute(
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload,
              ),
            ),
        )
          .to.emit(context.lsp11BasicSocialRecovery, 'SecretHashChanged')
          .withArgs(txParams.hash);
      });
    });

    describe('when testing function logic', () => {
      describe('when owner calls addGuardian(..) with an existing Guardian address', () => {
        let txParams;
        let payload;
        before('Adding the guardian first', async () => {
          // Add the guardian
          txParams = {
            guardianAddress: context.accounts.guardian1.address,
          };

          payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData('addGuardian', [
            txParams.guardianAddress,
          ]);

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.emit(context.lsp11BasicSocialRecovery, 'GuardianAdded')
            .withArgs(txParams.guardianAddress);
        });

        it('Should revert with GuardianAlreadyExist error ', async () => {
          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.be.revertedWithCustomError(context.lsp11BasicSocialRecovery, 'GuardianAlreadyExist')
            .withArgs(txParams.guardianAddress);

          const isGuardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
            txParams.guardianAddress,
          );
          expect(isGuardian).to.be.true;
        });
      });

      describe('when owner calls removeGuardian(..) with a non-existing Guardian address', () => {
        it('Should revert with GuardianDoNotExist error', async () => {
          const txParams = {
            guardianAddress: context.accounts.random.address,
          };

          const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
            'removeGuardian',
            [txParams.guardianAddress],
          );

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.be.revertedWithCustomError(context.lsp11BasicSocialRecovery, 'GuardianDoNotExist')
            .withArgs(txParams.guardianAddress);
        });
      });

      describe('when owner calls setGuardiansThreshold(..) with a threshold higher than the guardians count', () => {
        it('should revert with ThresholdCannotBeHigherThanGuardiansNumber error', async () => {
          const guardians = await context.lsp11BasicSocialRecovery.callStatic.getGuardians();

          expect(guardians.length).to.equal(1);

          const txParams = {
            newThreshold: 2,
          };

          const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
            'setGuardiansThreshold',
            [txParams.newThreshold],
          );

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.be.revertedWithCustomError(
              context.lsp11BasicSocialRecovery,
              'ThresholdCannotBeHigherThanGuardiansNumber',
            )
            .withArgs(txParams.newThreshold, guardians.length);
        });
      });

      describe('when owner calls setGuardiansThreshold(..) with a threshold lower than the guardians count', () => {
        it('should pass', async () => {
          const guardians = await context.lsp11BasicSocialRecovery.callStatic.getGuardians();

          expect(guardians.length).to.equal(1);

          const txParams = {
            newThreshold: 0,
          };

          const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
            'setGuardiansThreshold',
            [txParams.newThreshold],
          );

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.emit(context.lsp11BasicSocialRecovery, 'GuardiansThresholdChanged')
            .withArgs(txParams.newThreshold);

          const guardiansThreshold =
            await context.lsp11BasicSocialRecovery.callStatic.getGuardiansThreshold();
          expect(guardiansThreshold).to.equal(txParams.newThreshold);
        });
      });

      describe('when owner calls setGuardiansThreshold(..) with a threshold equal to the guardians count', () => {
        it('should pass', async () => {
          const guardians = await context.lsp11BasicSocialRecovery.callStatic.getGuardians();

          expect(guardians.length).to.equal(1);

          const txParams = {
            newThreshold: 1,
          };

          const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
            'setGuardiansThreshold',
            [txParams.newThreshold],
          );

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.emit(context.lsp11BasicSocialRecovery, 'GuardiansThresholdChanged')
            .withArgs(txParams.newThreshold);

          const guardiansThreshold =
            await context.lsp11BasicSocialRecovery.callStatic.getGuardiansThreshold();
          expect(guardiansThreshold).to.equal(txParams.newThreshold);
        });
      });

      describe('when owner calls removeGuardian(..) when the threshold is equal to the guardians count', () => {
        let guardians;
        let guardiansThreshold;
        before('Check that the guardians number is equal to the guardians threshold', async () => {
          guardians = await context.lsp11BasicSocialRecovery.callStatic.getGuardians();
          guardiansThreshold =
            await context.lsp11BasicSocialRecovery.callStatic.getGuardiansThreshold();

          expect(guardians.length).to.equal(guardiansThreshold);
        });

        it('Should revert with GuardiansNumberCannotGoBelowThreshold error', async () => {
          const txParams = {
            guardianAddress: context.accounts.guardian1.address,
          };

          const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
            'removeGuardian',
            [txParams.guardianAddress],
          );

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          )
            .to.be.revertedWithCustomError(
              context.lsp11BasicSocialRecovery,
              'GuardiansNumberCannotGoBelowThreshold',
            )
            .withArgs(guardiansThreshold);
        });
      });

      describe('when owner calls setRecoverySecretHash(..) with bytes32(0) as secret', () => {
        it('should revert with SecretHashCannotBeZero error', async () => {
          const txParams = {
            hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          };

          const payload = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
            'setRecoverySecretHash',
            [txParams.hash],
          );

          await expect(
            context.lsp6KeyManager
              .connect(context.accounts.owner)
              .execute(
                callPayload(
                  context.universalProfile,
                  context.lsp11BasicSocialRecovery.address,
                  payload,
                ),
              ),
          ).to.be.revertedWithCustomError(
            context.lsp11BasicSocialRecovery,
            'SecretHashCannotBeZero',
          );
        });
      });
    });

    describe('when testing guardians functionalities', () => {
      before('Checking guardians and add few more', async () => {
        // Checking that guardian1 address is set
        const isAddress1Guardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          context.accounts.guardian1.address,
        );

        expect(isAddress1Guardian).to.be.true;

        // Adding more guardians

        const payload1 = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'addGuardian',
          [context.accounts.guardian2.address],
        );

        const payload2 = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'addGuardian',
          [context.accounts.guardian3.address],
        );

        const payload3 = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'addGuardian',
          [context.accounts.guardian4.address],
        );

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          .executeBatch(
            [0, 0, 0],
            [
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload1,
              ),
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload2,
              ),
              callPayload(
                context.universalProfile,
                context.lsp11BasicSocialRecovery.address,
                payload3,
              ),
            ],
          );

        const isAddress2Guardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          context.accounts.guardian2.address,
        );

        const isAddress3Guardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          context.accounts.guardian3.address,
        );

        const isAddress4Guardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          context.accounts.guardian4.address,
        );

        expect(isAddress2Guardian).to.be.true;
        expect(isAddress3Guardian).to.be.true;
        expect(isAddress4Guardian).to.be.true;
      });

      describe('when non-guardian calls selectNewController(..) function', () => {
        it('should revert with CallerIsNotGuardian error', async () => {
          const txParams = {
            addressToSelect: context.accounts.addressASelected.address,
          };

          const caller = context.accounts.random;

          const isGuardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
            caller.address,
          );

          expect(isGuardian).to.be.false;

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(caller)
              .selectNewController(txParams.addressToSelect),
          )
            .to.be.revertedWithCustomError(context.lsp11BasicSocialRecovery, 'CallerIsNotGuardian')
            .withArgs(caller.address);
        });
      });

      describe('when a guardian calls selectNewController(..) function', () => {
        it('should pass and emit SelectedNewController event', async () => {
          const txParams = {
            addressToSelect: context.accounts.addressASelected.address,
          };

          const caller = context.accounts.guardian1;

          const isGuardian = await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
            caller.address,
          );

          expect(isGuardian).to.be.true;

          const currentRecoveryCounter =
            await context.lsp11BasicSocialRecovery.callStatic.getRecoveryCounter();

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(caller)
              .selectNewController(txParams.addressToSelect),
          )
            .to.emit(context.lsp11BasicSocialRecovery, 'SelectedNewController')
            .withArgs(currentRecoveryCounter, caller.address, txParams.addressToSelect);
        });
      });
    });

    describe('when finalizing recovery', () => {
      let plainSecret;
      let recoverySecretHash;
      let beforeRecoveryCounter;
      let guardiansThreshold;
      let addressBselection;

      before('Distribution selection of the guardians and setting recovery params', async () => {
        // Checks that recoveryCounter equal 0 before recovery
        beforeRecoveryCounter =
          await context.lsp11BasicSocialRecovery.callStatic.getRecoveryCounter();

        expect(beforeRecoveryCounter).to.equal(0);

        // Changing the threshold to 3 out of 4 guardians
        const payload1 = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'setGuardiansThreshold',
          [3],
        );

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload1,
            ),
          );

        guardiansThreshold =
          await context.lsp11BasicSocialRecovery.callStatic.getGuardiansThreshold();
        expect(guardiansThreshold).to.equal(3);

        // Changing the secretHash to "LUKSO"
        plainSecret = 'LUKSO';
        recoverySecretHash = ethers.utils.solidityKeccak256(['string'], [plainSecret]);

        const payload2 = context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          'setRecoverySecretHash',
          [recoverySecretHash],
        );

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload2,
            ),
          );

        // Guardian 1 selects address A
        await context.lsp11BasicSocialRecovery
          .connect(context.accounts.guardian1)
          .selectNewController(context.accounts.addressASelected.address);

        const guardian1Choice = await context.lsp11BasicSocialRecovery.callStatic.getGuardianChoice(
          context.accounts.guardian1.address,
        );

        expect(guardian1Choice).to.equal(context.accounts.addressASelected.address);

        // Guardian 2 selects address A
        await context.lsp11BasicSocialRecovery
          .connect(context.accounts.guardian2)
          .selectNewController(context.accounts.addressASelected.address);

        const guardian2Choice = await context.lsp11BasicSocialRecovery.callStatic.getGuardianChoice(
          context.accounts.guardian2.address,
        );

        expect(guardian2Choice).to.equal(context.accounts.addressASelected.address);

        // Guardian 3 selects address A
        await context.lsp11BasicSocialRecovery
          .connect(context.accounts.guardian3)
          .selectNewController(context.accounts.addressASelected.address);

        const guardian3Choice = await context.lsp11BasicSocialRecovery.callStatic.getGuardianChoice(
          context.accounts.guardian3.address,
        );

        expect(guardian3Choice).to.equal(context.accounts.addressASelected.address);

        // Guardian 4 selects address B
        await context.lsp11BasicSocialRecovery
          .connect(context.accounts.guardian4)
          .selectNewController(context.accounts.addressBSelected.address);

        const guardian4Choice = await context.lsp11BasicSocialRecovery.callStatic.getGuardianChoice(
          context.accounts.guardian4.address,
        );

        addressBselection = 1;

        expect(guardian4Choice).to.equal(context.accounts.addressBSelected.address);
      });

      describe("When address B calls recoverOwnership(..) when it didn't reached the guardians threshold", () => {
        it('should revert with ThresholdNotReachedForRecoverer error', async () => {
          const txParams = {
            secret: plainSecret,
            newHash: ethers.utils.solidityKeccak256(['string'], ['NotLUKSO']),
          };

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(context.accounts.addressBSelected)
              .recoverOwnership(
                context.accounts.addressBSelected.address,
                txParams.secret,
                txParams.newHash,
              ),
          )
            .to.be.revertedWithCustomError(
              context.lsp11BasicSocialRecovery,
              'ThresholdNotReachedForRecoverer',
            )
            .withArgs(
              context.accounts.addressBSelected.address,
              addressBselection,
              guardiansThreshold,
            );
        });
      });

      describe('When address A calls recoverOwnership(..) with bytes32(0) as new secretHash', () => {
        it('should revert with SecretHashCannotBeZero error', async () => {
          const txParams = {
            secret: plainSecret,
            newHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          };

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(context.accounts.addressASelected)
              .recoverOwnership(
                context.accounts.addressASelected.address,
                txParams.secret,
                txParams.newHash,
              ),
          ).to.be.revertedWithCustomError(
            context.lsp11BasicSocialRecovery,
            'SecretHashCannotBeZero',
          );
        });
      });

      describe('When address A calls recoverOwnership(..) with the incorrect plainSecret', () => {
        it('should revert with WrongPlainSecret error', async () => {
          const txParams = {
            secret: 'NotTheValidPlainSecret',
            newHash: ethers.utils.solidityKeccak256(['string'], ['NotLUKSO']),
          };

          await expect(
            context.lsp11BasicSocialRecovery
              .connect(context.accounts.addressASelected)
              .recoverOwnership(
                context.accounts.addressASelected.address,
                txParams.secret,
                txParams.newHash,
              ),
          ).to.be.revertedWithCustomError(context.lsp11BasicSocialRecovery, 'WrongPlainSecret');
        });
      });

      describe('When address A calls recoverOwnership(..) with the correct plainSecret', () => {
        let ownershipRecoveryTx;
        let newPlainSecret;
        let newSecretHash;
        before('Creating the tx of recovering', async () => {
          newPlainSecret = 'UniversalProfiles';
          newSecretHash = ethers.utils.solidityKeccak256(['string'], [newPlainSecret]);

          const txParams = {
            secret: plainSecret,
            newHash: newSecretHash,
          };

          ownershipRecoveryTx = await context.lsp11BasicSocialRecovery
            .connect(context.accounts.addressASelected)
            .recoverOwnership(
              context.accounts.addressASelected.address,
              txParams.secret,
              txParams.newHash,
            );
        });

        it('should pass and emit RecoveryProcessSuccessful event', async () => {
          expect(ownershipRecoveryTx)
            .to.emit(context.lsp11BasicSocialRecovery, 'RecoveryProcessSuccessful')
            .withArgs(
              beforeRecoveryCounter,
              context.accounts.addressASelected,
              newSecretHash,
              await context.lsp11BasicSocialRecovery.callStatic.getGuardians(),
            );
        });

        it('should increment the recovery counter', async () => {
          const afterRecoveryCounter =
            await context.lsp11BasicSocialRecovery.callStatic.getRecoveryCounter();

          expect(afterRecoveryCounter).to.equal(beforeRecoveryCounter + 1);
        });

        it('should update the recoverySecretHash ', async () => {
          expect(ownershipRecoveryTx)
            .to.emit(context.lsp11BasicSocialRecovery, 'SecretHashChanged')
            .withArgs(newSecretHash);
        });

        it('should add the AddressPermissions Key for address A in the target ', async () => {
          const txParams = {
            permissionArrayKey: ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
            permissionInArrayKey:
              ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              '00000000000000000000000000000003',
            permissionMap:
              ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts.addressASelected.address.substr(2),
          };
          const [permissionArrayLength, controllerAddress, controllerPermissions] =
            await context.universalProfile.callStatic.getDataBatch([
              txParams.permissionArrayKey,
              txParams.permissionInArrayKey,
              txParams.permissionMap,
            ]);

          expect(permissionArrayLength).to.equal(
            ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 16),
          );
          expect(ethers.utils.getAddress(controllerAddress)).to.equal(
            context.accounts.addressASelected.address,
          );
          expect(controllerPermissions).to.equal(ALL_PERMISSIONS);
        });
      });
    });

    describe('when testing execution on target after recovery', () => {
      describe('when setting data on the target', () => {
        it('should pass', async () => {
          const txParams = {
            key: ethers.utils.solidityKeccak256(['string'], ['MyKey']),
            value: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('I have access')),
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            txParams.key,
            txParams.value,
          ]);

          await context.lsp6KeyManager.connect(context.accounts.addressASelected).execute(payload);

          const value = await context.universalProfile.callStatic['getData(bytes32)'](txParams.key);

          expect(value).to.equal(txParams.value);
        });
      });
    });

    describe('when checking guardians choice', () => {
      it('should be reset', async () => {
        const guardian1Choice = await context.lsp11BasicSocialRecovery.callStatic.getGuardianChoice(
          context.accounts.guardian1.address,
        );

        expect(guardian1Choice).to.equal(ethers.constants.AddressZero);

        const guardian2Choice = await context.lsp11BasicSocialRecovery.callStatic.getGuardianChoice(
          context.accounts.guardian2.address,
        );

        expect(guardian2Choice).to.equal(ethers.constants.AddressZero);
      });
    });
  });
};

export type LSP11InitializeTestContext = {
  lsp11BasicSocialRecovery: LSP11BasicSocialRecovery;
  deployParams: LSP11DeployParams;
  initializeTransaction: TransactionResponse;
};

export const shouldInitializeLikeLSP11 = (
  buildContext: () => Promise<LSP11InitializeTestContext>,
) => {
  let context: LSP11InitializeTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('Should have registered the ERC165 interface', async () => {
      expect(
        await context.lsp11BasicSocialRecovery.callStatic.supportsInterface(INTERFACE_IDS.ERC165),
      ).to.be.true;
    });

    it('Should have registered the LSP11 interface', async () => {
      expect(
        await context.lsp11BasicSocialRecovery.callStatic.supportsInterface(
          INTERFACE_IDS.LSP11BasicSocialRecovery,
        ),
      ).to.be.true;
    });

    it('Should have set the owner', async () => {
      const owner = await context.lsp11BasicSocialRecovery.callStatic.owner();
      expect(owner).to.equal(context.deployParams.owner.address);
    });

    it('Should have set the linked target', async () => {
      const target = await context.lsp11BasicSocialRecovery.callStatic.target();
      expect(target).to.equal(context.deployParams.target.address);
    });
  });
};
