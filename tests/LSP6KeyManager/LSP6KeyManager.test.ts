import { expect } from "chai";
import { BigNumber } from "ethers";
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
    const buildTestContext = async (
      initialFunding?: BigNumber
    ): Promise<LSP6TestContext> => {
      const accounts = await ethers.getSigners();
      const owner = accounts[0];

      const universalProfile = await new UniversalProfile__factory(
        owner
      ).deploy(owner.address, { value: initialFunding });

      const keyManager = await new LSP6KeyManager__factory(owner).deploy(
        universalProfile.address
      );

      return { accounts, owner, universalProfile, keyManager, initialFunding };
    };

    describe("when deploying the contract", () => {
      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP6(buildTestContext);
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
    const buildTestContext = async (
      initialFunding?: BigNumber
    ): Promise<LSP6TestContext> => {
      const accounts = await ethers.getSigners();
      const owner = accounts[0];

      const baseUP = await new UniversalProfileInit__factory(owner).deploy();
      const upProxy = await deployProxy(baseUP.address, owner);
      const universalProfile = await baseUP.attach(upProxy);

      const baseKM = await new LSP6KeyManagerInit__factory(owner).deploy();
      const kmProxy = await deployProxy(baseKM.address, owner);
      const keyManager = await baseKM.attach(kmProxy);

      return { accounts, owner, universalProfile, keyManager, initialFunding };
    };

    const initializeProxy = async (context: LSP6TestContext) => {
      await context.universalProfile["initialize(address)"](
        context.owner.address,
        { value: context.initialFunding }
      );

      await context.keyManager["initialize(address)"](
        context.universalProfile.address
      );

      return context;
    };

    describe("when deploying the base contract implementation", () => {
      it("should prevent any address from calling the `initialize(...)` function on the base contract", async () => {
        let context = await buildTestContext();

        const baseKM = await new LSP6KeyManagerInit__factory(
          context.accounts[0]
        ).deploy();

        await expect(
          baseKM.initialize(context.accounts[0].address)
        ).to.be.revertedWith("Initializable: contract is already initialized");
      });
    });

    describe("when deploying the contract as proxy", () => {
      let context: LSP6TestContext;

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP6(async () => {
          context = await buildTestContext();
          await initializeProxy(context);
          return context;
        });
      });

      describe("when calling `initialize(...) more than once`", () => {
        it("should revert", async () => {
          context = await buildTestContext();
          await initializeProxy(context);

          await expect(initializeProxy(context)).to.be.revertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP6(async (initialFunding?: BigNumber) => {
        let context = await buildTestContext(initialFunding);
        await initializeProxy(context);
        return context;
      });
    });
  });
});
