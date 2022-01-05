import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  AddressRegistry,
  AddressRegistryRequiresERC725,
  AddressRegistryRequiresERC725__factory,
  AddressRegistry__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../../types";

describe("Address Registry contracts", () => {
  let addressRegistry: AddressRegistry;
  let accounts: SignerWithAddress[];

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    addressRegistry = await new AddressRegistry__factory(accounts[1]).deploy();
  });

  describe("AddressRegistry", () => {
    it("add address", async () => {
      await addressRegistry.addAddress(accounts[1].address);
      expect(await addressRegistry.getAddress(0)).toEqual(accounts[1].address);
    });

    it("add same address", async () => {
      expect(await addressRegistry.containsAddress(accounts[1].address)).toBe(
        true
      );

      await addressRegistry.addAddress(accounts[1].address);
      expect(await addressRegistry.getAddress(0)).toEqual(accounts[1].address);
    });

    it("should add and remove address", async () => {
      await addressRegistry.addAddress(accounts[4].address);
      expect(
        await addressRegistry.containsAddress(accounts[4].address)
      ).toBeTruthy();

      await addressRegistry.removeAddress(accounts[4].address);
      expect(
        await addressRegistry.containsAddress(accounts[4].address)
      ).toBeFalsy();
    });

    it("should give the right count", async () => {
      expect(await addressRegistry.length()).toEqBN("1");
      // add new entry
      await addressRegistry.addAddress(accounts[2].address);
      expect(await addressRegistry.length()).toEqBN("2");
    });

    it("get correct index", async () => {
      expect(await addressRegistry.getIndex(accounts[1].address)).toEqBN("0");
      expect(await addressRegistry.getIndex(accounts[2].address)).toEqBN("1");

      await expect(
        addressRegistry.getIndex(accounts[4].address)
      ).toBeRevertedWith("EnumerableSet: Index not found");
    });

    it("can list all values of the registry", async () => {
      let length = await (await addressRegistry.length()).toNumber();
      let values = [];

      for (let i = 0; i < length; i++) {
        values.push(await addressRegistry.getAddress(i));
      }

      expect(values).toStrictEqual([accounts[1].address, accounts[2].address]);
    });

    it("can get all raw values in one call", async () => {
      expect(await addressRegistry.getAllRawValues()).toStrictEqual([
        "0x000000000000000000000000" +
          accounts[1].address.replace("0x", "").toLowerCase(),
        "0x000000000000000000000000" +
          accounts[2].address.replace("0x", "").toLowerCase(),
      ]);
    });
  });

  // Require ERC725
  describe("AddressRegistryRequiresERC725", () => {
    let addressRegistryRequireERC725: AddressRegistryRequiresERC725,
      account: UniversalProfile,
      owner: SignerWithAddress;

    beforeEach(async () => {
      owner = accounts[3];
      account = await new UniversalProfile__factory(owner).deploy(
        owner.address
      );
      addressRegistryRequireERC725 =
        await new AddressRegistryRequiresERC725__factory(owner).deploy();
    });

    it("add address", async () => {
      let abi = addressRegistryRequireERC725.interface.encodeFunctionData(
        "addAddress",
        [account.address]
      );

      await account
        .connect(owner)
        .execute(0, addressRegistryRequireERC725.address, 0, abi, {
          gasLimit: 3_000_000,
        });
      expect(await addressRegistryRequireERC725.getAddress(0)).toEqual(
        account.address
      );
    });

    it("external account adds address", async () => {
      await addressRegistryRequireERC725
        .connect(accounts[5])
        .addAddress(account.address);
      expect(await addressRegistryRequireERC725.getAddress(0)).toEqual(
        account.address
      );
    });

    it("remove address", async () => {
      let abi = addressRegistryRequireERC725.interface.encodeFunctionData(
        "removeAddress",
        [account.address]
      );

      await account
        .connect(owner)
        .execute(0, addressRegistryRequireERC725.address, 0, abi);
      expect(
        await addressRegistryRequireERC725.containsAddress(account.address)
      ).toEqual(false);
    });

    it("should fail if called by a regular address", async () => {
      //simply reverts as no ERC165 is detected
      await expect(
        addressRegistryRequireERC725.addAddress(accounts[5].address)
      ).toBeReverted();
    });
  });
});
