const { expectRevert } = require("openzeppelin-test-helpers");

const Account = artifacts.require("LSP3Account");
const AddressRegistry = artifacts.require("AddressRegistry");
const AddressRegistryRequiresERC725 = artifacts.require("AddressRegistryRequiresERC725");

contract("Address Registry contracts", async (accounts) => {
  context("AddressRegistry", async () => {
    let addressRegistry;

    before(async () => {
      addressRegistry = await AddressRegistry.new();
    });

    it("add address", async () => {
      await addressRegistry.addAddress(accounts[1]);
      assert.equal(await addressRegistry.getAddress(0), accounts[1]);
    });

    it("add same address", async () => {
      assert.isTrue(await addressRegistry.containsAddress(accounts[1]));

      await addressRegistry.addAddress(accounts[1]);
      assert.equal(await addressRegistry.getAddress(0), accounts[1]);
    });

    it("should add and remove address", async () => {
      await addressRegistry.addAddress(accounts[4]);
      assert.isTrue(await addressRegistry.containsAddress(accounts[4]));

      await addressRegistry.removeAddress(accounts[4]);
      assert.isFalse(await addressRegistry.containsAddress(accounts[4]));
    });

    it("should give the right count", async () => {
      assert.equal(await addressRegistry.length(), "1");
      // add new entry
      await addressRegistry.addAddress(accounts[2]);
      assert.equal(await addressRegistry.length(), "2");
    });

    it("get correct index", async () => {
      assert.equal(await addressRegistry.getIndex(accounts[1]), "0");
      assert.equal(await addressRegistry.getIndex(accounts[2]), "1");

      expectRevert(addressRegistry.getIndex(accounts[4]), "EnumerableSet: Index not found");
    });

    it("can list all values of the registry", async () => {
      let length = await addressRegistry.length();
      let values = [];

      for (let i = 0; i < length; i++) {
        values.push(await addressRegistry.getAddress(i));
      }

      assert.deepEqual(values, [accounts[1], accounts[2]]);
    });

    it("can get all raw values in one call", async () => {
      assert.deepEqual(await addressRegistry.getAllRawValues(), [
        "0x000000000000000000000000" + accounts[1].replace("0x", "").toLowerCase(),
        "0x000000000000000000000000" + accounts[2].replace("0x", "").toLowerCase(),
      ]);
    });
  });

  // Require ERC725
  context("AddressRegistryRequiresERC725", async () => {
    let addressRegistryRequireERC725, account, owner;

    before(async () => {
      owner = accounts[3];
      account = await Account.new(owner);
      addressRegistryRequireERC725 = await AddressRegistryRequiresERC725.new();
    });

    it("add address", async () => {
      let abi = addressRegistryRequireERC725.contract.methods
        .addAddress(account.address)
        .encodeABI();
      await account.execute(0, addressRegistryRequireERC725.address, 0, abi, { from: owner });
      assert.equal(await addressRegistryRequireERC725.getAddress(0), account.address);
    });

    it("external account adds address", async () => {
      await addressRegistryRequireERC725.addAddress(account.address, { from: accounts[5] });
      assert.equal(await addressRegistryRequireERC725.getAddress(0), account.address);
    });

    it("remove address", async () => {
      let abi = addressRegistryRequireERC725.contract.methods
        .removeAddress(account.address)
        .encodeABI();

      await account.execute(0, addressRegistryRequireERC725.address, 0, abi, { from: owner });
      assert.isFalse(await addressRegistryRequireERC725.containsAddress(account.address));
    });

    it("should fail if called by a regular address", async () => {
      //simply reverts as no ERC165 is detected
      await expectRevert.unspecified(addressRegistryRequireERC725.addAddress(accounts[5]));
    });
  });
});
