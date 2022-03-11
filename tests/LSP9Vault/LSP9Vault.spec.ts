import {
  LSP9Vault__factory,
  LSP9VaultInit__factory,
  LSP1UniversalReceiverDelegateUP,
  LSP1UniversalReceiverDelegateUP__factory,
  UniversalProfile,
  LSP6KeyManager,
} from "../../types";
import { deployProxy } from "../utils/proxy";
import {
  getNamedAccounts,
  shouldBehaveLikeLSP9,
  shouldInitializeLikeLSP9,
  LSP9TestContext,
} from "./LSP9Vault.behaviour";

import { setupProfileWithKeyManagerWithURD } from "../utils/fixtures";

describe("LSP9Vault", () => {
  describe("when using LSP9Vault contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP9TestContext> => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        newOwner: accounts.owner.address,
      };
      const lsp9Vault = await new LSP9Vault__factory(accounts.owner).deploy(
        deployParams.newOwner
      );

      const [
        UP1,
        KM1,
        lsp1universalReceiverDelegateUP,
      ] = await setupProfileWithKeyManagerWithURD(accounts.owner);

      const universalProfile = UP1 as UniversalProfile;
      const lsp6KeyManager = KM1 as LSP6KeyManager;

      return {
        accounts,
        lsp9Vault,
        deployParams,
        universalProfile,
        lsp6KeyManager,
      };
    };

    describe("when deploying the contract", () => {
      let context: LSP9TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP9(async () => {
          const { lsp9Vault, deployParams } = context;

          return {
            lsp9Vault,
            deployParams,
            initializeTransaction: context.lsp9Vault.deployTransaction,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP9(buildTestContext);
    });
  });

  describe("when using LSP9Vault contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP9TestContext> => {
      const accounts = await getNamedAccounts();
      const deployParams = {
        newOwner: accounts.owner.address,
      };

      const lsp9VaultInit = await new LSP9VaultInit__factory(
        accounts.owner
      ).deploy();
      const lsp9VaultProxy = await deployProxy(
        lsp9VaultInit.address,
        accounts.owner
      );
      const lsp9Vault = lsp9VaultInit.attach(lsp9VaultProxy);

      const [
        UP1,
        KM1,
        lsp1universalReceiverDelegateUP,
      ] = await setupProfileWithKeyManagerWithURD(accounts.owner);

      const universalProfile = UP1 as UniversalProfile;
      const lsp6KeyManager = KM1 as LSP6KeyManager;

      return {
        accounts,
        lsp9Vault,
        deployParams,
        universalProfile,
        lsp6KeyManager,
      };
    };

    const initializeProxy = async (context: LSP9TestContext) => {
      return context.lsp9Vault["initialize(address)"](
        context.deployParams.newOwner
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP9TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP9(async () => {
          const { lsp9Vault, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp9Vault,
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
      shouldBehaveLikeLSP9(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
