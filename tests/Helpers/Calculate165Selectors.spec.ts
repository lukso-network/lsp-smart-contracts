import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CalculateERC165Selectors,
  CalculateERC165Selectors__factory,
  CalculateERCInterfaces,
  CalculateERCInterfaces__factory,
} from "../../types";

// utils
import { INTERFACE_IDS } from "../../constants";

/**
 * @dev these tests also ensure that the interfaceIds (stored in utils/constant.ts)
 *      are always correct, so that the other tests use the correct values
 */
describe("Calculate LSP interfaces", () => {
  let accounts: SignerWithAddress[];
  let contract: CalculateERC165Selectors;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    contract = await new CalculateERC165Selectors__factory(
      accounts[0]
    ).deploy();
  });

  it("LSP1", async () => {
    const result = await contract.callStatic.calculateSelectorLSP1();
    expect(result).toEqual(INTERFACE_IDS.LSP1);
  });

  it("LSP1Delegate", async () => {
    const result = await contract.callStatic.calculateSelectorLSP1Delegate();
    expect(result).toEqual(INTERFACE_IDS.LSP1Delegate);
  });

  it("LSP7", async () => {
    const result = await contract.callStatic.calculateSelectorLSP7();
    expect(result).toEqual(INTERFACE_IDS.LSP7);
  });

  it("LSP8", async () => {
    const result = await contract.callStatic.calculateSelectorLSP8();
    expect(result).toEqual(INTERFACE_IDS.LSP8);
  });

  it("LSP6KeyManager", async () => {
    const result = await contract.callStatic.calculateSelectorLSP6KeyManager();
    expect(result).toEqual(INTERFACE_IDS.LSP6);
  });
});

describe("Calculate ERC interfaces", () => {
  let accounts: SignerWithAddress[];
  let contract: CalculateERCInterfaces;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    contract = await new CalculateERCInterfaces__factory(accounts[0]).deploy();
  });

  it("ERC20", async () => {
    const result = await contract.callStatic.calculateInterfaceERC20();
    console.log("ERC20: ", result);
    // expect(result).toEqual(INTERFACE_IDS.ERC20);
  });

  it("ERC721", async () => {
    const result = await contract.callStatic.calculateInterfaceERC721();
    console.log("ERC721: ", result);
    expect(result).toEqual(INTERFACE_IDS.ERC721);
  });

  it("ERC721Metadata", async () => {
    const result = await contract.callStatic.calculateInterfaceERC721Metadata();
    expect(result).toEqual(INTERFACE_IDS.ERC721Metadata);
  });

  it("ERC721Metadata", async () => {
    const result = await contract.callStatic.calculateInterfaceERC721Metadata();
    expect(result).toEqual(INTERFACE_IDS.ERC721Metadata);
  });
});
