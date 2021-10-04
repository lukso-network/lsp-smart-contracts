import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { CalculateERC165Selectors, CalculateERC165Selectors__factory } from "../build/types";

// utils
import { INTERFACE_IDS } from "./utils/constants";

/**
 * @dev these tests also ensure that the interfaceIds (stored in utils/constant.ts)
 *      are always correct, so that the other tests use the correct values
 */
describe("Calculate Selectors", () => {
  let accounts: SignerWithAddress[];
  let contract: CalculateERC165Selectors;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    contract = await new CalculateERC165Selectors__factory(accounts[0]).deploy();
  });

  it("LSP1", async () => {
    const result = await contract.callStatic.calculateSelectorLSP1();
    console.log("LSP1:", result);
    expect(result).toEqual(INTERFACE_IDS.LSP1);
  });

  it("LSP1Delegate", async () => {
    const result = await contract.callStatic.calculateSelectorLSP1Delegate();
    console.log("LSP1Delegate:", result);
    expect(result).toEqual(INTERFACE_IDS.LSP1Delegate);
  });

  it("LSP6KeyManager", async () => {
    const result = await contract.callStatic.calculateSelectorLSP6KeyManager();
    console.log("LSP6KeyManager:", result);
    expect(result).toEqual(INTERFACE_IDS.LSP6);
  });
});
