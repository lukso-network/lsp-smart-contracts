import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  ERC725Utils,
  UniversalProfile,
  KeyManager,
  Executor,
  Executor__factory,
} from "../build/types";

// custom helpers
import { deployERC725Utils, deployUniversalProfile, deployKeyManager } from "./utils/deploy";
import { KEYS, PERMISSIONS } from "./utils/keymanager";

describe("Executor interacting with KeyManager", () => {
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress;

  let erc725Utils: ERC725Utils,
    universalProfile: UniversalProfile,
    keyManager: KeyManager,
    executor: Executor;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    erc725Utils = await deployERC725Utils();
    universalProfile = await deployUniversalProfile(erc725Utils.address, owner);
    keyManager = await deployKeyManager(erc725Utils.address, universalProfile);
    executor = await new Executor__factory(owner).deploy(keyManager.address);

    // owner permissions
    let ownerPermissions = ethers.utils.hexZeroPad(PERMISSIONS.ALL, 2);
    await universalProfile
      .connect(owner)
      .setData([KEYS.PERMISSIONS + owner.address.substr(2)], [ownerPermissions]);

    // executor permissions
    let executorPermissions = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 2);
    await universalProfile
      .connect(owner)
      .setData([KEYS.PERMISSIONS + executor.address.substr(2)], [executorPermissions]);

    // switch account management to KeyManager
    await universalProfile.connect(owner).transferOwnership(keyManager.address);
  });

  describe("Setup", () => {
    it("Executor should have permission SETDATA + CALL", async () => {
      let [permissions] = await universalProfile.getData([
        KEYS.PERMISSIONS + executor.address.substr(2),
      ]);
      expect(permissions).toEqual("0x000c");
    });
  });

  describe("Interactions", () => {
    // keccak256('MyFirstKey')
    const key = "0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5";
    const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Hello Lukso"));

    // always reset storage before each tests
    beforeEach(async () => {
      let resetPayload = universalProfile.interface.encodeFunctionData("setData", [[key], ["0x"]]);
      await keyManager.connect(owner).execute(resetPayload);
    });

    describe("> contract calls", () => {
      it("Should allow executor to `setHardcodedKey` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setHardcodedKey();

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });

      it("Should allow executor to `setComputedKey` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setComputedKey();

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });

      it("Should allow executor to `setComputedKeyFromParams` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await executor.setComputedKeyFromParams(key, value);

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });
    });

    describe("> Low-level calls", () => {
      it("Should allow executor to `setHardcodedKeyRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        console.log("initialStorage (low level): ", initialStorage);
        expect(initialStorage).toEqual("0x");

        // check if low-level call succeeded
        let result = await executor.callStatic.setHardcodedKeyRawCall();
        console.log("result (low level): ", result);
        expect(result).toBeTruthy();

        // make the executor call
        await executor.setHardcodedKeyRawCall();

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        console.log("newStorage (low level): ", newStorage);
        expect(newStorage).toEqual(value);
      });
    });
  });
});
