import { Signer } from "ethers";
import { ethers } from "hardhat";
import {
  AddressRegistry,
  AddressRegistryRequiresERC725,
  AddressRegistryRequiresERC725__factory,
  AddressRegistry__factory,
  LSP3Account,
  LSP3Account__factory,
} from "../build/types";

describe("Address Registry contracts", () => {
  let addressRegistry: AddressRegistry;
  let accounts: Signer[];
  let account1Address;
  let account2Address;
  let account3Address;
  let account4Address;
  let account5Address;

  beforeAll(async () => {
    accounts = await ethers.getSigners();

    account1Address = await accounts[1].getAddress();
    account2Address = await accounts[2].getAddress();
    account3Address = await accounts[3].getAddress();
    account4Address = await accounts[4].getAddress();
    account5Address = await accounts[5].getAddress();

    addressRegistry = await new AddressRegistry__factory(accounts[1]).deploy();
  });
  describe("AddressRegistry", () => {
    it("add address", async () => {
      await addressRegistry.addAddress(account1Address);
      expect(await addressRegistry.getAddress(0)).toEqual(account1Address);
    });

    it("add same address", async () => {
      expect(await addressRegistry.containsAddress(account1Address)).toBe(true);

      await addressRegistry.addAddress(account1Address);
      expect(await addressRegistry.getAddress(0)).toEqual(account1Address);
    });

    it("should add and remove address", async () => {
      await addressRegistry.addAddress(account4Address);
      expect(await addressRegistry.containsAddress(account4Address)).toBeTruthy();

      await addressRegistry.removeAddress(account4Address);
      expect(await addressRegistry.containsAddress(account4Address)).toBeFalsy();
    });

    it("should give the right count", async () => {
      expect(await addressRegistry.length()).toEqBN("1");
      // add new entry
      await addressRegistry.addAddress(account2Address);
      expect(await addressRegistry.length()).toEqBN("2");
    });

    it("get correct index", async () => {
      expect(await addressRegistry.getIndex(account1Address)).toEqBN("0");
      expect(await addressRegistry.getIndex(account2Address)).toEqBN("1");

      await expect(addressRegistry.getIndex(account4Address)).toBeRevertedWith("EnumerableSet: Index not found");
    });

    it("can list all values of the registry", async () => {
      let length = await (await addressRegistry.length()).toNumber();
      let values = [];

      for (let i = 0; i < length; i++) {
        values.push(await addressRegistry.getAddress(i));
      }

      expect(values).toStrictEqual([account1Address, account2Address]);
    });

    it("can get all raw values in one call", async () => {
      expect(await addressRegistry.getAllRawValues()).toStrictEqual([
        "0x000000000000000000000000" + account1Address.replace("0x", "").toLowerCase(),
        "0x000000000000000000000000" + account2Address.replace("0x", "").toLowerCase(),
      ]);
    });
  });

  // Require ERC725
  describe("AddressRegistryRequiresERC725", () => {
    let addressRegistryRequireERC725: AddressRegistryRequiresERC725, account: LSP3Account, ownerAddress;

    beforeEach(async () => {
      ownerAddress = account3Address;
      account = await new LSP3Account__factory(accounts[3]).deploy(ownerAddress);
      addressRegistryRequireERC725 = await new AddressRegistryRequiresERC725__factory(accounts[0]).deploy();
    });

    it("add address", async () => {
      let abi = addressRegistryRequireERC725.interface.encodeFunctionData("addAddress", [account.address]);

      await account.execute(0, addressRegistryRequireERC725.address, 0, abi, {
        from: ownerAddress,
      });

      expect(await addressRegistryRequireERC725.getAddress(0)).toEqual(account.address);
    });

    it("external account adds address", async () => {
      await addressRegistryRequireERC725.connect(accounts[5]).addAddress(account.address);
      expect(await addressRegistryRequireERC725.getAddress(0)).toEqual(account.address);
    });

    it("remove address", async () => {
      let abi = addressRegistryRequireERC725.interface.encodeFunctionData("removeAddress", [account.address]);

      await account.execute(0, addressRegistryRequireERC725.address, 0, abi);
      expect(await addressRegistryRequireERC725.containsAddress(account.address)).toEqual(false);
    });

    it("should fail if called by a regular address", async () => {
      //simply reverts as no ERC165 is detected
      await expect(addressRegistryRequireERC725.addAddress(account5Address)).toBeReverted();
    });
  });
});
