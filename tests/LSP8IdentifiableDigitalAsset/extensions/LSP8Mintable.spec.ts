import {
  LSP8Mintable,
  LSP8Mintable__factory,
  LSP8MintableInit,
  LSP8MintableInit__factory,
} from "../../../types";

import { shouldInitializeLikeLSP8 } from "../LSP8IdentifiableDigitalAsset.behaviour";
import {
  shouldBehaveLikeLSP8Mintable,
  LSP8MintableTestContext,
  getNamedAccounts,
} from "./LSP8Mintable.behavior";

import { deployProxy } from "../../utils/fixtures";

describe("LSP8Mintable", () => {
  describe("when using LSP8Mintable with constructor", () => {
    const buildTestContext = async () => {
      const accounts = await getNamedAccounts();

      const deployParams = {
        name: "LSP8 Mintable - deployed with constructor",
        symbol: "LSP8 MNTBL",
        newOwner: accounts.owner.address,
      };

      const lsp8Mintable: LSP8Mintable = await new LSP8Mintable__factory(
        accounts.owner
      ).deploy(deployParams.name, deployParams.symbol, deployParams.newOwner);

      return { accounts, lsp8Mintable, deployParams };
    };

    describe("when deploying the contract", () => {
      let context: LSP8MintableTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      shouldInitializeLikeLSP8(async () => {
        const { lsp8Mintable: lsp8, deployParams } = context;

        return {
          lsp8,
          deployParams,
          initializeTransaction: context.lsp8Mintable.deployTransaction,
        };
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8Mintable(buildTestContext);
    });
  });

  describe("when using LSP8Mintable with proxy", () => {
    const buildTestContext = async () => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        name: "LSP8 Mintable - deployed with proxy",
        symbol: "MNTBL",
        newOwner: accounts.owner.address,
      };

      const LSP8MintableInit: LSP8MintableInit =
        await new LSP8MintableInit__factory(accounts.owner).deploy();

      const lsp8MintableProxy = await deployProxy(
        LSP8MintableInit.address,
        accounts.owner
      );
      const lsp8Mintable: LSP8MintableInit =
        LSP8MintableInit.attach(lsp8MintableProxy);

      return { accounts, lsp8Mintable, deployParams };
    };

    const initializeProxy = async (context: LSP8MintableTestContext) => {
      return context.lsp8Mintable["initialize(string,string,address)"](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner
      );
    };
    describe("when deploying the contract as proxy", () => {
      let context: LSP8MintableTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });
      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP8(async () => {
          const { lsp8Mintable: lsp8, deployParams } = context;
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
      shouldBehaveLikeLSP8Mintable(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
