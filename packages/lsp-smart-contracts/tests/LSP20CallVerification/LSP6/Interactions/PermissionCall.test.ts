import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  FallbackInitializer,
  FallbackInitializer__factory,
  FallbackRevert,
  FallbackRevert__factory,
  TargetContract,
  TargetContract__factory,
} from '../../../../types';

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
import {
  abiCoder,
  combineAllowedCalls,
  combineCallTypes,
  combinePermissions,
  provider,
} from '../../../utils/helpers';

export const shouldBehaveLikePermissionCall = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('when making an empty call via `ERC25X.execute(...)` -> (`data` = `0x`, `value` = 0)', () => {
    let addressCanMakeCallNoAllowedCalls: SignerWithAddress,
      addressCanMakeCallWithAllowedCalls: SignerWithAddress,
      addressCannotMakeCallNoAllowedCalls: SignerWithAddress,
      addressCannotMakeCallWithAllowedCalls: SignerWithAddress,
      addressWithSuperCall: SignerWithAddress;

    let allowedEOA: string;

    let allowedContractWithFallback: FallbackInitializer,
      allowedContractWithFallbackRevert: FallbackRevert;

    before(async () => {
      context = await buildContext();

      addressCannotMakeCallNoAllowedCalls = context.accounts[1];
      addressCannotMakeCallWithAllowedCalls = context.accounts[2];
      addressCanMakeCallNoAllowedCalls = context.accounts[3];
      addressCanMakeCallWithAllowedCalls = context.accounts[4];
      addressWithSuperCall = context.accounts[5];

      allowedEOA = context.accounts[6].address;

      allowedContractWithFallback = await new FallbackInitializer__factory(
        context.accounts[0],
      ).deploy();

      allowedContractWithFallbackRevert = await new FallbackRevert__factory(
        context.accounts[0],
      ).deploy();

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCannotMakeCallNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCannotMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanMakeCallNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressWithSuperCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressCannotMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
      ];

      const allowedCallsValues = combineAllowedCalls(
        [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
        [
          allowedEOA,
          allowedContractWithFallback.address,
          allowedContractWithFallbackRevert.address,
        ],
        ['0xffffffff', '0xffffffff', '0xffffffff'],
        ['0xffffffff', '0xffffffff', '0xffffffff'],
      );

      const permissionsValues = [
        combinePermissions(PERMISSIONS.SIGN, PERMISSIONS.EXECUTE_RELAY_CALL),
        combinePermissions(PERMISSIONS.SIGN, PERMISSIONS.EXECUTE_RELAY_CALL),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        combinePermissions(PERMISSIONS.SUPER_CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        allowedCallsValues,
        allowedCallsValues,
      ];

      await setupKeyManager(context, permissionKeys, permissionsValues);
    });

    describe('when caller does not have permission CALL and no Allowed Calls', () => {
      it('should fail with `NotAuthorised` error when `to` is an EOA', async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallNoAllowedCalls)
            .execute(OPERATION_TYPES.CALL, targetEOA, 0, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotMakeCallNoAllowedCalls.address, 'CALL');
      });

      it('should fail with `NotAuthorised` error when `to` is a contract', async () => {
        const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallNoAllowedCalls)
            .execute(OPERATION_TYPES.CALL, targetContract.address, 0, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotMakeCallNoAllowedCalls.address, 'CALL');
      });
    });

    describe('when caller does not have permission CALL but have some Allowed Calls', () => {
      it('should fail with `NotAuthorised` error when `to` is an EOA', async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallWithAllowedCalls)
            .execute(OPERATION_TYPES.CALL, targetEOA, 0, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotMakeCallWithAllowedCalls.address, 'CALL');
      });

      it('should fail with `NotAuthorised` error when `to` is a contract', async () => {
        const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallWithAllowedCalls)
            .execute(OPERATION_TYPES.CALL, targetContract.address, 0, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotMakeCallWithAllowedCalls.address, 'CALL');
      });
    });

    describe('when caller has permission CALL, but no Allowed Calls', () => {
      it('should fail with `NoCallsAllowed` error when `to` is an EOA', async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await expect(
          context.universalProfile
            .connect(addressCanMakeCallNoAllowedCalls)
            .execute(OPERATION_TYPES.CALL, targetEOA, 0, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
          .withArgs(addressCanMakeCallNoAllowedCalls.address);
      });

      it('should fail with `NoCallsAllowed` error when `to` is a contract', async () => {
        const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

        await expect(
          context.universalProfile
            .connect(addressCanMakeCallNoAllowedCalls)
            .execute(OPERATION_TYPES.CALL, targetContract.address, 0, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
          .withArgs(addressCanMakeCallNoAllowedCalls.address);
      });
    });

    describe('when caller has permission CALL with some Allowed Calls', () => {
      describe('when `to` is an EOA', () => {
        describe('when `to` is NOT in the list of Allowed Calls', () => {
          it('should fail with `NotAllowedCall` error', async () => {
            const targetEOA = ethers.Wallet.createRandom().address;

            await expect(
              context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                .execute(OPERATION_TYPES.CALL, targetEOA, 0, '0x'),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
              .withArgs(addressCanMakeCallWithAllowedCalls.address, targetEOA, '0x00000000');
          });
        });

        describe('when `to` is in the list of Allowed Calls', () => {
          it('should pass', async () => {
            const tx = context.universalProfile
              .connect(addressCanMakeCallWithAllowedCalls)
              .execute(OPERATION_TYPES.CALL, allowedEOA, 0, '0x');

            await expect(tx).to.not.be.reverted;

            expect(tx)
              .to.emit(context.keyManager, 'PermissionsVerified')
              .withArgs(addressCanMakeCallWithAllowedCalls.address, 0, '0x00000000');
          });
        });
      });

      describe('when `to` is a contract', () => {
        describe('when `to` is NOT in the list of Allowed Calls', () => {
          it('should fail with `NotAllowedCall` error', async () => {
            const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

            await expect(
              context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                .execute(OPERATION_TYPES.CALL, targetContract.address, 0, '0x'),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
              .withArgs(
                addressCanMakeCallWithAllowedCalls.address,
                targetContract.address,
                '0x00000000',
              );
          });
        });

        describe('when `to` is in the list of Allowed Calls', () => {
          describe('if the `fallback()` function of `to` update some state', () => {
            it("should pass and update `to` contract's storage", async () => {
              await context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                .execute(OPERATION_TYPES.CALL, allowedContractWithFallback.address, 0, '0x');

              expect(await allowedContractWithFallback.caller()).to.equal(
                context.universalProfile.address,
              );
            });
          });

          describe('if the `fallback()` function of `to` reverts', () => {
            it('should fail and bubble the error back to the Key Manager', async () => {
              await expect(
                context.universalProfile
                  .connect(addressCanMakeCallWithAllowedCalls)
                  .execute(
                    OPERATION_TYPES.CALL,
                    allowedContractWithFallbackRevert.address,
                    0,
                    '0x',
                  ),
              ).to.be.revertedWith('fallback reverted');
            });
          });
        });
      });
    });

    describe('when caller has permission SUPER_CALL', () => {
      it('should pass and allow to call an EOA', async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await context.universalProfile
          .connect(addressWithSuperCall)
          .execute(OPERATION_TYPES.CALL, targetEOA, 0, '0x');
      });

      describe('when `to` is a contract', () => {
        describe('if the `fallback()` function of `to` update some state', () => {
          it("should pass and update `to` contract's storage", async () => {
            const targetContractWithFallback = await new FallbackInitializer__factory(
              context.accounts[0],
            ).deploy();

            await context.universalProfile
              .connect(addressWithSuperCall)
              .execute(OPERATION_TYPES.CALL, targetContractWithFallback.address, 0, '0x');

            expect(await targetContractWithFallback.caller()).to.equal(
              context.universalProfile.address,
            );
          });
        });

        describe('if the `fallback()` function of `to` reverts', () => {
          it('should fail and bubble the error back to the Key Manager', async () => {
            const targetContractWithFallbackRevert = await new FallbackRevert__factory(
              context.accounts[0],
            ).deploy();

            await expect(
              context.universalProfile
                .connect(addressWithSuperCall)
                .execute(OPERATION_TYPES.CALL, targetContractWithFallbackRevert.address, 0, '0x'),
            ).to.be.revertedWith('fallback reverted');
          });
        });
      });
    });
  });

  describe('when making a ERC25X.execute(...) call with some `data` payload', () => {
    let addressCanMakeCallNoAllowedCalls: SignerWithAddress,
      addressCanMakeCallWithAllowedCalls: SignerWithAddress,
      addressCannotMakeCall: SignerWithAddress;

    let targetContract: TargetContract;

    before(async () => {
      context = await buildContext();

      addressCanMakeCallNoAllowedCalls = context.accounts[1];
      addressCanMakeCallWithAllowedCalls = context.accounts[2];
      addressCannotMakeCall = context.accounts[3];

      targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanMakeCallNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCannotMakeCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.EXECUTE_RELAY_CALL),
        combineAllowedCalls(
          [CALLTYPE.CALL],
          [targetContract.address],
          ['0xffffffff'],
          ['0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionsValues);
    });

    describe('when interacting via `execute(...)`', () => {
      describe('when caller has ALL PERMISSIONS', () => {
        it('should pass and change state at the target contract', async () => {
          const argument = 'new name';

          const targetPayload = targetContract.interface.encodeFunctionData('setName', [argument]);

          await context.universalProfile
            .connect(context.mainController)
            .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload);

          const result = await targetContract.callStatic.getName();
          expect(result).to.equal(argument);
        });

        describe('when calling a function that returns some value', () => {
          it('should return the value to the Key Manager <- UP <- targetContract.getName()', async () => {
            const expectedName = await targetContract.callStatic.getName();

            const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

            const result = await context.universalProfile
              .connect(context.mainController)
              .callStatic.execute(
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContractPayload,
              );

            const [decodedResult] = abiCoder.decode(['string'], result);
            expect(decodedResult).to.equal(expectedName);
          });

          it('Should return the value to the Key Manager <- UP <- targetContract.getNumber()', async () => {
            const expectedNumber = await targetContract.callStatic.getNumber();

            const targetContractPayload = targetContract.interface.encodeFunctionData('getNumber');

            const result = await context.universalProfile
              .connect(context.mainController)
              .callStatic.execute(
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContractPayload,
              );

            const [decodedResult] = abiCoder.decode(['uint256'], result);
            expect(decodedResult).to.equal(expectedNumber);
          });
        });

        describe('when calling a function that reverts', () => {
          it('should revert', async () => {
            const targetContractPayload = targetContract.interface.encodeFunctionData('revertCall');

            await expect(
              context.universalProfile.execute(
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContractPayload,
              ),
            ).to.be.revertedWith('TargetContract:revertCall: this function has reverted!');
          });
        });
      });

      describe('when caller has permission CALL', () => {
        describe('when caller has no allowed calls set', () => {
          it('should revert with `NotAllowedCall(...)` error', async () => {
            const argument = 'another name';

            const targetPayload = targetContract.interface.encodeFunctionData('setName', [
              argument,
            ]);

            await expect(
              context.universalProfile
                .connect(addressCanMakeCallNoAllowedCalls)
                .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
              .withArgs(addressCanMakeCallNoAllowedCalls.address);
          });
        });

        describe('when caller has some allowed calls set', () => {
          it('should pass and change state at the target contract', async () => {
            const argument = 'another name';

            const targetPayload = targetContract.interface.encodeFunctionData('setName', [
              argument,
            ]);

            await context.universalProfile
              .connect(addressCanMakeCallWithAllowedCalls)
              .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload);

            const result = await targetContract.callStatic.getName();
            expect(result).to.equal(argument);
          });
        });
      });

      describe('when caller does not have permission CALL', () => {
        it('should revert', async () => {
          const argument = 'another name';

          const targetPayload = targetContract.interface.encodeFunctionData('setName', [argument]);

          await expect(
            context.universalProfile
              .connect(addressCannotMakeCall)
              .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(addressCannotMakeCall.address, 'CALL');
        });
      });
    });
  });

  describe('`execute(...)` edge cases', async () => {
    before(async () => {
      context = await buildContext();

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
      ];

      const permissionValues = [ALL_PERMISSIONS];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    it('Should revert when caller calls the KeyManager through execute', async () => {
      const lsp20VerifyCallPayload = context.keyManager.interface.encodeFunctionData(
        'lsp20VerifyCall',
        [
          context.accounts[2].address,
          context.keyManager.address,
          context.accounts[2].address,
          0,
          '0xaabbccdd',
        ], // random arguments
      );

      await expect(
        context.universalProfile.execute(
          OPERATION_TYPES.CALL,
          context.keyManager.address,
          0,
          lsp20VerifyCallPayload,
        ),
      ).to.be.revertedWithCustomError(context.keyManager, 'CallingKeyManagerNotAllowed');
    });

    describe('when the offset of the `data` payload is not `0x00...80`', () => {
      describe('if the offset points backwards to the `value` parameter', () => {
        // We add the target in the allowed calls for each of these controller
        let controllerCanTransferValue;
        let controllerCanTransferValueAndCall;
        let controllerCanCall;

        let controllerCanOnlySign;

        let controllerCanSuperCall;
        let controllerCanSuperTransferValue;

        let targetContract: FallbackInitializer;

        let executePayload;

        before(async () => {
          context = await buildContext(ethers.utils.parseEther('50'));

          const accounts = await ethers.getSigners();

          controllerCanTransferValue = accounts[1];
          controllerCanTransferValueAndCall = accounts[2];
          controllerCanCall = accounts[3];

          controllerCanOnlySign = accounts[4];

          controllerCanSuperCall = accounts[5];
          controllerCanSuperTransferValue = accounts[6];

          targetContract = await new FallbackInitializer__factory(context.accounts[0]).deploy();

          const permissionKeys = [
            // permissions
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanTransferValue.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanTransferValueAndCall.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanCall.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanOnlySign.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanSuperCall.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanSuperTransferValue.address.substring(2),
            // allowed calls
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              controllerCanTransferValue.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              controllerCanTransferValueAndCall.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              controllerCanCall.address.substring(2),
          ];

          const allowedCall = combineAllowedCalls(
            [combineCallTypes(CALLTYPE.CALL, CALLTYPE.VALUE)],
            [targetContract.address],
            ['0xffffffff'],
            ['0xffffffff'],
          );

          const permissionValues = [
            // permissions
            PERMISSIONS.TRANSFERVALUE,
            combinePermissions(PERMISSIONS.TRANSFERVALUE, PERMISSIONS.CALL),
            PERMISSIONS.CALL,
            PERMISSIONS.SIGN,
            PERMISSIONS.SUPER_CALL,
            PERMISSIONS.SUPER_TRANSFERVALUE,
            // allowed calls,
            allowedCall,
            allowedCall,
            allowedCall,
          ];

          await setupKeyManager(context, permissionKeys, permissionValues);
        });

        afterEach('clearing target contract storage', async () => {
          await context.accounts[0].sendTransaction({
            to: targetContract.address,
            data: '0xcafecafe',
          });
        });

        describe('when the `value` parameter has some number, that points to some `data == 0x0000...04deadbe`', () => {
          before(async () => {
            executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              targetContract.address,
              36,
              '0xdeadbeef',
            ]);

            // edit the `data` offset to points to the `value` parameter
            executePayload = executePayload.replace(
              '0000000000000000000000000000000000000000000000000000000000000080',
              '0000000000000000000000000000000000000000000000000000000000000040',
            );
          });

          describe('when caller has permission TRANSFERVALUE only', () => {
            it("should revert with 'NotAuthorised' error to 'CALL'", async () => {
              await expect(
                // We need to do low level send transactions as the data offset is not standard
                controllerCanTransferValue.sendTransaction({
                  to: context.universalProfile.address,
                  data: executePayload,
                }),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(controllerCanTransferValue.address, 'CALL');
            });
          });

          describe('when caller has permission CALL only', () => {
            it("should revert with 'NotAuthorised' error to 'TRANSFERVALUE'", async () => {
              await expect(
                controllerCanCall.sendTransaction({
                  to: context.universalProfile.address,
                  data: executePayload,
                }),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(controllerCanCall.address, 'TRANSFERVALUE');
            });
          });

          describe('when caller does not have neither CALL nor TRANSFERVALUE permissions', () => {
            it("should revert with 'NotAuthorised' error to 'TRANSFERVALUE' (as value transfer is the first thing being checked", async () => {
              await expect(
                controllerCanOnlySign.sendTransaction({
                  to: context.universalProfile.address,
                  data: executePayload,
                }),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(controllerCanOnlySign.address, 'TRANSFERVALUE');
            });
          });

          describe('when caller has both permissions CALL + TRANSFERVALUE', () => {
            it('should pass and allow to call the contract', async () => {
              expect(await provider.getBalance(targetContract.address)).to.equal(0);

              await controllerCanTransferValueAndCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });

              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
              expect(await provider.getBalance(targetContract.address)).to.equal(36);
            });
          });
        });

        describe('when the `value` parameter is 0, meaning calldata is empty (= empty call)', () => {
          before(async () => {
            executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              '0x',
            ]);

            // edit the `data` offset to points to the `value` parameter
            executePayload = executePayload.replace(
              '0000000000000000000000000000000000000000000000000000000000000080',
              '0000000000000000000000000000000000000000000000000000000000000040',
            );
          });

          describe('when controller has permission CALL only', () => {
            it('should pass', async () => {
              await controllerCanCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });
              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
            });
          });

          describe('when controller has SUPER_CALL', () => {
            it('should pass', async () => {
              await controllerCanSuperCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });
              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
            });
          });

          describe('when controller does not have permission CALL', () => {
            it('should revert with `NotAuthorised` error to `CALL`', async () => {
              await expect(
                controllerCanOnlySign.sendTransaction({
                  to: context.universalProfile.address,
                  data: executePayload,
                }),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(controllerCanOnlySign.address, 'CALL');
            });
          });
        });
      });

      describe("if the offset points forwards (there are 32 random bytes between the data's offset and the data's length", () => {
        // We add the target in the allowed calls for each of these controller
        let controllerCanCall;
        let controllerCanSuperCall;
        let controllerCanOnlySign;

        let targetContract: FallbackInitializer;

        let executePayload;

        before(async () => {
          context = await buildContext(ethers.utils.parseEther('50'));

          const accounts = await ethers.getSigners();

          controllerCanCall = accounts[1];
          controllerCanSuperCall = accounts[2];
          controllerCanOnlySign = accounts[3];

          targetContract = await new FallbackInitializer__factory(context.accounts[0]).deploy();

          const permissionKeys = [
            // permissions
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanCall.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanSuperCall.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              controllerCanOnlySign.address.substring(2),
            // allowed calls
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
              controllerCanCall.address.substring(2),
          ];

          const allowedCall = combineAllowedCalls(
            [combineCallTypes(CALLTYPE.CALL)],
            [targetContract.address],
            ['0xffffffff'],
            ['0xffffffff'],
          );

          const permissionValues = [
            // permissions
            PERMISSIONS.CALL,
            PERMISSIONS.SUPER_CALL,
            PERMISSIONS.SIGN,
            // allowed calls,
            allowedCall,
          ];

          await setupKeyManager(context, permissionKeys, permissionValues);
        });

        afterEach('clearing target contract storage', async () => {
          await context.accounts[0].sendTransaction({
            to: targetContract.address,
            data: '0xcafecafe',
          });
        });

        describe('the length byte points to some number', () => {
          before('constructing manually the payload', async () => {
            // 0x44c028fe                                                         --> ERC725X.execute(uint256,address,uint256,bytes) selector
            //   0000000000000000000000000000000000000000000000000000000000000000 --> operationType = CALL (0)
            //   0000000000000000000000004ed7c70f96b99c776995fb64377f0d4ab3b0e1c1 --> target = targetContract.address
            //   0000000000000000000000000000000000000000000000000000000000000000 --> value = 0
            //   00000000000000000000000000000000000000000000000000000000000000a0 --> offset = 160
            //   cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe --> 32 random bytes in between
            //   0000000000000000000000000000000000000000000000000000000000000004 --> `data.length` = 4
            //   deadbeef00000000000000000000000000000000000000000000000000000000 --> `data` = 0xdeadbeef
            executePayload =
              '0x44c028fe0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
              targetContract.address.substring(2).toLowerCase() +
              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe0000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000';
          });

          describe('when caller has permission CALL', () => {
            it('should pass', async () => {
              await controllerCanCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });
              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
            });
          });

          describe('when caller has permission SUPER_CALL', () => {
            it('should pass', async () => {
              await controllerCanSuperCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });
              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
            });
          });

          describe("when caller does not have permission 'CALL' nor 'SUPER_CALL'", () => {
            it("should revert with 'NotAuthorised' error to 'CALL'", async () => {
              await expect(
                controllerCanOnlySign.sendTransaction({
                  to: context.universalProfile.address,
                  data: executePayload,
                }),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(controllerCanOnlySign.address, 'CALL');
            });
          });
        });

        describe('the length byte points to `0x0000...0000` (= no data, this is an empty call)', () => {
          before('constructing manually the payload', async () => {
            // 0x44c028fe                                                         --> ERC725X.execute(uint256,address,uint256,bytes) selector
            //   0000000000000000000000000000000000000000000000000000000000000000 --> operationType = CALL (0)
            //   0000000000000000000000004ed7c70f96b99c776995fb64377f0d4ab3b0e1c1 --> target = targetContract.address
            //   0000000000000000000000000000000000000000000000000000000000000000 --> value = 0
            //   00000000000000000000000000000000000000000000000000000000000000a0 --> offset = 160
            //   cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe --> 32 random bytes in between
            //   0000000000000000000000000000000000000000000000000000000000000000 --> `data.length` = 0
            executePayload =
              '0x44c028fe0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
              targetContract.address.substring(2).toLowerCase() +
              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe0000000000000000000000000000000000000000000000000000000000000000';
          });

          describe('when caller has permission CALL', () => {
            it('should pass', async () => {
              await controllerCanCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });
              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
            });
          });

          describe('when caller has permission SUPER_CALL', () => {
            it('should pass', async () => {
              await controllerCanSuperCall.sendTransaction({
                to: context.universalProfile.address,
                data: executePayload,
              });
              expect(await targetContract.caller()).to.equal(context.universalProfile.address);
            });
          });

          describe("when caller does not have permission 'CALL' nor 'SUPER_CALL'", () => {
            it("should revert with 'NotAuthorised' error to 'CALL'", async () => {
              await expect(
                controllerCanOnlySign.sendTransaction({
                  to: context.universalProfile.address,
                  data: executePayload,
                }),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(controllerCanOnlySign.address, 'CALL');
            });
          });
        });
      });
    });
  });
};
