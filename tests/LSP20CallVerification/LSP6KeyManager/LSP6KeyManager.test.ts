import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import {
  UniversalProfile__factory,
  LSP6KeyManager__factory,
} from "../../../types";

import { LSP6TestContext } from "../../utils/context";

import {
  shouldInitializeLikeLSP6,
  shouldBehaveLikeLSP6,
} from "./LSP6KeyManager.behaviour";

describe("LSP20 + LSP6 with constructor", () => {
  const buildTestContext = async (
    initialFunding?: BigNumber
  ): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const owner = accounts[0];

    const universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address,
      { value: initialFunding }
    );

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
});
