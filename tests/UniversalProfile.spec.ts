import { ethers } from "hardhat";
import {
  UniversalProfileInit__factory,
  UniversalProfile__factory,
} from "../types";
import { deployProxy } from "./utils/proxy";
import {
  LSP3TestContext,
  shouldInitializeLikeLSP3,
  shouldBehaveLikeLSP3,
} from "./UniversalProfile.behaviour";

describe("UniversalProfile", () => {
  describe("when using UniversalProfile contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };
      const universalProfile = await new UniversalProfile__factory(
        accounts[0]
      ).deploy(deployParams.owner.address);

      return { accounts, universalProfile, deployParams };
    };

    describe("when deploying the contract", () => {
      let context: LSP3TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP3(async () => {
          const { universalProfile, deployParams } = context;
          return {
            universalProfile,
            deployParams,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP3(buildTestContext);
    });
  });

  describe("when using UniversalProfile contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };
      const universalProfileInit = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();
      const universalProfileProxy = await deployProxy(
        universalProfileInit.address,
        accounts[0]
      );
      const universalProfile = universalProfileInit.attach(
        universalProfileProxy
      );

      return { accounts, universalProfile, deployParams };
    };

    const initializeProxy = async (context: LSP3TestContext) => {
      return context.universalProfile["initialize(address)"](
        context.deployParams.owner.address
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP3TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP3(async () => {
          const { universalProfile, deployParams } = context;
          await initializeProxy(context);

          return {
            universalProfile,
            deployParams,
          };
        });
      });

      describe("when calling `initialize(...)` more than once", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).toBeRevertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP3(async () => {
        let context = await buildTestContext();
        await initializeProxy(context);
        return context;
      });
    });
  });
});
