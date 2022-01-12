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
 * @dev these tests check that the ERC165 interface IDs stored in `constant.ts`
 *      match with the Solidity built-in function `type(InterfaceName).interfaceId`
 *      (or the XOR of a specific set of function signatures, for custom interface IDs)
 *
 *      This ensure that:
 *      - the file `constants.ts` always hold correct values (since it is part of the npm package)
 *      - tests that use or check for these interface IDs rely on correct values
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
    expect(result).toEqual(INTERFACE_IDS.ERC20);
  });

  it("ERC721", async () => {
    const result = await contract.callStatic.calculateInterfaceERC721();
    expect(result).toEqual(INTERFACE_IDS.ERC721);
  });

  it("ERC721Metadata", async () => {
    const result = await contract.callStatic.calculateInterfaceERC721Metadata();
    expect(result).toEqual(INTERFACE_IDS.ERC721Metadata);
  });

  it("ERC777", async () => {
    const result = await contract.callStatic.calculateInterfaceERC777();
    expect(result).toEqual(INTERFACE_IDS.ERC777);
  });

  it("ERC1155", async () => {
    const result = await contract.callStatic.calculateInterfaceERC1155();
    expect(result).toEqual(INTERFACE_IDS.ERC1155);
  });

  it("ERC1271", async () => {
    const result = await contract.callStatic.calculateInterfaceERC1271();
    expect(result).toEqual(INTERFACE_IDS.ERC1271);
  });
});
