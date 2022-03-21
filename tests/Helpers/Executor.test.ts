import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  UniversalProfile,
  UniversalProfile__factory,
  LSP6KeyManager,
  LSP6KeyManager__factory,
  Executor,
  Executor__factory,
} from "../../types";

// custom helpers
import { ERC725YKeys, ALL_PERMISSIONS_SET, PERMISSIONS } from "../../constants";

describe("Executor interacting with KeyManager", () => {
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress;

  let universalProfile: UniversalProfile,
    keyManager: LSP6KeyManager,
    executor: Executor;

  /**
   * @dev this is necessary when the function being called in the contract
   *  perform a raw / low-level call (in the function body)
   *  otherwise, the deeper layer of interaction (UP.execute) fails
   */
  const GAS_PROVIDED = 200_000;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
  });

  beforeEach(async () => {
    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );
    executor = await new Executor__factory(owner).deploy(
      universalProfile.address,
      keyManager.address
    );

    // owner permissions
    let ownerPermissions = ethers.utils.hexZeroPad(ALL_PERMISSIONS_SET, 32);
    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            owner.address.substr(2),
        ],
        [ownerPermissions]
      );

    // executor permissions
    let executorPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
      32
    );
    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            executor.address.substr(2),
        ],
        [executorPermissions]
      );

    // switch account management to KeyManager
    await universalProfile.connect(owner).transferOwnership(keyManager.address);
  });

  describe("Setup", () => {
    it("Executor should have permission SETDATA + CALL + TRANSFERVALUE", async () => {
      let [permissions] = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          executor.address.substr(2),
      ]);
      expect(permissions).toEqual(
        "0x0000000000000000000000000000000000000000000000000000000000000118"
      );
    });
  });

  describe("Interaction = `setData`", () => {
    // keccak256('MyFirstKey')
    const key =
      "0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5";
    const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Hello Lukso"));

    // always reset storage before each tests
    beforeEach(async () => {
      let resetPayload = universalProfile.interface.encodeFunctionData(
        "setData",
        [[key], ["0x"]]
      );
      await keyManager.connect(owner).execute(resetPayload);
    });

    describe("> contract calls", () => {
      it("Should allow to `setHardcodedKey` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setHardcodedKey();

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to `setComputedKey` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setComputedKey();

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to `setComputedKeyFromParams` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setComputedKeyFromParams(key, value, {
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });
    });

    describe("> Low-level calls", () => {
      it("Should allow to `setHardcodedKeyRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // check if low-level call succeeded
        let result = await executor.callStatic.setHardcodedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });
        expect(result).toBeTruthy();

        // make the executor call
        await executor.setHardcodedKeyRawCall({ gasLimit: GAS_PROVIDED });

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to `setComputedKeyRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setComputedKeyRawCall({ gasLimit: GAS_PROVIDED });

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to `setComputedKeyFromParamsRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setComputedKeyFromParamsRawCall(key, value, {
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });
    });
  });
});
