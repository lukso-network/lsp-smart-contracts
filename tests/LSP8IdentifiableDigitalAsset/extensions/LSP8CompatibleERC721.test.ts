import { ethers } from "hardhat";
import { expect } from "chai";

import {
  LSP8CompatibleERC721Tester__factory,
  LSP8CompatibleERC721InitTester__factory,
} from "../../../types";

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8CompatibleERC721,
  shouldInitializeLikeLSP8CompatibleERC721,
  LSP8CompatibleERC721TestContext,
} from "./LSP8CompatibleERC721.behaviour";

import { deployProxy } from "../../utils/fixtures";

describe("LSP8CompatibleERC721", () => {
  describe("when using LSP8CompatibleERC721 contract with constructor", () => {
    const buildTestContext =
      async (): Promise<LSP8CompatibleERC721TestContext> => {
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

        const lsp8CompatibleERC721 =
          await new LSP8CompatibleERC721Tester__factory(accounts.owner).deploy(
            deployParams.name,
            deployParams.symbol,
            deployParams.newOwner,
            deployParams.lsp4MetadataValue
          );

        return { accounts, lsp8CompatibleERC721, deployParams };
      };

    describe("when deploying the contract", () => {
      let context: LSP8CompatibleERC721TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8CompatibleERC721(async () => {
          const { lsp8CompatibleERC721, deployParams } = context;

          return {
            lsp8CompatibleERC721,
            deployParams,
            initializeTransaction:
              context.lsp8CompatibleERC721.deployTransaction,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8CompatibleERC721(buildTestContext);
    });
  });

  describe("when using LSP8 contract with proxy", () => {
    const buildTestContext =
      async (): Promise<LSP8CompatibleERC721TestContext> => {
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

        const lsp8CompatibleERC721TesterInit =
          await new LSP8CompatibleERC721InitTester__factory(
            accounts.owner
          ).deploy();
        const lsp8CompatibleERC721Proxy = await deployProxy(
          lsp8CompatibleERC721TesterInit.address,
          accounts.owner
        );
        const lsp8CompatibleERC721 = lsp8CompatibleERC721TesterInit.attach(
          lsp8CompatibleERC721Proxy
        );

        return { accounts, lsp8CompatibleERC721, deployParams };
      };

    const initializeProxy = async (
      context: LSP8CompatibleERC721TestContext
    ) => {
      return context.lsp8CompatibleERC721[
        "initialize(string,string,address,bytes)"
      ](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner,
        context.deployParams.lsp4MetadataValue
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP8CompatibleERC721TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8CompatibleERC721(async () => {
          const { lsp8CompatibleERC721, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp8CompatibleERC721,
            deployParams,
            initializeTransaction,
          };
        });
      });

      describe("when calling initialize more than once", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).to.be.revertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8CompatibleERC721(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
