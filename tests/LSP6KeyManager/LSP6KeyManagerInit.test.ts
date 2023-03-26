import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { LSP6TestContext } from "../utils/context";
import {
  LSP6KeyManagerInit__factory,
  UniversalProfileInit__factory,
} from "../../types";
import { deployProxy } from "../utils/fixtures";
import {
  shouldBehaveLikeLSP6,
  shouldInitializeLikeLSP6,
} from "./LSP6KeyManager.behaviour";

async function buildProxyTestContext(
  initialFunding?: BigNumber
): Promise<LSP6TestContext> {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  const baseUP = await new UniversalProfileInit__factory(owner).deploy();
  const upProxy = await deployProxy(baseUP.address, owner);
  const universalProfile = await baseUP.attach(upProxy);

  const baseKM = await new LSP6KeyManagerInit__factory(owner).deploy();
  const kmProxy = await deployProxy(baseKM.address, owner);
  const keyManager = await baseKM.attach(kmProxy);

  return { accounts, owner, universalProfile, keyManager, initialFunding };
}

async function initializeProxy(context: LSP6TestContext) {
  await context.universalProfile["initialize(address)"](context.owner.address, {
    value: context.initialFunding,
  });

  await context.keyManager["initialize(address)"](
    context.universalProfile.address
  );

  return context;
}

describe("LSP6KeyManager with proxy", () => {
  let context: LSP6TestContext;

  describe("when deploying the base LSP6KeyManagerInit implementation", () => {
    it("should prevent any address from calling the `initialize(...)` function on the base contract", async () => {
      let context = await buildProxyTestContext();

      const baseKM = await new LSP6KeyManagerInit__factory(
        context.accounts[0]
      ).deploy();

      await expect(
        baseKM.initialize(context.accounts[0].address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("when initializing the proxy", () => {
    shouldInitializeLikeLSP6(async () => {
      context = await buildProxyTestContext();
      await initializeProxy(context);
      return context;
    });
  });

  describe("when calling `initialize(...) more than once`", () => {
    it("should revert", async () => {
      context = await buildProxyTestContext();
      await initializeProxy(context);

      await expect(initializeProxy(context)).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
  });

  describe("when testing the deployed proxy", () => {
    shouldBehaveLikeLSP6(async (initialFunding?: BigNumber) => {
      let context = await buildProxyTestContext(initialFunding);
      await initializeProxy(context);
      return context;
    });
  });
});
