import { ethers } from "hardhat";

import {
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  UniversalProfileInit__factory,
  LSP6KeyManagerInit__factory,
  KeyManagerInternalTester__factory,
} from "../../types";

import { LSP6TestContext } from "../utils/context";
import { deployProxy } from "../utils/fixtures";

import {
  shouldInitializeLikeLSP6,
  shouldBehaveLikeLSP6,
  testLSP6InternalFunctions,
} from "./LSP6KeyManager.behaviour";

describe("LSP6KeyManager", () => {
  describe("when using LSP6KeyManager with constructor", () => {
    const buildTestContext = async (): Promise<LSP6TestContext> => {
      const accounts = await ethers.getSigners();
      const owner = accounts[0];

      const universalProfile = await new UniversalProfile__factory(
        owner
      ).deploy(owner.address);
      const keyManager = await new LSP6KeyManager__factory(owner).deploy(
        universalProfile.address
      );

      return { accounts, owner, universalProfile, keyManager };
    };

    describe("when deploying the contract", () => {
      let context: LSP6TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP6(async () => {
          const { accounts, owner, universalProfile, keyManager } = context;
          return {
            accounts,
            owner,
            universalProfile,
            keyManager,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP6(buildTestContext);
    });

    describe("testing internal functions", () => {
      testLSP6InternalFunctions(async () => {
        const accounts = await ethers.getSigners();
        const owner = accounts[0];

        const universalProfile = await new UniversalProfile__factory(
          owner
        ).deploy(owner.address);
        const keyManagerInternalTester =
          await new KeyManagerInternalTester__factory(owner).deploy(
            universalProfile.address
          );

        return { owner, accounts, universalProfile, keyManagerInternalTester };
      });
    });
  });

  describe("when using LSP6KeyManager with proxy", () => {
    const buildTestContext = async (): Promise<LSP6TestContext> => {
      const accounts = await ethers.getSigners();
      const owner = accounts[0];

      const baseUP = await new UniversalProfileInit__factory(owner).deploy();
      const upProxy = await deployProxy(baseUP.address, owner);
      const universalProfile = await baseUP.attach(upProxy);

      const baseKM = await new LSP6KeyManagerInit__factory(owner).deploy();
      const kmProxy = await deployProxy(baseKM.address, owner);
      const keyManager = await baseKM.attach(kmProxy);

      return { accounts, owner, universalProfile, keyManager };
    };

    const initializeProxy = async (context: LSP6TestContext) => {
      await context.universalProfile["initialize(address)"](
        context.owner.address
      );

      await context.keyManager["initialize(address)"](
        context.universalProfile.address
      );

      return context;
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP6TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP6(async () => {
          const { accounts, owner, universalProfile, keyManager } = context;
          await initializeProxy(context);

          return {
            accounts,
            owner,
            universalProfile,
            keyManager,
          };
        });
      });

      describe("when calling `initialize(...) more than once`", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).toBeRevertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP6(async () => {
        let context = await buildTestContext();
        await initializeProxy(context);
        return context;
      });
    });
  });
});
