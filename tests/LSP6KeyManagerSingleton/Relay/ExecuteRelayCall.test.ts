import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EIP191Signer } from '@lukso/eip191-signer.js';

import {
  LSP7Mintable,
  LSP7Mintable__factory,
  TargetContract,
  TargetContract__factory,
} from '../../../types';

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  OPERATION_TYPES,
  LSP25_VERSION,
  PERMISSIONS,
  CALLTYPE,
  INTERFACE_IDS,
} from '../../../constants';

// helpers
import {
  combineAllowedCalls,
  combinePermissions,
  createValidityTimestamps,
  signLSP6ExecuteRelayCallSingleton,
} from '../../utils/helpers';

// setup
import { LSP6SingletonTestContext } from '../../utils/context';
import { setupKeyManagerSingleton } from '../../utils/fixtures';
import { provider, LOCAL_PRIVATE_KEYS, combineCallTypes } from '../../utils/helpers';

export const shouldBehaveLikeExecuteRelayCall = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6SingletonTestContext>,
) => {
  let context: LSP6SingletonTestContext;

  describe('`executeRelayCall(..)`', () => {
    let signer: SignerWithAddress,
      relayer: SignerWithAddress,
      random: SignerWithAddress,
      signerNoAllowedCalls: SignerWithAddress,
      signerWithoutExecuteRelayCall: SignerWithAddress;

    const signerPrivateKey = LOCAL_PRIVATE_KEYS.ACCOUNT1;

    let targetContract: TargetContract;

    before(async () => {
      context = await buildContext();

      signer = context.accounts[1];
      relayer = context.accounts[2];
      signerNoAllowedCalls = context.accounts[3];
      random = context.accounts[4];
      signerWithoutExecuteRelayCall = context.accounts[5];

      targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + signer.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + signer.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          signerNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          signerWithoutExecuteRelayCall.address.substring(2),
      ];

      const allPermissionsWithoutExecuteRelayCall = ethers.utils.hexZeroPad(
        BigNumber.from(ALL_PERMISSIONS)
          .sub(BigNumber.from(PERMISSIONS.EXECUTE_RELAY_CALL))
          .toHexString(),
        32,
      );

      const permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(
          PERMISSIONS.CALL,
          PERMISSIONS.TRANSFERVALUE,
          PERMISSIONS.EXECUTE_RELAY_CALL,
        ),
        combineAllowedCalls(
          [
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          ],
          [random.address, targetContract.address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
        combinePermissions(
          PERMISSIONS.CALL,
          PERMISSIONS.TRANSFERVALUE,
          PERMISSIONS.EXECUTE_RELAY_CALL,
        ),
        allPermissionsWithoutExecuteRelayCall,
      ];

      await setupKeyManagerSingleton(context, permissionKeys, permissionsValues);
    });
    describe('When signer does not have EXECUTE_RELAY_CALL permission', () => {
      it('should revert', async () => {
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, random.address, 0, '0x'],
        );

        const latestNonce = await context.keyManager.callStatic.getNonce(
          targetContract.address,
          signerWithoutExecuteRelayCall.address,
          0,
        );

        const validityTimestamps = 0;

        const signedMessageParams = {
          lsp25Version: LSP25_VERSION,
          chainId: 31337, // HARDHAT_CHAINID
          nonce: latestNonce,
          validityTimestamps,
          msgValue: 0,
          payload: executeRelayCallPayload,
        };

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            signedMessageParams.lsp25Version,
            signedMessageParams.chainId,
            context.universalProfile.address,
            signedMessageParams.nonce,
            signedMessageParams.validityTimestamps,
            signedMessageParams.msgValue,
            signedMessageParams.payload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT5,
        );

        await expect(
          context.keyManager
            .connect(relayer)
            .executeRelayCall(
              context.universalProfile.address,
              signature,
              signedMessageParams.nonce,
              signedMessageParams.validityTimestamps,
              signedMessageParams.payload,
              { value: 0 },
            ),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(signerWithoutExecuteRelayCall.address, 'EXECUTE_RELAY_CALL');
      });
    });
    describe('When testing signed message', () => {
      describe('When testing msg.value', () => {
        describe('When sending more than the signed msg.value', () => {
          it('should revert by recovering a non permissioned address', async () => {
            const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [OPERATION_TYPES.CALL, random.address, 0, '0x'],
            );

            const latestNonce = await context.keyManager.callStatic.getNonce(
              context.universalProfile.address,
              signer.address,
              0,
            );

            const validityTimestamps = 0;

            const valueToSign = 5;

            const signedMessageParams = {
              lsp25Version: LSP25_VERSION,
              chainId: 31337, // HARDHAT_CHAINID
              nonce: latestNonce,
              validityTimestamps,
              msgValue: valueToSign,
              payload: executeRelayCallPayload,
            };

            const valueToSendFromRelayer = 10;

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
              [
                signedMessageParams.lsp25Version,
                signedMessageParams.chainId,
                context.universalProfile.address,
                signedMessageParams.nonce,
                signedMessageParams.validityTimestamps,
                signedMessageParams.msgValue,
                signedMessageParams.payload,
              ],
            );

            const eip191Signer = new EIP191Signer();

            const { signature } = await eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT1,
            );

            await expect(
              context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.payload,
                  { value: valueToSendFromRelayer },
                ),
            ).to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet');
          });
        });

        describe('When sending 0 while msg.value signed > 0', () => {
          it('should revert by recovering a non permissioned address', async () => {
            const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [OPERATION_TYPES.CALL, random.address, 0, '0x'],
            );

            const latestNonce = await context.keyManager.callStatic.getNonce(
              context.universalProfile.address,
              signer.address,
              0,
            );

            const validityTimestamps = 0;

            const valueToSign = 5;

            const signedMessageParams = {
              lsp25Version: LSP25_VERSION,
              chainId: 31337, // HARDHAT_CHAINID
              nonce: latestNonce,
              validityTimestamps,
              msgValue: valueToSign,
              payload: executeRelayCallPayload,
            };

            const valueToSendFromRelayer = 0;

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
              [
                signedMessageParams.lsp25Version,
                signedMessageParams.chainId,
                context.universalProfile.address,
                signedMessageParams.nonce,
                signedMessageParams.validityTimestamps,
                signedMessageParams.msgValue,
                signedMessageParams.payload,
              ],
            );

            const eip191Signer = new EIP191Signer();

            const { signature } = await eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT1,
            );

            await expect(
              context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.payload,
                  { value: valueToSendFromRelayer },
                ),
            ).to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet');
          });
        });

        describe('When sending exact msg.value like the one that is signed', () => {
          it('should pass if signer has the `to` address in its allowed calls', async () => {
            const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [OPERATION_TYPES.CALL, random.address, 0, '0x'],
            );

            const latestNonce = await context.keyManager.callStatic.getNonce(
              context.universalProfile.address,
              signer.address,
              0,
            );

            const validityTimestamps = 0;

            const valueToSendFromRelayer = 10;

            const signedMessageParams = {
              lsp25Version: LSP25_VERSION,
              chainId: 31337, // HARDHAT_CHAINID
              nonce: latestNonce,
              validityTimestamps,
              msgValue: valueToSendFromRelayer,
              payload: executeRelayCallPayload,
            };

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
              [
                signedMessageParams.lsp25Version,
                signedMessageParams.chainId,
                context.universalProfile.address,
                signedMessageParams.nonce,
                signedMessageParams.validityTimestamps,
                signedMessageParams.msgValue,
                signedMessageParams.payload,
              ],
            );

            const balanceOfUpBefore = await provider.getBalance(context.universalProfile.address);

            const eip191Signer = new EIP191Signer();

            const { signature } = await eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT1,
            );

            const tx = await context.keyManager
              .connect(relayer)
              .executeRelayCall(
                context.universalProfile.address,
                signature,
                signedMessageParams.nonce,
                signedMessageParams.validityTimestamps,
                signedMessageParams.payload,
                { value: valueToSendFromRelayer },
              );

            expect(tx)
              .to.emit(context.keyManager, 'PermissionsVerified')
              .withArgs(
                context.accounts[1].address,
                signedMessageParams.msgValue,
                context.universalProfile.interface.getSighash('execute'),
              );

            const balanceOfUpAfter = await provider.getBalance(context.universalProfile.address);

            expect(balanceOfUpAfter).to.equal(balanceOfUpBefore.add(valueToSendFromRelayer));
          });

          it('should fail if signer has nothing listed in its allowed calls', async () => {
            const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [OPERATION_TYPES.CALL, random.address, 0, '0x'],
            );

            const latestNonce = await context.keyManager.callStatic.getNonce(
              context.universalProfile.address,
              signerNoAllowedCalls.address,
              0,
            );

            const validityTimestamps = 0;

            const valueToSendFromRelayer = 10;

            const signedMessageParams = {
              lsp25Version: LSP25_VERSION,
              chainId: 31337, // HARDHAT_CHAINID
              nonce: latestNonce,
              validityTimestamps,
              msgValue: valueToSendFromRelayer,
              payload: executeRelayCallPayload,
            };

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
              [
                signedMessageParams.lsp25Version,
                signedMessageParams.chainId,
                context.universalProfile.address,
                signedMessageParams.nonce,
                signedMessageParams.validityTimestamps,
                signedMessageParams.msgValue,
                signedMessageParams.payload,
              ],
            );

            const eip191Signer = new EIP191Signer();

            const { signature } = await eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT3,
            );

            await expect(
              context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.payload,
                  { value: valueToSendFromRelayer },
                ),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
              .withArgs(signerNoAllowedCalls.address);
          });
        });

        describe('When UP have 0 value and interacting with contract that require value', () => {
          describe("When relayer don't fund the UP so it's balance is greater than the value param of execute(..)", () => {
            it('should revert', async () => {
              const nameToSet = 'Alice';
              const targetContractPayload = targetContract.interface.encodeFunctionData(
                'setNamePayableMinimumValue',
                [nameToSet],
              );

              const requiredValueForExecution = 51; // specified in `setNamePayableMinimumValue(..)`

              const latestNonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                0,
              );

              const validityTimestamps = 0;

              const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [
                  OPERATION_TYPES.CALL,
                  targetContract.address,
                  requiredValueForExecution,
                  targetContractPayload,
                ],
              );

              const valueToSendFromRelayer = 0;

              const signedMessageParams = {
                lsp25Version: LSP25_VERSION,
                chainId: 31337, // HARDHAT_CHAINID
                nonce: latestNonce,
                validityTimestamps,
                msgValue: valueToSendFromRelayer,
                payload: executeRelayCallPayload,
              };

              const encodedMessage = ethers.utils.solidityPack(
                ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
                [
                  signedMessageParams.lsp25Version,
                  signedMessageParams.chainId,
                  context.universalProfile.address,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.msgValue,
                  signedMessageParams.payload,
                ],
              );

              const eip191Signer = new EIP191Signer();

              const { signature } = await eip191Signer.signDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage,
                LOCAL_PRIVATE_KEYS.ACCOUNT1,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    signedMessageParams.nonce,
                    signedMessageParams.validityTimestamps,
                    signedMessageParams.payload,
                    { value: valueToSendFromRelayer },
                  ),
              )
                .to.be.revertedWithCustomError(
                  context.universalProfile,
                  'ERC725X_InsufficientBalance',
                )
                .withArgs(
                  await provider.getBalance(context.universalProfile.address),
                  requiredValueForExecution,
                );
            });
          });

          describe("When relayer fund the UP so it's balance is greater than the value param of execute(..)", () => {
            it('should pass if signer has the target contract address in its list of allowed calls', async () => {
              const nameToSet = 'Alice';
              const targetContractPayload = targetContract.interface.encodeFunctionData(
                'setNamePayableMinimumValue',
                [nameToSet],
              );

              const requiredValueForExecution = 51; // specified in `setNamePayableMinimumValue(..)`

              const latestNonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                0,
              );

              const validityTimestamps = 0;

              const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [
                  OPERATION_TYPES.CALL,
                  targetContract.address,
                  requiredValueForExecution,
                  targetContractPayload,
                ],
              );

              const valueToSendFromRelayer = 51;

              const signedMessageParams = {
                lsp25Version: LSP25_VERSION,
                chainId: 31337, // HARDHAT_CHAINID
                nonce: latestNonce,
                validityTimestamps,
                msgValue: valueToSendFromRelayer,
                payload: executeRelayCallPayload,
              };

              const encodedMessage = ethers.utils.solidityPack(
                ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
                [
                  signedMessageParams.lsp25Version,
                  signedMessageParams.chainId,
                  context.universalProfile.address,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.msgValue,
                  signedMessageParams.payload,
                ],
              );

              const eip191Signer = new EIP191Signer();

              const { signature } = await eip191Signer.signDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage,
                LOCAL_PRIVATE_KEYS.ACCOUNT1,
              );

              await context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.payload,
                  { value: valueToSendFromRelayer },
                );

              const result = await targetContract.callStatic.getName();
              expect(result).to.equal(nameToSet);
            });

            it("should revert with 'NotAllowedCall' error if signer does not have any listed under its allowed calls", async () => {
              const nameToSet = 'Alice';
              const targetContractPayload = targetContract.interface.encodeFunctionData(
                'setNamePayableMinimumValue',
                [nameToSet],
              );

              const requiredValueForExecution = 51; // specified in `setNamePayableMinimumValue(..)`

              const latestNonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signerNoAllowedCalls.address,
                0,
              );

              const validityTimestamps = 0;

              const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
                'execute',
                [
                  OPERATION_TYPES.CALL,
                  targetContract.address,
                  requiredValueForExecution,
                  targetContractPayload,
                ],
              );

              const valueToSendFromRelayer = 51;

              const signedMessageParams = {
                lsp25Version: LSP25_VERSION,
                chainId: 31337, // HARDHAT_CHAINID
                nonce: latestNonce,
                validityTimestamps,
                msgValue: valueToSendFromRelayer,
                payload: executeRelayCallPayload,
              };

              const encodedMessage = ethers.utils.solidityPack(
                ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
                [
                  signedMessageParams.lsp25Version,
                  signedMessageParams.chainId,
                  context.universalProfile.address,
                  signedMessageParams.nonce,
                  signedMessageParams.validityTimestamps,
                  signedMessageParams.msgValue,
                  signedMessageParams.payload,
                ],
              );

              const eip191Signer = new EIP191Signer();

              const { signature } = await eip191Signer.signDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage,
                LOCAL_PRIVATE_KEYS.ACCOUNT3,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    signedMessageParams.nonce,
                    signedMessageParams.validityTimestamps,
                    signedMessageParams.payload,
                    { value: valueToSendFromRelayer },
                  ),
              )
                .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
                .withArgs(signerNoAllowedCalls.address);
            });
          });
        });
      });

      describe('When testing `validityTimestamps`', () => {
        describe('(invalid timestamps) `startingTimestamp` is greater than `endingTimestamp`', () => {
          describe('`now` is equal to `startingTimestamp` and `now` is greater than `endingTimestamp`', () => {
            it('reverts', async () => {
              const now = await time.latest();
              const startingTimestamp = now;

              const endingTimestamp = now - 1000;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                1,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );

              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallExpired');
            });
          });

          describe('`now` is greater than `startingTimestamp` and `now` is greater than `endingTimestamp`', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const endingTimestamp = now - 2000;
              const startingTimestamp = now - 1500;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                2,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallExpired');
            });
          });

          describe('`now` is lesser than `startingTimestamp` and `now` is lesser than `endingTimestamp`', () => {
            it('reverts', async () => {
              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                3,
              );

              const now = await time.latest();

              const endingTimestamp = now + 1000;
              const startingTimestamp = now + 1500;

              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );

              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallBeforeStartTime');
            });
          });

          describe('`now` is lesser than `startingTimestamp` and `now` is greater than `endingTimestamp`', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now + 1000;
              const endingTimestamp = now - 1000;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                4,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallBeforeStartTime');
            });
          });

          describe('`now` is lesser than `startingTimestamp` and `now` is equal to `endingTimestamp`', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now + 1000;
              const endingTimestamp = now;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                5,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallBeforeStartTime');
            });
          });
        });

        describe('(valid timestamps) `startingTimestamp` is lesser than `endingTimestamp`', () => {
          describe('(tx can be executed) `now` is equal to `startingTimestamp` and `now` is lesser than `endingTimestamp`', () => {
            it('passes', async () => {
              const now = await time.latest();

              const startingTimestamp = now;
              const endingTimestamp = now + 1000;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                6,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const randomNumber = 12345;
              const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
              ]);
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  nonce,
                  validityTimestamps,
                  calldata,
                );

              expect(await targetContract.getNumber()).to.equal(randomNumber);
            });
          });

          describe('(tx cannot be executed yet) `now` is lesser than `startingTimestamp` and `now` is lesser than `endingTimestamp`', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now + 1000;
              const endingTimestamp = now + 1500;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                7,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallBeforeStartTime');
            });
          });

          describe('(tx is expired) `now` is greater than `startingTimestamp` and `now` is greater than `endingTimestamp`', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now - 1500;
              const endingTimestamp = now - 1000;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                8,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallExpired');
            });
          });

          describe('(tx can be executed) `now` is greater than `startingTimestamp` and `now` is lesser than `endingTimestamp`', () => {
            it('passes', async () => {
              const now = await time.latest();

              const startingTimestamp = now - 1000;
              const endingTimestamp = now + 1500;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                9,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const randomNumber = 12345;
              const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
              ]);
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  nonce,
                  validityTimestamps,
                  calldata,
                );

              expect(await targetContract.getNumber()).to.equal(randomNumber);
            });
          });

          describe('(tx can be executed) `now` is greater than `startingTimestamp` and `now` is equal to `endingTimestamp`', () => {
            it('passes', async () => {
              const now = await time.latest();

              const startingTimestamp = now - 1000;
              const endingTimestamp = now;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                10,
              );

              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const randomNumber = 12345;
              const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
              ]);
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await time.setNextBlockTimestamp(now);

              await context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  nonce,
                  validityTimestamps,
                  calldata,
                );

              expect(await targetContract.getNumber()).to.equal(randomNumber);
            });
          });
        });

        describe('start timestamp = end timestamp', () => {
          describe('start timestamp = end timestamp < now', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now - 100;
              const endingTimestamp = now - 100;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                11,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallExpired');
            });
          });

          describe('start timestamp = end timestamp > now', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now + 100;
              const endingTimestamp = now + 100;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                12,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const calldata = '0xcafecafe';
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallBeforeStartTime');
            });
          });

          describe('start timestamp = end timestamp = now', () => {
            it('passes', async () => {
              const now = await time.latest();

              const startingTimestamp = now;
              const endingTimestamp = now;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                13,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const randomNumber = 12345;
              const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
              ]);
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await time.setNextBlockTimestamp(now);

              await context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  nonce,
                  validityTimestamps,
                  calldata,
                );

              expect(await targetContract.getNumber()).to.equal(randomNumber);
            });
          });
        });

        describe('when `validityTimestamps == 0`', () => {
          it('passes', async () => {
            const nonce = await context.keyManager.callStatic.getNonce(
              context.universalProfile.address,
              signer.address,
              14,
            );
            const validityTimestamps = 0;
            const randomNumber = 12345;
            const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
            ]);
            const value = 0;
            const signature = await signLSP6ExecuteRelayCallSingleton(
              context.universalProfile.address,
              context.keyManager.address,
              nonce.toString(),
              validityTimestamps,
              signerPrivateKey,
              value,
              calldata,
            );

            await context.keyManager
              .connect(relayer)
              .executeRelayCall(
                context.universalProfile.address,
                signature,
                nonce,
                validityTimestamps,
                calldata,
              );

            expect(await targetContract.getNumber()).to.equal(randomNumber);
          });
        });

        describe('when `endingTimestamp == 0`', () => {
          describe('`startingTimestamp` < now', () => {
            it('passes', async () => {
              const now = await time.latest();

              const startingTimestamp = now - 100;
              const endingTimestamp = 0;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                14,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const randomNumber = 12345;
              const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
              ]);
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await context.keyManager
                .connect(relayer)
                .executeRelayCall(
                  context.universalProfile.address,
                  signature,
                  nonce,
                  validityTimestamps,
                  calldata,
                );

              expect(await targetContract.getNumber()).to.equal(randomNumber);
            });
          });

          describe('`startingTimestamp` > now', () => {
            it('reverts', async () => {
              const now = await time.latest();

              const startingTimestamp = now + 100;
              const endingTimestamp = 0;

              const nonce = await context.keyManager.callStatic.getNonce(
                context.universalProfile.address,
                signer.address,
                14,
              );
              const validityTimestamps = createValidityTimestamps(
                startingTimestamp,
                endingTimestamp,
              );
              const randomNumber = 12345;
              const calldata = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContract.interface.encodeFunctionData('setNumber', [randomNumber]),
              ]);
              const value = 0;
              const signature = await signLSP6ExecuteRelayCallSingleton(
                context.universalProfile.address,
                context.keyManager.address,
                nonce.toString(),
                validityTimestamps,
                signerPrivateKey,
                value,
                calldata,
              );

              await expect(
                context.keyManager
                  .connect(relayer)
                  .executeRelayCall(
                    context.universalProfile.address,
                    signature,
                    nonce,
                    validityTimestamps,
                    calldata,
                  ),
              ).to.be.revertedWithCustomError(context.keyManager, 'RelayCallBeforeStartTime');
            });
          });
        });
      });
    });
  });

  describe('`executeRelayCallBatch()', () => {
    let context: LSP6SingletonTestContext;

    let minter: SignerWithAddress;
    let tokenRecipient: SignerWithAddress;

    let tokenContract: LSP7Mintable;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther('10'));

      minter = context.accounts[1];
      tokenRecipient = context.accounts[2];

      // deploy token contract
      tokenContract = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        'My LSP7 Token',
        'LSP7',
        context.universalProfile.address,
        false,
      );

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
      ];

      const permissionsValues = [ALL_PERMISSIONS];

      await setupKeyManagerSingleton(context, permissionKeys, permissionsValues);
    });

    it('should revert when there are not the same number of elements for each parameters', async () => {
      // these are dummy values parameters. The aim is to check that it reverts in the first place.
      const signatures = ['0x' + 'aa'.repeat(65), '0x' + 'bb'.repeat(65), '0x' + 'cc'.repeat(65)];
      const nonces = [0, 1, 2];
      const values = [0, 0, 0];
      const validityTimestamps = [0, 0, 0];
      const payloads = ['0xcafecafe', '0xbeefbeef'];

      await expect(
        context.keyManager
          .connect(context.mainController)
          .executeRelayCallBatch(
            context.universalProfile.address,
            signatures,
            nonces,
            validityTimestamps,
            values,
            payloads,
          ),
      ).to.be.revertedWithCustomError(
        context.keyManager,
        'BatchExecuteRelayCallParamsLengthMismatch',
      );
    });

    it('should revert when we are specifying the same signature twice', async () => {
      const recipient = context.accounts[1].address;
      const amountForRecipient = ethers.utils.parseEther('1');

      const transferLyxPayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        recipient,
        amountForRecipient,
        '0x',
      ]);

      const ownerNonce = await context.keyManager.getNonce(
        context.universalProfile.address,
        context.mainController.address,
        0,
      );

      const validityTimestamps = 0;

      const transferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
        context.universalProfile.address,
        context.keyManager.address,
        ownerNonce.toHexString(),
        validityTimestamps,
        LOCAL_PRIVATE_KEYS.ACCOUNT0,
        0,
        transferLyxPayload,
      );

      // these steps (before running the batch executeRelayCall([],[],[]) on the KeyManager)
      // describe why the execution fails with `InvalidRelayNonce` error.
      // the Key Manager recovers the address based on:
      // - the signature provided
      // - the encoded message generated internally using:
      //        `abi.encodePacked(LSP25_VERSION, block.chainid,nonce, msg.value, payload);`
      //
      // the address is recovered as follow:
      //    `address signer = address(this).toDataWithIntendedValidator(encodedMessage).recover(signature);`
      //
      // when running the second payload in the batch execution, the Key Manager will recover a different signer address, because:
      //    - the encodedMessage generated internally includes nonce = 1
      //    - the signature provided was for an encoded message with nonce = 0 (same signature as the first payload)
      //
      // because no encoded message with nonce = 1 was signed, and the signature provided was for an encoded message with nonce = 0,
      // the KeyManager ends up recovering a random address (since the signature and the encoded message are not 'related to each other')
      // Therefore, the Key Manager try to verify the nonce of a different address than the one that signed the message, and the nonce is invalid.
      const eip191 = new EIP191Signer();

      const encodedMessage = ethers.utils.solidityPack(
        ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
        [
          LSP25_VERSION,
          31337,
          context.universalProfile.address,
          ownerNonce.add(1),
          validityTimestamps,
          0,
          transferLyxPayload,
        ],
      );

      const hashedDataWithIntendedValidator = eip191.hashDataWithIntendedValidator(
        context.keyManager.address,
        encodedMessage,
      );

      const incorrectRecoveredAddress = await eip191.recover(
        hashedDataWithIntendedValidator,
        transferLyxSignature,
      );

      // the transaction will revert with InvalidNonce because it will check the nonce of
      // the incorrectly recovered address (as explained above)
      await expect(
        context.keyManager
          .connect(context.mainController)
          .executeRelayCallBatch(
            context.universalProfile.address,
            [transferLyxSignature, transferLyxSignature],
            [ownerNonce, ownerNonce.add(1)],
            [validityTimestamps, validityTimestamps],
            [0, 0],
            [transferLyxPayload, transferLyxPayload],
          ),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'InvalidRelayNonce')
        .withArgs(incorrectRecoveredAddress, ownerNonce.add(1), transferLyxSignature);
    });

    it('should 1) give the permission to someone to mint, 2) let the controller mint, 3) remove the permission to the controller to mint', async () => {
      const tokensToMint = 1_000;

      const validityTimestamps = 0;

      // step 1 - give minter permissions to mint
      const giveMinterPermissionsPayload = context.universalProfile.interface.encodeFunctionData(
        'setDataBatch',
        [
          [
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + minter.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + minter.address.substring(2),
          ],
          [
            combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
            combineAllowedCalls(
              [CALLTYPE.CALL],
              [tokenContract.address],
              [INTERFACE_IDS.LSP7DigitalAsset],
              [tokenContract.interface.getSighash('mint')],
            ),
          ],
        ],
      );

      const ownerNonce = await context.keyManager.getNonce(
        context.universalProfile.address,
        context.mainController.address,
        0,
      );

      const ownerGivePermissionsSignature = await signLSP6ExecuteRelayCallSingleton(
        context.universalProfile.address,
        context.keyManager.address,
        ownerNonce.toHexString(),
        validityTimestamps,
        LOCAL_PRIVATE_KEYS.ACCOUNT0,
        0,
        giveMinterPermissionsPayload,
      );

      // Step 2 - let minter mint
      const minterMintPayload = tokenContract.interface.encodeFunctionData('mint', [
        tokenRecipient.address,
        tokensToMint,
        true,
        '0x',
      ]);
      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        tokenContract.address,
        0,
        minterMintPayload,
      ]);

      const minterNonce = await context.keyManager.getNonce(
        context.universalProfile.address,
        minter.address,
        0,
      );

      const minterMintSignature = await signLSP6ExecuteRelayCallSingleton(
        context.universalProfile.address,
        context.keyManager.address,
        minterNonce.toHexString(),
        validityTimestamps,
        LOCAL_PRIVATE_KEYS.ACCOUNT1,
        0,
        executePayload,
      );

      // Step 3 - remove minter permissions to mint
      const removeMinterPermissionsPayload = context.universalProfile.interface.encodeFunctionData(
        'setDataBatch',
        [
          [
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + minter.address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + minter.address.substring(2),
          ],
          ['0x', '0x'],
        ],
      );
      const newOwnerNonce = ownerNonce.add(1);

      const ownerRemovePermissionsSignature = await signLSP6ExecuteRelayCallSingleton(
        context.universalProfile.address,
        context.keyManager.address,
        newOwnerNonce.toHexString(),
        validityTimestamps,
        LOCAL_PRIVATE_KEYS.ACCOUNT0,
        0,
        removeMinterPermissionsPayload,
      );

      await context.keyManager
        .connect(context.mainController)
        .executeRelayCallBatch(
          context.universalProfile.address,
          [ownerGivePermissionsSignature, minterMintSignature, ownerRemovePermissionsSignature],
          [ownerNonce, minterNonce, newOwnerNonce],
          [validityTimestamps, validityTimestamps, validityTimestamps],
          [0, 0, 0],
          [giveMinterPermissionsPayload, executePayload, removeMinterPermissionsPayload],
        );

      // CHECK that the recipient received its tokens
      expect(await tokenContract.balanceOf(tokenRecipient.address)).to.equal(tokensToMint);

      // CHECK that the minter does not have permissions anymore
      expect(
        await context.universalProfile.getDataBatch([
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + minter.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + minter.address.substring(2),
        ]),
      ).to.deep.equal(['0x', '0x']);

      // CHECK that the minter cannot mint anymore
      await expect(
        context.keyManager
          .connect(minter)
          .execute(context.universalProfile.address, executePayload),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet')
        .withArgs(minter.address);
    });

    describe('when specifying msg.value', () => {
      describe('when total `values[]` is LESS than `msg.value`', () => {
        it('should revert because insufficent `msg.value`', async () => {
          const firstRecipient = context.accounts[1].address;
          const secondRecipient = context.accounts[2].address;
          const thirdRecipient = context.accounts[3].address;

          const transferAmounts = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const values = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          // give to much and check that no funds can remain on the Key Manager
          const amountToFund = totalValues.sub(1);

          const firstLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, firstRecipient, transferAmounts[0], '0x'],
          );

          const secondLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, secondRecipient, transferAmounts[1], '0x'],
          );

          const thirdLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, thirdRecipient, transferAmounts[2], '0x'],
          );

          const ownerNonce = await context.keyManager.getNonce(
            context.universalProfile.address,
            context.mainController.address,
            0,
          );

          const validityTimestamps = 0;

          const firstTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[0],
            firstLyxTransfer,
          );
          const secondTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.add(1).toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[1],
            secondLyxTransfer,
          );
          const thirdTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.add(2).toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[2],
            thirdLyxTransfer,
          );

          await expect(
            context.keyManager
              .connect(context.mainController)
              .executeRelayCallBatch(
                context.universalProfile.address,
                [firstTransferLyxSignature, secondTransferLyxSignature, thirdTransferLyxSignature],
                [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)],
                [validityTimestamps, validityTimestamps, validityTimestamps],
                values,
                [firstLyxTransfer, secondLyxTransfer, thirdLyxTransfer],
                { value: amountToFund },
              ),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'LSP6BatchInsufficientValueSent')
            .withArgs(totalValues, amountToFund);
        });
      });

      describe('when total `values[]` is MORE than `msg.value`', () => {
        it('should revert to not leave any remaining funds on the Key Manager', async () => {
          const firstRecipient = context.accounts[1].address;
          const secondRecipient = context.accounts[2].address;
          const thirdRecipient = context.accounts[3].address;

          const transferAmounts = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const values = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          // give to much and check that no funds can remain on the Key Manager
          const amountToFund = totalValues.add(1);

          const firstLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, firstRecipient, transferAmounts[0], '0x'],
          );

          const secondLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, secondRecipient, transferAmounts[1], '0x'],
          );

          const thirdLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, thirdRecipient, transferAmounts[2], '0x'],
          );

          const ownerNonce = await context.keyManager.getNonce(
            context.universalProfile.address,
            context.mainController.address,
            0,
          );

          const validityTimestamps = 0;

          const firstTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[0],
            firstLyxTransfer,
          );
          const secondTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.add(1).toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[1],
            secondLyxTransfer,
          );
          const thirdTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.add(2).toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[2],
            thirdLyxTransfer,
          );

          await expect(
            context.keyManager
              .connect(context.mainController)
              .executeRelayCallBatch(
                context.universalProfile.address,
                [firstTransferLyxSignature, secondTransferLyxSignature, thirdTransferLyxSignature],
                [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)],
                [validityTimestamps, validityTimestamps, validityTimestamps],
                values,
                [firstLyxTransfer, secondLyxTransfer, thirdLyxTransfer],
                { value: amountToFund },
              ),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'LSP6BatchExcessiveValueSent')
            .withArgs(totalValues, amountToFund);
        });
      });

      describe('when total `values[]` is EQUAL to `msg.value`', () => {
        it('should pass', async () => {
          const firstRecipient = context.accounts[1].address;
          const secondRecipient = context.accounts[2].address;
          const thirdRecipient = context.accounts[3].address;

          const transferAmounts = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const values = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const amountToFund = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          const firstLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, firstRecipient, transferAmounts[0], '0x'],
          );

          const secondLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, secondRecipient, transferAmounts[1], '0x'],
          );

          const thirdLyxTransfer = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, thirdRecipient, transferAmounts[2], '0x'],
          );

          const ownerNonce = await context.keyManager.getNonce(
            context.universalProfile.address,
            context.mainController.address,
            0,
          );

          const validityTimestamps = 0;

          const firstTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[0],
            firstLyxTransfer,
          );
          const secondTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.add(1).toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[1],
            secondLyxTransfer,
          );
          const thirdTransferLyxSignature = await signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            ownerNonce.add(2).toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[2],
            thirdLyxTransfer,
          );

          const tx = await context.keyManager
            .connect(context.mainController)
            .executeRelayCallBatch(
              context.universalProfile.address,
              [firstTransferLyxSignature, secondTransferLyxSignature, thirdTransferLyxSignature],
              [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)],
              [validityTimestamps, validityTimestamps, validityTimestamps],
              values,
              [firstLyxTransfer, secondLyxTransfer, thirdLyxTransfer],
              { value: amountToFund },
            );

          await expect(tx).to.changeEtherBalances(
            [context.universalProfile.address, firstRecipient, secondRecipient, thirdRecipient],
            [0, values[0], values[1], values[2]],
          );
        });
      });
    });

    describe('when one of the payload reverts', () => {
      it('should revert the whole transaction if first payload reverts', async () => {
        const upBalance = await provider.getBalance(context.universalProfile.address);

        const validAmount = ethers.utils.parseEther('1');
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, '0x'],
        );

        const firstTransferPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
        );

        const secondTransferPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
        );

        const ownerNonce = await context.keyManager.getNonce(
          context.universalProfile.address,
          context.mainController.address,
          0,
        );

        const nonces = [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)];

        const validityTimestamps = 0;

        const signatures = [
          signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            nonces[0].toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            0,
            failingTransferPayload,
          ),
          signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            nonces[1].toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            0,
            firstTransferPayload,
          ),
          signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            nonces[2].toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            0,
            secondTransferPayload,
          ),
        ];

        // prettier-ignore
        const payloads = [failingTransferPayload, firstTransferPayload, secondTransferPayload];

        await expect(
          context.keyManager
            .connect(context.mainController)
            .executeRelayCallBatch(
              context.universalProfile.address,
              signatures,
              nonces,
              [validityTimestamps, validityTimestamps, validityTimestamps],
              [0, 0, 0],
              payloads,
            ),
        ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_InsufficientBalance');
      });

      it('should revert the whole transaction if last payload reverts', async () => {
        const upBalance = await provider.getBalance(context.universalProfile.address);

        const validAmount = ethers.utils.parseEther('1');
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, '0x'],
        );

        const firstTransferPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
        );

        const secondTransferPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
        );

        const ownerNonce = await context.keyManager.getNonce(
          context.universalProfile.address,
          context.mainController.address,
          0,
        );

        const nonces = [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)];
        const values = [0, 0, 0];

        const validityTimestamps = 0;

        const signatures = [
          signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            nonces[0].toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            0,
            firstTransferPayload,
          ),
          signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            nonces[1].toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            0,
            secondTransferPayload,
          ),
          signLSP6ExecuteRelayCallSingleton(
            context.universalProfile.address,
            context.keyManager.address,
            nonces[2].toHexString(),
            validityTimestamps,
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            0,
            failingTransferPayload,
          ),
        ];

        // prettier-ignore
        const payloads = [firstTransferPayload, secondTransferPayload, failingTransferPayload];

        await expect(
          context.keyManager
            .connect(context.mainController)
            .executeRelayCallBatch(
              context.universalProfile.address,
              signatures,
              nonces,
              [validityTimestamps, validityTimestamps, validityTimestamps],
              values,
              payloads,
            ),
        ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_InsufficientBalance');
      });
    });
  });
};
