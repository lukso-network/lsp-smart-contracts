import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  LSP8CompatibilityForERC721Tester,
  LSP8CompatibilityForERC721Tester__factory,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from "../../../types";
import { tokenIdAsBytes32 } from "../../utils/tokens";
import { INTERFACE_IDS } from "../../../constants";

import type { BytesLike } from "ethers";

type LSP8CompatibilityForERC721TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

const getNamedAccounts =
  async (): Promise<LSP8CompatibilityForERC721TestAccounts> => {
    const [owner, tokenReceiver, operator, anotherOperator, anyone] =
      await ethers.getSigners();
    return { owner, tokenReceiver, operator, anotherOperator, anyone };
  };

type LSP8CompatibilityForERC721TestContext = {
  accounts: LSP8CompatibilityForERC721TestAccounts;
  lsp8CompatibilityForERC721: LSP8CompatibilityForERC721Tester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    tokenURIValue: string;
  };
};

const buildTestContext =
  async (): Promise<LSP8CompatibilityForERC721TestContext> => {
    const accounts = await getNamedAccounts();

    const deployParams = {
      name: "Compat for ERC721",
      symbol: "NFT",
      newOwner: accounts.owner.address,
      tokenURIValue: "LSP4Metadata -> JSONURL",
    };

    const lsp8CompatibilityForERC721 =
      await new LSP8CompatibilityForERC721Tester__factory(
        accounts.owner
      ).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner,
        deployParams.tokenURIValue
      );

    await lsp8CompatibilityForERC721.mint(
      accounts.owner.address,
      mintedTokenId,
      ethers.utils.toUtf8Bytes("mint a token for the owner")
    );

    return { accounts, lsp8CompatibilityForERC721, deployParams };
  };

const mintedTokenId = tokenIdAsBytes32(10);
const neverMintedTokenId = tokenIdAsBytes32(1010110);

describe("LSP8CompatibilityForERC721", () => {
  let context: LSP8CompatibilityForERC721TestContext;
  beforeEach(async () => {
    context = await buildTestContext();
  });

  describe("when checking supported ERC165 interfaces", () => {
    it("should support EC721", async () => {
      expect(
        await context.lsp8CompatibilityForERC721.supportsInterface(
          INTERFACE_IDS.ERC721
        )
      ).toEqual(true);
    });

    it("should support EC721Metadata", async () => {
      expect(
        await context.lsp8CompatibilityForERC721.supportsInterface(
          INTERFACE_IDS.ERC721Metadata
        )
      ).toEqual(true);
    });
  });

  describe("name", () => {
    it("should allow reading name", async () => {
      // using compatibility getter -> returns(string)
      const nameAsString = await context.lsp8CompatibilityForERC721.name();
      expect(nameAsString).toEqual(context.deployParams.name);

      // using getData -> returns(bytes)
      const data = await context.lsp8CompatibilityForERC721.getData([
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenName")),
      ]);
      const nameAsBytes = data[0];
      expect(ethers.utils.toUtf8String(nameAsBytes)).toEqual(
        context.deployParams.name
      );
    });
  });

  describe("symbol", () => {
    it("should allow reading symbol", async () => {
      // using compatibility getter -> returns(string)
      const symbolAsString = await context.lsp8CompatibilityForERC721.symbol();
      expect(symbolAsString).toEqual(context.deployParams.symbol);

      // using getData -> returns(bytes)
      const data = await context.lsp8CompatibilityForERC721.getData([
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenSymbol")),
      ]);
      const symbolAsBytes = data[0];
      expect(ethers.utils.toUtf8String(symbolAsBytes)).toEqual(
        context.deployParams.symbol
      );
    });
  });

  describe("tokenURI", () => {
    it("should allow reading tokenURI", async () => {
      // using compatibility getter -> returns(string)
      const tokenURIAsString =
        await context.lsp8CompatibilityForERC721.tokenURI(mintedTokenId);
      expect(tokenURIAsString).toEqual(context.deployParams.tokenURIValue);

      // using getData -> returns(bytes)
      const data = await context.lsp8CompatibilityForERC721.getData([
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4Metadata")),
      ]);
      const symbolAsBytes = data[0];
      expect(ethers.utils.toUtf8String(symbolAsBytes)).toEqual(
        context.deployParams.tokenURIValue
      );
    });
  });

  describe("ownerOf", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8CompatibilityForERC721.ownerOf(neverMintedTokenId)
        ).toBeRevertedWith("LSP8: can not query non existent token");
      });
    });

    describe("when tokenId has been minted", () => {
      it("should return owner address", async () => {
        expect(
          await context.lsp8CompatibilityForERC721.ownerOf(mintedTokenId)
        ).toEqual(context.accounts.owner.address);
      });
    });
  });

  describe("approve", () => {
    describe("when caller is not owner of tokenId", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8CompatibilityForERC721
            .connect(context.accounts.anyone)
            .approve(context.accounts.operator.address, mintedTokenId)
        ).toBeRevertedWith(
          "LSP8: caller can not authorize operator for token id"
        );
      });
    });

    describe("when caller is owner of tokenId", () => {
      describe("when operator is not the zero address", () => {
        it("should succeed", async () => {
          const operator = context.accounts.operator.address;
          const tokenId = mintedTokenId;

          const tx = await context.lsp8CompatibilityForERC721.approve(
            operator,
            tokenId
          );

          expect(tx).toHaveEmittedWith(
            context.lsp8CompatibilityForERC721,
            "AuthorizedOperator",
            [
              operator,
              context.accounts.owner.address,
              tokenIdAsBytes32(tokenId),
            ]
          );

          expect(tx).toHaveEmittedWith(
            context.lsp8CompatibilityForERC721,
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
            context.lsp8CompatibilityForERC721.approve(operator, tokenId)
          ).toBeRevertedWith("LSP8: can not authorize zero address");
        });
      });
    });
  });

  describe("getApproved", () => {
    describe("when tokenId has not been minted", () => {
      it("should revert", async () => {
        await expect(
          context.lsp8CompatibilityForERC721.getApproved(neverMintedTokenId)
        ).toBeRevertedWith(
          "LSP8: can not query operator for non existent token"
        );
      });
    });

    describe("when tokenId has been minted", () => {
      describe("when there have been no approvals for the tokenId", () => {
        it("should return address(0)", async () => {
          expect(
            await context.lsp8CompatibilityForERC721.getApproved(mintedTokenId)
          ).toEqual(ethers.constants.AddressZero);
        });
      });

      describe("when one account has been approved for the tokenId", () => {
        it("should return the operator address", async () => {
          await context.lsp8CompatibilityForERC721.approve(
            context.accounts.operator.address,
            tokenIdAsBytes32(mintedTokenId)
          );

          expect(
            await context.lsp8CompatibilityForERC721.getApproved(mintedTokenId)
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

          await context.lsp8CompatibilityForERC721.approve(
            operatorFirstAndThirdCall,
            tokenIdAsBytes32(mintedTokenId)
          );
          await context.lsp8CompatibilityForERC721.approve(
            operatorSecondCall,
            tokenIdAsBytes32(mintedTokenId)
          );
          await context.lsp8CompatibilityForERC721.approve(
            operatorFirstAndThirdCall,
            tokenIdAsBytes32(mintedTokenId)
          );

          expect(
            await context.lsp8CompatibilityForERC721.getApproved(mintedTokenId)
          ).toEqual(context.accounts.anotherOperator.address);
        });
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
      // setup so we can observe approvals being cleared during transfer tests
      await context.lsp8CompatibilityForERC721.approve(
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
      const preOwnerOf = await context.lsp8CompatibilityForERC721.ownerOf(
        tokenId
      );
      expect(preOwnerOf).toEqual(from);

      // effect
      const txArgs = [from, to, tokenId];
      if (data) txArgs.push(data);

      const tx = await context.lsp8CompatibilityForERC721[transferFn](
        ...txArgs
      );
      expect(tx).toHaveEmittedWith(
        context.lsp8CompatibilityForERC721,
        "Transfer(address,address,address,bytes32,bool,bytes)",
        [operator, from, to, tokenIdAsBytes32(tokenId), force, expectedData]
      );
      expect(tx).toHaveEmittedWith(
        context.lsp8CompatibilityForERC721,
        "Transfer(address,address,uint256)",
        [from, to, ethers.BigNumber.from(tokenId)]
      );
      expect(tx).toHaveEmittedWith(
        context.lsp8CompatibilityForERC721,
        "RevokedOperator",
        [context.accounts.operator.address, from, tokenIdAsBytes32(tokenId)]
      );

      // post-conditions
      const postOwnerOf = await context.lsp8CompatibilityForERC721.ownerOf(
        tokenId
      );
      expect(postOwnerOf).toEqual(to);
    };

    const transferFailScenario = async (
      { from, to, tokenId }: TransferTxParams,
      transferFn: string,
      expectedError: string
    ) => {
      // pre-conditions
      const preOwnerOf = await context.lsp8CompatibilityForERC721.ownerOf(
        tokenId
      );

      // effect
      await expect(
        context.lsp8CompatibilityForERC721[transferFn](from, to, tokenId)
      ).toBeRevertedWith(expectedError);

      // post-conditions
      const postOwnerOf = await context.lsp8CompatibilityForERC721.ownerOf(
        tokenId
      );
      expect(postOwnerOf).toEqual(preOwnerOf);
    };

    describe("transferFrom", () => {
      const transferFn = "transferFrom";
      const force = true;
      const expectedData = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("compat-transferFrom")
      );

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
            operator: context.accounts.anyone.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
          };
          const expectedError =
            "LSP8: transfer of tokenId from incorrect owner";

          await transferFailScenario(txParams, transferFn, expectedError);
        });
      });
    });

    describe("safeTransferFrom(address,address,uint256)", () => {
      const transferFn = "safeTransferFrom(address,address,uint256)";
      const force = false;
      const expectedData = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("compat-safeTransferFrom")
      );

      describe("when the from address is the tokenId owner", () => {
        describe("when `to` is an EOA", () => {
          it("should revert", async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
            };
            const expectedError = "LSP8: token receiver is EOA";

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
              const expectedError =
                "LSP8: token receiver contract missing LSP1 interface";

              await transferFailScenario(txParams, transferFn, expectedError);
            });
          });
        });
      });

      describe("when the from address is not the tokenId owner", () => {
        it("should revert", async () => {
          const txParams = {
            operator: context.accounts.anyone.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
          };
          const expectedError =
            "LSP8: transfer of tokenId from incorrect owner";

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
            const expectedError = "LSP8: token receiver is EOA";

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
              const expectedError =
                "LSP8: token receiver contract missing LSP1 interface";

              await transferFailScenario(txParams, transferFn, expectedError);
            });
          });
        });
      });

      describe("when the from address is not the tokenId owner", () => {
        it("should revert", async () => {
          const txParams = {
            operator: context.accounts.anyone.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
            data: expectedData,
          };
          const expectedError =
            "LSP8: transfer of tokenId from incorrect owner";

          await transferFailScenario(txParams, transferFn, expectedError);
        });
      });
    });
  });
});
