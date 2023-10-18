import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';

import {
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
  BuyExtension,
  BuyExtension__factory,
} from '../../types';

// helpers
import { abiCoder, provider } from '../utils/helpers';

// constants
import { ERC725YDataKeys } from '../../constants';

export type LSP17TestContext = {
  accounts: SignerWithAddress[];
  contract: LSP0ERC725Account | LSP9Vault | any;
  deployParams: any;
};

export const shouldBehaveLikeLSP17 = (buildContext: () => Promise<LSP17TestContext>) => {
  let context: LSP17TestContext;
  let notExistingFunctionSignature,
    checkMsgVariableFunctionSelector,
    nameFunctionSelector,
    ageFunctionSelector,
    transferFunctionSelector,
    reenterAccountFunctionSelector,
    revertStringFunctionSelector,
    revertCustomFunctionSelector,
    emitEventFunctionSelector,
    buyFunctionSelector,
    supportsInterfaceFunctionSelector;

  let checkMsgVariableFunctionExtensionHandlerKey,
    nameFunctionExtensionHandlerKey,
    ageFunctionExtensionHandlerKey,
    transferFunctionExtensionHandlerKey,
    reenterAccountFunctionExtensionHandlerKey,
    revertStringFunctionExtensionHandlerKey,
    revertCustomFunctionExtensionHandlerKey,
    emitEventFunctionExtensionHandlerKey,
    buyFunctionExtensionHandlerKey,
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

    // buy()
    buyFunctionSelector = '0xa6f2ae3a';

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

    buyFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      buyFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded

    supportsInterfaceFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      supportsInterfaceFunctionSelector.substring(2) +
      '00000000000000000000000000000000'; // zero padded
  });

  describe('when calling the contract with calldata', () => {
    describe("when calling method that doesn't exist", () => {
      describe('when there is no extension for the function called', () => {
        describe('when calling without sending any value', () => {
          it('should revert with NoExtensionForFunctionSignature error', async () => {
            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
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
                to: context.contract.address,
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
                    to: context.contract.address,
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
                    to: context.contract.address,
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
                  .setData(checkMsgVariableFunctionExtensionHandlerKey, checkerExtension.address);
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
                    to: context.contract.address,
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
                    to: context.contract.address,
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
                  to: context.contract.address,
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
              .setData(revertStringFunctionExtensionHandlerKey, revertStringExtension.address);
          });

          it('should revert with a string error provided as argument', async () => {
            const revertString = 'I failed';

            const revertStringFunctionSignature =
              revertStringFunctionSelector +
              abiCoder.encode(['string'], [revertString]).substring(2);

            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
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
              .setData(revertCustomFunctionExtensionHandlerKey, revertCustomExtension.address);
          });

          it('should revert with a custom error with tx.origin and msg.sender as argument', async () => {
            const sender = context.accounts[0];

            await expect(
              sender.sendTransaction({
                to: context.contract.address,
                data: revertCustomFunctionSelector,
                value: 0,
              }),
            )
              .to.be.revertedWithCustomError(revertCustomExtension, 'RevertWithAddresses')
              .withArgs(sender.address, context.contract.address);
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
              .setData(emitEventFunctionExtensionHandlerKey, emitEventExtension.address);
          });

          it('should pass and emit the event on the extension', async () => {
            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
                data: emitEventFunctionSelector,
                value: 0,
              }),
            ).to.emit(emitEventExtension, 'EventEmittedInExtension');
          });
        });

        describe('when calling an extension that returns a string', () => {
          let nameExtension: FakeContract;

          before(async () => {
            nameExtension = await smock.fake([
              {
                inputs: [],
                name: 'name',
                outputs: [
                  {
                    internalType: 'string',
                    name: '',
                    type: 'string',
                  },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ]);
            nameExtension.name.returns('LUKSO');

            await context.contract
              .connect(context.deployParams.owner)
              .setData(nameFunctionExtensionHandlerKey, nameExtension.address);
          });

          it('should pass and return the name correctly', async () => {
            const returnValue = await provider.call({
              from: context.accounts[0].address,
              to: context.contract.address,
              data: nameFunctionSelector,
            });

            expect(returnValue).to.equal(abiCoder.encode(['string'], ['LUKSO']));
          });
        });

        describe('when calling an extension that returns a number', () => {
          let ageExtension: FakeContract;

          before(async () => {
            ageExtension = await smock.fake([
              {
                inputs: [],
                name: 'age',
                outputs: [
                  {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                  },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ]);
            ageExtension.age.returns(20);

            await context.contract
              .connect(context.deployParams.owner)
              .setData(ageFunctionExtensionHandlerKey, ageExtension.address);
          });

          it('should pass and return the age correctly', async () => {
            const returnValue = await provider.call({
              from: context.accounts[0].address,
              to: context.contract.address,
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
              .setData(transferFunctionExtensionHandlerKey, transferExtension.address);
          });

          it('should pass and change the state accordingly', async () => {
            const balanceBefore = await transferExtension.callStatic.balances(
              context.accounts[0].address,
            );

            expect(balanceBefore).to.equal(0);

            const amountTransferred = 20;

            const transferFunctionSignature =
              transferFunctionSelector +
              abiCoder.encode(['uint256'], [amountTransferred]).substring(2);

            await context.accounts[0].sendTransaction({
              to: context.contract.address,
              data: transferFunctionSignature,
            });

            const balanceAfter = await transferExtension.callStatic.balances(
              context.accounts[0].address,
            );

            expect(balanceAfter).to.equal(amountTransferred);
          });
        });

        describe('when calling a payable extension with value', () => {
          let buyExtension: BuyExtension;

          before(async () => {
            buyExtension = await new BuyExtension__factory(context.accounts[0]).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              .setData(buyFunctionExtensionHandlerKey, buyExtension.address);
          });

          it('should pass and receive the value sent within the contract', async () => {
            const balanceBefore = await provider.getBalance(buyExtension.address);

            expect(balanceBefore).to.equal(0);

            await context.accounts[0].sendTransaction({
              to: context.contract.address,
              value: 100,
              data: buyFunctionSelector,
            });

            const balanceAfter = await provider.getBalance(buyExtension.address);

            expect(balanceAfter).to.equal(100);
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
              .setData(reenterAccountFunctionExtensionHandlerKey, reenterAccountExtension.address);
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
                    to: context.contract.address,
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
                  .setData(emitEventFunctionExtensionHandlerKey, emitEventExtension.address);
              });
              it('should emit the event on 3rd extension called', async () => {
                const reenterAccountFunctionSignature =
                  reenterAccountFunctionSelector +
                  abiCoder.encode(['bytes'], [emitEventFunctionSelector]).substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: context.contract.address,
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
                .setData(supportsInterfaceFunctionExtensionHandlerKey, erc165Extension.address);
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
        it('should revert', async () => {
          await expect(
            context.accounts[0].sendTransaction({
              to: context.contract.address,
              data: '0x01',
            }),
          ).to.be.revertedWithCustomError(context.contract, 'InvalidFunctionSelector');
        });
      });
    });
  });
};
