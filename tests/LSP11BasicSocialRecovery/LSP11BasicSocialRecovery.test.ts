import { expect } from "chai";

import {
  LSP11BasicSocialRecovery__factory,
  LSP6KeyManager,
  UniversalProfile,
  LSP11BasicSocialRecoveryInit__factory,
} from "../../types";

import {
  getNamedAccounts,
  shouldInitializeLikeLSP11,
  LSP11TestContext,
  shouldBehaveLikeLSP11,
} from "./LSP11BasicSocialRecovery.behaviour";

import {
  grantPermissionViaKeyManager,
  setupProfileWithKeyManagerWithURD,
  deployProxy,
} from "../utils/fixtures";

import { combinePermissions } from "../utils/helpers";

import { PERMISSIONS } from "../../constants";

describe("LSP11BasicSocialRecovery contract", () => {
  describe("When using LSP11 contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP11TestContext> => {
      const accounts = await getNamedAccounts();

      const [UP, KM] = await setupProfileWithKeyManagerWithURD(accounts.owner);

      const universalProfile = UP as UniversalProfile;
      const lsp6KeyManager = KM as LSP6KeyManager;

      const deployParams = {
        owner: universalProfile,
        target: universalProfile,
      };

      const lsp11BasicSocialRecovery =
        await new LSP11BasicSocialRecovery__factory(accounts.any).deploy(
          deployParams.owner.address,
          deployParams.target.address
        );

      const lsp11Permissions = combinePermissions(
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.CHANGEPERMISSIONS
      );

      await grantPermissionViaKeyManager(
        accounts.owner,
        universalProfile,
        lsp6KeyManager,
        lsp11BasicSocialRecovery.address,
        lsp11Permissions
      );

      return {
        accounts,
        lsp11BasicSocialRecovery,
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
          const { lsp11BasicSocialRecovery, deployParams } = context;
          return {
            lsp11BasicSocialRecovery,
            deployParams,
            initializeTransaction:
              context.lsp11BasicSocialRecovery.deployTransaction,
          };
        });
      });
    });

    describe("When testing deployed contract", () => {
      shouldBehaveLikeLSP11(buildTestContext);
    });
  });

  describe("When using LSP11contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP11TestContext> => {
      const accounts = await getNamedAccounts();

      const [UP, KM] = await setupProfileWithKeyManagerWithURD(accounts.owner);

      const universalProfile = UP as UniversalProfile;
      const lsp6KeyManager = KM as LSP6KeyManager;

      const deployParams = {
        owner: universalProfile,
        target: universalProfile,
      };

      const lsp11BasicSocialRecoveryInit =
        await new LSP11BasicSocialRecoveryInit__factory(
          accounts.owner
        ).deploy();

      const lsp11BasicSocialRecoveryProxy = await deployProxy(
        lsp11BasicSocialRecoveryInit.address,
        accounts.owner
      );

      const lsp11BasicSocialRecovery = lsp11BasicSocialRecoveryInit.attach(
        lsp11BasicSocialRecoveryProxy
      );

      const lsp11Permissions = combinePermissions(
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.CHANGEPERMISSIONS
      );

      await grantPermissionViaKeyManager(
        accounts.owner,
        universalProfile,
        lsp6KeyManager,
        lsp11BasicSocialRecovery.address,
        lsp11Permissions
      );

      return {
        accounts,
        lsp11BasicSocialRecovery,
        deployParams,
        universalProfile,
        lsp6KeyManager,
      };
    };

    const initializeProxy = async (context: LSP11TestContext) => {
      return context.lsp11BasicSocialRecovery["initialize(address,address)"](
        context.deployParams.owner.address,
        context.deployParams.target.address
      );
    };

    describe("When deploying the contract as proxy", () => {
      let context: LSP11TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("When initializing the contract", () => {
        shouldInitializeLikeLSP11(async () => {
          const { lsp11BasicSocialRecovery, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            lsp11BasicSocialRecovery,
            deployParams,
            initializeTransaction,
          };
        });
      });

      describe("When calling initialize more than once", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).to.be.revertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("When testing deployed contract", () => {
      shouldBehaveLikeLSP11(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
