import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { encodeData, flattenEncodedData } from "@erc725/erc725.js";

import { Executor, Executor__factory } from "../../../types";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  BasicUPSetup_Schema,
  OPERATION_TYPES,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  abiCoder,
  generateKeysAndValues,
  getRandomAddresses,
  NotAuthorisedError,
} from "../../utils/helpers";

export const shouldBehaveLikePermissionSetData = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("when caller is an EOA", () => {
    let canSetData: SignerWithAddress, cannotSetData: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canSetData = context.accounts[1];
      cannotSetData = context.accounts[2];

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetData.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          cannotSetData.address.substr(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.SETDATA)) +
            parseInt(Number(PERMISSIONS.CALL)),
          32
        ),
        PERMISSIONS.CALL,
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe("when setting one key", () => {
      describe("For UP owner", () => {
        it("should pass", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("My First Key")
          );
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Hello Lukso!")
          );

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager.connect(context.owner).execute(payload);
          const fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32)"
          ](key);
          expect(fetchedResult).toEqual(value);
        });
      });

      describe("For address that has permission SETDATA", () => {
        it("should pass", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("My First Key")
          );
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Hello Lukso!")
          );

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager.connect(canSetData).execute(payload);
          const fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32)"
          ](key);
          expect(fetchedResult).toEqual(value);
        });
      });

      describe("For address that doesn't have permission SETDATA", () => {
        it("should not allow", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("My First Key")
          );
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Hello Lukso!")
          );

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(cannotSetData).execute(payload)
          ).toBeRevertedWith(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        });
      });
    });

    describe("when setting multiple keys", () => {
      describe("For UP owner", () => {
        it("(should pass): adding 5 singleton keys", async () => {
          let elements = {
            MyFirstKey: "aaaaaaaaaa",
            MySecondKey: "bbbbbbbbbb",
            MyThirdKey: "cccccccccc",
            MyFourthKey: "dddddddddd",
            MyFifthKey: "eeeeeeeeee",
          };

          let [keys, values] = generateKeysAndValues(elements);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(context.owner).execute(payload);
          let fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32[])"
          ](keys);
          expect(fetchedResult).toEqual(
            Object.values(elements).map((value) =>
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value))
            )
          );
        });

        it("(should pass): adding 10 LSP12IssuedAssets", async () => {
          let lsp12IssuedAssets = getRandomAddresses(10);

          const data = { "LSP12IssuedAssets[]": lsp12IssuedAssets };

          const encodedData = encodeData(data, BasicUPSetup_Schema);
          const flattenedEncodedData = flattenEncodedData(encodedData);

          let keys = [];
          let values = [];

          flattenedEncodedData.map((data) => {
            keys.push(data.key);
            values.push(data.value);
          });

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(context.owner).execute(payload);
          const fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32[])"
          ](keys);
          expect(fetchedResult).toEqual(values);
        });

        it("(should pass): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)", async () => {
          const basicUPSetup = {
            LSP3Profile: {
              hashFunction: "keccak256(utf8)",
              hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
              url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
            },
            "LSP12IssuedAssets[]": [
              "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
              "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
            ],
            LSP1UniversalReceiverDelegate:
              "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
          };

          let encodedData = encodeData(basicUPSetup, BasicUPSetup_Schema);
          let flattenedEncodedData = flattenEncodedData(encodedData);

          let keys = [];
          let values = [];

          flattenedEncodedData.map((data) => {
            keys.push(data.key);
            values.push(data.value);
          });

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(context.owner).execute(payload);
          let fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32[])"
          ](keys);
          expect(fetchedResult).toEqual(values);
        });
      });

      describe("For address that has permission SETDATA", () => {
        it("(should pass): adding 5 singleton keys", async () => {
          // prettier-ignore
          let elements = {
                            "MyFirstKey": "aaaaaaaaaa",
                            "MySecondKey": "bbbbbbbbbb",
                            "MyThirdKey": "cccccccccc",
                            "MyFourthKey": "dddddddddd",
                            "MyFifthKey": "eeeeeeeeee",
                          };

          let [keys, values] = generateKeysAndValues(elements);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(canSetData).execute(payload);
          let fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32[])"
          ](keys);
          expect(fetchedResult).toEqual(
            Object.values(elements).map((value) =>
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value))
            )
          );
        });

        it("(should pass): adding 10 LSP12IssuedAssets", async () => {
          let lsp12IssuedAssets = getRandomAddresses(10);

          const data = { "LSP12IssuedAssets[]": lsp12IssuedAssets };

          const encodedData = encodeData(data, BasicUPSetup_Schema);
          const flattenedEncodedData = flattenEncodedData(encodedData);

          let keys = [];
          let values = [];

          flattenedEncodedData.map((data) => {
            keys.push(data.key);
            values.push(data.value);
          });

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(canSetData).execute(payload);
          let fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32[])"
          ](keys);
          expect(fetchedResult).toEqual(values);
        });

        it("(should pass): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)", async () => {
          const basicUPSetup = {
            LSP3Profile: {
              hashFunction: "keccak256(utf8)",
              hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
              url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
            },
            "LSP12IssuedAssets[]": [
              "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
              "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
            ],
            LSP1UniversalReceiverDelegate:
              "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
          };

          let encodedData = encodeData(basicUPSetup, BasicUPSetup_Schema);
          let flattenedEncodedData = flattenEncodedData(encodedData);

          let keys = [];
          let values = [];

          flattenedEncodedData.map((data) => {
            keys.push(data.key);
            values.push(data.value);
          });

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(canSetData).execute(payload);
          let fetchedResult = await context.universalProfile.callStatic[
            "getData(bytes32[])"
          ](keys);
          expect(fetchedResult).toEqual(values);
        });
      });

      describe("For address that doesn't have permission SETDATA", () => {
        it("(should fail): adding 5 singleton keys", async () => {
          let elements = {
            MyFirstKey: "aaaaaaaaaa",
            MySecondKey: "bbbbbbbbbb",
            MyThirdKey: "cccccccccc",
            MyFourthKey: "dddddddddd",
            MyFifthKey: "eeeeeeeeee",
          };

          let [keys, values] = generateKeysAndValues(elements);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager.connect(cannotSetData).execute(payload)
          ).toBeRevertedWith(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        });

        it("(should fail): adding 10 LSP12IssuedAssets", async () => {
          let lsp12IssuedAssets = getRandomAddresses(10);

          const data = { "LSP12IssuedAssets[]": lsp12IssuedAssets };

          const encodedData = encodeData(data, BasicUPSetup_Schema);
          const flattenedEncodedData = flattenEncodedData(encodedData);

          let keys = [];
          let values = [];

          flattenedEncodedData.map((data) => {
            keys.push(data.key);
            values.push(data.value);
          });

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager.connect(cannotSetData).execute(payload)
          ).toBeRevertedWith(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        });

        it("(should fail): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)", async () => {
          const basicUPSetup = {
            LSP3Profile: {
              hashFunction: "keccak256(utf8)",
              hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
              url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
            },
            "LSP12IssuedAssets[]": [
              "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
              "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
            ],
            LSP1UniversalReceiverDelegate:
              "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
          };

          let encodedData = encodeData(basicUPSetup, BasicUPSetup_Schema);
          let flattenedEncodedData = flattenEncodedData(encodedData);

          let keys = [];
          let values = [];

          flattenedEncodedData.map((data) => {
            keys.push(data.key);
            values.push(data.value);
          });

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager.connect(cannotSetData).execute(payload)
          ).toBeRevertedWith(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        });
      });
    });
  });

  describe("when caller is a contract", () => {
    let contractCanSetData: Executor;

    const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Key"));
    const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some value"));

    /**
     * @dev this is necessary when the function being called in the contract
     *  perform a raw / low-level call (in the function body)
     *  otherwise, the deeper layer of interaction (UP.execute) fails
     */
    const GAS_PROVIDED = 500_000;

    beforeEach(async () => {
      context = await buildContext();

      contractCanSetData = await new Executor__factory(context.owner).deploy(
        context.universalProfile.address,
        context.keyManager.address
      );

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contractCanSetData.address.substring(2),
      ];

      const permissionValues = [ALL_PERMISSIONS, PERMISSIONS.SETDATA];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("> contract calls", () => {
      it("should allow to set a key hardcoded inside a function of the calling contract", async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await contractCanSetData.setHardcodedKey();

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to set a key computed inside a function of the calling contract", async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await contractCanSetData.setComputedKey();

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to set a key computed from parameters given to a function of the calling contract", async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await contractCanSetData.setComputedKeyFromParams(key, value);

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(newStorage).toEqual(value);
      });
    });

    describe("> Low-level calls", () => {
      it("Should allow to `setHardcodedKeyRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(initialStorage).toEqual("0x");

        // check if low-level call succeeded
        let result = await contractCanSetData.callStatic.setHardcodedKeyRawCall(
          {
            gasLimit: GAS_PROVIDED,
          }
        );
        expect(result).toBeTruthy();

        // make the executor call
        await contractCanSetData.setHardcodedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to `setComputedKeyRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await contractCanSetData.setComputedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(newStorage).toEqual(value);
      });

      it("Should allow to `setComputedKeyFromParamsRawCall` on UP", async () => {
        // check that nothing is set at store[key]
        let initialStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(initialStorage).toEqual("0x");

        // make the executor call
        await contractCanSetData.setComputedKeyFromParamsRawCall(key, value, {
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        let newStorage = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(newStorage).toEqual(value);
      });
    });
  });

  describe("when caller is another UniversalProfile (with a KeyManager attached as owner)", () => {
    // UP making the call
    let alice: SignerWithAddress;
    let aliceContext: LSP6TestContext;

    // UP being called
    let bob: SignerWithAddress;
    let bobContext: LSP6TestContext;

    beforeAll(async () => {
      aliceContext = await buildContext();
      alice = aliceContext.accounts[0];

      bobContext = await buildContext();
      bob = bobContext.accounts[1];

      const alicePermissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substring(2),
      ];
      const alicePermissionValues = [ALL_PERMISSIONS];

      const bobPermissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          aliceContext.universalProfile.address.substring(2),
      ];

      const bobPermissionValues = [ALL_PERMISSIONS, PERMISSIONS.SETDATA];

      await setupKeyManager(
        aliceContext,
        alicePermissionKeys,
        alicePermissionValues
      );

      await setupKeyManager(bobContext, bobPermissionKeys, bobPermissionValues);
    });

    it("Alice should have ALL PERMISSIONS in her UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        alice.address.substring(2);

      const result = await aliceContext.universalProfile["getData(bytes32)"](
        key
      );
      expect(result).toEqual(ALL_PERMISSIONS);
    });

    it("Bob should have ALL PERMISSIONS in his UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        bob.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(ALL_PERMISSIONS);
    });

    it("Alice's UP should have permission SETDATA on Bob's UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        aliceContext.universalProfile.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(PERMISSIONS.SETDATA);
    });

    it("Alice's UP should be able to `setData(...)` on Bob's UP", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Alice's Key"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("Alice's Value")
      );

      let finalSetDataPayload =
        bobContext.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

      let bobKeyManagerPayload =
        bobContext.keyManager.interface.encodeFunctionData("execute", [
          finalSetDataPayload,
        ]);

      let aliceUniversalProfilePayload =
        aliceContext.universalProfile.interface.encodeFunctionData("execute", [
          OPERATION_TYPES.CALL,
          bobContext.keyManager.address,
          0,
          bobKeyManagerPayload,
        ]);

      let tx = await aliceContext.keyManager
        .connect(alice)
        .execute(aliceUniversalProfilePayload);
      let receipt = await tx.wait();
      console.log("gas used: ", receipt.gasUsed.toNumber());

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(value);
    });
  });

  describe("when caller has SUPER_SETDATA + some allowed ERC725YKeys", () => {
    let caller: SignerWithAddress;

    const allowedERC725YKeys = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 1st allowed key")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 2nd allowed key")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 3rd allowed key")),
    ];

    beforeEach(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          caller.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.SUPER_SETDATA,
        abiCoder.encode(["bytes32[]"], [allowedERC725YKeys]),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when trying to set a disallowed key", () => {
      for (let ii = 1; ii <= 5; ii++) {
        let key = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(`dissallowed key ${ii}`)
        );
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(`some value ${ii}`)
        );

        it(`should be allowed to set a disallowed key: ${key}`, async () => {
          const payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager.connect(caller).execute(payload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(value);
        });
      }
    });

    describe("when trying to set an allowed key", () => {
      it("should be allowed to set the 1st allowed key", async () => {
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("some value 1")
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [allowedERC725YKeys[0], value]
        );

        await context.keyManager.connect(caller).execute(payload);

        const result = await context.universalProfile["getData(bytes32)"](
          allowedERC725YKeys[0]
        );
        expect(result).toEqual(value);
      });

      it("should be allowed to set the 2nd allowed key", async () => {
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("some value 2")
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [allowedERC725YKeys[1], value]
        );

        await context.keyManager.connect(caller).execute(payload);

        const result = await context.universalProfile["getData(bytes32)"](
          allowedERC725YKeys[1]
        );
        expect(result).toEqual(value);
      });

      it("should be allowed to set the 3rd allowed key", async () => {
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("some value 3")
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [allowedERC725YKeys[2], value]
        );

        await context.keyManager.connect(caller).execute(payload);

        const result = await context.universalProfile["getData(bytes32)"](
          allowedERC725YKeys[2]
        );
        expect(result).toEqual(value);
      });
    });
  });
};
