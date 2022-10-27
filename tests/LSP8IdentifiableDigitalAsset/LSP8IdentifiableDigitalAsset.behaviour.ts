import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { BytesLike } from "ethers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

// types
import {
  LSP8IdentifiableDigitalAsset,
  LSP8Tester,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from "../../types";

// helpers
import { tokenIdAsBytes32 } from "../utils/tokens";

// constants
import {
  ERC725YKeys,
  INTERFACE_IDS,
  LSP1_TYPE_IDS,
  SupportedStandards,
} from "../../constants";

export type LSP8TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8TestAccounts> => {
  const [owner, tokenReceiver, operator, anotherOperator, anyone] =
    await ethers.getSigners();
  return { owner, tokenReceiver, operator, anotherOperator, anyone };
};

export type LSP8DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP8TestContext = {
  accounts: LSP8TestAccounts;
  lsp8: LSP8Tester;
  deployParams: LSP8DeployParams;
};

export type ExpectedError = {
  error: string;
  args: string[];
};

const mintedTokenId = tokenIdAsBytes32(10);
const neverMintedTokenId = tokenIdAsBytes32(1010110);

export const shouldBehaveLikeLSP8 = (
  buildContext: () => Promise<LSP8TestContext>
) => {
  let context: LSP8TestContext;

  beforeEach(async () => {
    context = await buildContext();
    await context.lsp8.mint(
      context.accounts.owner.address,
      mintedTokenId,
      true,
      ethers.utils.toUtf8Bytes("mint a token for the owner")
    );
  });

  describe("when minting tokens", () => {
    describe("when tokenId has already been minted", () => {
      it("should revert", async () => {
        const txParams = {
          to: context.accounts.tokenReceiver.address,
          tokenId: mintedTokenId,
          force: true,
          data: "0x",
        };

        await expect(
          context.lsp8.mint(
            txParams.to,
            txParams.tokenId,
            txParams.force,
            txParams.data
          )
        )
          .to.be.revertedWithCustomError(
            context.lsp8,
            "LSP8TokenIdAlreadyMinted"
          )
          .withArgs(txParams.tokenId);
      });
    });

    describe("when tokenId has not been minted", () => {
      const toBeMintedTokenId = tokenIdAsBytes32("2020202020");

      describe("when `to` is the zero address", () => {
        it("should revert", async () => {
          const txParams = {
            to: ethers.constants.AddressZero,
            tokenId: toBeMintedTokenId,
            force: true,
            data: "0x",
          };

          await expect(
            context.lsp8.mint(
              txParams.to,
              txParams.tokenId,
              txParams.force,
              txParams.data
            )
          ).to.be.revertedWithCustomError(
            context.lsp8,
            "LSP8CannotSendToAddressZero"
          );
        });
      });

      describe("when `to` is not the zero address", () => {
        it("should mint the token", async () => {
          const txParams = {
            to: context.accounts.tokenReceiver.address,
            tokenId: toBeMintedTokenId,
            force: true,
            data: ethers.utils.toUtf8Bytes("we need more tokens"),
          };

          await context.lsp8.mint(
            txParams.to,
            txParams.tokenId,
            txParams.force,
            txParams.data
          );

          const tokenOwnerOf = await context.lsp8.tokenOwnerOf(
            txParams.tokenId
          );
          expect(tokenOwnerOf).to.equal(txParams.to);
        });
      });
    });
  });

  describe("totalSupply", () => {
    it("should return total token supply", async () => {
      expect(await context.lsp8.totalSupply()).to.equal(
        ethers.BigNumber.from("1")
      );
    });
  });

  describe("balanceOf", () => {
    describe("when the given address owns tokens", () => {
      it("should return the owned token count", async () => {
        expect(
          await context.lsp8.balanceOf(context.accounts.owner.address)
        ).to.equal(ethers.BigNumber.from("1"));
      });
    });

    describe("when the given address does not own tokens", () => {
      it("should return zero", async () => {
        expect(
          await context.lsp8.balanceOf(context.accounts.anyone.address)
        ).to.equal(ethers.BigNumber.from("0"));
      });
    });
  });

  describe("tokenOwnerOf", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(context.lsp8.tokenOwnerOf(neverMintedTokenId))
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NonExistentTokenId")
          .withArgs(neverMintedTokenId);
      });
    });

    describe("when tokenId has been minted", () => {
      it("should return owner address", async () => {
        expect(await context.lsp8.tokenOwnerOf(mintedTokenId)).to.equal(
          context.accounts.owner.address
        );
      });
    });
  });

  describe("tokenIdsOf", () => {
    describe("when the given address owns some tokens", () => {
      it("should return the list of owned tokenIds", async () => {
        expect(
          await context.lsp8.tokenIdsOf(context.accounts.owner.address)
        ).to.be.deep.equal([mintedTokenId]);
      });
    });

    describe("when the given address does not owns some tokens", () => {
      it("should return an empty list", async () => {
        expect(
          await context.lsp8.tokenIdsOf(context.accounts.anyone.address)
        ).to.be.deep.equal([]);
      });
    });
  });

  describe("authorizeOperator", () => {
    describe("when tokenId does not exist", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8.authorizeOperator(
            context.accounts.operator.address,
            neverMintedTokenId
          )
        )
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NonExistentTokenId")
          .withArgs(neverMintedTokenId);
      });
    });

    describe("when caller is not owner of tokenId", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8
            .connect(context.accounts.anyone)
            .authorizeOperator(context.accounts.operator.address, mintedTokenId)
        )
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NotTokenOwner")
          .withArgs(
            context.accounts.owner.address,
            mintedTokenId,
            context.accounts.anyone.address
          );
      });
    });

    describe("when caller is owner of tokenId", () => {
      describe("when operator is not the zero address", () => {
        it("should succeed", async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const tokenId = mintedTokenId;

          const tx = await context.lsp8.authorizeOperator(operator, tokenId);

          await expect(tx)
            .to.emit(context.lsp8, "AuthorizedOperator")
            .withArgs(operator, tokenOwner, tokenId);

          expect(await context.lsp8.isOperatorFor(operator, tokenId)).to.be
            .true;
        });

        describe("when operator is already authorized", () => {
          beforeEach(async () => {
            await context.lsp8.authorizeOperator(
              context.accounts.operator.address,
              mintedTokenId
            );
          });

          it("should revert", async () => {
            const operator = context.accounts.operator.address;
            const tokenId = mintedTokenId;

            await expect(context.lsp8.authorizeOperator(operator, tokenId))
              .to.be.revertedWithCustomError(
                context.lsp8,
                "LSP8OperatorAlreadyAuthorized"
              )
              .withArgs(operator, tokenId);
          });
        });

        describe("when operator is the zero address", () => {
          it("should revert", async () => {
            const operator = ethers.constants.AddressZero;
            const tokenId = mintedTokenId;

            await expect(
              context.lsp8.authorizeOperator(operator, tokenId)
            ).to.be.revertedWithCustomError(
              context.lsp8,
              "LSP8CannotUseAddressZeroAsOperator"
            );
          });
        });
      });
    });
  });

  describe("revokeOperator", () => {
    describe("when tokenId does not exist", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8.revokeOperator(
            context.accounts.operator.address,
            neverMintedTokenId
          )
        )
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NonExistentTokenId")
          .withArgs(neverMintedTokenId);
      });
    });

    describe("when caller is not owner of tokenId", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8
            .connect(context.accounts.anyone)
            .revokeOperator(context.accounts.operator.address, mintedTokenId)
        )
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NotTokenOwner")
          .withArgs(
            context.accounts.owner.address,
            mintedTokenId,
            context.accounts.anyone.address
          );
      });
    });

    describe("when caller is owner of tokenId", () => {
      describe("when operator is not the zero address", () => {
        it("should succeed", async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const tokenId = mintedTokenId;

          // pre-conditions
          await context.lsp8.authorizeOperator(operator, tokenId);
          expect(await context.lsp8.isOperatorFor(operator, tokenId)).to.be
            .true;

          // effects
          const tx = await context.lsp8.revokeOperator(operator, tokenId);
          await expect(tx)
            .to.emit(context.lsp8, "RevokedOperator")
            .withArgs(operator, tokenOwner, tokenId);

          // post-conditions
          expect(await context.lsp8.isOperatorFor(operator, tokenId)).to.be
            .false;
        });
      });

      describe("when operator is the zero address", () => {
        it("should revert", async () => {
          const operator = ethers.constants.AddressZero;
          const tokenId = mintedTokenId;

          await expect(
            context.lsp8.revokeOperator(operator, tokenId)
          ).to.be.revertedWithCustomError(
            context.lsp8,
            "LSP8CannotUseAddressZeroAsOperator"
          );
        });
      });

      describe("when address provided to revoke is not an existing operator", () => {
        it("should revert", async () => {
          const operator = context.accounts.anyone.address;
          const tokenId = mintedTokenId;

          await expect(context.lsp8.revokeOperator(operator, tokenId))
            .to.be.revertedWithCustomError(
              context.lsp8,
              "LSP8NonExistingOperator"
            )
            .withArgs(operator, tokenId);
        });
      });
    });
  });

  describe("isOperatorFor", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8.isOperatorFor(
            context.accounts.operator.address,
            neverMintedTokenId
          )
        )
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NonExistentTokenId")
          .withArgs(neverMintedTokenId);
      });
    });

    describe("when tokenId has been minted", () => {
      describe("when operator has not been authorized", () => {
        it("should return false", async () => {
          expect(
            await context.lsp8.isOperatorFor(
              context.accounts.operator.address,
              mintedTokenId
            )
          ).to.be.false;
        });
      });

      describe("when one account have been authorized for the tokenId", () => {
        it("should return true", async () => {
          await context.lsp8.authorizeOperator(
            context.accounts.operator.address,
            mintedTokenId
          );

          expect(
            await context.lsp8.isOperatorFor(
              context.accounts.operator.address,
              mintedTokenId
            )
          ).to.be.true;
        });
      });

      describe("when many accounts have been authorized for the tokenId", () => {
        it("should return true for all operators", async () => {
          await context.lsp8.authorizeOperator(
            context.accounts.operator.address,
            mintedTokenId
          );
          await context.lsp8.authorizeOperator(
            context.accounts.anotherOperator.address,
            mintedTokenId
          );

          expect(
            await context.lsp8.isOperatorFor(
              context.accounts.operator.address,
              mintedTokenId
            )
          ).to.be.true;
          expect(
            await context.lsp8.isOperatorFor(
              context.accounts.anotherOperator.address,
              mintedTokenId
            )
          ).to.be.true;
        });
      });
    });
  });

  describe("getOperatorsOf", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(context.lsp8.getOperatorsOf(neverMintedTokenId))
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NonExistentTokenId")
          .withArgs(neverMintedTokenId);
      });
    });

    describe("when tokenId has been minted", () => {
      describe("when operator has not been authorized", () => {
        it("should return empty list", async () => {
          expect(
            await context.lsp8.getOperatorsOf(mintedTokenId)
          ).to.be.deep.equal([]);
        });
      });

      describe("when one account have been authorized for the tokenId", () => {
        it("should return list", async () => {
          await context.lsp8.authorizeOperator(
            context.accounts.operator.address,
            mintedTokenId
          );

          expect(
            await context.lsp8.getOperatorsOf(mintedTokenId)
          ).to.be.deep.equal([context.accounts.operator.address]);
        });
      });

      describe("when many accounts have been authorized for the tokenId", () => {
        it("should return list", async () => {
          await context.lsp8.authorizeOperator(
            context.accounts.operator.address,
            mintedTokenId
          );
          await context.lsp8.authorizeOperator(
            context.accounts.anotherOperator.address,
            mintedTokenId
          );

          expect(
            await context.lsp8.getOperatorsOf(mintedTokenId)
          ).to.be.deep.equal([
            context.accounts.operator.address,
            context.accounts.anotherOperator.address,
          ]);
        });
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
      // setup so we can observe operators being cleared during transfer tests
      await context.lsp8.authorizeOperator(
        context.accounts.operator.address,
        mintedTokenId
      );
      await context.lsp8.authorizeOperator(
        context.accounts.anotherOperator.address,
        mintedTokenId
      );
    });

    describe("transfer", () => {
      type TransferTxParams = {
        from: string;
        to: string;
        tokenId: BytesLike;
        force: boolean;
        data: string;
      };

      const transferSuccessScenario = async (
        { from, to, tokenId, force, data }: TransferTxParams,
        operator: SignerWithAddress
      ) => {
        // pre-conditions
        const preTokenOwnerOf = await context.lsp8.tokenOwnerOf(tokenId);
        expect(preTokenOwnerOf).to.equal(from);

        const preOperatorsOf = await context.lsp8.getOperatorsOf(tokenId);
        expect(preOperatorsOf).to.be.deep.equal([
          context.accounts.operator.address,
          context.accounts.anotherOperator.address,
        ]);

        const preFromTokenIdsOf = await context.lsp8.tokenIdsOf(from);
        expect(preFromTokenIdsOf.includes(tokenId.toString())).to.be.true;

        const preToTokenIdsOf = await context.lsp8.tokenIdsOf(to);
        expect(preToTokenIdsOf.includes(tokenId.toString())).to.be.false;

        const preFromBalanceOf = await context.lsp8.balanceOf(from);
        const preToBalanceOf = await context.lsp8.balanceOf(to);

        // effect
        const tx = await context.lsp8
          .connect(operator)
          .transfer(from, to, tokenId, force, data);
        await expect(tx)
          .to.emit(context.lsp8, "Transfer")
          .withArgs(operator.address, from, to, tokenId, force, data);
        await expect(tx)
          .to.emit(context.lsp8, "RevokedOperator")
          .withArgs(context.accounts.operator.address, from, tokenId);
        await expect(tx)
          .to.emit(context.lsp8, "RevokedOperator")
          .withArgs(context.accounts.anotherOperator.address, from, tokenId);

        // post-conditions
        const postTokenOwnerOf = await context.lsp8.tokenOwnerOf(tokenId);
        expect(postTokenOwnerOf).to.equal(to);

        const postOperatorsOf = await context.lsp8.getOperatorsOf(tokenId);
        expect(postOperatorsOf).to.be.deep.equal([]);

        const postFromTokenIdsOf = await context.lsp8.tokenIdsOf(from);
        expect(postFromTokenIdsOf.includes(tokenId.toString())).to.be.false;

        const postToTokenIdsOf = await context.lsp8.tokenIdsOf(to);
        expect(postToTokenIdsOf.includes(tokenId.toString())).to.be.true;

        const postFromBalanceOf = await context.lsp8.balanceOf(from);
        expect(postFromBalanceOf).to.equal(preFromBalanceOf.sub(1));

        const postToBalanceOf = await context.lsp8.balanceOf(to);
        expect(postToBalanceOf).to.equal(preToBalanceOf.add(1));

        return tx;
      };

      const transferFailScenario = async (
        { from, to, tokenId, force, data }: TransferTxParams,
        operator: SignerWithAddress,
        expectedError: ExpectedError
      ) => {
        if (expectedError.args.length > 0)
          await expect(
            context.lsp8
              .connect(operator)
              .transfer(from, to, tokenId, force, data)
          )
            .to.be.revertedWithCustomError(context.lsp8, expectedError.error)
            .withArgs(...expectedError.args);
        else
          await expect(
            context.lsp8
              .connect(operator)
              .transfer(from, to, tokenId, force, data)
          ).to.be.revertedWithCustomError(context.lsp8, expectedError.error);
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
            describe("when `to` is the zero address", () => {
              it("should revert", async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: ethers.constants.AddressZero,
                  tokenId: mintedTokenId,
                  force,
                  data,
                };
                const expectedError = "LSP8CannotSendToAddressZero";

                await transferFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [],
                });
              });
            });

            it("should allow transfering the tokenId", async () => {
              const txParams = {
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                tokenId: mintedTokenId,
                force,
                data,
              };

              await transferSuccessScenario(txParams, operator);
            });
          });

          describe("when `to` is a contract", () => {
            describe("when receiving contract supports LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: helperContracts.tokenReceiverWithLSP1.address,
                  tokenId: mintedTokenId,
                  force,
                  data,
                };

                const tx = await transferSuccessScenario(txParams, operator);

                const typeId = LSP1_TYPE_IDS.LSP8Tokens_RecipientNotification;
                const packedData = ethers.utils.solidityPack(
                  ["address", "address", "bytes32", "bytes"],
                  [txParams.from, txParams.to, txParams.tokenId, txParams.data]
                );

                await expect(tx)
                  .to.emit(
                    helperContracts.tokenReceiverWithLSP1,
                    "UniversalReceiverCalled"
                  )
                  .withArgs(typeId, packedData);
              });
            });

            describe("when receiving contract does not support LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: helperContracts.tokenReceiverWithoutLSP1.address,
                  tokenId: mintedTokenId,
                  force,
                  data,
                };

                await transferSuccessScenario(txParams, operator);
              });
            });
          });

          describe("when `from == to` address (= sending to tokenId's owner itself)", () => {
            it("should revert", async () => {
              const txParams = {
                from: context.accounts.owner.address,
                to: context.accounts.owner.address,
                tokenId: mintedTokenId,
                force,
                data,
              };
              const expectedError = "LSP8CannotSendToSelf";

              await transferFailScenario(txParams, operator, {
                error: expectedError,
                args: [],
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
            it("should not allow transfering the tokenId", async () => {
              const txParams = {
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                tokenId: mintedTokenId,
                force,
                data,
              };
              const expectedError = "LSP8NotifyTokenReceiverIsEOA";

              await transferFailScenario(txParams, operator, {
                error: expectedError,
                args: [txParams.to],
              });
            });
          });

          describe("when `to` is a contract", () => {
            describe("when receiving contract supports LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: helperContracts.tokenReceiverWithLSP1.address,
                  tokenId: mintedTokenId,
                  force,
                  data,
                };

                const tx = await transferSuccessScenario(txParams, operator);

                const typeId = LSP1_TYPE_IDS.LSP8Tokens_RecipientNotification;
                const packedData = ethers.utils.solidityPack(
                  ["address", "address", "bytes32", "bytes"],
                  [txParams.from, txParams.to, txParams.tokenId, txParams.data]
                );

                await expect(tx)
                  .to.emit(
                    helperContracts.tokenReceiverWithLSP1,
                    "UniversalReceiverCalled"
                  )
                  .withArgs(typeId, packedData);
              });
            });

            describe("when receiving contract does not support LSP1", () => {
              it("should not allow transfering the tokenId", async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: helperContracts.tokenReceiverWithoutLSP1.address,
                  tokenId: mintedTokenId,
                  force,
                  data,
                };
                const expectedError =
                  "LSP8NotifyTokenReceiverContractMissingLSP1Interface";

                await transferFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [txParams.to],
                });
              });
            });
          });

          describe("when `from == to` address (= sending to tokenId's owner itself)", () => {
            it("should revert", async () => {
              const txParams = {
                from: context.accounts.owner.address,
                to: context.accounts.owner.address,
                tokenId: mintedTokenId,
                force,
                data,
              };
              const expectedError = "LSP8CannotSendToSelf";

              await transferFailScenario(txParams, operator, {
                error: expectedError,
                args: [],
              });
            });
          });
        });
      };

      describe("when tokenOwner sends tx", () => {
        sendingTransferTransactions(() => context.accounts.owner);
      });

      describe("when operator sends tx", () => {
        sendingTransferTransactions(() => context.accounts.operator);

        describe("when the caller is not an operator", () => {
          it("should revert", async () => {
            const operator = context.accounts.anyone;
            const txParams = {
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
              force: true,
              data: "0x",
            };
            const expectedError = "LSP8NotTokenOperator";

            await transferFailScenario(txParams, operator, {
              error: expectedError,
              args: [txParams.tokenId.toString(), operator.address],
            });
          });
        });
      });

      describe("when the from address is incorrect", () => {
        it("should revert", async () => {
          const operator = context.accounts.owner;
          const txParams = {
            from: context.accounts.anyone.address,
            to: context.accounts.tokenReceiver.address,
            tokenId: mintedTokenId,
            force: true,
            data: "0x",
          };
          const expectedError = "LSP8NotTokenOwner";

          await transferFailScenario(txParams, operator, {
            error: expectedError,
            args: [
              context.accounts.owner.address,
              txParams.tokenId.toString(),
              txParams.from,
            ],
          });
        });
      });

      describe("when the given tokenId has not been minted", () => {
        it("should revert", async () => {
          const operator = context.accounts.owner;
          const txParams = {
            from: context.accounts.owner.address,
            to: context.accounts.tokenReceiver.address,
            tokenId: neverMintedTokenId,
            force: true,
            data: "0x",
          };
          const expectedError = "LSP8NonExistentTokenId";

          await transferFailScenario(txParams, operator, {
            error: expectedError,
            args: [txParams.tokenId.toString()],
          });
        });
      });
    });

    describe("transferBatch", () => {
      const anotherMintedTokenId = tokenIdAsBytes32("5555");

      beforeEach(async () => {
        // setup so we can transfer multiple tokenIds during transferBatch test
        await context.lsp8.mint(
          context.accounts.owner.address,
          anotherMintedTokenId,
          true,
          ethers.utils.toUtf8Bytes("mint another token for the owner")
        );

        // setup so we can observe operators being cleared during transferBatch tests
        await context.lsp8.authorizeOperator(
          context.accounts.operator.address,
          anotherMintedTokenId
        );
        await context.lsp8.authorizeOperator(
          context.accounts.anotherOperator.address,
          anotherMintedTokenId
        );
      });

      type TransferBatchTxParams = {
        from: string[];
        to: string[];
        tokenId: BytesLike[];
        force: boolean[];
        data: string[];
      };

      const transferBatchSuccessScenario = async (
        { from, to, tokenId, force, data }: TransferBatchTxParams,
        operator: SignerWithAddress
      ) => {
        // pre-conditions
        await Promise.all(
          tokenId.map((_, index) => async () => {
            const preTokenOwnerOf = await context.lsp8.tokenOwnerOf(
              tokenId[index]
            );
            expect(preTokenOwnerOf).to.equal(from[index]);

            const preOperatorsOf = await context.lsp8.getOperatorsOf(
              tokenId[index]
            );
            expect(preOperatorsOf).to.be.deep.equal([
              context.accounts.operator.address,
              context.accounts.anotherOperator.address,
            ]);
          })
        );

        // effect
        const tx = await context.lsp8
          .connect(operator)
          .transferBatch(from, to, tokenId, force, data);

        await Promise.all(
          tokenId.map(async (_, index) => {
            await expect(tx)
              .to.emit(context.lsp8, "Transfer")
              .withArgs(
                operator.address,
                from[index],
                to[index],
                tokenId[index],
                force[index],
                data[index]
              );
            await expect(tx)
              .to.emit(context.lsp8, "RevokedOperator")
              .withArgs(
                context.accounts.operator.address,
                from[index],
                tokenId[index]
              );
            await expect(tx)
              .to.emit(context.lsp8, "RevokedOperator")
              .withArgs(
                context.accounts.anotherOperator.address,
                from[index],
                tokenId[index]
              );
          })
        );

        // post-conditions
        await Promise.all(
          tokenId.map((_, index) => async () => {
            const preTokenOwnerOf = await context.lsp8.tokenOwnerOf(
              tokenId[index]
            );
            expect(preTokenOwnerOf).to.equal(to[index]);

            const postOperatorsOf = await context.lsp8.getOperatorsOf(
              tokenId[index]
            );
            expect(postOperatorsOf).to.be.deep.equal([]);
          })
        );

        return tx;
      };

      const transferBatchFailScenario = async (
        { from, to, tokenId, force, data }: TransferBatchTxParams,
        operator: SignerWithAddress,
        expectedError: ExpectedError
      ) => {
        // pre-conditions
        await Promise.all(
          tokenId.map((_, index) => async () => {
            const preTokenOwnerOf = await context.lsp8.tokenOwnerOf(
              tokenId[index]
            );
            expect(preTokenOwnerOf).to.equal(from[index]);
          })
        );

        // effect
        if (expectedError.args.length > 0)
          await expect(
            context.lsp8
              .connect(operator)
              .transferBatch(from, to, tokenId, force, data)
          )
            .to.be.revertedWithCustomError(context.lsp8, expectedError.error)
            .withArgs(...expectedError.args);
        else
          await expect(
            context.lsp8
              .connect(operator)
              .transferBatch(from, to, tokenId, force, data)
          ).to.be.revertedWithCustomError(context.lsp8, expectedError.error);
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
                  tokenId: [mintedTokenId, anotherMintedTokenId],
                  force: [true, true],
                  data: [data, data],
                };
                const expectedError = "LSP8CannotSendToAddressZero";

                await transferBatchFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [],
                });
              });
            });

            it("should allow transfering the tokenId", async () => {
              const txParams = {
                from: [
                  context.accounts.owner.address,
                  context.accounts.owner.address,
                ],
                to: [
                  context.accounts.tokenReceiver.address,
                  context.accounts.tokenReceiver.address,
                ],
                tokenId: [mintedTokenId, anotherMintedTokenId],
                force: [true, true],
                data: [data, data],
              };

              await transferBatchSuccessScenario(txParams, operator);
            });
          });

          describe("when `to` is a contract", () => {
            describe("when receiving contract supports LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  from: [
                    context.accounts.owner.address,
                    context.accounts.owner.address,
                  ],
                  to: [
                    helperContracts.tokenReceiverWithLSP1.address,
                    helperContracts.tokenReceiverWithLSP1.address,
                  ],
                  tokenId: [mintedTokenId, anotherMintedTokenId],
                  force: [true, true],
                  data: [data, data],
                };

                const tx = await transferBatchSuccessScenario(
                  txParams,
                  operator
                );

                await Promise.all(
                  txParams.tokenId.map((_, index) => async () => {
                    const typeId =
                      "0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895";
                    const packedData = ethers.utils.solidityPack(
                      ["address", "address", "bytes32", "bytes"],
                      [
                        txParams.from[index],
                        txParams.to[index],
                        txParams.tokenId[index],
                        txParams.data[index],
                      ]
                    );

                    await expect(tx)
                      .to.emit(
                        helperContracts.tokenReceiverWithLSP1,
                        "UniversalReceiverCalled"
                      )
                      .withArgs(typeId, packedData);
                  })
                );
              });
            });

            describe("when receiving contract does not support LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  from: [
                    context.accounts.owner.address,
                    context.accounts.owner.address,
                  ],
                  to: [
                    helperContracts.tokenReceiverWithoutLSP1.address,
                    helperContracts.tokenReceiverWithoutLSP1.address,
                  ],
                  tokenId: [mintedTokenId, anotherMintedTokenId],
                  force: [true, true],
                  data: [data, data],
                };

                await transferBatchSuccessScenario(txParams, operator);
              });
            });
          });
        });

        describe("when force=false", () => {
          const data = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("doing a transfer without force")
          );

          describe("when `to` is an EOA", () => {
            it("should not allow transfering the tokenId", async () => {
              const txParams = {
                from: [
                  context.accounts.owner.address,
                  context.accounts.owner.address,
                ],
                to: [
                  context.accounts.tokenReceiver.address,
                  helperContracts.tokenReceiverWithLSP1.address,
                ],
                tokenId: [mintedTokenId, anotherMintedTokenId],
                force: [false, false],
                data: [data, data],
              };
              const expectedError = "LSP8NotifyTokenReceiverIsEOA";

              await transferBatchFailScenario(txParams, operator, {
                error: expectedError,
                args: [txParams.to[0]],
              });
            });
          });

          describe("when `to` is a contract", () => {
            describe("when receiving contract supports LSP1", () => {
              it("should allow transfering the tokenId", async () => {
                const txParams = {
                  from: [
                    context.accounts.owner.address,
                    context.accounts.owner.address,
                  ],
                  to: [
                    helperContracts.tokenReceiverWithLSP1.address,
                    helperContracts.tokenReceiverWithLSP1.address,
                  ],
                  tokenId: [mintedTokenId, anotherMintedTokenId],
                  force: [false, false],
                  data: [data, data],
                };

                await transferBatchSuccessScenario(txParams, operator);
              });
            });

            describe("when receiving contract does not support LSP1", () => {
              it("should not allow transfering the tokenId", async () => {
                const txParams = {
                  from: [
                    context.accounts.owner.address,
                    context.accounts.owner.address,
                  ],
                  to: [
                    helperContracts.tokenReceiverWithoutLSP1.address,
                    helperContracts.tokenReceiverWithLSP1.address,
                  ],
                  tokenId: [mintedTokenId, anotherMintedTokenId],
                  force: [false, false],
                  data: [data, data],
                };
                const expectedError =
                  "LSP8NotifyTokenReceiverContractMissingLSP1Interface";

                await transferBatchFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [txParams.to[0]],
                });
              });
            });
          });
        });

        describe("when the from address is incorrect", () => {
          it("should revert", async () => {
            const txParams = {
              to: [context.accounts.anyone.address],
              from: [context.accounts.tokenReceiver.address],
              tokenId: [mintedTokenId],
              force: [true],
              data: ["0x"],
            };
            const expectedError = "LSP8NotTokenOwner";

            await transferBatchFailScenario(txParams, operator, {
              error: expectedError,
              args: [
                context.accounts.owner.address,
                txParams.tokenId[0].toString(),
                txParams.from[0],
              ],
            });
          });
        });

        describe("when the given tokenId has not been minted", () => {
          it("should revert", async () => {
            const txParams = {
              to: [context.accounts.anyone.address],
              from: [context.accounts.tokenReceiver.address],
              tokenId: [neverMintedTokenId],
              force: [true],
              data: ["0x"],
            };
            const expectedError = "LSP8NonExistentTokenId";

            await transferBatchFailScenario(txParams, operator, {
              error: expectedError,
              args: [txParams.tokenId[0].toString()],
            });
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
              tokenId: [mintedTokenId, anotherMintedTokenId],
              force: [true],
              data: ["0x", "0x"],
            };

            await Promise.all(
              ["from", "to", "tokenId", "data"].map(async (arrayParam) => {
                await transferBatchFailScenario(
                  {
                    ...validTxParams,
                    [`${arrayParam}`]: [validTxParams[arrayParam][0]],
                  },
                  operator,
                  {
                    error: "LSP8InvalidTransferBatch",
                    args: [],
                  }
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

        describe("when the caller is not an operator", () => {
          it("should revert", async () => {
            const operator = context.accounts.anyone;
            const txParams = {
              to: [context.accounts.owner.address],
              from: [context.accounts.tokenReceiver.address],
              tokenId: [mintedTokenId],
              force: [true],
              data: ["0x"],
            };
            const expectedError = "LSP8NotTokenOperator";

            await transferBatchFailScenario(txParams, operator, {
              error: expectedError,
              args: [txParams.tokenId[0].toString(), operator.address],
            });
          });
        });
      });
    });
  });

  describe("burn", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(context.lsp8.burn(neverMintedTokenId, "0x"))
          .to.be.revertedWithCustomError(context.lsp8, "LSP8NonExistentTokenId")
          .withArgs(neverMintedTokenId);
      });
    });

    describe("when tokenId has been minted", () => {
      describe("when caller is not the token owner or an operator", () => {
        it("should revert", async () => {
          await expect(
            context.lsp8
              .connect(context.accounts.anyone)
              .burn(mintedTokenId, "0x")
          )
            .to.be.revertedWithCustomError(context.lsp8, "LSP8NotTokenOperator")
            .withArgs(mintedTokenId, context.accounts.anyone.address);
        });
      });

      describe("when caller is the token owner", () => {
        describe("after burning a tokenId", () => {
          it("should have decreased the total supply", async () => {
            const totalSupplyBefore = await context.lsp8.totalSupply();

            await context.lsp8
              .connect(context.accounts.owner)
              .burn(mintedTokenId, "0x");

            const totalSupplyAfter = await context.lsp8.totalSupply();

            expect(totalSupplyAfter).to.equal(totalSupplyBefore.sub(1));
          });

          it("should have emitted a Transfer event with address(0) as `to` param", async () => {
            await expect(
              context.lsp8
                .connect(context.accounts.owner)
                .burn(mintedTokenId, "0x")
            )
              .to.emit(context.lsp8, "Transfer")
              .withArgs(
                context.accounts.owner.address,
                context.accounts.owner.address,
                ethers.constants.AddressZero,
                mintedTokenId,
                false,
                "0x"
              );
          });

          describe("when calling `tokenOwnerOf(...)` for the burnt tokenId", () => {
            it("should revert stating tokenId does not exist", async () => {
              await context.lsp8
                .connect(context.accounts.owner)
                .burn(mintedTokenId, "0x");

              await expect(
                context.lsp8.tokenOwnerOf(mintedTokenId)
              ).to.be.revertedWithCustomError(
                context.lsp8,
                "LSP8NonExistentTokenId"
              );
            });
          });

          describe("when calling `getOperatorsOf(...)` for the burnt tokenId", () => {
            it("should revert stating tokenId does not exist", async () => {
              await context.lsp8.authorizeOperator(
                context.accounts.operator.address,
                mintedTokenId
              );

              await context.lsp8.authorizeOperator(
                context.accounts.anotherOperator.address,
                mintedTokenId
              );

              const operatorsForTokenIdBefore =
                await context.lsp8.getOperatorsOf(mintedTokenId);

              expect(operatorsForTokenIdBefore).to.deep.equal([
                context.accounts.operator.address,
                context.accounts.anotherOperator.address,
              ]);

              await context.lsp8
                .connect(context.accounts.owner)
                .burn(mintedTokenId, "0x");

              await expect(
                context.lsp8.getOperatorsOf(mintedTokenId)
              ).to.be.revertedWithCustomError(
                context.lsp8,
                "LSP8NonExistentTokenId"
              );
            });
          });

          describe("when calling `tokenIdsOf(...)` with the initial owner address of the burnt token", () => {
            it("should return a list of tokenIds that does not contain the burnt tokenId", async () => {
              const tokenIdsOfOwnerBefore = await context.lsp8.tokenIdsOf(
                context.accounts.owner.address
              );
              expect(tokenIdsOfOwnerBefore).to.contain(mintedTokenId);

              await context.lsp8
                .connect(context.accounts.owner)
                .burn(mintedTokenId, "0x");

              const tokenIdsOfOwnerAfter = await context.lsp8.tokenIdsOf(
                context.accounts.owner.address
              );
              expect(tokenIdsOfOwnerAfter).to.not.contain(mintedTokenId);
            });
          });
        });
      });

      describe("when caller is an operator", () => {
        beforeEach(async () => {
          await context.lsp8.authorizeOperator(
            context.accounts.operator.address,
            mintedTokenId
          );
        });

        describe("after burning a tokenId", () => {
          it("should have decreased the total supply", async () => {
            const totalSupplyBefore = await context.lsp8.totalSupply();

            await context.lsp8
              .connect(context.accounts.operator)
              .burn(mintedTokenId, "0x");

            const totalSupplyAfter = await context.lsp8.totalSupply();

            expect(totalSupplyAfter).to.equal(totalSupplyBefore.sub(1));
          });

          it("should have emitted a Transfer event with address(0) as `to` param", async () => {
            await expect(
              context.lsp8
                .connect(context.accounts.operator)
                .burn(mintedTokenId, "0x")
            )
              .to.emit(context.lsp8, "Transfer")
              .withArgs(
                context.accounts.operator.address,
                context.accounts.owner.address,
                ethers.constants.AddressZero,
                mintedTokenId,
                false,
                "0x"
              );
          });

          describe("when calling `tokenOwnerOf(...)` for the burnt tokenId", () => {
            it("should revert stating tokenId does not exist", async () => {
              await context.lsp8
                .connect(context.accounts.operator)
                .burn(mintedTokenId, "0x");

              await expect(
                context.lsp8.tokenOwnerOf(mintedTokenId)
              ).to.be.revertedWithCustomError(
                context.lsp8,
                "LSP8NonExistentTokenId"
              );
            });
          });

          describe("when calling `getOperatorsOf(...)` for the burnt tokenId", () => {
            it("should revert stating tokenId does not exist", async () => {
              await context.lsp8.authorizeOperator(
                context.accounts.anotherOperator.address,
                mintedTokenId
              );

              const operatorsForTokenIdBefore =
                await context.lsp8.getOperatorsOf(mintedTokenId);

              expect(operatorsForTokenIdBefore).to.deep.equal([
                context.accounts.operator.address,
                context.accounts.anotherOperator.address,
              ]);

              await context.lsp8
                .connect(context.accounts.operator)
                .burn(mintedTokenId, "0x");

              await expect(
                context.lsp8.getOperatorsOf(mintedTokenId)
              ).to.be.revertedWithCustomError(
                context.lsp8,
                "LSP8NonExistentTokenId"
              );
            });
          });

          describe("when calling `tokenIdsOf(...)` with the initial owner address of the burnt token", () => {
            it("should return a list of tokenIds that does not contain the burnt tokenId", async () => {
              const tokenIdsOfOwnerBefore = await context.lsp8.tokenIdsOf(
                context.accounts.owner.address
              );
              expect(tokenIdsOfOwnerBefore).to.contain(mintedTokenId);

              await context.lsp8
                .connect(context.accounts.operator)
                .burn(mintedTokenId, "0x");

              const tokenIdsOfOwnerAfter = await context.lsp8.tokenIdsOf(
                context.accounts.owner.address
              );
              expect(tokenIdsOfOwnerAfter).to.not.contain(mintedTokenId);
            });
          });
        });
      });
    });
  });

  describe("transferOwnership", () => {
    let oldOwner: SignerWithAddress;
    let newOwner: SignerWithAddress;

    before(async () => {
      context = await buildContext();
      oldOwner = context.accounts.owner;
      newOwner = context.accounts.anyone;
    });

    it("should transfer ownership of the contract", async () => {
      await context.lsp8.connect(oldOwner).transferOwnership(newOwner.address);
      expect(await context.lsp8.owner()).to.equal(newOwner.address);
    });

    it("should not allow non-owners to transfer ownership", async () => {
      const newOwner = context.accounts.anyone;
      await expect(
        context.lsp8.connect(newOwner).transferOwnership(newOwner.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    describe("after transferring ownership of the contract", () => {
      beforeEach(async () => {
        await context.lsp8
          .connect(oldOwner)
          .transferOwnership(newOwner.address);
      });

      it("old owner should not be allowed to use `transferOwnership(..)`", async () => {
        const randomAddress = context.accounts.anyone.address;
        await expect(
          context.lsp8.connect(oldOwner).transferOwnership(randomAddress)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("old owner should not be allowed to use `renounceOwnership(..)`", async () => {
        await expect(
          context.lsp8.connect(oldOwner).renounceOwnership()
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("old owner should not be allowed to use `setData(..)`", async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key"));
        const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("value"));
        await expect(
          context.lsp8.connect(oldOwner)["setData(bytes32,bytes)"](key, value)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("new owner should be allowed to use `transferOwnership(..)`", async () => {
        const randomAddress = context.accounts.anyone.address;

        await context.lsp8.connect(newOwner).transferOwnership(randomAddress);

        expect(await context.lsp8.owner()).to.equal(randomAddress);
      });

      it("new owner should be allowed to use `renounceOwnership(..)`", async () => {
        await context.lsp8.connect(newOwner).renounceOwnership();

        expect(await context.lsp8.owner()).to.equal(
          ethers.constants.AddressZero
        );
      });

      it("new owner should be allowed to use `setData(..)`", async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key"));
        const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("value"));
        await context.lsp8
          .connect(newOwner)
          ["setData(bytes32,bytes)"](key, value);

        expect(await context.lsp8["getData(bytes32)"](key)).to.equal(value);
      });
    });
  });
};

export type LSP8InitializeTestContext = {
  lsp8: LSP8IdentifiableDigitalAsset;
  initializeTransaction: TransactionResponse;
  deployParams: LSP8DeployParams;
};

export const shouldInitializeLikeLSP8 = (
  buildContext: () => Promise<LSP8InitializeTestContext>
) => {
  let context: LSP8InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should have registered the ERC165 interface", async () => {
      expect(await context.lsp8.supportsInterface(INTERFACE_IDS.ERC165));
    });

    it("should have registered the ERC725Y interface", async () => {
      expect(await context.lsp8.supportsInterface(INTERFACE_IDS.ERC725Y));
    });

    it("should have registered the LSP8 interface", async () => {
      expect(
        await context.lsp8.supportsInterface(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        )
      );
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp8, "DataChanged")
        .withArgs(
          SupportedStandards.LSP4DigitalAsset.key,
          SupportedStandards.LSP4DigitalAsset.value
        );
      expect(
        await context.lsp8["getData(bytes32)"](
          SupportedStandards.LSP4DigitalAsset.key
        )
      ).to.equal(SupportedStandards.LSP4DigitalAsset.value);

      const nameKey = ERC725YKeys.LSP4["LSP4TokenName"];
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name)
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp8, "DataChanged")
        .withArgs(nameKey, expectedNameValue);
      expect(await context.lsp8["getData(bytes32)"](nameKey)).to.equal(
        expectedNameValue
      );

      const symbolKey = ERC725YKeys.LSP4["LSP4TokenSymbol"];
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol)
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp8, "DataChanged")
        .withArgs(symbolKey, expectedSymbolValue);
      expect(await context.lsp8["getData(bytes32)"](symbolKey)).to.equal(
        expectedSymbolValue
      );
    });
  });
};
