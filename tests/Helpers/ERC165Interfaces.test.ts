import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CalculateLSPInterfaces,
  CalculateLSPInterfaces__factory,
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
  let contract: CalculateLSPInterfaces;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    contract = await new CalculateLSPInterfaces__factory(accounts[0]).deploy();
  });

  it("LSP0", async () => {
    const result = await contract.calculateInterfaceLSP0();
    expect(result).toEqual(INTERFACE_IDS.LSP0ERC725Account);
  });

  it("LSP1", async () => {
    const result = await contract.calculateInterfaceLSP1();
    expect(result).toEqual(INTERFACE_IDS.LSP1UniversalReceiver);
  });

  it("LSP1Delegate", async () => {
    const result = await contract.calculateInterfaceLSP1Delegate();
    expect(result).toEqual(INTERFACE_IDS.LSP1UniversalReceiverDelegate);
  });

  it("LSP6", async () => {
    const result = await contract.calculateInterfaceLSP6KeyManager();
    expect(result).toEqual(INTERFACE_IDS.LSP6KeyManager);
  });

  it("LSP7", async () => {
    const result = await contract.calculateInterfaceLSP7();
    expect(result).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
  });

  it("LSP8", async () => {
    const result = await contract.calculateInterfaceLSP8();
    expect(result).toEqual(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
  });

  it("LSP9", async () => {
    const result = await contract.calculateInterfaceLSP9();
    expect(result).toEqual(INTERFACE_IDS.LSP9Vault);
  });

  it("IClaimOwnership", async () => {
    const result = await contract.calculateInterfaceClaimOwnership();
    expect(result).toEqual(INTERFACE_IDS.ClaimOwnership);
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

  it("ERC223", async () => {
    const result = await contract.callStatic.calculateInterfaceERC223();
    expect(result).toEqual(INTERFACE_IDS.ERC223);
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
