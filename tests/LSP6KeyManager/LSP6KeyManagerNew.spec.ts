import { ethers } from "hardhat";

import {
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  UniversalProfileInit__factory,
  LSP6KeyManagerInit,
  LSP6KeyManagerInit__factory,
} from "../../types";
import { deployProxy } from "../utils/proxy";

import {
  LSP6TestContext,
  shouldInitializeLikeLSP6,
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
          const { owner, universalProfile, keyManager } = context;
          return {
            owner,
            universalProfile,
            keyManager,
          };
        });
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
          const { owner, universalProfile, keyManager } = context;
          await initializeProxy(context);

          return {
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
  });
});
