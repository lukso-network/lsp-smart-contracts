import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { BigNumber } from "ethers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

// types
import {
  LSP7Tester,
  LSP7DigitalAsset,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from "../../types";

// helpers
import {
  ERC725YKeys,
  INTERFACE_IDS,
  SupportedStandards,
} from "../../constants";

export type LSP7TestAccounts = {
  owner: SignerWithAddress;

  tokenReceiver: SignerWithAddress;
  anotherTokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  operatorWithLowAuthorizedAmount: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7TestAccounts> => {
  const [
    owner,
    tokenReceiver,
    anotherTokenReceiver,
    operator,
    operatorWithLowAuthorizedAmount,
    anyone,
  ] = await ethers.getSigners();
  return {
    owner,
    tokenReceiver,
    anotherTokenReceiver,
    operator,
    operatorWithLowAuthorizedAmount,
    anyone,
  };
};

export type LSP7DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP7TestContext = {
  accounts: LSP7TestAccounts;
  lsp7: LSP7Tester;
  deployParams: LSP7DeployParams;
  initialSupply: BigNumber;
};

export const shouldBehaveLikeLSP7 = (
  buildContext: () => Promise<LSP7TestContext>
) => {
  let context: LSP7TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when setting data on ERC725Y storage", () => {
    it("should revert when trying to edit Token Name", async () => {
      const key = ERC725YKeys.LSP4["LSP4TokenName"];
      const value = "Overriden Token Name";

      await expect(
        context.lsp7
          .connect(context.deployParams.newOwner)
          ["setData(bytes32,bytes)"](key, value)
      ).toBeRevertedWith("LSP4: cannot edit Token Name after deployment");
    });

    it("should revert when trying to edit Token Symbol", async () => {
      const key = ERC725YKeys.LSP4["LSP4TokenSymbol"];
      const value = "BAD";

      await expect(
        context.lsp7
          .connect(context.deployParams.newOwner)
          ["setData(bytes32,bytes)"](key, value)
      ).toBeRevertedWith("LSP4: cannot edit Token Symbol after deployment");
    });
  });

  describe("when minting tokens", () => {
    describe("when `to` is the zero address", () => {
      it("should revert", async () => {
        const txParams = {
          to: ethers.constants.AddressZero,
          amount: ethers.BigNumber.from("1"),
          force: true,
          data: ethers.utils.toUtf8Bytes("should revert"),
        };

        await expect(
          context.lsp7.mint(
            txParams.to,
            txParams.amount,
            txParams.force,
            txParams.data
          )
        ).toBeRevertedWith("LSP7CannotSendWithAddressZero()");
      });
    });

    describe("when `to` is not the zero address", () => {
      it("should mint the token amount", async () => {
        const txParams = {
          to: context.accounts.tokenReceiver.address,
          amount: ethers.BigNumber.from("1"),
          force: true,
          data: ethers.utils.toUtf8Bytes("we need more tokens"),
        };

        // pre-conditions
        const preBalanceOf = await context.lsp7.balanceOf(txParams.to);

        // effects
        await context.lsp7.mint(
          txParams.to,
          txParams.amount,
          txParams.force,
          txParams.data
        );

        // post-conditions
        const postBalanceOf = await context.lsp7.balanceOf(txParams.to);
        expect(postBalanceOf).toEqual(preBalanceOf.add(txParams.amount));
      });
    });
  });

  describe("when tokens have been minted", () => {
    describe("totalSupply", () => {
      it("should return total token supply", async () => {
        expect(await context.lsp7.totalSupply()).toEqual(context.initialSupply);
      });
    });

    describe("balanceOf", () => {
      describe("when the given address owns tokens", () => {
        it("should return the owned token count", async () => {
          expect(
            await context.lsp7.balanceOf(context.accounts.owner.address)
          ).toEqual(context.initialSupply);
        });
      });

      describe("when the given address does not own tokens", () => {
        it("should return zero", async () => {
          expect(
            await context.lsp7.balanceOf(context.accounts.anyone.address)
          ).toEqual(ethers.constants.Zero);
        });
      });
    });

    describe("decimals", () => {
      it("should return 18 as default value", async () => {
        expect(await context.lsp7.decimals()).toEqual(
          ethers.BigNumber.from("18")
        );
      });
    });

    describe("authorizeOperator", () => {
      describe("when operator is not the zero address", () => {
        it("should succeed", async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const amount = context.initialSupply;

          const tx = await context.lsp7.authorizeOperator(operator, amount);

          await expect(tx).toHaveEmittedWith(
            context.lsp7,
            "AuthorizedOperator",
            [operator, tokenOwner, amount]
          );

          expect(
            await context.lsp7.isOperatorFor(operator, tokenOwner)
          ).toEqual(amount);
        });

        describe("when operator is already authorized", () => {
          beforeEach(async () => {
            await context.lsp7.authorizeOperator(
              context.accounts.operator.address,
              context.initialSupply
            );
          });

          it("should succeed", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;
            const amount = context.initialSupply.add(1);

            await context.lsp7.authorizeOperator(operator, amount);

            const tx = await context.lsp7.authorizeOperator(operator, amount);

            await expect(tx).toHaveEmittedWith(
              context.lsp7,
              "AuthorizedOperator",
              [operator, tokenOwner, amount]
            );

            expect(
              await context.lsp7.isOperatorFor(operator, tokenOwner)
            ).toEqual(amount);
          });
        });
      });

      describe("when operator is the zero address", () => {
        it("should revert", async () => {
          const operator = ethers.constants.AddressZero;

          await expect(
            context.lsp7.authorizeOperator(operator, context.initialSupply)
          ).toBeRevertedWith("LSP7CannotUseAddressZeroAsOperator()");
        });
      });
    });
  });

  describe("revokeOperator", () => {
    describe("when operator is not the zero address", () => {
      it("should succeed", async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        // pre-conditions
        await context.lsp7.authorizeOperator(operator, amount);
        expect(await context.lsp7.isOperatorFor(operator, tokenOwner)).toEqual(
          amount
        );

        // effects
        const tx = await context.lsp7.revokeOperator(operator);
        await expect(tx).toHaveEmittedWith(context.lsp7, "RevokedOperator", [
          operator,
          tokenOwner,
        ]);

        // post-conditions
        expect(await context.lsp7.isOperatorFor(operator, tokenOwner)).toEqual(
          ethers.constants.Zero
        );
      });
    });

    describe("when operator is the zero address", () => {
      it("should revert", async () => {
        const operator = ethers.constants.AddressZero;

        await expect(context.lsp7.revokeOperator(operator)).toBeRevertedWith(
          "LSP7CannotUseAddressZeroAsOperator()"
        );
      });
    });

    describe("isOperatorFor", () => {
      describe("when operator is the token owner", () => {
        it("should return the balance of the token owner", async () => {
          expect(
            await context.lsp7.isOperatorFor(
              context.accounts.owner.address,
              context.accounts.owner.address
            )
          ).toEqual(
            await context.lsp7.balanceOf(context.accounts.owner.address)
          );
        });
      });

      describe("when operator has not been authorized", () => {
        it("should return zero", async () => {
          expect(
            await context.lsp7.isOperatorFor(
              context.accounts.operator.address,
              context.accounts.owner.address
            )
          ).toEqual(ethers.constants.Zero);
        });
      });

      describe("when one account have been authorized", () => {
        it("should return the authorized amount", async () => {
          await context.lsp7.authorizeOperator(
            context.accounts.operator.address,
            context.initialSupply
          );

          expect(
            await context.lsp7.isOperatorFor(
              context.accounts.operator.address,
              context.accounts.owner.address
            )
          ).toEqual(context.initialSupply);
        });
      });

      describe("when many accounts have been authorized", () => {
        it("should return the authorized amount for each operator", async () => {
          await context.lsp7.authorizeOperator(
            context.accounts.operator.address,
            context.initialSupply
          );
          await context.lsp7.authorizeOperator(
            context.accounts.operatorWithLowAuthorizedAmount.address,
            ethers.BigNumber.from("1")
          );

          expect(
            await context.lsp7.isOperatorFor(
              context.accounts.operator.address,
              context.accounts.owner.address
            )
          ).toEqual(context.initialSupply);
          expect(
            await context.lsp7.isOperatorFor(
              context.accounts.operatorWithLowAuthorizedAmount.address,
              context.accounts.owner.address
            )
          ).toEqual(ethers.BigNumber.from("1"));
        });
      });
    });

    describe("transfers", () => {
      type HelperContracts = {
        tokenReceiverWithLSP1: TokenReceiverWithLSP1;
        tokenReceiverWithoutLSP1: TokenReceiverWithoutLSP1;
      };
      let helperContracts: HelperContracts;

      beforeEach(async () => {
        helperContracts = {
          tokenReceiverWithLSP1: await new TokenReceiverWithLSP1__factory(
            context.accounts.owner
          ).deploy(),
          tokenReceiverWithoutLSP1: await new TokenReceiverWithoutLSP1__factory(
            context.accounts.owner
          ).deploy(),
        };
      });

      beforeEach(async () => {
        // setup so we can observe operator amounts during transfer tests
        await context.lsp7.authorizeOperator(
          context.accounts.operator.address,
          context.initialSupply
        );
        await context.lsp7.authorizeOperator(
          context.accounts.operatorWithLowAuthorizedAmount.address,
          ethers.BigNumber.from("1")
        );
      });

      describe("transfer", () => {
        type TransferTxParams = {
          from: string;
          to: string;
          amount: BigNumber;
          force: boolean;
          data: string;
        };

        const transferSuccessScenario = async (
          { from, to, amount, force, data }: TransferTxParams,
          operator: SignerWithAddress
        ) => {
          // pre-conditions
          const preFromBalanceOf = await context.lsp7.balanceOf(from);
          const preToBalanceOf = await context.lsp7.balanceOf(to);
          const preIsOperatorFor = await context.lsp7.isOperatorFor(
            operator.address,
            from
          );

          // effect
          const tx = await context.lsp7
            .connect(operator)
            .transfer(from, to, amount, force, data);
          await expect(tx).toHaveEmittedWith(context.lsp7, "Transfer", [
            operator.address,
            from,
            to,
            amount,
            force,
            data,
          ]);

          // post-conditions
          const postFromBalanceOf = await context.lsp7.balanceOf(from);
          expect(postFromBalanceOf).toEqual(preFromBalanceOf.sub(amount));

          const postToBalanceOf = await context.lsp7.balanceOf(to);
          expect(postToBalanceOf).toEqual(preToBalanceOf.add(amount));

          if (operator.address !== from) {
            const postIsOperatorFor = await context.lsp7.isOperatorFor(
              operator.address,
              from
            );
            expect(postIsOperatorFor).toEqual(preIsOperatorFor.sub(amount));

            if (postIsOperatorFor.eq("0")) {
              await expect(tx).toHaveEmittedWith(
                context.lsp7,
                "RevokedOperator",
                [context.accounts.operator.address, from]
              );
            } else {
              await expect(tx).toHaveEmittedWith(
                context.lsp7,
                "AuthorizedOperator",
                [context.accounts.operator.address, from, postIsOperatorFor]
              );
            }
          }

          return tx;
        };

        const transferFailScenario = async (
          { from, to, amount, force, data }: TransferTxParams,
          operator: SignerWithAddress,
          expectedError: string
        ) => {
          await expect(
            context.lsp7
              .connect(operator)
              .transfer(from, to, amount, force, data)
          ).toBeRevertedWith(expectedError);
        };

        const sendingTransferTransactions = (
          getOperator: () => SignerWithAddress
        ) => {
          let operator: SignerWithAddress;
          beforeEach(() => {
            // passed as a thunk since other before hooks setup accounts map
            operator = getOperator();
          });

          describe("when using force=true", () => {
            const force = true;
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("doing a transfer with force")
            );

            describe("when `to` is an EOA", () => {
              describe("when `to` is not the zero address", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: context.accounts.tokenReceiver.address,
                    amount: context.initialSupply,
                    force,
                    data,
                  };

                  await transferSuccessScenario(txParams, operator);
                });
              });

              describe("when `to` is the zero address", () => {
                it("should revert", async () => {
                  const txParams = {
                    from: operator.address,
                    to: ethers.constants.AddressZero,
                    amount: context.initialSupply,
                    force: true,
                    data: ethers.utils.hexlify(
                      ethers.utils.toUtf8Bytes("should revert")
                    ),
                  };
                  const expectedError = "LSP7CannotSendWithAddressZero()";

                  await transferFailScenario(txParams, operator, expectedError);
                });
              });
            });

            describe("when `to` is a contract", () => {
              describe("when receiving contract supports LSP1", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: helperContracts.tokenReceiverWithLSP1.address,
                    amount: context.initialSupply,
                    force,
                    data,
                  };

                  const tx = await transferSuccessScenario(txParams, operator);

                  const typeId =
                    "0xdbe2c314e1aee2970c72666f2ebe8933a8575263ea71e5ff6a9178e95d47a26f";
                  const packedData = ethers.utils.solidityPack(
                    ["address", "address", "uint256", "bytes"],
                    [txParams.from, txParams.to, txParams.amount, txParams.data]
                  );

                  await expect(tx).toHaveEmittedWith(
                    helperContracts.tokenReceiverWithLSP1,
                    "UniversalReceiverCalled",
                    [typeId, packedData]
                  );
                });
              });

              describe("when receiving contract does not support LSP1", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: helperContracts.tokenReceiverWithoutLSP1.address,
                    amount: context.initialSupply,
                    force,
                    data,
                  };

                  await transferSuccessScenario(txParams, operator);
                });
              });
            });
          });

          describe("when force=false", () => {
            const force = false;
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("doing a transfer without force")
            );

            describe("when `to` is an EOA", () => {
              it("should revert", async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: context.accounts.tokenReceiver.address,
                  amount: context.initialSupply,
                  force,
                  data,
                };
                const expectedError = `LSP7NotifyTokenReceiverIsEOA("${txParams.to}")`;

                await transferFailScenario(txParams, operator, expectedError);
              });
            });

            describe("when `to` is a contract", () => {
              describe("when receiving contract supports LSP1", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: helperContracts.tokenReceiverWithLSP1.address,
                    amount: context.initialSupply,
                    force,
                    data,
                  };

                  const tx = await transferSuccessScenario(txParams, operator);

                  const typeId =
                    "0xdbe2c314e1aee2970c72666f2ebe8933a8575263ea71e5ff6a9178e95d47a26f";
                  const packedData = ethers.utils.solidityPack(
                    ["address", "address", "uint256", "bytes"],
                    [txParams.from, txParams.to, txParams.amount, txParams.data]
                  );

                  await expect(tx).toHaveEmittedWith(
                    helperContracts.tokenReceiverWithLSP1,
                    "UniversalReceiverCalled",
                    [typeId, packedData]
                  );
                });
              });

              describe("when receiving contract does not support LSP1", () => {
                it("should revert", async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: helperContracts.tokenReceiverWithoutLSP1.address,
                    amount: context.initialSupply,
                    force,
                    data,
                  };
                  const expectedError = `LSP7NotifyTokenReceiverContractMissingLSP1Interface("${txParams.to}")`;

                  await transferFailScenario(txParams, operator, expectedError);
                });
              });
            });
          });

          describe("when the given amount is more than balance of tokenOwner", () => {
            it("should revert", async () => {
              const txParams = {
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: context.initialSupply.add(1),
                force: true,
                data: ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("should revert")
                ),
              };
              const expectedError = `LSP7AmountExceedsBalance(${context.initialSupply}, "${txParams.from}", ${txParams.amount})`;

              if (txParams.from !== operator.address) {
                await context.lsp7.authorizeOperator(
                  operator.address,
                  txParams.amount
                );
              }

              await transferFailScenario(txParams, operator, expectedError);
            });
          });
        };

        describe("when tokenOwner sends tx", () => {
          sendingTransferTransactions(() => context.accounts.owner);
        });

        describe("when operator sends tx", () => {
          sendingTransferTransactions(() => context.accounts.operator);

          describe("when operator does not have enough authorized amount", () => {
            it("should revert", async () => {
              const operator = context.accounts.operatorWithLowAuthorizedAmount;
              const txParams = {
                from: context.accounts.owner.address,
                to: helperContracts.tokenReceiverWithoutLSP1.address,
                amount: context.initialSupply,
                force: true,
                data: ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("should revert")
                ),
              };
              const expectedError = `LSP7AmountExceedsAuthorizedAmount("${txParams.from}", 1, "${operator.address}", ${txParams.amount})`;

              await transferFailScenario(txParams, operator, expectedError);
            });
          });
        });

        describe("when the caller is not an operator", () => {
          it("should revert", async () => {
            const operator = context.accounts.anyone;
            const txParams = {
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              amount: context.initialSupply,
              force: true,
              data: ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes("should revert")
              ),
            };
            const expectedError = `LSP7AmountExceedsAuthorizedAmount("${txParams.from}", 0, "${operator.address}", ${txParams.amount})`;

            // pre-conditions
            expect(
              await context.lsp7.isOperatorFor(operator.address, txParams.from)
            ).toEqual(ethers.constants.Zero);

            // effects
            await transferFailScenario(txParams, operator, expectedError);
          });
        });
      });

      describe("transferBatch", () => {
        beforeEach(async () => {
          // setup so we can observe operator amounts during transferBatch tests
          await context.lsp7.authorizeOperator(
            context.accounts.operator.address,
            context.initialSupply
          );
          await context.lsp7.authorizeOperator(
            context.accounts.operatorWithLowAuthorizedAmount.address,
            ethers.BigNumber.from("1")
          );
        });

        type TransferBatchTxParams = {
          from: string[];
          to: string[];
          amount: BigNumber[];
          force: boolean;
          data: string[];
        };

        const transferBatchSuccessScenario = async (
          { from, to, amount, force, data }: TransferBatchTxParams,
          operator: SignerWithAddress
        ) => {
          // pre-conditions
          await Promise.all(
            amount.map((_, index) => async () => {
              const preBalanceOf = await context.lsp7.balanceOf(to[index]);
              expect(preBalanceOf).toEqual(ethers.constants.Zero);
            })
          );

          // effect
          const tx = await context.lsp7
            .connect(operator)
            .transferBatch(from, to, amount, force, data);

          await Promise.all(
            amount.map(async (_, index) => {
              await expect(tx).toHaveEmittedWith(context.lsp7, "Transfer", [
                operator.address,
                from[index],
                to[index],
                amount[index],
                force,
                data[index],
              ]);
            })
          );

          // post-conditions
          await Promise.all(
            amount.map((_, index) => async () => {
              const postBalanceOf = await context.lsp7.balanceOf(to[index]);
              expect(postBalanceOf).toEqual(amount[index]);

              if (operator.address !== from[index]) {
                const postIsOperatorFor = await context.lsp7.isOperatorFor(
                  operator.address,
                  from[index]
                );
                expect(postIsOperatorFor).toEqual(
                  postIsOperatorFor.sub(amount[index])
                );

                if (postIsOperatorFor.eq("0")) {
                  await expect(tx).toHaveEmittedWith(
                    context.lsp7,
                    "RevokedOperator",
                    [
                      context.accounts.operator.address,
                      from[index],
                      postIsOperatorFor,
                    ]
                  );
                } else {
                  await expect(tx).toHaveEmittedWith(
                    context.lsp7,
                    "AuthorizedOperator",
                    [context.accounts.operator.address, from, postIsOperatorFor]
                  );
                }
              }
            })
          );

          return tx;
        };

        const transferBatchFailScenario = async (
          { from, to, amount, force, data }: TransferBatchTxParams,
          operator: SignerWithAddress,
          expectedError: string
        ) => {
          await expect(
            context.lsp7
              .connect(operator)
              .transferBatch(from, to, amount, force, data)
          ).toBeRevertedWith(expectedError);
        };

        const sendingTransferBatchTransactions = (
          getOperator: () => SignerWithAddress
        ) => {
          let operator: SignerWithAddress;
          beforeEach(() => {
            // passed as a thunk since other before hooks setup accounts map
            operator = getOperator();
          });

          describe("when using force=true", () => {
            const force = true;
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("doing a transfer with force")
            );

            describe("when `to` is an EOA", () => {
              describe("when `to` is the zero address", () => {
                it("should revert", async () => {
                  const txParams = {
                    from: [
                      context.accounts.owner.address,
                      context.accounts.owner.address,
                    ],
                    to: [
                      context.accounts.tokenReceiver.address,
                      ethers.constants.AddressZero,
                    ],
                    amount: [
                      context.initialSupply.sub(1),
                      ethers.BigNumber.from("1"),
                    ],
                    force,
                    data: [data, data],
                  };
                  const expectedError = "LSP7CannotSendWithAddressZero()";

                  await transferBatchFailScenario(
                    txParams,
                    operator,
                    expectedError
                  );
                });
              });

              describe("when `to` is not the zero address", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: [
                      context.accounts.owner.address,
                      context.accounts.owner.address,
                    ],
                    to: [
                      context.accounts.tokenReceiver.address,
                      context.accounts.anotherTokenReceiver.address,
                    ],
                    amount: [
                      context.initialSupply.sub(1),
                      ethers.BigNumber.from("1"),
                    ],
                    force,
                    data: [data, data],
                  };

                  await transferBatchSuccessScenario(txParams, operator);
                });
              });
            });

            describe("when `to` is a contract", () => {
              describe("when receiving contract supports LSP1", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: [
                      context.accounts.owner.address,
                      context.accounts.owner.address,
                    ],
                    to: [
                      helperContracts.tokenReceiverWithLSP1.address,
                      helperContracts.tokenReceiverWithLSP1.address,
                    ],
                    amount: [
                      context.initialSupply.sub(1),
                      ethers.BigNumber.from("1"),
                    ],
                    force,
                    data: [data, data],
                  };

                  const tx = await transferBatchSuccessScenario(
                    txParams,
                    operator
                  );

                  await Promise.all(
                    txParams.amount.map((_, index) => async () => {
                      const typeId =
                        "0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895";
                      const packedData = ethers.utils.solidityPack(
                        ["address", "address", "uint256", "bytes"],
                        [
                          txParams.from[index],
                          txParams.to[index],
                          txParams.amount[index],
                          txParams.data[index],
                        ]
                      );

                      await expect(tx).toHaveEmittedWith(
                        helperContracts.tokenReceiverWithLSP1,
                        "UniversalReceiverCalled",
                        [typeId, packedData]
                      );
                    })
                  );
                });
              });

              describe("when receiving contract does not support LSP1", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: [
                      context.accounts.owner.address,
                      context.accounts.owner.address,
                    ],
                    to: [
                      helperContracts.tokenReceiverWithoutLSP1.address,
                      helperContracts.tokenReceiverWithoutLSP1.address,
                    ],
                    amount: [
                      context.initialSupply.sub(1),
                      ethers.BigNumber.from("1"),
                    ],
                    force,
                    data: [data, data],
                  };

                  await transferBatchSuccessScenario(txParams, operator);
                });
              });
            });
          });

          describe("when force=false", () => {
            const force = false;
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("doing a transfer without force")
            );

            describe("when `to` is an EOA", () => {
              it("should revert", async () => {
                const txParams = {
                  from: [
                    context.accounts.owner.address,
                    context.accounts.owner.address,
                  ],
                  to: [
                    context.accounts.tokenReceiver.address,
                    context.accounts.anotherTokenReceiver.address,
                  ],
                  amount: [
                    context.initialSupply.sub(1),
                    ethers.BigNumber.from("1"),
                  ],
                  force,
                  data: [data, data],
                };
                const expectedError = `LSP7NotifyTokenReceiverIsEOA("${txParams.to[0]}")`;

                await transferBatchFailScenario(
                  txParams,
                  operator,
                  expectedError
                );
              });
            });

            describe("when `to` is a contract", () => {
              describe("when receiving contract supports LSP1", () => {
                it("should allow transfering", async () => {
                  const txParams = {
                    from: [
                      context.accounts.owner.address,
                      context.accounts.owner.address,
                    ],
                    to: [
                      helperContracts.tokenReceiverWithLSP1.address,
                      helperContracts.tokenReceiverWithLSP1.address,
                    ],
                    amount: [
                      context.initialSupply.sub(1),
                      ethers.BigNumber.from("1"),
                    ],
                    force,
                    data: [data, data],
                  };

                  await transferBatchSuccessScenario(txParams, operator);
                });
              });

              describe("when receiving contract does not support LSP1", () => {
                it("should revert", async () => {
                  const txParams = {
                    from: [
                      context.accounts.owner.address,
                      context.accounts.owner.address,
                    ],
                    to: [
                      helperContracts.tokenReceiverWithoutLSP1.address,
                      helperContracts.tokenReceiverWithoutLSP1.address,
                    ],
                    amount: [
                      context.initialSupply.sub(1),
                      ethers.BigNumber.from("1"),
                    ],
                    force,
                    data: [data, data],
                  };
                  const expectedError = `LSP7NotifyTokenReceiverContractMissingLSP1Interface("${txParams.to[0]}")`;

                  await transferBatchFailScenario(
                    txParams,
                    operator,
                    expectedError
                  );
                });
              });
            });
          });

          describe("when the given amount is more than balance of tokenOwner", () => {
            it("should revert", async () => {
              const txParams = {
                from: [context.accounts.owner.address],
                to: [context.accounts.tokenReceiver.address],
                amount: [context.initialSupply.add(1)],
                force: true,
                data: [
                  ethers.utils.hexlify(
                    ethers.utils.toUtf8Bytes("should revert")
                  ),
                ],
              };
              const expectedError = `LSP7AmountExceedsBalance(${context.initialSupply}, "${txParams.from[0]}", ${txParams.amount[0]})`;

              if (
                txParams.from.filter((x) => x !== operator.address).length !== 0
              ) {
                const totalAmount = txParams.amount.reduce(
                  (acc, amount) => acc.add(amount),
                  ethers.BigNumber.from("0")
                );
                await context.lsp7.authorizeOperator(
                  operator.address,
                  totalAmount
                );
              }

              await transferBatchFailScenario(
                txParams,
                operator,
                expectedError
              );
            });
          });

          describe("when function parameters list length does not match", () => {
            it("should revert", async () => {
              const validTxParams = {
                from: [
                  context.accounts.owner.address,
                  context.accounts.owner.address,
                ],
                to: [
                  context.accounts.tokenReceiver.address,
                  context.accounts.tokenReceiver.address,
                ],
                amount: [
                  context.initialSupply.sub(1),
                  ethers.BigNumber.from("1"),
                ],
                force: true,
                data: [
                  ethers.utils.toUtf8Bytes("should revert"),
                  ethers.utils.toUtf8Bytes("should revert"),
                ],
              };

              await Promise.all(
                ["from", "to", "amount", "data"].map(async (arrayParam) => {
                  await transferBatchFailScenario(
                    {
                      ...validTxParams,
                      [`${arrayParam}`]: [validTxParams[arrayParam][0]],
                    },
                    operator,
                    "LSP7InvalidTransferBatch()"
                  );
                })
              );
            });
          });
        };

        describe("when tokenOwner sends tx", () => {
          sendingTransferBatchTransactions(() => context.accounts.owner);
        });

        describe("when operator sends tx", () => {
          sendingTransferBatchTransactions(() => context.accounts.operator);

          describe("when operator does not have enough authorized amount", () => {
            it("should revert", async () => {
              const operator = context.accounts.operatorWithLowAuthorizedAmount;
              const txParams = {
                from: [context.accounts.owner.address],
                to: [context.accounts.tokenReceiver.address],
                amount: [context.initialSupply],
                force: true,
                data: [ethers.utils.toUtf8Bytes("should revert")],
              };
              const expectedError = `LSP7AmountExceedsAuthorizedAmount("${txParams.from[0]}", 1, "${operator.address}", ${txParams.amount[0]})`;

              await transferBatchFailScenario(
                txParams,
                operator,
                expectedError
              );
            });
          });

          describe("when the caller is not an operator", () => {
            it("should revert", async () => {
              const operator = context.accounts.anyone;
              const txParams = {
                from: [context.accounts.owner.address],
                to: [context.accounts.tokenReceiver.address],
                amount: [context.initialSupply],
                force: true,
                data: [
                  ethers.utils.hexlify(
                    ethers.utils.toUtf8Bytes("should revert")
                  ),
                ],
              };
              const expectedError = `LSP7AmountExceedsAuthorizedAmount("${txParams.from[0]}", 0, "${operator.address}", ${txParams.amount[0]})`;

              await transferBatchFailScenario(
                txParams,
                operator,
                expectedError
              );
            });
          });
        });
      });
    });
  });
};

export type LSP7InitializeTestContext = {
  lsp7: LSP7DigitalAsset;
  deployParams: LSP7DeployParams;
  initializeTransaction: TransactionResponse;
};

export const shouldInitializeLikeLSP7 = (
  buildContext: () => Promise<LSP7InitializeTestContext>
) => {
  let context: LSP7InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should have registered the ERC165 interface", async () => {
      expect(await context.lsp7.supportsInterface(INTERFACE_IDS.ERC165));
    });

    it("should have registered the ERC725Y interface", async () => {
      expect(await context.lsp7.supportsInterface(INTERFACE_IDS.ERC725Y));
    });

    it("should have registered the LSP7 interface", async () => {
      expect(
        await context.lsp7.supportsInterface(INTERFACE_IDS.LSP7DigitalAsset)
      );
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp7,
        "DataChanged",
        [
          SupportedStandards.LSP4DigitalAsset.key
        ]
      );
      expect(
        await context.lsp7["getData(bytes32)"](
          SupportedStandards.LSP4DigitalAsset.key
        )
      ).toEqual(SupportedStandards.LSP4DigitalAsset.value);

      const nameKey = ERC725YKeys.LSP4["LSP4TokenName"];
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name)
      );
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp7,
        "DataChanged",
        [nameKey]
      );
      expect(await context.lsp7["getData(bytes32)"](nameKey)).toEqual(
        expectedNameValue
      );

      const symbolKey = ERC725YKeys.LSP4["LSP4TokenSymbol"];
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol)
      );
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp7,
        "DataChanged",
        [symbolKey]
      );
      expect(await context.lsp7["getData(bytes32)"](symbolKey)).toEqual(
        expectedSymbolValue
      );
    });
  });
};
