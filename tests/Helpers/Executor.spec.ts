import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  UniversalProfile,
  UniversalProfile__factory,
  KeyManager,
  KeyManager__factory,
  Executor,
  Executor__factory,
} from "../../build/types";

// custom helpers
import { ONE_ETH, DUMMY_RECIPIENT } from "../utils/helpers";
import { ALL_PERMISSIONS_SET, KEYS, PERMISSIONS } from "../utils/keymanager";

describe("Executor interacting with KeyManager", () => {
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManager: KeyManager, executor: Executor;

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
    universalProfile = await new UniversalProfile__factory(owner).deploy(owner.address);
    keyManager = await new KeyManager__factory(owner).deploy(universalProfile.address);
    executor = await new Executor__factory(owner).deploy(
      universalProfile.address,
      keyManager.address
    );

    // owner permissions
    let ownerPermissions = ethers.utils.hexZeroPad(ALL_PERMISSIONS_SET, 32);
    await universalProfile
      .connect(owner)
      .setData([KEYS.PERMISSIONS + owner.address.substr(2)], [ownerPermissions]);

    // executor permissions
    let executorPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
      32
    );
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
      expect(permissions).toEqual(
        "0x000000000000000000000000000000000000000000000000000000000000008c"
      );
    });
  });

  describe("Interaction = `setData`", () => {
    // keccak256('MyFirstKey')
    const key = "0x00b76b597620a89621ab37aedc4220d553ad6145a885461350e5990372b906f5";
    const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Hello Lukso"));

    // always reset storage before each tests
    beforeEach(async () => {
      let resetPayload = universalProfile.interface.encodeFunctionData("setData", [[key], ["0x"]]);
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
        await executor.setComputedKeyFromParams(key, value, { gasLimit: GAS_PROVIDED });

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        expect(newStorage).toEqual(value);
      });
    });

    describe("> Low-level calls", () => {
      it("Should allow to `setHardcodedKeyRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        let [initialStorage] = await universalProfile.callStatic.getData([key]);
        console.log("initialStorage (low level): ", initialStorage);
        expect(initialStorage).toEqual("0x");

        // check if low-level call succeeded
        let result = await executor.callStatic.setHardcodedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });
        console.log("result (low level): ", result);
        expect(result).toBeTruthy();

        // make the executor call
        await executor.setHardcodedKeyRawCall({ gasLimit: GAS_PROVIDED });

        // check that store[key] is now set to value
        let [newStorage] = await universalProfile.callStatic.getData([key]);
        console.log("newStorage (low level): ", newStorage);
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

  describe("Interaction = transfering LYX", () => {
    let provider = ethers.provider;

    beforeEach(async () => {
      let ownerBalance = await provider.getBalance(owner.address);
      console.log(ethers.utils.formatUnits(ownerBalance));

      await owner.sendTransaction({
        to: universalProfile.address,
        value: ethers.utils.parseEther("1"),
      });
    });

    describe("> Contract calls", () => {
      it("Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcoded`)", async () => {
        let initialUPBalance = await provider.getBalance(universalProfile.address);
        let initialRecipientBalance = await provider.getBalance(DUMMY_RECIPIENT);
        expect(initialUPBalance).toEqBN(ONE_ETH);

        await executor.sendOneLyxHardcoded();

        let newUPBalance = await provider.getBalance(universalProfile.address);
        let newRecipientBalance = await provider.getBalance(DUMMY_RECIPIENT);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(initialRecipientBalance.add(ONE_ETH));
      });

      it("Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipient`)", async () => {
        let recipient = accounts[1];

        let initialUPBalance = await provider.getBalance(universalProfile.address);
        let initialRecipientBalance = await provider.getBalance(recipient.address);
        expect(initialUPBalance).toEqBN(ONE_ETH);

        await executor.sendOneLyxToRecipient(recipient.address);

        let newUPBalance = await provider.getBalance(universalProfile.address);
        let newRecipientBalance = await provider.getBalance(recipient.address);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(initialRecipientBalance.add(ONE_ETH));
      });
    });

    describe("> Low-level calls", () => {
      it("Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcodedRawCall`)", async () => {
        let initialUPBalance = await provider.getBalance(universalProfile.address);
        let initialRecipientBalance = await provider.getBalance(DUMMY_RECIPIENT);
        expect(initialUPBalance).toEqBN(ONE_ETH);

        await executor.sendOneLyxHardcodedRawCall({ gasLimit: GAS_PROVIDED });

        let newUPBalance = await provider.getBalance(universalProfile.address);
        let newRecipientBalance = await provider.getBalance(DUMMY_RECIPIENT);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(initialRecipientBalance.add(ONE_ETH));
      });

      it("Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipientRawCall`)", async () => {
        let recipient = accounts[1];

        let initialUPBalance = await provider.getBalance(universalProfile.address);
        let initialRecipientBalance = await provider.getBalance(recipient.address);
        expect(initialUPBalance).toEqBN(ONE_ETH);

        await executor.sendOneLyxToRecipientRawCall(recipient.address, { gasLimit: GAS_PROVIDED });

        let newUPBalance = await provider.getBalance(universalProfile.address);
        let newRecipientBalance = await provider.getBalance(recipient.address);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(initialRecipientBalance.add(ONE_ETH));
      });
    });
  });
});
