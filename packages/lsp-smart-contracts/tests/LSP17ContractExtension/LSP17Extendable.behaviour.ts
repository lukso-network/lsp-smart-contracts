import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import {
  NameExtension,
  NameExtension__factory,
  AgeExtension__factory,
  AgeExtension,
  LSP0ERC725Account,
  LSP9Vault,
  CheckerExtension__factory,
  ERC165Extension,
  ERC165Extension__factory,
  RevertStringExtension__factory,
  RevertCustomExtension,
  RevertCustomExtension__factory,
  EmitEventExtension,
  EmitEventExtension__factory,
  TransferExtension__factory,
  TransferExtension,
  ReenterAccountExtension__factory,
  ReenterAccountExtension,
  OnERC721ReceivedExtension,
  OnERC721ReceivedExtension__factory,
  RequireCallbackToken,
  RequireCallbackToken__factory,
  RevertFallbackExtension,
  RevertFallbackExtension__factory,
} from '../../typechain';

// helpers
import { abiCoder, provider } from '../utils/helpers';

// constants
import { ERC725YDataKeys, INTERFACE_IDS, LSP1_TYPE_IDS } from '../../constants';

export type LSP17TestContext = {
  accounts: SignerWithAddress[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contract: LSP0ERC725Account | LSP9Vault | any;
  deployParams: { owner: string };
};

export const shouldBehaveLikeLSP17 = (buildContext: () => Promise<LSP17TestContext>) => {
  let context: LSP17TestContext;
  let notExistingFunctionSignature,
    onERC721ReceivedFunctionSelector,
    checkMsgVariableFunctionSelector,
    nameFunctionSelector,
    ageFunctionSelector,
    transferFunctionSelector,
    reenterAccountFunctionSelector,
    revertStringFunctionSelector,
    revertCustomFunctionSelector,
    emitEventFunctionSelector,
    supportsInterfaceFunctionSelector;

  let checkMsgVariableFunctionExtensionHandlerKey,
    nameFunctionExtensionHandlerKey,
    ageFunctionExtensionHandlerKey,
    transferFunctionExtensionHandlerKey,
    reenterAccountFunctionExtensionHandlerKey,
    revertStringFunctionExtensionHandlerKey,
    revertCustomFunctionExtensionHandlerKey,
    emitEventFunctionExtensionHandlerKey,
    onERC721ReceivedFunctionExtensionHandlerKey,
    supportsInterfaceFunctionExtensionHandlerKey;

  before(async () => {
    context = await buildContext();

    // withdraw()
    notExistingFunctionSignature = '0x3ccfd60b';

    // checkMsgVariable(address,uint256)
    checkMsgVariableFunctionSelector = '0xe825d37d';

    // name()
    nameFunctionSelector = '0x06fdde03';

    // age()
    ageFunctionSelector = '0x262a9dff';

    // transfer(uint256)
    transferFunctionSelector = '0x12514bba';

    // revertString(string)
    revertStringFunctionSelector = '0xb678618b';

    // revertCustom()
    revertCustomFunctionSelector = '0x1ed106b8';

    // emitEvent()
    emitEventFunctionSelector = '0x7b0cb839';

    // reenterAccount(bytes)
    reenterAccountFunctionSelector = '0x864e5589';

    // onERC721Received(address,address,uint256,bytes)
    onERC721ReceivedFunctionSelector = '0x150b7a02';

    // supportsInterface(bytes4)
    supportsInterfaceFunctionSelector = '0x01ffc9a7';

    checkMsgVariableFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      checkMsgVariableFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    nameFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      nameFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    ageFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      ageFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    transferFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      transferFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    reenterAccountFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      reenterAccountFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    revertStringFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      revertStringFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    revertCustomFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      revertCustomFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    emitEventFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      emitEventFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    onERC721ReceivedFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      onERC721ReceivedFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    supportsInterfaceFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      supportsInterfaceFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded
  });

  describe('when calling the contract with empty calldata', () => {
    describe('when making a call without any value', () => {
      it('should pass and not emit UniversalReceiver', async () => {
        await expect(
          context.accounts[0].sendTransaction({
            to: await context.contract.getAddress(),
          }),
        ).to.not.emit(context.contract, 'UniversalReceiver');
      });
    });

    describe('when making a call with sending value', () => {
      describe('when extension is not payable', () => {
        it('should pass and emit UniversalReceiver', async () => {
          const amountSent = 200;

          const tx = await context.accounts[0].sendTransaction({
            to: await context.contract.getAddress(),
            value: amountSent,
          });

          const isSupportingLSP0 = await context.contract.supportsInterface(
            INTERFACE_IDS.LSP0ERC725Account,
          );

          const isSupportingLSP9 = await context.contract.supportsInterface(
            INTERFACE_IDS.LSP9Vault,
          );

          let emittedTypeId;
          if (isSupportingLSP0) {
            emittedTypeId = LSP1_TYPE_IDS.LSP0ValueReceived;
          } else if (isSupportingLSP9) {
            emittedTypeId = LSP1_TYPE_IDS.LSP9ValueReceived;
          }

          expect(tx)
            .to.emit(context.contract, 'UniversalReceiver')
            .withArgs(
              context.accounts[0].address,
              amountSent,
              emittedTypeId,
              '0x',
              abiCoder.encode(
                ['bytes', 'bytes'],
                [ethers.hexlify(ethers.toUtf8Bytes('LSP1: typeId out of scope')), '0x'],
              ),
            );
        });
      });
    });
  });

  describe('when calling the contract with calldata', () => {
    describe('when calling method that exist', () => {
      describe('when calling the contract with transferOwnership Signature', () => {
        it('should pass and set the pending owner', async () => {
          const pendingOwnerBefore = await context.contract.pendingOwner();
          expect(pendingOwnerBefore).to.equal(ethers.ZeroAddress);

          const transferOwnershipPayload = context.contract.interface.encodeFunctionData(
            'transferOwnership',
            [context.accounts[2].address],
          );

          await context.accounts[0].sendTransaction({
            to: await context.contract.getAddress(),
            data: transferOwnershipPayload,
          });

          const pendingOwnerAfter = await context.contract.pendingOwner();

          expect(pendingOwnerAfter).to.equal(context.accounts[2].address);
        });
      });
    });

    describe("when calling method that doesn't exist", () => {
      describe('when there is no extension for the function called', () => {
        describe('when calling without sending any value', () => {
          it('should revert with NoExtensionForFunctionSignature error', async () => {
            await expect(
              context.accounts[0].sendTransaction({
                to: await context.contract.getAddress(),
                data: notExistingFunctionSignature,
              }),
            )
              .to.be.revertedWithCustomError(
                context.contract,
                'NoExtensionFoundForFunctionSelector',
              )
              .withArgs(notExistingFunctionSignature);
          });
        });

        describe('when calling with sending value', () => {
          it('should revert with NoExtensionForFunctionSignature error', async () => {
            const amountSent = 200;
            await expect(
              context.accounts[0].sendTransaction({
                to: await context.contract.getAddress(),
                data: notExistingFunctionSignature,
                value: amountSent,
              }),
            )
              .to.be.revertedWithCustomError(
                context.contract,
                'NoExtensionFoundForFunctionSelector',
              )
              .withArgs(notExistingFunctionSignature);
          });
        });
      });

      describe('when there is an extension for the function called', () => {
        describe('when double checking that the msg.sender & msg.value were sent with the calldata to the extension', () => {
          describe('when relying on the Checker Extension', () => {
            describe('when the extension is not set yet', () => {
              it('should revert with NoExtensionFoundForFunctionSelector', async () => {
                const supposedSender = context.accounts[0];
                const value = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(['address', 'uint256'], [supposedSender.address, value])
                    .substring(2);

                // different sender
                await expect(
                  context.accounts[1].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: checkMsgVariableFunctionSignature,
                    value: value,
                  }),
                )
                  .to.be.revertedWithCustomError(
                    context.contract,
                    'NoExtensionFoundForFunctionSelector',
                  )
                  .withArgs(checkMsgVariableFunctionSelector);
              });

              it('should revert with NoExtensionFoundForFunctionSelector, even if passed a different value from the msg.value', async () => {
                const sender = context.accounts[0];
                const supposedValue = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(['address', 'uint256'], [sender.address, supposedValue])
                    .substring(2);

                await expect(
                  sender.sendTransaction({
                    to: await context.contract.getAddress(),
                    data: checkMsgVariableFunctionSignature,
                    value: 100, // different value
                  }),
                )
                  .to.be.revertedWithCustomError(
                    context.contract,
                    'NoExtensionFoundForFunctionSelector',
                  )
                  .withArgs(checkMsgVariableFunctionSelector);
              });
            });

            describe('when the extension is set', () => {
              before(async () => {
                const checkerExtension = await new CheckerExtension__factory(
                  context.accounts[0],
                ).deploy();

                await context.contract
                  .connect(context.deployParams.owner)
                  .setData(
                    checkMsgVariableFunctionExtensionHandlerKey,
                    await checkerExtension.getAddress(),
                  );
              });

              it('should fail if passed a different value from the msg.value', async () => {
                const sender = context.accounts[0];
                const supposedValue = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(['address', 'uint256'], [sender.address, supposedValue])
                    .substring(2);

                await expect(
                  sender.sendTransaction({
                    to: await context.contract.getAddress(),
                    data: checkMsgVariableFunctionSignature,
                    value: 100, // different value
                  }),
                ).to.be.reverted;
              });

              it('should fail if passed a different address from the msg.sender', async () => {
                const supposedSender = context.accounts[0];
                const value = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(['address', 'uint256'], [supposedSender.address, value])
                    .substring(2);

                // different sender
                await expect(
                  context.accounts[1].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: checkMsgVariableFunctionSignature,
                    value: value,
                  }),
                ).to.be.reverted;
              });

              it('should pass if passed the same address and value as the msg.sender and msg.value', async () => {
                const sender = context.accounts[0];
                const value = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder.encode(['address', 'uint256'], [sender.address, value]).substring(2);

                await sender.sendTransaction({
                  to: await context.contract.getAddress(),
                  data: checkMsgVariableFunctionSignature,
                  value: value,
                });
              });
            });
          });
        });

        describe('when calling an extension that reverts with string error', () => {
          before(async () => {
            const revertStringExtension = await new RevertStringExtension__factory(
              context.accounts[0],
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(
                revertStringFunctionExtensionHandlerKey,
                await revertStringExtension.getAddress(),
              );
          });

          it('should revert with a string error provided as argument', async () => {
            const revertString = 'I failed';

            const revertStringFunctionSignature =
              revertStringFunctionSelector +
              abiCoder.encode(['string'], [revertString]).substring(2);

            await expect(
              context.accounts[0].sendTransaction({
                to: await context.contract.getAddress(),
                data: revertStringFunctionSignature,
                value: 0,
              }),
            ).to.be.revertedWith(revertString);
          });
        });

        describe('when calling an extension that reverts with Custom error with tx.origin and msg.sender as parameters', () => {
          let revertCustomExtension: RevertCustomExtension;

          before(async () => {
            revertCustomExtension = await new RevertCustomExtension__factory(
              context.accounts[0],
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(
                revertCustomFunctionExtensionHandlerKey,
                await revertCustomExtension.getAddress(),
              );
          });

          it('should revert with a custom error with tx.origin and msg.sender as argument', async () => {
            const sender = context.accounts[0];

            await expect(
              sender.sendTransaction({
                to: await context.contract.getAddress(),
                data: revertCustomFunctionSelector,
                value: 0,
              }),
            )
              .to.be.revertedWithCustomError(revertCustomExtension, 'RevertWithAddresses')
              .withArgs(sender.address, await context.contract.getAddress());
          });
        });

        describe('when calling an extension that emits an event', () => {
          let emitEventExtension: EmitEventExtension;

          before(async () => {
            emitEventExtension = await new EmitEventExtension__factory(
              context.accounts[0],
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(emitEventFunctionExtensionHandlerKey, await emitEventExtension.getAddress());
          });

          it('should pass and emit the event on the extension', async () => {
            await expect(
              context.accounts[0].sendTransaction({
                to: await context.contract.getAddress(),
                data: emitEventFunctionSelector,
                value: 0,
              }),
            ).to.emit(emitEventExtension, 'EventEmittedInExtension');
          });
        });

        describe('when the extension function is payable', () => {
          it('should forward the value to the extension', async () => {
            const transferExtension = await new TransferExtension__factory(
              context.accounts[0],
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(transferFunctionExtensionHandlerKey, await transferExtension.getAddress());

            const amountTransferred = 20;

            const transferFunctionSignature =
              transferFunctionSelector +
              abiCoder.encode(['uint256'], [amountTransferred]).substring(2);

            await context.accounts[0].sendTransaction({
              to: await context.contract.getAddress(),
              data: transferFunctionSignature,
            });

            const balanceAfter = await transferExtension.balances(context.accounts[0].address);

            expect(balanceAfter).to.equal(amountTransferred);
          });
        });

        describe('when calling an extension that returns a string', () => {
          let nameExtension: NameExtension;

          before(async () => {
            nameExtension = await new NameExtension__factory(context.accounts[0]).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(nameFunctionExtensionHandlerKey, await nameExtension.getAddress());
          });

          it('should pass and return the name correctly', async () => {
            const returnValue = await provider.call({
              from: context.accounts[0].address,
              to: await context.contract.getAddress(),
              data: nameFunctionSelector,
            });

            expect(returnValue).to.equal(abiCoder.encode(['string'], ['LUKSO']));
          });
        });

        describe('when calling an extension that returns a number', () => {
          let ageExtension: AgeExtension;

          before(async () => {
            ageExtension = await new AgeExtension__factory(context.accounts[0]).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(ageFunctionExtensionHandlerKey, await ageExtension.getAddress());
          });

          it('should pass and return the age correctly', async () => {
            const returnValue = await provider.call({
              from: context.accounts[0].address,
              to: await context.contract.getAddress(),
              data: ageFunctionSelector,
            });

            expect(returnValue).to.equal(abiCoder.encode(['uint256'], [20]));
          });
        });

        describe('when calling an extension that modify the state of the extension', () => {
          let transferExtension: TransferExtension;

          before(async () => {
            transferExtension = await new TransferExtension__factory(context.accounts[0]).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(transferFunctionExtensionHandlerKey, await transferExtension.getAddress());
          });

          it('should pass and change the state accordingly', async () => {
            const balanceBefore = await transferExtension.balances(context.accounts[0].address);

            expect(balanceBefore).to.equal(0);

            const amountTransferred = 20;

            const transferFunctionSignature =
              transferFunctionSelector +
              abiCoder.encode(['uint256'], [amountTransferred]).substring(2);

            await context.accounts[0].sendTransaction({
              to: await context.contract.getAddress(),
              data: transferFunctionSignature,
            });

            const balanceAfter = await transferExtension.balances(context.accounts[0].address);

            expect(balanceAfter).to.equal(amountTransferred);
          });
        });

        describe('when calling an extension that reenter the fallback function of the account', () => {
          let reenterAccountExtension: ReenterAccountExtension;

          before(async () => {
            reenterAccountExtension = await new ReenterAccountExtension__factory(
              context.accounts[0],
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(
                reenterAccountFunctionExtensionHandlerKey,
                await reenterAccountExtension.getAddress(),
              );
          });

          describe('when reentering the fallback function without calling any other extension', () => {
            it('should pass', async () => {
              const reenterAccountFunctionSignature =
                reenterAccountFunctionSelector + abiCoder.encode(['bytes'], ['0x']).substring(2);

              await expect(
                context.accounts[0].sendTransaction({
                  to: await context.contract.getAddress(),
                  data: reenterAccountFunctionSignature,
                }),
              ).to.not.be.reverted;
            });
          });

          describe('when reentering with a call to an extension that emits an event', () => {
            describe('when reentering before setting the extension', () => {
              let emitEventExtension: EmitEventExtension;

              before(async () => {
                emitEventExtension = await new EmitEventExtension__factory(
                  context.accounts[0],
                ).deploy();
              });

              it('should not emit any event', async () => {
                const reenterAccountFunctionSignature =
                  reenterAccountFunctionSelector +
                  abiCoder.encode(['bytes'], [emitEventFunctionSelector]).substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: reenterAccountFunctionSignature,
                  }),
                ).to.not.emit(emitEventExtension, 'EventEmittedInExtension');
              });
            });
            describe('when reentering after setting the extension', () => {
              let emitEventExtension: EmitEventExtension;

              before(async () => {
                emitEventExtension = await new EmitEventExtension__factory(
                  context.accounts[0],
                ).deploy();

                await context.contract
                  .connect(context.deployParams.owner)
                  .setData(
                    emitEventFunctionExtensionHandlerKey,
                    await emitEventExtension.getAddress(),
                  );
              });
              it('should emit the event on 3rd extension called', async () => {
                const reenterAccountFunctionSignature =
                  reenterAccountFunctionSelector +
                  abiCoder.encode(['bytes'], [emitEventFunctionSelector]).substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: reenterAccountFunctionSignature,
                    value: 0,
                  }),
                ).to.emit(emitEventExtension, 'EventEmittedInExtension');
              });
            });
          });
        });

        describe('when calling the supportsInterface of the extendable contract with `0xaabbccdd` value', () => {
          describe('when the ERC165 extension was not set', () => {
            it('should return false', async () => {
              expect(await context.contract.supportsInterface('0xaabbccdd')).to.be.false;
            });
          });

          describe('when the ERC165 extension was set', () => {
            let erc165Extension: ERC165Extension;
            before(async () => {
              erc165Extension = await new ERC165Extension__factory(context.accounts[0]).deploy();

              await context.contract
                .connect(context.deployParams.owner)
                .setData(
                  supportsInterfaceFunctionExtensionHandlerKey,
                  await erc165Extension.getAddress(),
                );
            });

            it('should return true', async () => {
              expect(await context.contract.supportsInterface('0xaabbccdd')).to.be.true;
            });
          });
        });
      });
    });

    describe('when calling with calldata that is not checked for extension', () => {
      describe('when calling with a payload of length less than 4bytes', () => {
        let revertFallbackExtension: RevertFallbackExtension;

        before(async () => {
          revertFallbackExtension = await new RevertFallbackExtension__factory(
            context.accounts[0],
          ).deploy();

          const bytes1ZeroPaddedExtensionHandlerKey =
            ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
            '01000000' +
            '00000000000000000000000000000000'; // zero padded

          await context.contract
            .connect(context.deployParams.owner)
            .setData(
              bytes1ZeroPaddedExtensionHandlerKey,
              await revertFallbackExtension.getAddress(),
            );
        });

        it('should pass even if there is an extension for it that reverts', async () => {
          await expect(
            context.accounts[0].sendTransaction({
              to: await context.contract.getAddress(),
              data: '0x01',
            }),
          ).to.not.be.reverted;
        });
      });

      describe('when calling with a payload prepended with 4 bytes of 0', () => {
        describe('when no extension is set for bytes4(0)', () => {
          describe('when the payload is `0x00000000`', () => {
            describe('with sending value', () => {
              it('should pass and emit UniversalReceiver', async () => {
                const amountSent = 2;

                const tx = await context.accounts[0].sendTransaction({
                  to: await context.contract.getAddress(),
                  data: '0x00000000',
                  value: amountSent,
                });

                const isSupportingLSP0 = await context.contract.supportsInterface(
                  INTERFACE_IDS.LSP0ERC725Account,
                );

                const isSupportingLSP9 = await context.contract.supportsInterface(
                  INTERFACE_IDS.LSP9Vault,
                );

                let emittedTypeId;
                if (isSupportingLSP0) {
                  emittedTypeId = LSP1_TYPE_IDS.LSP0ValueReceived;
                } else if (isSupportingLSP9) {
                  emittedTypeId = LSP1_TYPE_IDS.LSP9ValueReceived;
                }

                expect(tx)
                  .to.emit(context.contract, 'UniversalReceiver')
                  .withArgs(
                    context.accounts[0].address,
                    amountSent,
                    emittedTypeId,
                    '0x',
                    abiCoder.encode(
                      ['bytes', 'bytes'],
                      [ethers.hexlify(ethers.toUtf8Bytes('LSP1: typeId out of scope')), '0x'],
                    ),
                  );
              });
            });

            describe('without sending value', () => {
              it('should pass', async () => {
                await expect(
                  context.accounts[0].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: '0x00000000',
                  }),
                ).to.not.be.reverted;
              });
            });
          });

          describe("when the payload is `0x00000000` + some random data ('graffiti')", () => {
            describe('with sending value', () => {
              it('should pass and emit ValueReceived value', async () => {
                const amountSent = 2;
                const graffiti =
                  '0x00000000' +
                  ethers.hexlify(ethers.toUtf8Bytes('This is a small tip for you!')).substring(2);

                const tx = await context.accounts[0].sendTransaction({
                  to: await context.contract.getAddress(),
                  data: graffiti,
                  value: amountSent,
                });

                const isSupportingLSP0 = await context.contract.supportsInterface(
                  INTERFACE_IDS.LSP0ERC725Account,
                );

                const isSupportingLSP9 = await context.contract.supportsInterface(
                  INTERFACE_IDS.LSP9Vault,
                );

                let emittedTypeId;
                if (isSupportingLSP0) {
                  emittedTypeId = LSP1_TYPE_IDS.LSP0ValueReceived;
                } else if (isSupportingLSP9) {
                  emittedTypeId = LSP1_TYPE_IDS.LSP9ValueReceived;
                }

                expect(tx)
                  .to.emit(context.contract, 'UniversalReceiver')
                  .withArgs(
                    context.accounts[0].address,
                    amountSent,
                    emittedTypeId,
                    '0x',
                    abiCoder.encode(
                      ['bytes', 'bytes'],
                      [ethers.hexlify(ethers.toUtf8Bytes('LSP1: typeId out of scope')), '0x'],
                    ),
                  );
              });
            });

            describe('without sending value', () => {
              it('should pass', async () => {
                const graffiti =
                  '0x00000000' +
                  ethers
                    .hexlify(ethers.toUtf8Bytes('Sending a decentralized message'))
                    .substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: graffiti,
                  }),
                ).to.not.be.reverted;
              });
            });
          });
        });

        describe('when there is an extension set for bytes4(0)', () => {
          describe('when setting an extension that reverts', () => {
            let revertFallbackExtension: RevertFallbackExtension;

            before(async () => {
              revertFallbackExtension = await new RevertFallbackExtension__factory(
                context.accounts[0],
              ).deploy();

              const bytes1ZeroPaddedExtensionHandlerKey =
                ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
                '00000000' +
                '00000000000000000000000000000000'; // zero padded

              await context.contract
                .connect(context.deployParams.owner)
                .setData(
                  bytes1ZeroPaddedExtensionHandlerKey,
                  await revertFallbackExtension.getAddress(),
                );
            });

            describe('when the payload is `0x00000000`', () => {
              it('should revert', async () => {
                await expect(
                  context.accounts[0].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: '0x00000000',
                  }),
                ).to.be.reverted;
              });
            });

            describe("when the payload is `0x00000000` + some random data ('graffiti')", () => {
              it('should revert', async () => {
                const graffiti =
                  '0x00000000' +
                  ethers
                    .hexlify(ethers.toUtf8Bytes('Sending a decentralized message'))
                    .substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: await context.contract.getAddress(),
                    data: graffiti,
                  }),
                ).to.be.reverted;
              });
            });
          });
        });
      });
    });

    describe('edge cases', () => {
      describe('when setting less than 20 bytes as data value for the LSP17Extension data key', () => {
        const randomSelector = ethers.hexlify(ethers.randomBytes(4));
        const randomBytes10Value = ethers.hexlify(ethers.randomBytes(10));

        const lsp17DataKey =
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
          randomSelector.substring(2) +
          '00'.repeat(16);

        it('should pass when setting the bytes', async () => {
          await expect(context.contract.setData(lsp17DataKey, randomBytes10Value))
            .to.emit(context.contract, 'DataChanged')
            .withArgs(lsp17DataKey, randomBytes10Value);
        });

        it('should revert with no ExtensionFoundForSelector when calling the function selector mapped to the 10 random bytes', async () => {
          await expect(
            context.accounts[0].sendTransaction({
              to: await context.contract.getAddress(),
              data: randomSelector,
            }),
          )
            .to.be.revertedWithCustomError(context.contract, 'NoExtensionFoundForFunctionSelector')
            .withArgs(randomSelector);
        });
      });
    });

    describe('use cases', async () => {
      describe('when interacting with a contract that require the recipient to implement onERC721Received function to mint', () => {
        let token: RequireCallbackToken;

        before(async () => {
          token = await new RequireCallbackToken__factory(context.accounts[0]).deploy();
        });

        describe('when minting to the account', () => {
          describe('before setting the onERC721ReceivedExtension', () => {
            it('should fail since onERC721Received is not implemented', async () => {
              await expect(token.mint(await context.contract.getAddress())).to.be.reverted;
            });
          });

          describe('after setting the onERC721ReceivedExtension', () => {
            let onERC721ReceivedExtension: OnERC721ReceivedExtension;

            before(async () => {
              onERC721ReceivedExtension = await new OnERC721ReceivedExtension__factory(
                context.accounts[0],
              ).deploy();

              await context.contract
                .connect(context.deployParams.owner)
                .setData(
                  onERC721ReceivedFunctionExtensionHandlerKey,
                  await onERC721ReceivedExtension.getAddress(),
                );
            });
            it('should pass since onERC721Received is implemented as a fallback extension', async () => {
              await expect(token.mint(await context.contract.getAddress())).to.emit(
                token,
                'Minted',
              );
            });
          });
        });
      });
    });
  });
};
