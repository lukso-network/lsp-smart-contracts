import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { INTERFACE_IDS, SupportedStandards } from "../../../constants";
import {
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from "../../../types";

type LSP7CompatibilityForERC20TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts =
  async (): Promise<LSP7CompatibilityForERC20TestAccounts> => {
    const [owner, tokenReceiver, operator, anotherOperator, anyone] =
      await ethers.getSigners();
    return { owner, tokenReceiver, operator, anotherOperator, anyone };
  };

export type LSP7CompatibilityForERC20DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP7CompatibilityForERC20TestContext = {
  accounts: LSP7CompatibilityForERC20TestAccounts;
  lsp7CompatibilityForERC20: LSP7CompatibilityForERC20Tester;
  deployParams: LSP7CompatibilityForERC20DeployParams;
  initialSupply: BigNumber;
};

export const shouldBehaveLikeLSP7CompatibilityForERC20 = (
  buildContext: () => Promise<LSP7CompatibilityForERC20TestContext>
) => {
  let context: LSP7CompatibilityForERC20TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("approve", () => {
    describe("when operator is the zero address", () => {
      it("should revert", async () => {
        await expect(
          context.lsp7CompatibilityForERC20.approve(
            ethers.constants.AddressZero,
            context.initialSupply
          )
        ).toBeRevertedWith("LSP7CannotUseAddressZeroAsOperator()");
      });
    });

    describe("when the operator had no authorized amount", () => {
      it("should succeed by setting the given amount", async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const authorizedAmount = "1";

        const preAllowance = await context.lsp7CompatibilityForERC20.allowance(
          tokenOwner,
          operator
        );
        expect(preAllowance.toString()).toEqual("0");

        const tx = await context.lsp7CompatibilityForERC20.approve(
          operator,
          authorizedAmount
        );
        await expect(tx).toHaveEmittedWith(
          context.lsp7CompatibilityForERC20,
          "AuthorizedOperator",
          [operator, tokenOwner, authorizedAmount]
        );
        await expect(tx).toHaveEmittedWith(
          context.lsp7CompatibilityForERC20,
          "Approval",
          [tokenOwner, operator, authorizedAmount]
        );

        const postAllowance = await context.lsp7CompatibilityForERC20.allowance(
          tokenOwner,
          operator
        );
        expect(postAllowance.toString()).toEqual(authorizedAmount);
      });
    });

    describe("when the operator had an authorized amount", () => {
      describe("when the operator authorized amount is changed to another non-zero value", () => {
        it("should succeed by replacing the existing amount with the given amount", async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const previouslyAuthorizedAmount = "20";
          const authorizedAmount = "1";

          await context.lsp7CompatibilityForERC20.approve(
            operator,
            previouslyAuthorizedAmount
          );

          const preAllowance =
            await context.lsp7CompatibilityForERC20.allowance(
              tokenOwner,
              operator
            );
          expect(preAllowance.toString()).toEqual(previouslyAuthorizedAmount);

          const tx = await context.lsp7CompatibilityForERC20.approve(
            operator,
            authorizedAmount
          );
          await expect(tx).toHaveEmittedWith(
            context.lsp7CompatibilityForERC20,
            "AuthorizedOperator",
            [operator, tokenOwner, authorizedAmount]
          );
          await expect(tx).toHaveEmittedWith(
            context.lsp7CompatibilityForERC20,
            "Approval",
            [tokenOwner, operator, authorizedAmount]
          );

          const postAllowance =
            await context.lsp7CompatibilityForERC20.allowance(
              tokenOwner,
              operator
            );
          expect(postAllowance.toString()).toEqual(authorizedAmount);
        });
      });

      describe("when the operator authorized amount is changed to zero", () => {
        it("should succeed by replacing the existing amount with the given amount", async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const previouslyAuthorizedAmount = "20";
          const authorizedAmount = "0";

          await context.lsp7CompatibilityForERC20.approve(
            operator,
            previouslyAuthorizedAmount
          );

          const preAllowance =
            await context.lsp7CompatibilityForERC20.allowance(
              tokenOwner,
              operator
            );
          expect(preAllowance.toString()).toEqual(previouslyAuthorizedAmount);

          const tx = await context.lsp7CompatibilityForERC20.approve(
            operator,
            authorizedAmount
          );
          await expect(tx).toHaveEmittedWith(
            context.lsp7CompatibilityForERC20,
            "RevokedOperator",
            [operator, tokenOwner]
          );
          await expect(tx).toHaveEmittedWith(
            context.lsp7CompatibilityForERC20,
            "Approval",
            [tokenOwner, operator, authorizedAmount]
          );

          const postAllowance =
            await context.lsp7CompatibilityForERC20.allowance(
              tokenOwner,
              operator
            );
          expect(postAllowance.toString()).toEqual(authorizedAmount);
        });
      });
    });
  });

  describe("allowance", () => {
    describe("when operator has been approved", () => {
      it("should return approval amount", async () => {
        await context.lsp7CompatibilityForERC20.approve(
          context.accounts.operator.address,
          context.initialSupply
        );

        expect(
          await context.lsp7CompatibilityForERC20.allowance(
            context.accounts.owner.address,
            context.accounts.operator.address
          )
        ).toEqual(context.initialSupply);
      });
    });

    describe("when operator has not been approved", () => {
      it("should return zero", async () => {
        expect(
          await context.lsp7CompatibilityForERC20.allowance(
            context.accounts.owner.address,
            context.accounts.anyone.address
          )
        ).toEqual(ethers.constants.Zero);
      });
    });
  });

  describe("mint", () => {
    describe("when a token is minted", () => {
      it("should have expected events", async () => {
        const txParams = {
          to: context.accounts.owner.address,
          amount: context.initialSupply,
          data: ethers.utils.toUtf8Bytes("mint tokens for the owner"),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp7CompatibilityForERC20
          .connect(operator)
          .mint(txParams.to, txParams.amount, txParams.data);

        await expect(tx).toHaveEmittedWith(
          context.lsp7CompatibilityForERC20,
          "Transfer(address,address,address,uint256,bool,bytes)",
          [
            operator.address,
            ethers.constants.AddressZero,
            txParams.to,
            txParams.amount,
            true,
            ethers.utils.hexlify(txParams.data),
          ]
        );
        await expect(tx).toHaveEmittedWith(
          context.lsp7CompatibilityForERC20,
          "Transfer(address,address,uint256)",
          [ethers.constants.AddressZero, txParams.to, txParams.amount]
        );
      });
    });
  });

  describe("burn", () => {
    describe("when a token is burned", () => {
      beforeEach(async () => {
        await context.lsp7CompatibilityForERC20.mint(
          context.accounts.owner.address,
          context.initialSupply,
          ethers.utils.toUtf8Bytes("mint tokens for owner")
        );
      });

      it("should have expected events", async () => {
        const txParams = {
          from: context.accounts.owner.address,
          amount: context.initialSupply,
          data: ethers.utils.toUtf8Bytes("burn tokens from the owner"),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp7CompatibilityForERC20
          .connect(operator)
          .burn(txParams.from, txParams.amount, txParams.data);

        await expect(tx).toHaveEmittedWith(
          context.lsp7CompatibilityForERC20,
          "Transfer(address,address,address,uint256,bool,bytes)",
          [
            operator.address,
            txParams.from,
            ethers.constants.AddressZero,
            txParams.amount,
            false,
            ethers.utils.hexlify(txParams.data),
          ]
        );
        await expect(tx).toHaveEmittedWith(
          context.lsp7CompatibilityForERC20,
          "Transfer(address,address,uint256)",
          [txParams.from, ethers.constants.AddressZero, txParams.amount]
        );
      });
    });
  });

  describe("transfers", () => {
    type TestDeployedContracts = {
      tokenReceiverWithLSP1: TokenReceiverWithLSP1;
      tokenReceiverWithoutLSP1: TokenReceiverWithoutLSP1;
    };
    let deployedContracts: TestDeployedContracts;

    beforeEach(async () => {
      deployedContracts = {
        tokenReceiverWithLSP1: await new TokenReceiverWithLSP1__factory(
          context.accounts.owner
        ).deploy(),
        tokenReceiverWithoutLSP1: await new TokenReceiverWithoutLSP1__factory(
          context.accounts.owner
        ).deploy(),
      };
    });

    beforeEach(async () => {
      // setup so we have tokens to transfer
      await context.lsp7CompatibilityForERC20.mint(
        context.accounts.owner.address,
        context.initialSupply,
        ethers.utils.toUtf8Bytes("mint tokens for the owner")
      );

      // setup so we can observe allowance values during transfer tests
      await context.lsp7CompatibilityForERC20.approve(
        context.accounts.operator.address,
        context.initialSupply
      );
    });

    type TransferParams = {
      operator: string;
      from: string;
      to: string;
      amount: BigNumber;
    };

    const transferSuccessScenario = async (
      { operator, from, to, amount }: TransferParams,
      sendTransaction: () => Promise<ContractTransaction>,
      expectedData: string
    ) => {
      // pre-conditions
      const preBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(
        from
      );
      const preAllowance = await context.lsp7CompatibilityForERC20.allowance(
        from,
        operator
      );

      // effect
      const tx = await sendTransaction();
      await expect(tx).toHaveEmittedWith(
        context.lsp7CompatibilityForERC20,
        "Transfer(address,address,address,uint256,bool,bytes)",
        [
          operator,
          from,
          to,
          amount,
          true, // Using force=true so that EOA and any contract may receive the tokens.
          expectedData,
        ]
      );

      await expect(tx).toHaveEmittedWith(
        context.lsp7CompatibilityForERC20,
        "Transfer(address,address,uint256)",
        [from, to, amount]
      );

      // post-conditions
      const postBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(
        from
      );
      expect(postBalanceOf).toEqual(preBalanceOf.sub(amount));

      if (operator !== from) {
        const postAllowance = await context.lsp7CompatibilityForERC20.allowance(
          from,
          operator
        );
        expect(postAllowance).toEqual(preAllowance.sub(amount));
      }
    };

    const transferFailScenario = async (
      { from }: TransferParams,
      sendTransaction: () => Promise<ContractTransaction>,
      expectedError: string
    ) => {
      // pre-conditions
      const preBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(
        from
      );

      // effect
      await expect(sendTransaction()).toBeRevertedWith(expectedError);

      // post-conditions
      const postBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(
        from
      );
      expect(postBalanceOf).toEqual(preBalanceOf);
    };

    [
      {
        transferFn: "transfer",
        sendTransaction: (
          lsp7CompatibilityForERC20: LSP7CompatibilityForERC20Tester,
          txParams: TransferParams
        ) => {
          return lsp7CompatibilityForERC20["transfer(address,uint256)"](
            txParams.to,
            txParams.amount
          );
        },
        expectedData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("")),
      },
      {
        transferFn: "transferFrom",
        sendTransaction: (
          lsp7CompatibilityForERC20: LSP7CompatibilityForERC20Tester,
          txParams: TransferParams
        ) => {
          return lsp7CompatibilityForERC20.transferFrom(
            txParams.from,
            txParams.to,
            txParams.amount
          );
        },
        expectedData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("")),
      },
    ].forEach(({ transferFn, sendTransaction, expectedData }) => {
      describe(transferFn, () => {
        describe("when sender has enough balance", () => {
          describe("when `to` is an EOA", () => {
            it("should allow transfering the tokenId", async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: context.initialSupply,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  sendTransaction(context.lsp7CompatibilityForERC20, txParams),
                expectedData
              );
            });
          });

          describe("when `to` is a contract", () => {
            describe("when receiving contract supports LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: context.initialSupply,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    sendTransaction(
                      context.lsp7CompatibilityForERC20,
                      txParams
                    ),
                  expectedData
                );
              });
            });

            describe("when receiving contract does not support LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: context.initialSupply,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    sendTransaction(
                      context.lsp7CompatibilityForERC20,
                      txParams
                    ),
                  expectedData
                );
              });
            });
          });
        });

        describe("when sender does not have enough balance", () => {
          it("should revert", async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: deployedContracts.tokenReceiverWithoutLSP1.address,
              amount: context.initialSupply.add(1),
            };
            const expectedError = `LSP7AmountExceedsBalance(${context.initialSupply}, "${txParams.from}", ${txParams.amount})`;

            await transferFailScenario(
              txParams,
              () =>
                sendTransaction(context.lsp7CompatibilityForERC20, txParams),
              expectedError
            );
          });
        });
      });
    });
  });
};

export type LSP7InitializeTestContext = {
  lsp7CompatibilityForERC20: LSP7CompatibilityForERC20;
  deployParams: LSP7CompatibilityForERC20DeployParams;
  initializeTransaction: TransactionResponse;
};

export const shouldInitializeLikeLSP7CompatibilityForERC20 = (
  buildContext: () => Promise<LSP7InitializeTestContext>
) => {
  let context: LSP7InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should have registered its ERC165 interface", async () => {
      expect(
        await context.lsp7CompatibilityForERC20.supportsInterface(
          INTERFACE_IDS.LSP7DigitalAsset
        )
      );
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp7CompatibilityForERC20,
        "DataChanged",
        [
          SupportedStandards.LSP4DigitalAsset.key
        ]
      );
      expect(
        await context.lsp7CompatibilityForERC20["getData(bytes32)"](
          SupportedStandards.LSP4DigitalAsset.key
        )
      ).toEqual(SupportedStandards.LSP4DigitalAsset.value);

      const nameKey =
        "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1";
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name)
      );
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp7CompatibilityForERC20,
        "DataChanged",
        [nameKey]
      );
      expect(
        await context.lsp7CompatibilityForERC20["getData(bytes32)"](nameKey)
      ).toEqual(expectedNameValue);

      const symbolKey =
        "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756";
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol)
      );
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp7CompatibilityForERC20,
        "DataChanged",
        [symbolKey]
      );
      expect(
        await context.lsp7CompatibilityForERC20["getData(bytes32)"](symbolKey)
      ).toEqual(expectedSymbolValue);
    });
  });
};
