import { ethers } from "hardhat";
import { expect } from "chai";

import {
  LSP8Tester__factory,
  LSP8InitTester__factory,
  LSP8IdentifiableDigitalAsset,
} from "../../types";

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8,
  shouldInitializeLikeLSP8,
  LSP8TestContext,
} from "./LSP8IdentifiableDigitalAsset.behaviour";

import {
  LS4DigitalAssetMetadataTestContext,
  shouldBehaveLikeLSP4DigitalAssetMetadata,
} from "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour";

import { deployProxy } from "../utils/fixtures";

describe("LSP8", () => {
  describe("when using LSP8 contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP8TestContext> => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        name: "LSP8 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.owner.address,
      };
      const lsp8 = await new LSP8Tester__factory(accounts.owner).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner
      );

      return { accounts, lsp8, deployParams };
    };

    const buildLSP4DigitalAssetMetadataTestContext =
      async (): Promise<LS4DigitalAssetMetadataTestContext> => {
        const { lsp8 } = await buildTestContext();
        let accounts = await ethers.getSigners();

        let deployParams = {
          owner: accounts[0],
        };

        return {
          contract: lsp8 as LSP8IdentifiableDigitalAsset,
          accounts,
          deployParams,
        };
      };

    describe("when deploying the contract", () => {
      it("should revert when deploying with address(0) as owner", async () => {
        const accounts = await ethers.getSigners();

        const deployParams = {
          name: "LSP8 - deployed with constructor",
          symbol: "NFT",
          newOwner: ethers.constants.AddressZero,
        };

        await expect(
          new LSP8Tester__factory(accounts[0]).deploy(
            deployParams.name,
            deployParams.symbol,
            ethers.constants.AddressZero
          )
        ).to.be.revertedWith("Ownable: new owner is the zero address");
      });

      describe("once the contract was deployed", () => {
        let context: LSP8TestContext;

        beforeEach(async () => {
          context = await buildTestContext();
        });

        shouldInitializeLikeLSP8(async () => {
          const { lsp8, deployParams } = context;

          return {
            lsp8,
            deployParams,
            initializeTransaction: context.lsp8.deployTransaction,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP4DigitalAssetMetadata(
        buildLSP4DigitalAssetMetadataTestContext
      );
      shouldBehaveLikeLSP8(buildTestContext);
    });
  });

  describe("when using LSP8 contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP8TestContext> => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        name: "LSP8 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.owner.address,
      };

      const lsp8TesterInit = await new LSP8InitTester__factory(
        accounts.owner
      ).deploy();
      const lsp8Proxy = await deployProxy(
        lsp8TesterInit.address,
        accounts.owner
      );
      const lsp8 = lsp8TesterInit.attach(lsp8Proxy);

      return { accounts, lsp8, deployParams };
    };

    const buildLSP4DigitalAssetMetadataTestContext =
      async (): Promise<LS4DigitalAssetMetadataTestContext> => {
        const { lsp8 } = await buildTestContext();
        let accounts = await ethers.getSigners();

        let deployParams = {
          owner: accounts[0],
        };

        return {
          contract: lsp8 as LSP8IdentifiableDigitalAsset,
          accounts,
          deployParams,
        };
      };

    const initializeProxy = async (context: LSP8TestContext) => {
      return context.lsp8["initialize(string,string,address)"](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP8TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it("should revert when initializing with address(0) as owner", async () => {
        await expect(
          context.lsp8["initialize(string,string,address)"](
            context.deployParams.name,
            context.deployParams.symbol,
            ethers.constants.AddressZero
          )
        ).to.be.revertedWith("Ownable: new owner is the zero address");
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8(async () => {
          const { lsp8, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp8,
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
      shouldBehaveLikeLSP4DigitalAssetMetadata(async () => {
        let lsp4Context = await buildLSP4DigitalAssetMetadataTestContext();

        await lsp4Context.contract["initialize(string,string,address)"](
          "LSP8 - deployed with proxy",
          "NFT",
          lsp4Context.deployParams.owner.address
        );

        return lsp4Context;
      });

      shouldBehaveLikeLSP8(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
