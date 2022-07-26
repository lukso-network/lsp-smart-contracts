import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  LSP8CompatibleERC721Tester,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1__factory,
  TokenReceiverWithoutLSP1,
} from "../../../types";
import { tokenIdAsBytes32 } from "../../utils/tokens";
import { INTERFACE_IDS, SupportedStandards } from "../../../constants";

import type { BytesLike } from "ethers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

export type LSP8CompatibleERC721TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts =
  async (): Promise<LSP8CompatibleERC721TestAccounts> => {
    const [owner, tokenReceiver, operator, anotherOperator, anyone] =
      await ethers.getSigners();
    return { owner, tokenReceiver, operator, anotherOperator, anyone };
  };

type LSP8CompatibleERC721DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  lsp4MetadataValue: string;
};

export type LSP8CompatibleERC721TestContext = {
  accounts: LSP8CompatibleERC721TestAccounts;
  lsp8CompatibleERC721: LSP8CompatibleERC721Tester;
  deployParams: LSP8CompatibleERC721DeployParams;
};

const mintedTokenId = "10";
const neverMintedTokenId = "1010110";

export const shouldBehaveLikeLSP8CompatibleERC721 = (
  buildContext: () => Promise<LSP8CompatibleERC721TestContext>
) => {
  let context: LSP8CompatibleERC721TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when checking supported ERC165 interfaces", () => {
    it("should support ERC721", async () => {
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(
          INTERFACE_IDS.ERC721
        )
      ).toEqual(true);
    });

    it("should support ERC721Metadata", async () => {
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(
          INTERFACE_IDS.ERC721Metadata
        )
      ).toEqual(true);
    });
  });

  describe("name", () => {
    it("should allow reading name", async () => {
      // using compatibility getter -> returns(string)
      const nameAsString = await context.lsp8CompatibleERC721.name();
      expect(nameAsString).toEqual(context.deployParams.name);

      // using getData -> returns(bytes)
      const nameAsBytes = await context.lsp8CompatibleERC721[
        "getData(bytes32)"
      ](ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenName")));
      expect(ethers.utils.toUtf8String(nameAsBytes)).toEqual(
        context.deployParams.name
      );
    });
  });

  describe("symbol", () => {
    it("should allow reading symbol", async () => {
      // using compatibility getter -> returns(string)
      const symbolAsString = await context.lsp8CompatibleERC721.symbol();
      expect(symbolAsString).toEqual(context.deployParams.symbol);

      // using getData -> returns(bytes)
      const symbolAsBytes = await context.lsp8CompatibleERC721[
        "getData(bytes32)"
      ](ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenSymbol")));
      expect(ethers.utils.toUtf8String(symbolAsBytes)).toEqual(
        context.deployParams.symbol
      );
    });
  });

  describe("tokenURI", () => {
    it("should allow reading tokenURI", async () => {
      // using compatibility getter -> returns(string)
      const tokenURIAsString = await context.lsp8CompatibleERC721.tokenURI(
        mintedTokenId
      );
      // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36 + 2 for prefix = 38
      const offset = 36 * 2 + 2;
      expect(tokenURIAsString).toEqual(
        ethers.utils.toUtf8String(
          `0x${context.deployParams.lsp4MetadataValue.slice(offset)}`
        )
      );

      // using getData -> returns(bytes)
      const lsp4MetadataValueAsBytes = await context.lsp8CompatibleERC721[
        "getData(bytes32)"
      ](ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4Metadata")));
      expect(lsp4MetadataValueAsBytes).toEqual(
        context.deployParams.lsp4MetadataValue
      );
    });
  });

  describe("ownerOf", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8CompatibleERC721.ownerOf(neverMintedTokenId)
        ).toBeRevertedWith(
          `LSP8NonExistentTokenId("${tokenIdAsBytes32(neverMintedTokenId)}")`
        );
      });
    });

    describe("when tokenId has been minted", () => {
      it("should return owner address", async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes("mint a token for the owner")
        );

        expect(
          await context.lsp8CompatibleERC721.ownerOf(mintedTokenId)
        ).toEqual(context.accounts.owner.address);
      });
    });
  });

  describe("approve", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8CompatibleERC721
            .connect(context.accounts.anyone)
            .approve(context.accounts.operator.address, neverMintedTokenId)
        ).toBeRevertedWith(
          `LSP8NonExistentTokenId("${tokenIdAsBytes32(neverMintedTokenId)}")`
        );
      });
    });

    describe("when the tokenId has been minted", () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes("mint a token for the owner")
        );
      });

      describe("when caller is not owner of tokenId", () => {
        it("should revert", async () => {
          await expect(
            context.lsp8CompatibleERC721
              .connect(context.accounts.anyone)
              .approve(context.accounts.operator.address, mintedTokenId)
          ).toBeRevertedWith(
            `LSP8NotTokenOwner("${
              context.accounts.owner.address
            }", "${tokenIdAsBytes32(mintedTokenId)}", "${
              context.accounts.anyone.address
            }")`
          );
        });
      });

      describe("when caller is owner of tokenId", () => {
        describe("when operator is not the zero address", () => {
          it("should succeed", async () => {
            const operator = context.accounts.operator.address;
            const tokenId = mintedTokenId;

            const tx = await context.lsp8CompatibleERC721.approve(
              operator,
              tokenId
            );

            await expect(tx).toHaveEmittedWith(
              context.lsp8CompatibleERC721,
              "AuthorizedOperator",
              [
                operator,
                context.accounts.owner.address,
                tokenIdAsBytes32(tokenId),
              ]
            );

            await expect(tx).toHaveEmittedWith(
              context.lsp8CompatibleERC721,
              "Approval",
              [
                context.accounts.owner.address,
                operator,
                ethers.BigNumber.from(tokenId),
              ]
            );
          });
        });

        describe("when operator is the zero address", () => {
          it("should revert", async () => {
            const operator = ethers.constants.AddressZero;
            const tokenId = mintedTokenId;

            await expect(
              context.lsp8CompatibleERC721.approve(operator, tokenId)
            ).toBeRevertedWith("LSP8CannotUseAddressZeroAsOperator()");
          });
        });
      });
    });
  });

  describe("setApprovalForAll", () => {
    const tokenIds = [0, 1, 2, 3, 4];

    beforeEach(async () => {
      // owner has multiple tokenIds (x5)
      // 1. mint 5 NFT for address tokenOwner
      for (let ii = 0; ii < tokenIds.length; ii++) {
        const txParams = {
          to: context.accounts.owner.address,
          tokenId: ii,
          data: ethers.utils.toUtf8Bytes(`mint tokenId ${ii} for the owner`),
        };

        await context.lsp8CompatibleERC721
          .connect(context.accounts.owner)
          .mint(txParams.to, txParams.tokenId, txParams.data);
      }

      // 2. call setApprovalForAll to approve operator for all tokenIds of tokenOwner
      await context.lsp8CompatibleERC721
        .connect(context.accounts.owner)
        .setApprovalForAll(context.accounts.operator.address, true);
    });

    describe("when calling isApprovedForAll for operator", () => {
      it("should return true", async () => {
        const result = await context.lsp8CompatibleERC721.isApprovedForAll(
          context.accounts.owner.address,
          context.accounts.operator.address
        );

        expect(result).toBeTruthy();
      });
    });

    describe("when calling isApprovedForAll for non-operator", () => {
      it("should return false", async () => {
        const result = await context.lsp8CompatibleERC721.isApprovedForAll(
          context.accounts.owner.address,
          context.accounts.anyone.address
        );

        expect(result).toBeFalsy();
      });
    });

    [
      { tokenId: tokenIds[0] },
      { tokenId: tokenIds[1] },
      { tokenId: tokenIds[2] },
      { tokenId: tokenIds[3] },
      { tokenId: tokenIds[4] },
    ].forEach((testCase) => {
      it(`operator should be allowed to transfer tokenId ${testCase.tokenId}`, async () => {
        await context.lsp8CompatibleERC721
          .connect(context.accounts.operator)
          .transferFrom(
            context.accounts.owner.address,
            context.accounts.tokenReceiver.address,
            testCase.tokenId
          );
        const newTokenOwner = await context.lsp8CompatibleERC721.ownerOf(
          testCase.tokenId
        );
        expect(newTokenOwner).toEqual(context.accounts.tokenReceiver.address);
      });
    });

    [
      { tokenId: tokenIds[0] },
      { tokenId: tokenIds[1] },
      { tokenId: tokenIds[2] },
      { tokenId: tokenIds[3] },
      { tokenId: tokenIds[4] },
    ].forEach((testCase) => {
      it(`non-operator should not be allowed to transfer tokenId ${testCase.tokenId} with transferFrom(...)`, async () => {
        await context.lsp8CompatibleERC721
          .connect(context.accounts.anyone)
          .transferFrom(
            context.accounts.owner.address,
            context.accounts.tokenReceiver.address,
            testCase.tokenId
          );
        const newTokenOwner = await context.lsp8CompatibleERC721.ownerOf(
          testCase.tokenId
        );
        expect(newTokenOwner).toEqual(context.accounts.tokenReceiver.address);
      });
    });

    // 3. check for each NFT tokenId that operator can transfer
    // it("operator should be able to transfer tokenId 0", async () => {});

    // for each NFT, check that any random address cannot transfer
  });

  describe("isApprovedForAll", () => {
    describe("when called", () => {
      it("should return false", async () => {
        const tokenOwner = context.accounts.tokenReceiver.address;
        const operator = context.accounts.operator.address;

        // LSP8 does not support approving an operator for all tokenIds of a tokenOwner
        expect(
          await context.lsp8CompatibleERC721.isApprovedForAll(
            tokenOwner,
            operator
          )
        ).toBe(false);
      });
    });
  });

  describe("getApproved", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8CompatibleERC721.getApproved(neverMintedTokenId)
        ).toBeRevertedWith(
          `LSP8NonExistentTokenId("${tokenIdAsBytes32(neverMintedTokenId)}")`
        );
      });
    });

    describe("when tokenId has been minted", () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes("mint a token for the owner")
        );
      });

      describe("when there have been no approvals for the tokenId", () => {
        it("should return address(0)", async () => {
          expect(
            await context.lsp8CompatibleERC721.getApproved(mintedTokenId)
          ).toEqual(ethers.constants.AddressZero);
        });
      });

      describe("when one account has been approved for the tokenId", () => {
        it("should return the operator address", async () => {
          await context.lsp8CompatibleERC721.approve(
            context.accounts.operator.address,
            tokenIdAsBytes32(mintedTokenId)
          );

          expect(
            await context.lsp8CompatibleERC721.getApproved(mintedTokenId)
          ).toEqual(context.accounts.operator.address);
        });
      });

      describe("when many context.accounts have been approved for the tokenId", () => {
        it("should return the last new authorized operator", async () => {
          // We approve the same account in the first and third approve call, with a different
          // account in the second call as the last "new" approval.
          // This is to highlight its not 100% the same behavior as ERC721 since that implementation
          // has one active approval at a time, and LSP8 has a list of authorized operator addresses
          const operatorFirstAndThirdCall = context.accounts.operator.address;
          const operatorSecondCall = context.accounts.anotherOperator.address;

          await context.lsp8CompatibleERC721.approve(
            operatorFirstAndThirdCall,
            tokenIdAsBytes32(mintedTokenId)
          );
          await context.lsp8CompatibleERC721.approve(
            operatorSecondCall,
            tokenIdAsBytes32(mintedTokenId)
          );
          await context.lsp8CompatibleERC721.approve(
            operatorFirstAndThirdCall,
            tokenIdAsBytes32(mintedTokenId)
          );

          expect(
            await context.lsp8CompatibleERC721.getApproved(mintedTokenId)
          ).toEqual(context.accounts.anotherOperator.address);
        });
      });
    });
  });

  describe("mint", () => {
    describe("when a token is minted", () => {
      it("should have expected events", async () => {
        const txParams = {
          to: context.accounts.owner.address,
          tokenId: mintedTokenId,
          data: ethers.utils.toUtf8Bytes("mint a token for the owner"),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp8CompatibleERC721
          .connect(operator)
          .mint(txParams.to, txParams.tokenId, txParams.data);

        await expect(tx).toHaveEmittedWith(
          context.lsp8CompatibleERC721,
          "Transfer(address,address,address,bytes32,bool,bytes)",
          [
            operator.address,
            ethers.constants.AddressZero,
            txParams.to,
            tokenIdAsBytes32(txParams.tokenId),
            true,
            ethers.utils.hexlify(txParams.data),
          ]
        );
        await expect(tx).toHaveEmittedWith(
          context.lsp8CompatibleERC721,
          "Transfer(address,address,uint256)",
          [
            ethers.constants.AddressZero,
            txParams.to,
            ethers.BigNumber.from(txParams.tokenId),
          ]
        );
      });
    });
  });

  describe("burn", () => {
    describe("when a token is burned", () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes("mint a token for the owner")
        );
      });

      it("should have expected events", async () => {
        const txParams = {
          tokenId: mintedTokenId,
          data: ethers.utils.toUtf8Bytes("burn a token from the owner"),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp8CompatibleERC721
          .connect(operator)
          .burn(txParams.tokenId, txParams.data);

        await expect(tx).toHaveEmittedWith(
          context.lsp8CompatibleERC721,
          "Transfer(address,address,address,bytes32,bool,bytes)",
          [
            operator.address,
            operator.address,
            ethers.constants.AddressZero,
            tokenIdAsBytes32(txParams.tokenId),
            false,
            ethers.utils.hexlify(txParams.data),
          ]
        );
        await expect(tx).toHaveEmittedWith(
          context.lsp8CompatibleERC721,
          "Transfer(address,address,uint256)",
          [
            operator.address,
            ethers.constants.AddressZero,
            ethers.BigNumber.from(txParams.tokenId),
          ]
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

      // setup so we have a token to transfer
      await context.lsp8CompatibleERC721.mint(
        context.accounts.owner.address,
        mintedTokenId,
        ethers.utils.toUtf8Bytes("mint a token for the owner")
      );

      // setup so we can observe approvals being cleared during transfer tests
      await context.lsp8CompatibleERC721.approve(
        context.accounts.operator.address,
        mintedTokenId
      );
    });

    type TransferTxParams = {
      operator: string;
      from: string;
      to: string;
      tokenId: BytesLike;
      data?: BytesLike;
    };

    const transferSuccessScenario = async (
      { operator, from, to, tokenId, data }: TransferTxParams,
      transferFn: string,
      force: boolean,
      expectedData: string
    ) => {
      // pre-conditions
      const preOwnerOf = await context.lsp8CompatibleERC721.ownerOf(tokenId);
      expect(preOwnerOf).toEqual(from);

      // effect
      const txArgs = [from, to, tokenId];
      if (data) txArgs.push(data);

      const tx = await context.lsp8CompatibleERC721[transferFn](...txArgs);
      await expect(tx).toHaveEmittedWith(
        context.lsp8CompatibleERC721,
        "Transfer(address,address,address,bytes32,bool,bytes)",
        [operator, from, to, tokenIdAsBytes32(tokenId), force, expectedData]
      );
      await expect(tx).toHaveEmittedWith(
        context.lsp8CompatibleERC721,
        "Transfer(address,address,uint256)",
        [from, to, ethers.BigNumber.from(tokenId)]
      );
      await expect(tx).toHaveEmittedWith(
        context.lsp8CompatibleERC721,
        "RevokedOperator",
        [context.accounts.operator.address, from, tokenIdAsBytes32(tokenId)]
      );

      // post-conditions
      const postOwnerOf = await context.lsp8CompatibleERC721.ownerOf(tokenId);
      expect(postOwnerOf).toEqual(to);
    };

    const transferFailScenario = async (
      { from, to, tokenId }: TransferTxParams,
      transferFn: string,
      expectedError: string
    ) => {
      // pre-conditions
      const preOwnerOf = await context.lsp8CompatibleERC721.ownerOf(tokenId);

      // effect
      await expect(
        context.lsp8CompatibleERC721[transferFn](from, to, tokenId)
      ).toBeRevertedWith(expectedError);

      // post-conditions
      const postOwnerOf = await context.lsp8CompatibleERC721.ownerOf(tokenId);
      expect(postOwnerOf).toEqual(preOwnerOf);
    };

    describe("transferFrom", () => {
      const transferFn = "transferFrom";
      const force = true;
      const expectedData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(""));

      describe("when the from address is the tokenId owner", () => {
        describe("when `to` is an EOA", () => {
          it("should allow transfering the tokenId", async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
            };

            await transferSuccessScenario(
              txParams,
              transferFn,
              force,
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
                tokenId: mintedTokenId,
              };

              await transferSuccessScenario(
                txParams,
                transferFn,
                force,
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
                tokenId: mintedTokenId,
              };

              await transferSuccessScenario(
                txParams,
                transferFn,
                force,
                expectedData
              );
            });
          });
        });
      });

      describe("when the from address is not the tokenId owner", () => {
        it("should revert", async () => {
          const txParams = {
            operator: context.accounts.owner.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
          };
          const expectedError = `LSP8NotTokenOwner("${
            context.accounts.owner.address
          }", "${tokenIdAsBytes32(txParams.tokenId)}", "${txParams.from}")`;

          await transferFailScenario(txParams, transferFn, expectedError);
        });
      });
    });

    describe("safeTransferFrom(address,address,uint256)", () => {
      const transferFn = "safeTransferFrom(address,address,uint256)";
      const force = false;
      const expectedData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(""));

      describe("when the from address is the tokenId owner", () => {
        describe("when `to` is an EOA", () => {
          it("should revert", async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
            };
            const expectedError = `LSP8NotifyTokenReceiverIsEOA("${txParams.to}")`;

            await transferFailScenario(txParams, transferFn, expectedError);
          });
        });

        describe("when `to` is a contract", () => {
          describe("when receiving contract supports LSP1", () => {
            it("should allow transfering the tokenId", async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithLSP1.address,
                tokenId: mintedTokenId,
              };

              await transferSuccessScenario(
                txParams,
                transferFn,
                force,
                expectedData
              );
            });
          });

          describe("when receiving contract does not support LSP1", () => {
            it("should revert", async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithoutLSP1.address,
                tokenId: mintedTokenId,
              };
              const expectedError = `LSP8NotifyTokenReceiverContractMissingLSP1Interface("${txParams.to}")`;

              await transferFailScenario(txParams, transferFn, expectedError);
            });
          });
        });
      });

      describe("when the from address is not the tokenId owner", () => {
        it("should revert", async () => {
          const txParams = {
            operator: context.accounts.owner.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
          };

          const expectedError = `LSP8NotTokenOwner("${
            context.accounts.owner.address
          }", "${tokenIdAsBytes32(txParams.tokenId)}", "${txParams.from}")`;

          await transferFailScenario(txParams, transferFn, expectedError);
        });
      });
    });

    describe("safeTransferFrom(address,address,uint256,bytes)", () => {
      const transferFn = "safeTransferFrom(address,address,uint256,bytes)";
      const force = false;
      const expectedData = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(`custom-data-${Date.now()}`)
      );

      describe("when the from address is the tokenId owner", () => {
        describe("when `to` is an EOA", () => {
          it("should revert", async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
              data: expectedData,
            };
            const expectedError = `LSP8NotifyTokenReceiverIsEOA("${txParams.to}")`;

            await transferFailScenario(txParams, transferFn, expectedError);
          });
        });

        describe("when `to` is a contract", () => {
          describe("when receiving contract supports LSP1", () => {
            it("should allow transfering the tokenId", async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithLSP1.address,
                tokenId: mintedTokenId,
                data: expectedData,
              };

              await transferSuccessScenario(
                txParams,
                transferFn,
                force,
                expectedData
              );
            });
          });

          describe("when receiving contract does not support LSP1", () => {
            it("should revert", async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithoutLSP1.address,
                tokenId: mintedTokenId,
                data: expectedData,
              };
              const expectedError = `LSP8NotifyTokenReceiverContractMissingLSP1Interface("${txParams.to}")`;

              await transferFailScenario(txParams, transferFn, expectedError);
            });
          });
        });
      });

      describe("when the from address is not the tokenId owner", () => {
        it("should revert", async () => {
          const txParams = {
            operator: context.accounts.owner.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
            data: expectedData,
          };
          const expectedError = `LSP8NotTokenOwner("${
            context.accounts.owner.address
          }", "${tokenIdAsBytes32(txParams.tokenId)}", "${txParams.from}")`;

          await transferFailScenario(txParams, transferFn, expectedError);
        });
      });
    });
  });
};

export type LSP8InitializeTestContext = {
  lsp8CompatibleERC721: LSP8CompatibleERC721Tester;
  initializeTransaction: TransactionResponse;
  deployParams: LSP8CompatibleERC721DeployParams;
};

export const shouldInitializeLikeLSP8CompatibleERC721 = (
  buildContext: () => Promise<LSP8InitializeTestContext>
) => {
  let context: LSP8InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should have registered its ERC165 interface", async () => {
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        )
      );
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(
          INTERFACE_IDS.ERC721
        )
      );
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(
          INTERFACE_IDS.ERC721Metadata
        )
      );
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp8CompatibleERC721,
        "DataChanged",
        [SupportedStandards.LSP4DigitalAsset.key]
      );
      expect(
        await context.lsp8CompatibleERC721["getData(bytes32)"](
          SupportedStandards.LSP4DigitalAsset.key
        )
      ).toEqual(SupportedStandards.LSP4DigitalAsset.value);

      const nameKey =
        "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1";
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name)
      );
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp8CompatibleERC721,
        "DataChanged",
        [nameKey]
      );
      expect(
        await context.lsp8CompatibleERC721["getData(bytes32)"](nameKey)
      ).toEqual(expectedNameValue);

      const symbolKey =
        "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756";
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol)
      );
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp8CompatibleERC721,
        "DataChanged",
        [symbolKey]
      );
      expect(
        await context.lsp8CompatibleERC721["getData(bytes32)"](symbolKey)
      ).toEqual(expectedSymbolValue);
    });
  });
};
