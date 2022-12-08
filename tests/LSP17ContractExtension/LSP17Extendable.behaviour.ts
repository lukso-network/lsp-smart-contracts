import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  LSP0ERC725Account,
  LSP9Vault,
  CheckerExtension__factory,
  CheckerExtension,
  RevertStringExtension,
  ERC165Extension,
  ERC165Extension__factory,
  RevertStringExtension__factory,
  RevertCustomExtension,
  RevertCustomExtension__factory,
  EmitEventExtension,
  EmitEventExtension__factory,
  NameExtension,
  NameExtension__factory,
  AgeExtension__factory,
  AgeExtension,
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
} from "../../types";

import { abiCoder, provider } from "../utils/helpers";
// constants
import { ERC725YDataKeys } from "../../constants";

export type LSP17TestContext = {
  accounts: SignerWithAddress[];
  contract: LSP0ERC725Account | LSP9Vault;
  deployParams: { owner: SignerWithAddress };
};

export const shouldBehaveLikeLSP17 = (
  buildContext: () => Promise<LSP17TestContext>
) => {
  let context: LSP17TestContext;
  let newOwner: SignerWithAddress;
  let notExistingFunctionSignature,
    onERC721ReceivedFunctionSelector,
    checkMsgVariableFunctionSelector,
    nameFunctionSelector,
    ageFunctionSelector,
    transferFunctionSelector,
    sendDataFunctionSignature,
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
    mintFunctionExtensionHandlerKey,
    revertStringFunctionExtensionHandlerKey,
    revertCustomFunctionExtensionHandlerKey,
    emitEventFunctionExtensionHandlerKey,
    onERC721ReceivedFunctionExtensionHandlerKey,
    supportsInterfaceFunctionExtensionHandlerKey;

  beforeEach(async () => {
    context = await buildContext();
    newOwner = context.accounts[1];

    // withdraw()
    notExistingFunctionSignature = "0x3ccfd60b";

    // checkMsgVariable(address,uint256)
    checkMsgVariableFunctionSelector = "0xe825d37d";

    // name()
    nameFunctionSelector = "0x06fdde03";

    // age()
    ageFunctionSelector = "0x262a9dff";

    // transfer(uint256)
    transferFunctionSelector = "0x12514bba";

    // revertString(string)
    revertStringFunctionSelector = "0xb678618b";

    // revertCustom()
    revertCustomFunctionSelector = "0x1ed106b8";

    // emitEvent()
    emitEventFunctionSelector = "0x7b0cb839";

    // reenterAccount(bytes)
    reenterAccountFunctionSelector = "0x864e5589";

    // onERC721Received(address,address,uint256,bytes)
    onERC721ReceivedFunctionSelector = "0x150b7a02";

    // supportsInterface(bytes4)
    supportsInterfaceFunctionSelector = "0x01ffc9a7";

    checkMsgVariableFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      checkMsgVariableFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    nameFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      nameFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    ageFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      ageFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    transferFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      transferFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    reenterAccountFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      reenterAccountFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    revertStringFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      revertStringFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    revertCustomFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      revertCustomFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    emitEventFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      emitEventFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    onERC721ReceivedFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      onERC721ReceivedFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded

    supportsInterfaceFunctionExtensionHandlerKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      supportsInterfaceFunctionSelector.substring(2) +
      "00000000000000000000000000000000"; // zero padded
  });

  describe("when calling the contract with empty calldata", () => {
    describe("when making a call without any value", () => {
      it("should pass and not emit ValueReceived", async () => {
        await expect(
          context.accounts[0].sendTransaction({
            to: context.contract.address,
          })
        ).to.not.be.reverted.to.not.emit(context.contract, "ValueReceived");
      });
    });

    describe("when making a call with sending value", () => {
      it("should pass and emit ValueReceived", async () => {
        const amountSent = 200;
        await expect(
          context.accounts[0].sendTransaction({
            to: context.contract.address,
            value: amountSent,
          })
        )
          .to.emit(context.contract, "ValueReceived")
          .withArgs(context.accounts[0].address, amountSent);
      });
    });
  });

  describe("when calling the contract with calldata", () => {
    describe("when calling method that exist", () => {
      describe("when calling the contract with transferOwnership Signature", () => {
        it("should pass and set the pending owner", async () => {
          const pendingOwnerBefore =
            await context.contract.callStatic.pendingOwner();
          expect(pendingOwnerBefore).to.equal(ethers.constants.AddressZero);

          const transferOwnershipPayload =
            context.contract.interface.encodeFunctionData("transferOwnership", [
              context.accounts[2].address,
            ]);

          await context.accounts[0].sendTransaction({
            to: context.contract.address,
            data: transferOwnershipPayload,
          });

          const pendingOwnerAfter =
            await context.contract.callStatic.pendingOwner();

          expect(pendingOwnerAfter).to.equal(context.accounts[2].address);
        });
      });
    });

    describe("when calling method that doesn't exist", () => {
      describe("when there is no extension for the function called", () => {
        describe("when calling without sending any value", () => {
          it("should pass and not emit any event", async () => {
            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
                data: notExistingFunctionSignature,
              })
            ).to.not.be.reverted.to.not.emit(context.contract, "ValueReceived");
          });
        });

        describe("when calling with sending value", () => {
          it("should pass and emit ValueReceived event", async () => {
            const amountSent = 200;
            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
                data: notExistingFunctionSignature,
                value: amountSent,
              })
            )
              .to.emit(context.contract, "ValueReceived")
              .withArgs(context.accounts[0].address, amountSent);
          });
        });
      });

      describe("when there is an extension for the function called", () => {
        describe("when double checking that the msg.sender & msg.value were sent with the calldata to the extension", () => {
          describe("when relying on the Checker Extension", () => {
            describe("when the extension is not set yet", () => {
              it("should pass even if passed a different address from the msg.sender", async () => {
                const supposedSender = context.accounts[0];
                const value = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(
                      ["address", "uint256"],
                      [supposedSender.address, value]
                    )
                    .substring(2);

                // different sender
                await expect(
                  context.accounts[1].sendTransaction({
                    to: context.contract.address,
                    data: checkMsgVariableFunctionSignature,
                    value: value,
                  })
                ).to.not.be.reverted;
              });

              it("should pass even if passed a different value from the msg.value", async () => {
                const sender = context.accounts[0];
                const supposedValue = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(
                      ["address", "uint256"],
                      [sender.address, supposedValue]
                    )
                    .substring(2);

                await expect(
                  sender.sendTransaction({
                    to: context.contract.address,
                    data: checkMsgVariableFunctionSignature,
                    value: 100, // different value
                  })
                ).to.not.be.reverted;
              });
            });

            describe("when the extension is set", () => {
              beforeEach(async () => {
                const checkerExtension = await new CheckerExtension__factory(
                  context.accounts[0]
                ).deploy();

                await context.contract
                  .connect(context.deployParams.owner)
                  ["setData(bytes32,bytes)"](
                    checkMsgVariableFunctionExtensionHandlerKey,
                    checkerExtension.address
                  );
              });

              it("should fail if passed a different value from the msg.value", async () => {
                const sender = context.accounts[0];
                const supposedValue = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(
                      ["address", "uint256"],
                      [sender.address, supposedValue]
                    )
                    .substring(2);

                await expect(
                  sender.sendTransaction({
                    to: context.contract.address,
                    data: checkMsgVariableFunctionSignature,
                    value: 100, // different value
                  })
                ).to.be.reverted;
              });

              it("should fail if passed a different address from the msg.sender", async () => {
                const supposedSender = context.accounts[0];
                const value = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(
                      ["address", "uint256"],
                      [supposedSender.address, value]
                    )
                    .substring(2);

                // different sender
                await expect(
                  context.accounts[1].sendTransaction({
                    to: context.contract.address,
                    data: checkMsgVariableFunctionSignature,
                    value: value,
                  })
                ).to.be.reverted;
              });

              it("should pass if passed the same address and value as the msg.sender and msg.value", async () => {
                const sender = context.accounts[0];
                const value = 200;
                const checkMsgVariableFunctionSignature =
                  checkMsgVariableFunctionSelector +
                  abiCoder
                    .encode(["address", "uint256"], [sender.address, value])
                    .substring(2);

                await sender.sendTransaction({
                  to: context.contract.address,
                  data: checkMsgVariableFunctionSignature,
                  value: value,
                });
              });
            });
          });
        });

        describe("when calling an extension that reverts on any selector", () => {
          describe("when calling with a payload that starts with bytes4(0)", () => {
            let revertFallbackExtension: RevertFallbackExtension;
            beforeEach(async () => {
              revertFallbackExtension =
                await new RevertFallbackExtension__factory(
                  context.accounts[0]
                ).deploy();

              const bytes4ZeroExtensionHandlerKey =
                ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
                "00000000" +
                "00000000000000000000000000000000"; // zero padded

              await context.contract
                .connect(context.deployParams.owner)
                ["setData(bytes32,bytes)"](
                  bytes4ZeroExtensionHandlerKey,
                  revertFallbackExtension.address
                );
            });
            it("should forward the call to the extension and revert", async () => {
              await expect(
                context.accounts[0].sendTransaction({
                  to: context.contract.address,
                  data: "0x00000000",
                })
              ).to.be.reverted;
            });
          });
        });

        describe("when calling an extension that reverts with string error", () => {
          beforeEach(async () => {
            const revertStringExtension =
              await new RevertStringExtension__factory(
                context.accounts[0]
              ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                revertStringFunctionExtensionHandlerKey,
                revertStringExtension.address
              );
          });

          it("should revert with a string error provided as argument", async () => {
            const revertString = "I failed";

            const revertStringFunctionSignature =
              revertStringFunctionSelector +
              abiCoder.encode(["string"], [revertString]).substring(2);

            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
                data: revertStringFunctionSignature,
                value: 0,
              })
            ).to.be.revertedWith(revertString);
          });
        });

        describe("when calling an extension that reverts with Custom error with tx.origin and msg.sender as parameters", () => {
          let revertCustomExtension: RevertCustomExtension;
          beforeEach(async () => {
            revertCustomExtension = await new RevertCustomExtension__factory(
              context.accounts[0]
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                revertCustomFunctionExtensionHandlerKey,
                revertCustomExtension.address
              );
          });

          it("should revert with a custom error with tx.origin and msg.sender as argument", async () => {
            const sender = context.accounts[0];

            await expect(
              sender.sendTransaction({
                to: context.contract.address,
                data: revertCustomFunctionSelector,
                value: 0,
              })
            )
              .to.be.revertedWithCustomError(
                revertCustomExtension,
                "RevertWithAddresses"
              )
              .withArgs(sender.address, context.contract.address);
          });
        });

        describe("when calling an extension that emits an event", () => {
          let emitEventExtension: EmitEventExtension;
          beforeEach(async () => {
            emitEventExtension = await new EmitEventExtension__factory(
              context.accounts[0]
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                emitEventFunctionExtensionHandlerKey,
                emitEventExtension.address
              );
          });

          it("should pass and emit the event on the extension", async () => {
            await expect(
              context.accounts[0].sendTransaction({
                to: context.contract.address,
                data: emitEventFunctionSelector,
                value: 0,
              })
            ).to.emit(emitEventExtension, "EventEmittedInExtension");
          });
        });

        describe("when calling an extension that returns a string", () => {
          let nameExtension: NameExtension;
          beforeEach(async () => {
            nameExtension = await new NameExtension__factory(
              context.accounts[0]
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                nameFunctionExtensionHandlerKey,
                nameExtension.address
              );
          });

          it("should pass and return the name correctly", async () => {
            const returnValue = await provider.call({
              from: context.accounts[0].address,
              to: context.contract.address,
              data: nameFunctionSelector,
            });

            expect(returnValue).to.equal(
              abiCoder.encode(["string"], ["LUKSO"])
            );
          });
        });

        describe("when calling an extension that returns a number", () => {
          let ageExtension: AgeExtension;
          beforeEach(async () => {
            ageExtension = await new AgeExtension__factory(
              context.accounts[0]
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                ageFunctionExtensionHandlerKey,
                ageExtension.address
              );
          });

          it("should pass and return the age correctly", async () => {
            const returnValue = await provider.call({
              from: context.accounts[0].address,
              to: context.contract.address,
              data: ageFunctionSelector,
            });

            expect(returnValue).to.equal(abiCoder.encode(["uint256"], [20]));
          });
        });

        describe("when calling an extension that modify the state of the extension", () => {
          let transferExtension: TransferExtension;
          beforeEach(async () => {
            transferExtension = await new TransferExtension__factory(
              context.accounts[0]
            ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                transferFunctionExtensionHandlerKey,
                transferExtension.address
              );
          });

          it("should pass and change the state accordingly", async () => {
            const balanceBefore = await transferExtension.callStatic.balances(
              context.accounts[0].address
            );

            expect(balanceBefore).to.equal(0);

            const amountTransferred = 20;

            const transferFunctionSignature =
              transferFunctionSelector +
              abiCoder.encode(["uint256"], [amountTransferred]).substring(2);

            await context.accounts[0].sendTransaction({
              to: context.contract.address,
              data: transferFunctionSignature,
            });

            const balanceAfter = await transferExtension.callStatic.balances(
              context.accounts[0].address
            );

            expect(balanceAfter).to.equal(amountTransferred);
          });
        });

        describe("when calling an extension that reenter the fallback function of the account", () => {
          let reenterAccountExtension: ReenterAccountExtension;
          beforeEach(async () => {
            reenterAccountExtension =
              await new ReenterAccountExtension__factory(
                context.accounts[0]
              ).deploy();

            await context.contract
              .connect(context.deployParams.owner)
              ["setData(bytes32,bytes)"](
                reenterAccountFunctionExtensionHandlerKey,
                reenterAccountExtension.address
              );
          });

          describe("when reentering the fallback function without calling any other extension", () => {
            it("should pass", async () => {
              const reenterAccountFunctionSignature =
                reenterAccountFunctionSelector +
                abiCoder.encode(["bytes"], ["0x"]).substring(2);

              await expect(
                context.accounts[0].sendTransaction({
                  to: context.contract.address,
                  data: reenterAccountFunctionSignature,
                })
              ).to.not.be.reverted;
            });
          });

          describe("when reentering with a call to an extension that emits an event", () => {
            describe("when reentering before setting the extension", () => {
              let emitEventExtension: EmitEventExtension;
              beforeEach(async () => {
                emitEventExtension = await new EmitEventExtension__factory(
                  context.accounts[0]
                ).deploy();
              });

              it("should not emit any event", async () => {
                const reenterAccountFunctionSignature =
                  reenterAccountFunctionSelector +
                  abiCoder
                    .encode(["bytes"], [emitEventFunctionSelector])
                    .substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: context.contract.address,
                    data: reenterAccountFunctionSignature,
                  })
                ).to.not.emit(emitEventExtension, "EventEmittedInExtension");
              });
            });
            describe("when reentering after setting the extension", () => {
              let emitEventExtension: EmitEventExtension;
              beforeEach(async () => {
                emitEventExtension = await new EmitEventExtension__factory(
                  context.accounts[0]
                ).deploy();

                await context.contract
                  .connect(context.deployParams.owner)
                  ["setData(bytes32,bytes)"](
                    emitEventFunctionExtensionHandlerKey,
                    emitEventExtension.address
                  );
              });
              it("should emit the event on 3rd extension called", async () => {
                const reenterAccountFunctionSignature =
                  reenterAccountFunctionSelector +
                  abiCoder
                    .encode(["bytes"], [emitEventFunctionSelector])
                    .substring(2);

                await expect(
                  context.accounts[0].sendTransaction({
                    to: context.contract.address,
                    data: reenterAccountFunctionSignature,
                    value: 0,
                  })
                ).to.emit(emitEventExtension, "EventEmittedInExtension");
              });
            });
          });
        });

        describe("when calling the supportsInterface of the extendable contract with `0xaabbccdd` value", () => {
          describe("when the ERC165 extension was not set", () => {
            it("should return false", async () => {
              expect(await context.contract.supportsInterface("0xaabbccdd")).to
                .be.false;
            });
          });

          describe("when the ERC165 extension was set", () => {
            let erc165Extension: ERC165Extension;
            before(async () => {
              erc165Extension = await new ERC165Extension__factory(
                context.accounts[0]
              ).deploy();

              await context.contract
                .connect(context.deployParams.owner)
                ["setData(bytes32,bytes)"](
                  supportsInterfaceFunctionExtensionHandlerKey,
                  erc165Extension.address
                );
            });

            it("should return true", async () => {
              expect(await context.contract.supportsInterface("0xaabbccdd")).to
                .be.true;
            });
          });
        });
      });
    });

    describe("when calling with calldata that is not checked for extension", () => {
      describe("when calling with a payload of length less than 4bytes", () => {
        let revertFallbackExtension: RevertFallbackExtension;
        beforeEach(async () => {
          revertFallbackExtension = await new RevertFallbackExtension__factory(
            context.accounts[0]
          ).deploy();

          const bytes1ZeroPaddedExtensionHandlerKey =
            ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
            "01000000" +
            "00000000000000000000000000000000"; // zero padded

          await context.contract
            .connect(context.deployParams.owner)
            ["setData(bytes32,bytes)"](
              bytes1ZeroPaddedExtensionHandlerKey,
              revertFallbackExtension.address
            );
        });
        it("should pass even if there is an extension for it that reverts", async () => {
          await context.accounts[0].sendTransaction({
            to: context.contract.address,
            data: "0x01",
          });
        });
      });
    });

    describe("use cases", async () => {
      describe("when interacting with a contract that require the recipient to implement onERC721Received function to mint", () => {
        let token: RequireCallbackToken;
        beforeEach(async () => {
          token = await new RequireCallbackToken__factory(
            context.accounts[0]
          ).deploy();
        });
        describe("when minitng to the account", () => {
          describe("before setting the onERC721ReceivedExtension", () => {
            it("should fail since onERC721Received is not implemented", async () => {
              await expect(token.mint(context.contract.address)).to.be.reverted;
            });
          });

          describe("after setting the onERC721ReceivedExtension", () => {
            let onERC721ReceivedExtension: OnERC721ReceivedExtension;
            beforeEach(async () => {
              onERC721ReceivedExtension =
                await new OnERC721ReceivedExtension__factory(
                  context.accounts[0]
                ).deploy();

              await context.contract
                .connect(context.deployParams.owner)
                ["setData(bytes32,bytes)"](
                  onERC721ReceivedFunctionExtensionHandlerKey,
                  onERC721ReceivedExtension.address
                );
            });
            it("should pass since onERC721Received is implemented as a fallback extension", async () => {
              await expect(token.mint(context.contract.address)).to.emit(
                token,
                "Minted"
              );
            });
          });
        });
      });
    });
  });
};
