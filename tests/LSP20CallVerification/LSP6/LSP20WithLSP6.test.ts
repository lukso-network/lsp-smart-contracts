import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { UniversalProfile__factory, LSP6KeyManager__factory } from "../../../types";

import { LSP6TestContext } from "../../utils/context";

import { shouldBehaveLikeLSP6 } from "./LSP20WithLSP6.behaviour";

describe("LSP20 + LSP6 with constructor", () => {
  const buildTestContext = async (initialFunding?: BigNumber): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const owner = accounts[0];

    const universalProfile = await new UniversalProfile__factory(owner).deploy(owner.address, {
      value: initialFunding,
    });

    const keyManager = await new LSP6KeyManager__factory(owner).deploy(universalProfile.address);

    return { accounts, owner, universalProfile, keyManager, initialFunding };
  };

  describe("when deploying the contract", () => {
    // TODO: add tests to ensure LSP20 interface is registered.
    // on LSP6 or LSP0?
  });

  describe("when testing deployed contract", () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });
});
