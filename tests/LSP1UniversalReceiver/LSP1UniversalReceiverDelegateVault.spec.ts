import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  UniversalProfile__factory,
  LSP9Vault,
  LSP9Vault__factory,
  LSP7Tester__factory,
  LSP8Tester__factory,
  UniversalReceiverDelegateRevert__factory,
  LSP1UniversalReceiverDelegateVault,
  LSP1UniversalReceiverDelegateVault__factory,
} from "../../types";

import { ERC725YKeys, OPERATIONS, INTERFACE_IDS } from "../../constants";

import {
  LSP5_ARRAY_KEY,
  ARRAY_LENGTH,
  INDEX,
  TOKEN_ID,
  getMapAndArrayKeyValues,
} from "../utils/helpers";

describe("UniversalReceiverDelegateVault contract", () => {
  let accounts: SignerWithAddress[];
  let owner1, owner2;
  let UniversalProfileA, UniversalProfileB;
  let universalReceiverDelegate: LSP1UniversalReceiverDelegateVault;
  let VaultA: LSP9Vault;
  let VaultB: LSP9Vault;
  let universalReceiverDelegateRevert;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner1 = accounts[0];
    owner2 = accounts[1];
    UniversalProfileA = await new UniversalProfile__factory(owner1).deploy(
      owner1.address
    );
    UniversalProfileB = await new UniversalProfile__factory(owner2).deploy(
      owner2.address
    );

    VaultA = await new LSP9Vault__factory(owner1).deploy(
      UniversalProfileA.address
    );
    VaultB = await new LSP9Vault__factory(owner2).deploy(
      UniversalProfileB.address
    );
    universalReceiverDelegate =
      await new LSP1UniversalReceiverDelegateVault__factory(owner1).deploy();
    universalReceiverDelegateRevert =
      await new UniversalReceiverDelegateRevert__factory(owner1).deploy();
  });

  describe("Universal Receiver Delegate (for Vault) deployment", () => {
    it("should support ERC165 interface", async () => {
      let result = await universalReceiverDelegate.callStatic.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).toBeTruthy();
    });
    it("should support LSP1Delegate interface", async () => {
      let result = await universalReceiverDelegate.callStatic.supportsInterface(
        INTERFACE_IDS.LSP1Delegate
      );
      expect(result).toBeTruthy();
    });
  });

  describe("Vault deployement", () => {
    it("Deploys correctly, and compare owners", async () => {
      const idOwner = await VaultA.callStatic.owner();
      expect(idOwner).toEqual(UniversalProfileA.address);
      const idOwnerSecond = await VaultB.callStatic.owner();
      expect(idOwnerSecond).toEqual(UniversalProfileB.address);
    });

    it("Setting the UniversalReceiverAddress", async () => {
      let abiA = VaultA.interface.encodeFunctionData("setData", [
        [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
        [universalReceiverDelegate.address],
      ]);

      let abiB = VaultB.interface.encodeFunctionData("setData", [
        [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
        [universalReceiverDelegate.address],
      ]);

      await UniversalProfileA.connect(owner1).execute(
        OPERATIONS.CALL,
        VaultA.address,
        0,
        abiA
      );

      await UniversalProfileB.connect(owner2).execute(
        OPERATIONS.CALL,
        VaultB.address,
        0,
        abiB
      );

      let [fetchedResult1] = await VaultA.getData([
        ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate,
      ]);

      let [fetchedResult2] = await VaultB.getData([
        ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate,
      ]);

      expect(ethers.utils.getAddress(fetchedResult1)).toEqual(
        universalReceiverDelegate.address
      );
      expect(ethers.utils.getAddress(fetchedResult2)).toEqual(
        universalReceiverDelegate.address
      );
    });

    describe("ERC165", () => {
      it("Supports LSP1UniversalReceiverDelegate", async () => {
        const interfaceID = INTERFACE_IDS.LSP1;
        const resultVaultA = await VaultA.callStatic.supportsInterface(
          interfaceID
        );
        const resultVaultB = await VaultB.callStatic.supportsInterface(
          interfaceID
        );

        expect(resultVaultA).toBeTruthy();
        expect(resultVaultB).toBeTruthy();
      });
    });

    describe("LSP7-DigitalAsset", () => {
      let LSP7tokenA, LSP7tokenB, LSP7tokenC, LSP7tokenD, LSP7tokenE;
      beforeAll(async () => {
        LSP7tokenA = await new LSP7Tester__factory(owner1).deploy(
          "TokenA",
          "TKA",
          owner1.address
        );
        LSP7tokenB = await new LSP7Tester__factory(owner1).deploy(
          "TokenB",
          "TKB",
          owner1.address
        );
        LSP7tokenC = await new LSP7Tester__factory(owner1).deploy(
          "TokenC",
          "TKC",
          owner1.address
        );
        LSP7tokenD = await new LSP7Tester__factory(owner1).deploy(
          "TokenD",
          "TKD",
          owner1.address
        );
        LSP7tokenE = await new LSP7Tester__factory(owner1).deploy(
          "TokenE",
          "TKE",
          owner1.address
        );
      });
      describe("Minting and Burning Behavior", () => {
        it("Should mint tokenA and Register the Map and the Key in the Array", async () => {
          // Token const
          const tokenAMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenA.address.substr(2);

          let abi = LSP7tokenA.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenA.address,
            0,
            abi,
          ]);

          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Checking the Registred keys

          let [tokenMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenAMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP7tokenA.address
          );
        });

        it("Should mint TokenB and Register the Map and the Key in the Array and Update the length", async () => {
          // Token const
          const tokenBMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenB.address.substr(2);

          let abi = LSP7tokenB.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);

          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenB.address,
            0,
            abi,
          ]);

          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );
          // Check the Registred keys

          let [tokenMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenBMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP7tokenB.address
          );
        });

        it("Should send more token A and B and don't add or change something", async () => {
          // Token const
          const tokenAMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenA.address.substr(2);
          const tokenBMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenB.address.substr(2);

          let abi = LSP7tokenB.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenB.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let abi1 = LSP7tokenA.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor1 = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenA.address,
            0,
            abi1,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor1
          );

          let [tokenAMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenAMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          let [tokenBMapValue, , element2Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenBMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenAMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(tokenBMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP7tokenA.address
          );
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP7tokenB.address
          );
        });

        it("Should mint token C and Register the Map and the key in the Array and update the length", async () => {
          // Token const
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenC.address.substr(2);

          let abi = LSP7tokenC.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenC.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenMapValue, arrayLength, element3Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT3
            );

          expect(tokenMapValue).toEqual(
            "0x" + INDEX.TWO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(await ethers.utils.getAddress(element3Address)).toEqual(
            LSP7tokenC.address
          );
        });

        it("Should Burn token B and update the key in the Array and remove the map", async () => {
          // Token const
          const tokenBMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenB.address.substr(2);
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenC.address.substr(2);

          let abi = LSP7tokenB.interface.encodeFunctionData("burn", [
            VaultA.address,
            "20",
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenB.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenBMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenBMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          let [tokenCMapValue] = await VaultA.connect(owner1).getData([
            tokenCMapKey,
          ]);

          // Now the Map of Token C takes the index of the removed Token B and ELEMENT2 will be token C instead of B
          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(tokenBMapValue).toEqual("0x");
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP7tokenC.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        });

        it("Should mint Token D and registering the Map and the key in the Array", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenD.address.substr(2);

          let abi = LSP7tokenD.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenD.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenMapValue, arrayLength, element3Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT3
            );

          expect(tokenMapValue).toEqual(
            "0x" + INDEX.TWO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(await ethers.utils.getAddress(element3Address)).toEqual(
            LSP7tokenD.address
          );
        });

        it("Should burn Token D and remove the Map and the key in the Array and update the length", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenD.address.substr(2);
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenC.address.substr(2);

          let abi = LSP7tokenD.interface.encodeFunctionData("burn", [
            VaultA.address,
            "10",
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenD.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenCMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          let [tokenDMapValue] = await VaultA.connect(owner1).getData([
            tokenDMapKey,
          ]);

          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(tokenDMapValue).toEqual("0x");
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP7tokenC.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        });

        it("Should burn token A and update the key in the array and remove Map and update array length", async () => {
          // Token const
          const tokenAMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenA.address.substr(2);
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenC.address.substr(2);

          let abi = LSP7tokenA.interface.encodeFunctionData("burn", [
            VaultA.address,
            "20",
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenA.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenCMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          let [tokenAMapValue] = await VaultA.connect(owner1).getData([
            tokenAMapKey,
          ]);

          expect(tokenAMapValue).toEqual("0x");
          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP7tokenC.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Should burn token C and update the key in the array and remove Map and update array length", async () => {
          // Token const
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenC.address.substr(2);

          let abi = LSP7tokenC.interface.encodeFunctionData("burn", [
            VaultA.address,
            "10",
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenC.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenCMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenCMapValue).toEqual("0x");
          expect(element1Address).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
        });
        it("Should mint token E and register the Map and the key in the Array", async () => {
          // Token const
          const tokenEMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenE.address.substr(2);

          let abi = LSP7tokenE.interface.encodeFunctionData("mint", [
            VaultA.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenE.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenEMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP7tokenE.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
        });
      });

      describe("Transferring tokens between 2 Vaults", () => {
        it("Should transfer 5 tokensE to VaultB and keep 5 tokensE in VaultA and register the keys in VaultB and keep them also in VaultA", async () => {
          // Token const
          const tokenEMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenE.address.substr(2);

          let abi = LSP7tokenE.interface.encodeFunctionData("transfer", [
            VaultA.address,
            VaultB.address,
            "5",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenE.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys in VaultA

          let [tokenEMapValueVaultA, arrayLengthVaultA, element1AddressVaultA] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValueVaultA).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element1AddressVaultA)).toEqual(
            LSP7tokenE.address
          );
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ONE);

          // Check the Registred keys in VaultB

          let [tokenEMapValueVaultB, arrayLengthVaultB, element1AddressVaultB] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValueVaultB).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP7tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Should transfer 5 tokensE to VaultB from VaultA and Keep 0 token E in VaultA then clear all keys", async () => {
          // Token const
          const tokenEMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenE.address.substr(2);

          let abi = LSP7tokenE.interface.encodeFunctionData("transfer", [
            VaultA.address,
            VaultB.address,
            "5",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenE.address,
            0,
            abi,
          ]);

          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys in VaultA

          let [tokenEMapValueVaultA, arrayLengthVaultA, element1AddressVaultA] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValueVaultA).toEqual("0x");
          expect(element1AddressVaultA).toEqual("0x");
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ZERO);

          // Check the Registred keys in VaulB

          let [tokenEMapValueVaultB, arrayLengthVaultB, element1AddressVaultB] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValueVaultB).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP7tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Should mint token D to VaultB and register the map and the key in the array", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenD.address.substr(2);

          let abi = LSP7tokenD.interface.encodeFunctionData("mint", [
            VaultB.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultB.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenD.address,
            0,
            abi,
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiExecutor
          );

          // Check the Registred keys in VaultB

          let [tokenDMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenDMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP7tokenD.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        });

        it("Should Transfer token D from VaultB to VaultA and remove all Token D keys", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP7tokenD.address.substr(2);

          let abi = LSP7tokenD.interface.encodeFunctionData("transfer", [
            VaultB.address,
            VaultA.address,
            "10",
            false,
            "0x",
          ]);

          let abiExecutor = VaultB.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenD.address,
            0,
            abi,
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiExecutor
          );
          // Check the Registred keys in VaultA

          let [tokenDMapValueVaultA, arrayLengthVaultA, element1AddressVaultA] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenDMapValueVaultA).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP7.substr(2)
          );
          expect(await ethers.utils.getAddress(element1AddressVaultA)).toEqual(
            LSP7tokenD.address
          );
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ONE);

          // Check the Registred keys in VaultB
          // since token D is removed, the first ELEMENT will be now the token E

          let [tokenDMapValue, arrayLengthVaultB, element1AddressVaultB] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenDMapValue).toEqual("0x");
          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP7tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });
      });

      describe("Implementing UniversalReceiverDelegateRevert", () => {
        beforeAll(async () => {
          let abiSetData = VaultB.interface.encodeFunctionData("setData", [
            [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
            [universalReceiverDelegateRevert.address],
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiSetData
          );
        });

        it("Should revert when sending tokens from VaultA to VaultB that implement UniversalReceiverDelegateRevert", async () => {
          let abi = LSP7tokenD.interface.encodeFunctionData("transfer", [
            VaultA.address,
            VaultB.address,
            "10",
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenD.address,
            0,
            abi,
          ]);
          await expect(
            UniversalProfileA.connect(owner1).execute(
              OPERATIONS.CALL,
              VaultA.address,
              0,
              abiExecutor
            )
          ).toBeRevertedWith("This Contract reverts");
        });

        it("Should not register any token in VaultB nor remove any in VaultA", async () => {
          // Check the Registred keys in VaultA

          let [arrayLengthVaultA, element1AddressVaultA] = await VaultA.connect(
            owner1
          ).getData([
            ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
            LSP5_ARRAY_KEY.ELEMENT1,
          ]);

          expect(await ethers.utils.getAddress(element1AddressVaultA)).toEqual(
            LSP7tokenD.address
          );
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ONE);

          // Check the Registred keys in VaultB
          let [arrayLengthVaultB, element1AddressVaultB] = await VaultB.connect(
            owner2
          ).getData([
            ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
            LSP5_ARRAY_KEY.ELEMENT1,
          ]);

          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP7tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Resetting normal UniversalReceiverDelegate", async () => {
          let abiSetData = VaultB.interface.encodeFunctionData("setData", [
            [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
            [universalReceiverDelegate.address],
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiSetData
          );
        });
        it("Burning all token in VaultA and VaultB and clear the keys", async () => {
          // burning token D in VaultA
          let abi = LSP7tokenD.interface.encodeFunctionData("burn", [
            VaultA.address,
            "10",
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenD.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // burning token E in VaultB
          let abi1 = LSP7tokenE.interface.encodeFunctionData("burn", [
            VaultB.address,
            "10",
            "0x",
          ]);
          let abiExecutor1 = VaultB.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP7tokenE.address,
            0,
            abi1,
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiExecutor1
          );
        });
      });
    });

    describe("LSP8-IdentifiableDigitalAsset", () => {
      let LSP8tokenA, LSP8tokenB, LSP8tokenC, LSP8tokenD, LSP8tokenE;
      beforeAll(async () => {
        LSP8tokenA = await new LSP8Tester__factory(owner1).deploy(
          "TokenA",
          "TKA",
          owner1.address
        );
        LSP8tokenB = await new LSP8Tester__factory(owner1).deploy(
          "TokenB",
          "TKB",
          owner1.address
        );
        LSP8tokenC = await new LSP8Tester__factory(owner1).deploy(
          "TokenC",
          "TKC",
          owner1.address
        );
        LSP8tokenD = await new LSP8Tester__factory(owner1).deploy(
          "TokenD",
          "TKD",
          owner1.address
        );
        LSP8tokenE = await new LSP8Tester__factory(owner1).deploy(
          "TokenE",
          "TKE",
          owner1.address
        );
      });
      describe("Minting and Burning Behavior", () => {
        it("Should mint tokenA and Register the Map and the Key in the Array", async () => {
          // Token const
          const tokenAMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenA.address.substr(2);

          let abi = LSP8tokenA.interface.encodeFunctionData("mint", [
            VaultA.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenA.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Checking the Registred keys

          let [tokenAMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenAMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenAMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP8tokenA.address
          );
        });

        it("Should mint TokenB and Register the Map and the Key in the Array and Update the length", async () => {
          // Token const
          const tokenBMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenB.address.substr(2);

          let abi = LSP8tokenB.interface.encodeFunctionData("mint", [
            VaultA.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenB.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenBMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenBMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenBMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP8tokenB.address
          );
        });

        it("Should mint token C and Register the Map and the key in the Array and update the length", async () => {
          // Token const
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenC.address.substr(2);

          let abi = LSP8tokenC.interface.encodeFunctionData("mint", [
            VaultA.address,
            TOKEN_ID.THREE,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenC.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenCMapValue, arrayLength, element3Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT3
            );

          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.TWO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(await ethers.utils.getAddress(element3Address)).toEqual(
            LSP8tokenC.address
          );
        });

        it("Should Burn token B and update the key in the Array and remove the map", async () => {
          // Token const
          const tokenBMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenB.address.substr(2);
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenC.address.substr(2);

          let abi = LSP8tokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.TWO,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenB.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [arrayLength, element2Address, tokenBMapValue, tokenCMapValue] =
            await VaultA.connect(owner1).getData([
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2,
              tokenBMapKey,
              tokenCMapKey,
            ]);

          // Now the Map of Token C takes the index of the removed Token B and ELEMENT2 will be token C instead of B
          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(tokenBMapValue).toEqual("0x");
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP8tokenC.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        });

        it("Should mint Token D and registering the Map and the key in the Array", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenD.address.substr(2);

          let abi = LSP8tokenD.interface.encodeFunctionData("mint", [
            VaultA.address,
            TOKEN_ID.FOUR,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenD.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenDMapValue, arrayLength, element3Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT3
            );

          expect(tokenDMapValue).toEqual(
            "0x" + INDEX.TWO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(await ethers.utils.getAddress(element3Address)).toEqual(
            LSP8tokenD.address
          );
        });

        it("Should burn Token D and remove the Map and the key in the Array and update the length", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenD.address.substr(2);
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenC.address.substr(2);

          let abi = LSP8tokenD.interface.encodeFunctionData("burn", [
            TOKEN_ID.FOUR,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenD.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenCMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          let [tokenDMapValue] = await VaultA.connect(owner1).getData([
            tokenDMapKey,
          ]);

          /* Now the none of the existing map doesn't change the index since 
                the token removed is placed last in the array */
          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(tokenDMapValue).toEqual("0x");
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP8tokenC.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        });

        it("Should burn token A and update the key in the array and remove Map and update array length", async () => {
          // Token const
          const tokenAMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenA.address.substr(2);
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenC.address.substr(2);

          let abi = LSP8tokenA.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenA.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          let [tokenCMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          let [tokenAMapValue] = await VaultA.connect(owner1).getData([
            tokenAMapKey,
          ]);

          expect(tokenAMapValue).toEqual("0x");
          expect(tokenCMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP8tokenC.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Should burn token C and update the key in the array and remove Map and update array length", async () => {
          // Token const
          const tokenCMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenC.address.substr(2);

          let abi = LSP8tokenC.interface.encodeFunctionData("burn", [
            TOKEN_ID.THREE,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenC.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenCMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenCMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenCMapValue).toEqual("0x");
          expect(element1Address).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
        });
        it("Should mint token E and register the Map and the key in the Array", async () => {
          // Token const
          const tokenEMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenE.address.substr(2);

          let abi = LSP8tokenE.interface.encodeFunctionData("mint", [
            VaultA.address,
            TOKEN_ID.FIVE,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenE.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys

          let [tokenEMapValue, arrayLength, element1Address] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValue).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(await ethers.utils.getAddress(element1Address)).toEqual(
            LSP8tokenE.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
        });
      });

      describe("Transferring tokens between 2 Vaults", () => {
        it("Should transfer token E to VaultB and register the keys in VaultB ", async () => {
          // Token const
          const tokenEMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenE.address.substr(2);

          let abi = LSP8tokenE.interface.encodeFunctionData("transfer", [
            VaultA.address,
            VaultB.address,
            TOKEN_ID.FIVE,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenE.address,
            0,
            abi,
          ]);
          await UniversalProfileA.connect(owner1).execute(
            OPERATIONS.CALL,
            VaultA.address,
            0,
            abiExecutor
          );

          // Check the Registred keys in VaultA

          let [tokenEMapValueVaultA, arrayLengthVaultA, element1AddressVaultA] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenEMapValueVaultA).toEqual("0x");
          expect(element1AddressVaultA).toEqual("0x");
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ZERO);

          // Check the Registred keys in VaultB

          let [tokenEMapValueVaultB, arrayLengthVaultB, element1AddressVaultB] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenEMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenEMapValueVaultB).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP8tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Should mint token D to VaultB and register the map and the key in the array", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenD.address.substr(2);

          let abi = LSP8tokenD.interface.encodeFunctionData("mint", [
            VaultB.address,
            TOKEN_ID.FOUR,
            false,
            "0x",
          ]);
          let abiExecutor = VaultB.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenD.address,
            0,
            abi,
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiExecutor
          );

          // Check the Registred keys in VaultB

          let [tokenDMapValue, arrayLength, element2Address] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT2
            );

          expect(tokenDMapValue).toEqual(
            "0x" + INDEX.ONE + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(await ethers.utils.getAddress(element2Address)).toEqual(
            LSP8tokenD.address
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        });

        it("Should Transfer token D from VaultB to VaultA and remove all Token D keys", async () => {
          // Token const
          const tokenDMapKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"] +
            LSP8tokenD.address.substr(2);

          let abi = LSP8tokenD.interface.encodeFunctionData("transfer", [
            VaultB.address,
            VaultA.address,
            TOKEN_ID.FOUR,
            false,
            "0x",
          ]);
          let abiExecutor = VaultB.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenD.address,
            0,
            abi,
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiExecutor
          );

          // Check the Registred keys in VaultA

          let [tokenDMapValueVaultA, arrayLengthVaultA, element1AddressVaultA] =
            await getMapAndArrayKeyValues(
              VaultA,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenDMapValueVaultA).toEqual(
            "0x" + INDEX.ZERO + INTERFACE_IDS.LSP8.substr(2)
          );
          expect(await ethers.utils.getAddress(element1AddressVaultA)).toEqual(
            LSP8tokenD.address
          );
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ONE);

          // Check the Registred keys in VaultB
          // since token D is removed, the first ELEMENT will be now the token E

          let [tokenDMapValueVaultB, arrayLengthVaultB, element1AddressVaultB] =
            await getMapAndArrayKeyValues(
              VaultB,
              tokenDMapKey,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
              LSP5_ARRAY_KEY.ELEMENT1
            );

          expect(tokenDMapValueVaultB).toEqual("0x");
          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP8tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });
      });

      describe("Implementing UniversalReceiverDelegateRevert", () => {
        beforeAll(async () => {
          let abiSetData = VaultB.interface.encodeFunctionData("setData", [
            [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
            [universalReceiverDelegateRevert.address],
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiSetData
          );
        });

        it("Should revert when sending tokens from VaultA to VaultB that implement UniversalReceiverDelegateRevert", async () => {
          let abi = LSP8tokenD.interface.encodeFunctionData("transfer", [
            VaultA.address,
            VaultB.address,
            TOKEN_ID.FOUR,
            false,
            "0x",
          ]);
          let abiExecutor = VaultA.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            LSP8tokenD.address,
            0,
            abi,
          ]);
          await expect(
            UniversalProfileA.connect(owner1).execute(
              OPERATIONS.CALL,
              VaultA.address,
              0,
              abiExecutor
            )
          ).toBeRevertedWith("This Contract reverts");
        });

        it("Should not register any token in VaultB nor remove any in VaultA", async () => {
          // Check the Registred keys in VaultA

          let [arrayLengthVaultA, element1AddressVaultA] = await VaultA.connect(
            owner1
          ).getData([
            ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
            LSP5_ARRAY_KEY.ELEMENT1,
          ]);

          expect(await ethers.utils.getAddress(element1AddressVaultA)).toEqual(
            LSP8tokenD.address
          );
          expect(arrayLengthVaultA).toEqual(ARRAY_LENGTH.ONE);

          // Check the Registred keys in VaultB
          let [arrayLengthVaultB, element1AddressVaultB] = await VaultB.connect(
            owner2
          ).getData([
            ERC725YKeys.LSP5["LSP5ReceivedAssets[]"],
            LSP5_ARRAY_KEY.ELEMENT1,
          ]);

          expect(await ethers.utils.getAddress(element1AddressVaultB)).toEqual(
            LSP8tokenE.address
          );
          expect(arrayLengthVaultB).toEqual(ARRAY_LENGTH.ONE);
        });

        it("Resetting the default URD", async () => {
          let abiSetData = VaultB.interface.encodeFunctionData("setData", [
            [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
            [universalReceiverDelegate.address],
          ]);

          await UniversalProfileB.connect(owner2).execute(
            OPERATIONS.CALL,
            VaultB.address,
            0,
            abiSetData
          );
        });
      });
    });
  });
});
