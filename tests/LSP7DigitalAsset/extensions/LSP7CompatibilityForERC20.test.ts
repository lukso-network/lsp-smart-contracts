import { ethers } from "hardhat";

import {
  LSP7CompatibilityForERC20Tester__factory,
  LSP7CompatibilityForERC20InitTester__factory,
} from "../../../types";

import {
  getNamedAccounts,
  LSP7CompatibilityForERC20TestContext,
  shouldInitializeLikeLSP7CompatibilityForERC20,
  shouldBehaveLikeLSP7CompatibilityForERC20,
} from "./LSP7CompatibilityForERC20.behaviour";

import { deployProxy } from "../../utils/fixtures";

describe("LSP7CompatibilityForERC20", () => {
  describe("when using LSP7 contract with constructor", () => {
    const buildTestContext =
      async (): Promise<LSP7CompatibilityForERC20TestContext> => {
        const accounts = await getNamedAccounts();
        const initialSupply = ethers.BigNumber.from("3");
        const deployParams = {
          name: "Compat for ERC20",
          symbol: "NFT",
          newOwner: accounts.owner.address,
        };

        const lsp7CompatibilityForERC20 =
          await new LSP7CompatibilityForERC20Tester__factory(
            accounts.owner
          ).deploy(
            deployParams.name,
            deployParams.symbol,
            deployParams.newOwner
          );

        return {
          accounts,
          lsp7CompatibilityForERC20,
          deployParams,
          initialSupply,
        };
      };

    describe("when deploying the contract", () => {
      let context: LSP7CompatibilityForERC20TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP7CompatibilityForERC20(async () => {
          const { lsp7CompatibilityForERC20, deployParams } = context;
          return {
            lsp7CompatibilityForERC20,
            deployParams,
            initializeTransaction:
              context.lsp7CompatibilityForERC20.deployTransaction,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP7CompatibilityForERC20(buildTestContext);
    });
  });

  describe("when using LSP7 contract with proxy", () => {
    const buildTestContext =
      async (): Promise<LSP7CompatibilityForERC20TestContext> => {
        const accounts = await getNamedAccounts();
        const initialSupply = ethers.BigNumber.from("3");
        const deployParams = {
          name: "LSP7 - deployed with constructor",
          symbol: "NFT",
          newOwner: accounts.owner.address,
        };

        const lsp7CompatibilityForERC20TesterInit =
          await new LSP7CompatibilityForERC20InitTester__factory(
            accounts.owner
          ).deploy();
        const lsp7CompatibilityForERC20Proxy = await deployProxy(
          lsp7CompatibilityForERC20TesterInit.address,
          accounts.owner
        );
        const lsp7CompatibilityForERC20 =
          lsp7CompatibilityForERC20TesterInit.attach(
            lsp7CompatibilityForERC20Proxy
          );

        return {
          accounts,
          lsp7CompatibilityForERC20,
          deployParams,
          initialSupply,
        };
      };

    const initializeProxy = async (
      context: LSP7CompatibilityForERC20TestContext
    ) => {
      return context.lsp7CompatibilityForERC20[
        "initialize(string,string,address)"
      ](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP7CompatibilityForERC20TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP7CompatibilityForERC20(async () => {
          const { lsp7CompatibilityForERC20, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp7CompatibilityForERC20,
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
      shouldBehaveLikeLSP7CompatibilityForERC20(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
