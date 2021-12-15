import {
  LSP7MintableInit,
  LSP7MintableInit__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
} from "../../../types";
import { deployProxy } from "../../utils/proxy";

import { shouldInitializeLikeLSP7 } from "../LSP7DigitalAsset.behaviour";
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7Mintable,
  LSP7MintableTestContext,
  LSP7MintableDeployParams,
} from "./LSP7Mintable.behavior";

describe("LSP7Mintable", () => {
  describe("when using LSP7Mintable with constructor", () => {
    const buildTestContext = async (): Promise<LSP7MintableTestContext> => {
      const accounts = await getNamedAccounts();

      const deployParams: LSP7MintableDeployParams = {
        name: "LSP7Mintable - deployed with constructor",
        symbol: "LSP7MNT",
        newOwner: accounts.owner.address,
        isNFT: false,
      };

      const lsp7Mintable: LSP7Mintable = await new LSP7Mintable__factory(
        accounts.owner
      ).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner,
        deployParams.isNFT
      );

      return { accounts, lsp7Mintable, deployParams };
    };

    describe("when deploying the contract", () => {
      let context: LSP7MintableTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      shouldInitializeLikeLSP7(async () => {
        const { lsp7Mintable: lsp7, deployParams } = context;
        return {
          lsp7,
          deployParams,
          initializeTransaction: context.lsp7Mintable.deployTransaction,
        };
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP7Mintable(buildTestContext);
    });
  });

  describe("when using LSP7Mintable with proxy", () => {
    const buildTestContext = async () => {
      const accounts = await getNamedAccounts();

      const deployParams: LSP7MintableDeployParams = {
        name: "LSP7 Mintable - deployed with proxy",
        symbol: "LSP7 MNTBL",
        newOwner: accounts.owner.address,
        isNFT: false,
      };

      const LSP7MintableInit: LSP7MintableInit =
        await new LSP7MintableInit__factory(accounts.owner).deploy();

      const lsp7MintableProxy = await deployProxy(
        LSP7MintableInit.address,
        accounts.owner
      );
      const lsp7Mintable: LSP7MintableInit =
        LSP7MintableInit.attach(lsp7MintableProxy);

      return { accounts, lsp7Mintable, deployParams };
    };

    const initializeProxy = async (context: LSP7MintableTestContext) => {
      return context.lsp7Mintable["initialize(string,string,address,bool)"](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner,
        context.deployParams.isNFT
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP7MintableTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP7(async () => {
          const { lsp7Mintable: lsp7, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp7,
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
      shouldBehaveLikeLSP7Mintable(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
