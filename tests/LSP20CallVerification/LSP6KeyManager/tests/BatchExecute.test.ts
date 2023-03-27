import { expect } from "chai";
import { ethers } from "hardhat";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  OPERATION_TYPES,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { setupKeyManager } from "../../../utils/fixtures";
import { provider } from "../../../utils/helpers";
import { LSP7Mintable, LSP7Mintable__factory } from "../../../../types";
import { BigNumber } from "ethers";

export const shouldBehaveLikeBatchExecute = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("when using batch `execute(bytes[])`", () => {
    let context: LSP6TestContext;

    // a fictional DAI token on LUKSO
    let lyxDaiToken: LSP7Mintable,
      // a basic sample token
      metaCoin: LSP7Mintable,
      // a token that can be used as credits for a LUKSO relay service.
      // Inspired from https://github.com/lykhonis/relayer
      rLyxToken: LSP7Mintable;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("50"));

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
      ];

      const permissionsValues = [ALL_PERMISSIONS];

      await setupKeyManager(context, permissionKeys, permissionsValues);

      // deploy some sample LSP7 tokens and mint some tokens to the UP
      lyxDaiToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "LYX DAI Invented Token",
        "LYXDAI",
        context.accounts[0].address,
        false
      );

      metaCoin = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "Meta Coin",
        "MTC",
        context.accounts[0].address,
        false
      );

      rLyxToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "LUKSO Relay Token",
        "rLYX",
        context.accounts[0].address,
        false
      );

      await lyxDaiToken.mint(
        context.universalProfile.address,
        100,
        false,
        "0x"
      );
      await metaCoin.mint(context.universalProfile.address, 100, false, "0x");
      await rLyxToken.mint(context.universalProfile.address, 100, false, "0x");
    });

    describe("when specifying msg.value", () => {
      describe("when all the payloads are setData(...)", () => {
        describe("if specifying 0 for each values[index]", () => {
          it("should revert and not leave any funds locked on the Key Manager", async () => {
            const amountToFund = ethers.utils.parseEther("5");

            const dataKeys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key1")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key2")),
            ];
            const dataValues = ["0xaaaaaaaa", "0xbbbbbbbb"];

            const keyManagerBalanceBefore = await ethers.provider.getBalance(
              context.keyManager.address
            );

            const firstSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[0], dataValues[0]]
              );

            const secondSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[1], dataValues[1]]
              );

            // this error occurs when calling `setData(...)` with msg.value,
            // since these functions on ERC725Y are not payable
            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](
                  [0, 0],
                  [firstSetDataPayload, secondSetDataPayload],
                  { value: amountToFund }
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "LSP6BatchExcessiveValueSent"
              )
              .withArgs(0, amountToFund);

            const keyManagerBalanceAfter = await ethers.provider.getBalance(
              context.keyManager.address
            );

            expect(keyManagerBalanceAfter).to.equal(keyManagerBalanceBefore);

            // the Key Manager must not hold any funds and must always forward any funds sent to it.
            // it's balance must always be 0 after any execution
            expect(
              await provider.getBalance(context.keyManager.address)
            ).to.equal(0);
          });
        });

        describe("if specifying some value for each values[index]", () => {
          it("should revert with Key Manager error `CannotSendValueToSetData` when sending value while setting data", async () => {
            const amountToFund = ethers.utils.parseEther("2");

            const dataKeys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key1")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key2")),
            ];
            const dataValues = ["0xaaaaaaaa", "0xbbbbbbbb"];

            const keyManagerBalanceBefore = await ethers.provider.getBalance(
              context.keyManager.address
            );

            const firstSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[0], dataValues[0]]
              );

            const secondSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[1], dataValues[1]]
              );

            // this error occurs when calling `setData(...)` with msg.value,
            // since these functions on ERC725Y are not payable
            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](
                  [1, 1],
                  [firstSetDataPayload, secondSetDataPayload],
                  { value: amountToFund }
                )
            ).to.be.revertedWithCustomError(
              context.keyManager,
              "CannotSendValueToSetData"
            );
          });
        });
      });

      describe("when sending 2x payloads, 1st for `setData`, 2nd for `execute`", () => {
        describe("when `msgValues[1]` is zero for `setData(...)`", () => {
          it("should pass", async () => {
            const recipient = context.accounts[5].address;

            const dataKey = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("Sample Data Key")
            );
            const dataValue = ethers.utils.hexlify(
              ethers.utils.randomBytes(10)
            );

            const msgValues = [
              ethers.BigNumber.from(0),
              ethers.BigNumber.from("5"),
            ];

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKey, dataValue]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [OPERATION_TYPES.CALL, recipient, msgValues[1], "0x"]
              ),
            ];

            const totalValues = msgValues.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](msgValues, payloads, {
                  value: totalValues,
                })
            ).to.changeEtherBalances(
              [context.universalProfile.address, recipient],
              [0, msgValues[1]]
            );
            expect(
              await context.universalProfile["getData(bytes32)"](dataKey)
            ).to.equal(dataValue);
          });
        });

        describe("when `msgValues[1]` is NOT zero for `setData(...)`", () => {
          it("should revert with default LSP6 `executePayload(...)` error message", async () => {
            const recipient = context.accounts[5].address;

            const dataKey = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("Sample Data Key")
            );
            const dataValue = ethers.utils.hexlify(
              ethers.utils.randomBytes(10)
            );

            const msgValues = [
              ethers.BigNumber.from(5),
              ethers.BigNumber.from("5"),
            ];

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKey, dataValue]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [OPERATION_TYPES.CALL, recipient, msgValues[1], "0x"]
              ),
            ];

            const totalValues = msgValues.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](msgValues, payloads, {
                  value: totalValues,
                })
            ).to.be.revertedWithCustomError(
              context.keyManager,
              "CannotSendValueToSetData"
            );
          });
        });
      });

      describe("when sending 3x payloads", () => {
        describe("when total `values[]` is LESS than `msg.value`", () => {
          it("should revert because insufficent `msg.value`", async () => {
            const firstRecipient = context.accounts[3].address;
            const secondRecipient = context.accounts[4].address;
            const thirdRecipient = context.accounts[5].address;

            const amountsToTransfer = [
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
            ];

            const values = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const totalValues = values.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            // total of values[] - 1. To check we are not sending enough fuds
            const msgValue = totalValues.sub(1);

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  firstRecipient,
                  amountsToTransfer[0],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  secondRecipient,
                  amountsToTransfer[1],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  thirdRecipient,
                  amountsToTransfer[2],
                  "0x",
                ]
              ),
            ];

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](values, payloads, {
                  value: msgValue,
                })
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "LSP6BatchInsufficientValueSent"
              )
              .withArgs(totalValues, msgValue);
          });
        });

        describe("when total `values[]` is MORE than `msg.value`", () => {
          it("should revert to not leave any remaining funds on the Key Manager", async () => {
            const firstRecipient = context.accounts[3].address;
            const secondRecipient = context.accounts[4].address;
            const thirdRecipient = context.accounts[5].address;

            const amountsToTransfer = [
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
            ];

            const values = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const totalValues = values.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            // total of values[] + 1. To check we cannot send to much funds and leave some in the Key Manager
            const msgValue = totalValues.add(1);

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  firstRecipient,
                  amountsToTransfer[0],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  secondRecipient,
                  amountsToTransfer[1],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  thirdRecipient,
                  amountsToTransfer[2],
                  "0x",
                ]
              ),
            ];

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](values, payloads, {
                  value: msgValue,
                })
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "LSP6BatchExcessiveValueSent"
              )
              .withArgs(totalValues, msgValue);
          });
        });

        describe("when total `values[]` is EQUAL to `msg.value`", () => {
          it("should pass", async () => {
            const firstRecipient = context.accounts[3].address;
            const secondRecipient = context.accounts[4].address;
            const thirdRecipient = context.accounts[5].address;

            const amountsToTransfer = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const values = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const totalValues = values.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  firstRecipient,
                  amountsToTransfer[0],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  secondRecipient,
                  amountsToTransfer[1],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  thirdRecipient,
                  amountsToTransfer[2],
                  "0x",
                ]
              ),
            ];

            let tx = await context.keyManager
              .connect(context.owner)
              ["execute(uint256[],bytes[])"](values, payloads, {
                value: totalValues,
              });

            await expect(tx).to.changeEtherBalances(
              [
                context.universalProfile.address,
                firstRecipient,
                secondRecipient,
                thirdRecipient,
              ],
              [
                0,
                amountsToTransfer[0],
                amountsToTransfer[1],
                amountsToTransfer[2],
              ]
            );
          });
        });
      });
    });

    describe("when one of the payload reverts", () => {
      it("should revert the whole transaction if first payload reverts", async () => {
        const upBalance = await provider.getBalance(
          context.universalProfile.address
        );

        const validAmount = ethers.utils.parseEther("1");
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, "0x"]
          );

        const firstTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const secondTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        await expect(
          context.keyManager
            .connect(context.owner)
            ["execute(uint256[],bytes[])"](
              [0, 0, 0],
              [
                failingTransferPayload,
                firstTransferPayload,
                secondTransferPayload,
              ]
            )
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          "ERC725X_InsufficientBalance"
        );
      });

      it("should revert the whole transaction if last payload reverts", async () => {
        const upBalance = await provider.getBalance(
          context.universalProfile.address
        );

        const validAmount = ethers.utils.parseEther("1");
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, "0x"]
          );

        const firstTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const secondTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        await expect(
          context.keyManager
            .connect(context.owner)
            ["execute(uint256[],bytes[])"](
              [0, 0, 0],
              [
                firstTransferPayload,
                secondTransferPayload,
                failingTransferPayload,
              ]
            )
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          "ERC725X_InsufficientBalance"
        );
      });
    });
  });
};
