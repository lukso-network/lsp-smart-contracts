import { ethers } from "hardhat";
import {
  LSP8CappedSupplyTester__factory,
  LSP8CappedSupplyInitTester__factory,
} from "../../../types";

import { shouldInitializeLikeLSP8 } from "../LSP8IdentifiableDigitalAsset.behaviour";
import {
  shouldBehaveLikeLSP8CappedSupply,
  LSP8CappedSupplyTestContext,
  getNamedAccounts,
} from "./LSP8CappedSupply.behaviour";

import { deployProxy } from "../../utils/fixtures";

describe("LSP8CappedSupply", () => {
  describe("when using LSP8CappedSupply with constructor", () => {
    const buildTestContext = async () => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        name: "LSP8 capped supply - deployed with constructor",
        symbol: "CAP",
        newOwner: accounts.owner.address,
        tokenSupplyCap: ethers.BigNumber.from("2"),
      };
      const lsp8CappedSupply = await new LSP8CappedSupplyTester__factory(
        accounts.owner
      ).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner,
        deployParams.tokenSupplyCap
      );

      return { accounts, lsp8CappedSupply, deployParams };
    };

    describe("when deploying the contract", () => {
      let context: LSP8CappedSupplyTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      shouldInitializeLikeLSP8(async () => {
        const { lsp8CappedSupply: lsp8, deployParams } = context;

        return {
          lsp8,
          deployParams,
          initializeTransaction: context.lsp8CappedSupply.deployTransaction,
        };
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8CappedSupply(buildTestContext);
    });
  });

  describe("when using LSP8CappedSupply with proxy", () => {
    const buildTestContext = async () => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        name: "LSP8 capped supply - deployed with proxy",
        symbol: "CAP",
        newOwner: accounts.owner.address,
        tokenSupplyCap: ethers.BigNumber.from("2"),
      };
      const lsp8CappedSupplyInit =
        await new LSP8CappedSupplyInitTester__factory(accounts.owner).deploy();
      const lsp8CappedSupplyProxy = await deployProxy(
        lsp8CappedSupplyInit.address,
        accounts.owner
      );
      const lsp8CappedSupply = lsp8CappedSupplyInit.attach(
        lsp8CappedSupplyProxy
      );

      return { accounts, lsp8CappedSupply, deployParams };
    };

    const initializeProxy = async (context: LSP8CappedSupplyTestContext) => {
      return context.lsp8CappedSupply[
        "initialize(string,string,address,uint256)"
      ](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner,
        context.deployParams.tokenSupplyCap
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP8CappedSupplyTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8(async () => {
          const { lsp8CappedSupply: lsp8, deployParams } = context;
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

          await expect(initializeProxy(context)).toBeRevertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8CappedSupply(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
