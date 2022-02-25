import {
  getNamedAccounts,
  shouldInitializeLikeLSP11,
  LSP11TestContext,
  shouldBehaveLikeLSP11NormalThreshold,
  shouldBehaveLikeLSP11NullThreshold,
} from "./LSP11SocialRecovery.behavior";

import {
  setupProfileWithKeyManager,
  setupSocialRecovery,
  setupSocialRecoveryInit,
} from "../utils/fixtures";

describe("LSP11SocialRecovery contract", () => {
  describe("When using LSP11 contract with constructor", () => {
    describe("When setting the threshold = 0", () => {
      const buildTestContext = async (): Promise<LSP11TestContext> => {
        const accounts = await getNamedAccounts();

        const { universalProfile, lsp6KeyManager } =
          await setupProfileWithKeyManager(accounts.owner);

        const deployParams = {
          owner: accounts.owner,
          account: universalProfile,
          threshold: 0,
        };

        const lsp11SocialRecovery = await setupSocialRecovery(
          accounts.owner,
          deployParams.owner,
          deployParams.account,
          lsp6KeyManager,
          deployParams.threshold
        );

        return {
          accounts,
          lsp11SocialRecovery,
          deployParams,
          universalProfile,
          lsp6KeyManager,
        };
      };

      describe("when deploying the contract", () => {
        let context: LSP11TestContext;

        beforeEach(async () => {
          context = await buildTestContext();
        });

        describe("when initializing the contract", () => {
          shouldInitializeLikeLSP11(async () => {
            const { lsp11SocialRecovery, deployParams } = context;
            return {
              lsp11SocialRecovery,
              deployParams,
              initializeTransaction:
                context.lsp11SocialRecovery.deployTransaction,
            };
          });
        });
      });

      describe("when testing deployed contract", () => {
        shouldBehaveLikeLSP11NullThreshold(buildTestContext);
      });
    });

    describe("When setting the threshold > 0", () => {
      const buildTestContext = async (): Promise<LSP11TestContext> => {
        const accounts = await getNamedAccounts();

        const { universalProfile, lsp6KeyManager } =
          await setupProfileWithKeyManager(accounts.owner);
        
        const deployParams = {
          owner: accounts.owner,
          account: universalProfile,
          threshold: 3,
        };

        const lsp11SocialRecovery = await setupSocialRecovery(
          accounts.owner,
          deployParams.owner,
          deployParams.account,
          lsp6KeyManager,
          deployParams.threshold
        );

        return {
          accounts,
          lsp11SocialRecovery,
          deployParams,
          universalProfile,
          lsp6KeyManager,
        };
      };

      describe("When deploying the contract", () => {
        let context: LSP11TestContext;

        beforeEach(async () => {
          context = await buildTestContext();
        });

        describe("When initializing the contract", () => {
          shouldInitializeLikeLSP11(async () => {
            const { lsp11SocialRecovery, deployParams } = context;
            return {
              lsp11SocialRecovery,
              deployParams,
              initializeTransaction:
                context.lsp11SocialRecovery.deployTransaction,
            };
          });
        });
      });

      describe("When testing deployed contract", () => {
        shouldBehaveLikeLSP11NormalThreshold(buildTestContext);
      });
    });
  });

  describe("When using LSP11contract with proxy", () => {
    describe("When setting the threshold = 0", () => {
      const buildTestContext = async (): Promise<LSP11TestContext> => {
        const accounts = await getNamedAccounts();

        const { universalProfile, lsp6KeyManager } =
          await setupProfileWithKeyManager(accounts.owner);
        
        const deployParams = {
          owner: accounts.owner,
          account: universalProfile,
          threshold: 0,
        };

        const lsp11SocialRecovery = await setupSocialRecoveryInit(
          accounts.owner,
          deployParams.owner,
          deployParams.account,
          lsp6KeyManager,
          deployParams.threshold
        );

        return {
          accounts,
          lsp11SocialRecovery,
          deployParams,
          universalProfile,
          lsp6KeyManager,
        };
      };

      const initializeProxy = async (context: LSP11TestContext) => {
        return context.lsp11SocialRecovery[
          "initialize(address,address,uint256)"
        ](
          context.deployParams.owner.address,
          context.deployParams.account.address,
          context.deployParams.threshold
        );
      };

      describe("When deploying the contract as proxy", () => {
        let context: LSP11TestContext;

        beforeEach(async () => {
          context = await buildTestContext();
        });

        describe("When initializing the contract", () => {
          shouldInitializeLikeLSP11(async () => {
            const { lsp11SocialRecovery, deployParams } = context;
            const initializeTransaction = await initializeProxy(context);

            return {
              lsp11SocialRecovery,
              deployParams,
              initializeTransaction,
            };
          });
        });

        describe("When calling initialize more than once", () => {
          it("should revert", async () => {
            await initializeProxy(context);

            await expect(initializeProxy(context)).toBeRevertedWith(
              "Initializable: contract is already initialized"
            );
          });
        });
      });

      describe("When testing deployed contract", () => {
        shouldBehaveLikeLSP11NullThreshold(() =>
          buildTestContext().then(async (context) => {
            await initializeProxy(context);

            return context;
          })
        );
      });
    });

    describe("When setting the threshold > 0", () => {
      const buildTestContext = async (): Promise<LSP11TestContext> => {
        const accounts = await getNamedAccounts();

        const { universalProfile, lsp6KeyManager } =
          await setupProfileWithKeyManager(accounts.owner);
        
        const deployParams = {
          owner: accounts.owner,
          account: universalProfile,
          threshold: 3,
        };

        const lsp11SocialRecovery = await setupSocialRecoveryInit(
          accounts.owner,
          deployParams.owner,
          deployParams.account,
          lsp6KeyManager,
          deployParams.threshold
        );

        return {
          accounts,
          lsp11SocialRecovery,
          deployParams,
          universalProfile,
          lsp6KeyManager,
        };
      };

      const initializeProxy = async (context: LSP11TestContext) => {
        return context.lsp11SocialRecovery[
          "initialize(address,address,uint256)"
        ](
          context.deployParams.owner.address,
          context.deployParams.account.address,
          context.deployParams.threshold
        );
      };

      describe("When deploying the contract as proxy", () => {
        let context: LSP11TestContext;

        beforeEach(async () => {
          context = await buildTestContext();
        });

        describe("When initializing the contract", () => {
          shouldInitializeLikeLSP11(async () => {
            const { lsp11SocialRecovery, deployParams } = context;
            const initializeTransaction = await initializeProxy(context);

            return {
              lsp11SocialRecovery,
              deployParams,
              initializeTransaction,
            };
          });
        });

        describe("When calling initialize more than once", () => {
          it("should revert", async () => {
            await initializeProxy(context);

            await expect(initializeProxy(context)).toBeRevertedWith(
              "Initializable: contract is already initialized"
            );
          });
        });
      });

      describe("When testing deployed contract", () => {
        shouldBehaveLikeLSP11NormalThreshold(() =>
          buildTestContext().then(async (context) => {
            await initializeProxy(context);

            return context;
          })
        );
      });
    });
  });
});
