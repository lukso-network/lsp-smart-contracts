import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  LSP7CompatibilityForERC20Tester,
  LSP7CompatibilityForERC20Tester__factory,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from "../../../build/types";

import type { BigNumber, ContractTransaction } from "ethers";

type LSP7CompatibilityForERC20TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

const getNamedAccounts = async (): Promise<LSP7CompatibilityForERC20TestAccounts> => {
  const [owner, tokenReceiver, operator, anotherOperator, anyone] = await ethers.getSigners();
  return { owner, tokenReceiver, operator, anotherOperator, anyone };
};

type LSP7CompatibilityForERC20TestContext = {
  accounts: LSP7CompatibilityForERC20TestAccounts;
  lsp7CompatibilityForERC20: LSP7CompatibilityForERC20Tester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
  };
  initialSupply: BigNumber;
};

const buildTestContext = async (): Promise<LSP7CompatibilityForERC20TestContext> => {
  const accounts = await getNamedAccounts();
  const initialSupply = ethers.BigNumber.from("3");
  const deployParams = {
    name: "Compat for ERC20",
    symbol: "NFT",
    newOwner: accounts.owner.address,
  };

  const lsp7CompatibilityForERC20 = await new LSP7CompatibilityForERC20Tester__factory(
    accounts.owner
  ).deploy(deployParams.name, deployParams.symbol, deployParams.newOwner);

  await lsp7CompatibilityForERC20.mint(
    accounts.owner.address,
    initialSupply,
    ethers.utils.toUtf8Bytes("mint tokens for the owner")
  );

  return { accounts, lsp7CompatibilityForERC20, deployParams, initialSupply };
};

describe("LSP7CompatibilityForERC20", () => {
  let context: LSP7CompatibilityForERC20TestContext;
  beforeEach(async () => {
    context = await buildTestContext();
  });

  describe("approve", () => {
    describe("when operator is the zero address", () => {
      it("should revert", async () => {
        await expect(
          context.lsp7CompatibilityForERC20.approve(
            ethers.constants.AddressZero,
            context.initialSupply
          )
        ).toBeRevertedWith("LSP7: updating operator failed, operator can not be zero address");
      });
    });

    describe("when operator is the same as caller", () => {
      it("should revert", async () => {
        await expect(
          context.lsp7CompatibilityForERC20.approve(
            context.accounts.owner.address,
            context.initialSupply
          )
        ).toBeRevertedWith("LSP7: updating operator failed, can not use token owner as operator");
      });
    });

    describe("when the operator is different than the caller", () => {
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

          const tx = await context.lsp7CompatibilityForERC20.approve(operator, authorizedAmount);
          await expect(tx).toHaveEmittedWith(
            context.lsp7CompatibilityForERC20,
            "AuthorizedOperator",
            [operator, tokenOwner, authorizedAmount]
          );

          const postAllowance = await context.lsp7CompatibilityForERC20.allowance(
            tokenOwner,
            operator
          );
          expect(postAllowance.toString()).toEqual(authorizedAmount);
        });
      });

      describe("when the operator had an authorized amount", () => {
        it("should succeed by replacing the existing amount with the given amount", async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const previouslyAuthorizedAmount = "20";
          const authorizedAmount = "1";

          await context.lsp7CompatibilityForERC20.approve(operator, previouslyAuthorizedAmount);

          const preAllowance = await context.lsp7CompatibilityForERC20.allowance(
            tokenOwner,
            operator
          );
          expect(preAllowance.toString()).toEqual(previouslyAuthorizedAmount);

          const tx = await context.lsp7CompatibilityForERC20.approve(operator, authorizedAmount);
          await expect(tx).toHaveEmittedWith(
            context.lsp7CompatibilityForERC20,
            "AuthorizedOperator",
            [operator, tokenOwner, authorizedAmount]
          );

          const postAllowance = await context.lsp7CompatibilityForERC20.allowance(
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
      // setup so we can observe allowance values during transfer tests
      await context.lsp7CompatibilityForERC20.approve(
        context.accounts.operator.address,
        context.initialSupply
      );
    });

    type TransferParams = { operator: string; from: string; to: string; amount: BigNumber };

    const transferSuccessScenario = async (
      { operator, from, to, amount }: TransferParams,
      sendTransaction: () => Promise<ContractTransaction>,
      expectedData: string
    ) => {
      // pre-conditions
      const preBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(from);
      const preAllowance = await context.lsp7CompatibilityForERC20.allowance(from, operator);

      // effect
      const tx = await sendTransaction();
      expect(tx).toHaveEmittedWith(context.lsp7CompatibilityForERC20, "Transfer", [
        operator,
        from,
        to,
        amount,
        true, // Using force=true so that EOA and any contract may receive the tokens.
        expectedData,
      ]);

      // post-conditions
      const postBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(from);
      expect(postBalanceOf).toEqual(preBalanceOf.sub(amount));

      if (operator !== from) {
        const postAllowance = await context.lsp7CompatibilityForERC20.allowance(from, operator);
        expect(postAllowance).toEqual(preAllowance.sub(amount));
      }
    };

    const transferFailScenario = async (
      { from }: TransferParams,
      sendTransaction: () => Promise<ContractTransaction>,
      expectedError: string
    ) => {
      // pre-conditions
      const preBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(from);

      // effect
      await expect(sendTransaction()).toBeRevertedWith(expectedError);

      // post-conditions
      const postBalanceOf = await context.lsp7CompatibilityForERC20.balanceOf(from);
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
        expectedData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("compat-transfer")),
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
        expectedData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("compat-transferFrom")),
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
                () => sendTransaction(context.lsp7CompatibilityForERC20, txParams),
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
                  () => sendTransaction(context.lsp7CompatibilityForERC20, txParams),
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
                  () => sendTransaction(context.lsp7CompatibilityForERC20, txParams),
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
            const expectedError = "LSP7: transfer amount exceeds tokenOwner balance";

            await transferFailScenario(
              txParams,
              () => sendTransaction(context.lsp7CompatibilityForERC20, txParams),
              expectedError
            );
          });
        });
      });
    });
  });
});
