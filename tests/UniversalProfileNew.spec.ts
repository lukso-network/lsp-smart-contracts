import { ethers } from "hardhat";
import {
  UniversalProfileInit__factory,
  UniversalProfile__factory,
} from "../types";
import { deployProxy } from "./utils/proxy";
import {
  LSP3TestContext,
  shouldInitializeLikeLSP3,
} from "./UniversalProfile.behaviour";

describe("UniversalProfile", () => {
  describe("when using UniversalProfile contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0].address,
      };
      const universalProfile = await new UniversalProfile__factory(
        accounts[0]
      ).deploy(deployParams.owner);

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
  });

  describe("when using UniversalProfile contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0].address,
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
      return context.universalProfile.initialize(context.deployParams.owner);
    };
  });
});
