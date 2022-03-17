import { ethers } from "hardhat";

import {
  LSP8CompatibilityForERC721Tester__factory,
  LSP8CompatibilityForERC721InitTester__factory,
} from "../../../types";

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8CompatibilityForERC721,
  shouldInitializeLikeLSP8CompatibilityForERC721,
  LSP8CompatibilityForERC721TestContext,
} from "./LSP8CompatibilityForERC721.behaviour";

import { deployProxy } from "../../utils/fixtures";

describe("LSP8CompatibilityForERC721", () => {
  describe("when using LSP8CompatibilityForERC721 contract with constructor", () => {
    const buildTestContext =
      async (): Promise<LSP8CompatibilityForERC721TestContext> => {
        const accounts = await getNamedAccounts();

        const tokenUriHex = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("ipfs://some-cid")
        );
        const tokenUriHash = ethers.utils.keccak256(tokenUriHex);
        const hashSig = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("keccak256(utf8)")
        );
        const lsp4MetadataValue = `${hashSig.slice(
          0,
          10
        )}${tokenUriHash.replace(/^0x/, "")}${tokenUriHex.replace(/^0x/, "")}`;

        const deployParams = {
          name: "Compat for ERC721",
          symbol: "NFT",
          newOwner: accounts.owner.address,
          lsp4MetadataValue,
        };

        const lsp8CompatibilityForERC721 =
          await new LSP8CompatibilityForERC721Tester__factory(
            accounts.owner
          ).deploy(
            deployParams.name,
            deployParams.symbol,
            deployParams.newOwner,
            deployParams.lsp4MetadataValue
          );

        return { accounts, lsp8CompatibilityForERC721, deployParams };
      };

    describe("when deploying the contract", () => {
      let context: LSP8CompatibilityForERC721TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8CompatibilityForERC721(async () => {
          const { lsp8CompatibilityForERC721, deployParams } = context;

          return {
            lsp8CompatibilityForERC721,
            deployParams,
            initializeTransaction:
              context.lsp8CompatibilityForERC721.deployTransaction,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8CompatibilityForERC721(buildTestContext);
    });
  });

  describe("when using LSP8 contract with proxy", () => {
    const buildTestContext =
      async (): Promise<LSP8CompatibilityForERC721TestContext> => {
        const accounts = await getNamedAccounts();

        const tokenUriHex = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("ipfs://some-cid")
        );
        const tokenUriHash = ethers.utils.keccak256(tokenUriHex);
        const hashSig = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("keccak256(utf8)")
        );
        const lsp4MetadataValue = `${hashSig.slice(
          0,
          10
        )}${tokenUriHash.replace(/^0x/, "")}${tokenUriHex.replace(/^0x/, "")}`;

        const deployParams = {
          name: "LSP8 - deployed with constructor",
          symbol: "NFT",
          newOwner: accounts.owner.address,
          lsp4MetadataValue,
        };

        const lsp8CompatibilityForERC721TesterInit =
          await new LSP8CompatibilityForERC721InitTester__factory(
            accounts.owner
          ).deploy();
        const lsp8CompatibilityForERC721Proxy = await deployProxy(
          lsp8CompatibilityForERC721TesterInit.address,
          accounts.owner
        );
        const lsp8CompatibilityForERC721 =
          lsp8CompatibilityForERC721TesterInit.attach(
            lsp8CompatibilityForERC721Proxy
          );

        return { accounts, lsp8CompatibilityForERC721, deployParams };
      };

    const initializeProxy = async (
      context: LSP8CompatibilityForERC721TestContext
    ) => {
      return context.lsp8CompatibilityForERC721[
        "initialize(string,string,address,bytes)"
      ](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner,
        context.deployParams.lsp4MetadataValue
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP8CompatibilityForERC721TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8CompatibilityForERC721(async () => {
          const { lsp8CompatibilityForERC721, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp8CompatibilityForERC721,
            deployParams,
            initializeTransaction,
          };
        });
      });

      describe("when calling initialize more than once", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).toBeRevertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8CompatibilityForERC721(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
