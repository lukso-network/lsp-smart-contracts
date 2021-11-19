import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  UniversalProfile,
  UniversalProfile__factory,
  LSP6KeyManager,
  LSP7Tester,
  LSP7Tester__factory,
  LSP8Tester,
  LSP8Tester__factory,
  URDRevert,
  URDRevert__factory,
  LSP6KeyManager__factory,
  LSP1UniversalReceiverDelegate,
  LSP1UniversalReceiverDelegate__factory,
} from "../../types";

import { ERC725YKeys, ALL_PERMISSIONS_SET, PERMISSIONS, OPERATIONS } from "../utils/constants";

import { RAW_INTERFACE_ID, ITEMS_ARRAY_KEY, ARRAY_LENGTH, INDEX, TOKEN_ID } from "../utils/helpers";

describe("UniversalReceiverDelegate contract", () => {
  let accounts: SignerWithAddress[];
  let owner1, owner2;
  let keyManager1: LSP6KeyManager, keyManager2: LSP6KeyManager;
  let universalReceiverDelegate: LSP1UniversalReceiverDelegate;
  let universalProfile1: UniversalProfile, universalProfile2: UniversalProfile;
  let URDRevert: URDRevert;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner1 = accounts[0];
    owner2 = accounts[1];
    universalProfile1 = await new UniversalProfile__factory(owner1).deploy(owner1.address);
    universalProfile2 = await new UniversalProfile__factory(owner2).deploy(owner2.address);
    keyManager1 = await new LSP6KeyManager__factory(owner1).deploy(universalProfile1.address);
    keyManager2 = await new LSP6KeyManager__factory(owner2).deploy(universalProfile2.address);
    universalReceiverDelegate = await new LSP1UniversalReceiverDelegate__factory(owner1).deploy();
    URDRevert = await new URDRevert__factory(owner1).deploy();

    // Setting Permissions for UP1

    // owner1 permissions

    await universalProfile1
      .connect(owner1)
      .setData(
        [ERC725YKeys.LSP6["AddressPermissions:Permissions:"] + owner1.address.substr(2)],
        [ALL_PERMISSIONS_SET]
      );

    // set the URD Key
    await universalProfile1
      .connect(owner1)
      .setData(
        [ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"]],
        [universalReceiverDelegate.address]
      );

    // set URD permissions
    let URDPermissions = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32);
    await universalProfile1
      .connect(owner1)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions:"] +
            universalReceiverDelegate.address.substr(2),
        ],
        [URDPermissions]
      );

    // switch account management to keyManager1
    await universalProfile1.connect(owner1).transferOwnership(keyManager1.address);

    // Setting Permissions for UP1

    // owner2 permission

    await universalProfile2
      .connect(owner2)
      .setData(
        [ERC725YKeys.LSP6["AddressPermissions:Permissions:"] + owner2.address.substr(2)],
        [ALL_PERMISSIONS_SET]
      );

    // set the URD Key
    await universalProfile2
      .connect(owner2)
      .setData(
        [ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"]],
        [universalReceiverDelegate.address]
      );

    // set URD permissions
    let URDPermissions2 = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32);
    await universalProfile2
      .connect(owner2)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions:"] +
            universalReceiverDelegate.address.substr(2),
        ],
        [URDPermissions2]
      );

    // switch account management to keyManager2
    await universalProfile2.connect(owner2).transferOwnership(keyManager2.address);

    // fund UP with ether
    await owner1.sendTransaction({
      to: universalProfile1.address,
      value: ethers.utils.parseEther("10"),
    });

    await owner2.sendTransaction({
      to: universalProfile2.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  describe("Testing Deployement", () => {
    it("Deploys correctly, and compare owners", async () => {
      const idOwner = await universalProfile1.callStatic.owner();
      expect(idOwner).toEqual(keyManager1.address);
      const idOwnerSecond = await universalProfile2.callStatic.owner();
      expect(idOwnerSecond).toEqual(keyManager2.address);
    });

    it("Should be able to read UR key", async () => {
      // UP1
      const [gettedAddress] = await universalProfile1
        .connect(owner1)
        .getData([ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"]]);
      expect(await ethers.utils.getAddress(gettedAddress)).toEqual(
        universalReceiverDelegate.address
      );
      // UP2
      const [gettedAddressSecond] = await universalProfile2
        .connect(owner2)
        .getData([ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"]]);
      expect(await ethers.utils.getAddress(gettedAddressSecond)).toEqual(
        universalReceiverDelegate.address
      );
    });

    it("ensures owner is still universalProfile1's admin (=all permissions)", async () => {
      let [permissions] = await universalProfile1.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions:"] + owner1.address.substr(2),
      ]);
      expect(permissions).toEqual(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "Owner should have all permissions set"
      );

      // UP2
      let [permissionsSecond] = await universalProfile2.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions:"] + owner2.address.substr(2),
      ]);
      expect(permissionsSecond).toEqual(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "Owner should have all permissions set"
      );
    });

    it("get URD permissions", async () => {
      let [permissions] = await universalProfile1.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions:"] +
          universalReceiverDelegate.address.substr(2),
      ]);
      expect(permissions).toEqual(
        "0x0000000000000000000000000000000000000000000000000000000000000018",
        "URD should have permissions"
      ); // to setData and call

      // UP2
      let [permissionsSecond] = await universalProfile2.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions:"] +
          universalReceiverDelegate.address.substr(2),
      ]);
      expect(permissionsSecond).toEqual(
        "0x0000000000000000000000000000000000000000000000000000000000000018",
        "URD should have permissions"
      ); // to setData and call
    });

    it("Owner should be allowed to change keys", async () => {
      // change universalReceiverDelegate1's permissions
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions:"] +
        universalReceiverDelegate.address.substr(2);

      let payload = universalProfile1.interface.encodeFunctionData("setData", [
        [key],
        [PERMISSIONS.SETDATA],
      ]);

      let result = await keyManager1.connect(owner1).callStatic.execute(payload);
      expect(result).toBeTruthy();

      await keyManager1.connect(owner1).execute(payload);
      let fetchedResult = await universalProfile1.callStatic.getData([key]);
      expect(Number(fetchedResult)).toEqual(PERMISSIONS.SETDATA);

      // reset universalReceiverDelegate1 permissions
      await keyManager1.execute(
        universalProfile1.interface.encodeFunctionData("setData", [
          [key],
          [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32)],
        ])
      );
    });
  });

  describe("LSP7-DigitalAsset", () => {
    let LSP7tokenA, LSP7tokenB, LSP7tokenC, LSP7tokenD, LSP7tokenE;
    beforeAll(async () => {
      LSP7tokenA = await new LSP7Tester__factory(owner1).deploy("TokenA", "TKA", owner1.address);
      LSP7tokenB = await new LSP7Tester__factory(owner1).deploy("TokenB", "TKB", owner1.address);
      LSP7tokenC = await new LSP7Tester__factory(owner1).deploy("TokenC", "TKC", owner1.address);
      LSP7tokenD = await new LSP7Tester__factory(owner1).deploy("TokenD", "TKD", owner1.address);
      LSP7tokenE = await new LSP7Tester__factory(owner1).deploy("TokenE", "TKE", owner1.address);
    });
    describe("Minting and Burning Behavior", () => {
      it("Should mint tokenA and Register the Map and the Key in the Array", async () => {
        // Token const
        const tokenAMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenA.address.substr(2);

        let abi = LSP7tokenA.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Checking the Registred entries

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenAMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP7tokenA.address);
      });

      it("Should mint TokenB and Register the Map and the Key in the Array and Update the length", async () => {
        // Token const
        const tokenBMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenB.address.substr(2);

        let abi = LSP7tokenB.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenBMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP7);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP7tokenB.address);
      });

      it("Should send more token A and B and don't add or change something", async () => {
        // Token const
        const tokenAMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenA.address.substr(2);
        const tokenBMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenB.address.substr(2);

        let abi = LSP7tokenB.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let abi1 = LSP7tokenA.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor1 = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenA.address,
          0,
          abi1,
        ]);
        await keyManager1.execute(abiExecutor1, { from: owner1.address });

        let [indexAndInterfaceId1] = await universalProfile1
          .connect(owner1)
          .getData([tokenAMapAsset]);
        let [indexAndInterfaceId2] = await universalProfile1
          .connect(owner1)
          .getData([tokenBMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [item3Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM3]);

        expect(indexAndInterfaceId1).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(indexAndInterfaceId2).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP7);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP7tokenA.address);
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP7tokenB.address);
        expect(item3Address).toEqual("0x");
      });

      it("Should mint token C and Register the Map and the key in the Array and update the length", async () => {
        // Token const
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenC.address.substr(2);

        let abi = LSP7tokenC.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenC.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item3Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM3]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.TWO + RAW_INTERFACE_ID.LSP7);
        expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
        expect(await ethers.utils.getAddress(item3Address)).toEqual(LSP7tokenC.address);
      });

      it("Should Burn token B and update the key in the Array and remove the map", async () => {
        // Token const
        const tokenBMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenB.address.substr(2);
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenC.address.substr(2);

        let abi = LSP7tokenB.interface.encodeFunctionData("burn", [
          universalProfile1.address,
          "20",
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [indexAndInterfaceIdForB] = await universalProfile1
          .connect(owner1)
          .getData([tokenBMapAsset]);
        let [indexAndInterfaceIdForC] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);

        // Now the Map of Token C takes the index of the removed Token B and item2 will be token C instead of B
        expect(indexAndInterfaceIdForC).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP7);
        expect(indexAndInterfaceIdForB).toEqual("0x");
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP7tokenC.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
      });

      it("Should mint Token D and registering the Map and the key in the Array", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenD.address.substr(2);

        let abi = LSP7tokenD.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenDMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item3Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM3]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.TWO + RAW_INTERFACE_ID.LSP7);
        expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
        expect(await ethers.utils.getAddress(item3Address)).toEqual(LSP7tokenD.address);
      });

      it("Should burn Token D and remove the Map and the key in the Array and update the length", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenD.address.substr(2);
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenC.address.substr(2);

        let abi = LSP7tokenD.interface.encodeFunctionData("burn", [
          universalProfile1.address,
          "10",
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [indexAndInterfaceIdForD] = await universalProfile1
          .connect(owner1)
          .getData([tokenDMapAsset]);
        let [indexAndInterfaceIdForC] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);

        /* Now the none of the existing map doesn't change the index since 
                the token removed is placed last in the array */
        expect(indexAndInterfaceIdForC).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP7);
        expect(indexAndInterfaceIdForD).toEqual("0x");
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP7tokenC.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
      });

      it("Should burn token A and update the key in the array and remove Map and update array length", async () => {
        // Token const
        const tokenAMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenA.address.substr(2);
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenC.address.substr(2);

        let abi = LSP7tokenA.interface.encodeFunctionData("burn", [
          universalProfile1.address,
          "20",
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdForC] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);
        let [indexAndInterfaceIdForA] = await universalProfile1
          .connect(owner1)
          .getData([tokenAMapAsset]);

        expect(indexAndInterfaceIdForA).toEqual("0x");
        expect(indexAndInterfaceIdForC).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP7tokenC.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
      });

      it("Should burn token C and update the key in the array and remove Map and update array length", async () => {
        // Token const
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenC.address.substr(2);

        let abi = LSP7tokenC.interface.encodeFunctionData("burn", [
          universalProfile1.address,
          "10",
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenC.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);

        expect(indexAndInterfaceId).toEqual("0x");
        expect(item1Address).toEqual("0x");
        expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
      });
      it("Should mint token E and register the Map and the key in the Array", async () => {
        // Token const
        const tokenEMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenE.address.substr(2);

        let abi = LSP7tokenE.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP7tokenE.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
      });
    });

    describe("Transferring tokens between 2 UP", () => {
      it("Should transfer 5 tokensE to UP2 and keep 5 tokensE in UP1 and register the entries in UP2 and keep them also in UP1", async () => {
        // Token const
        const tokenEMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenE.address.substr(2);

        let abi = LSP7tokenE.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "5",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP1] = await universalProfile1
          .connect(owner1)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceIdUP1).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item1AddressUP1)).toEqual(LSP7tokenE.address);
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ONE);

        // Check the Registred entries in UP2

        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP7tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });

      it("Should transfer 5 tokensE to UP2 from UP1 and Keep 0 token E in UP1 then clear all entries", async () => {
        // Token const
        const tokenEMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenE.address.substr(2);

        let abi = LSP7tokenE.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "5",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP1] = await universalProfile1
          .connect(owner1)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceIdUP1).toEqual("0x");
        expect(item1AddressUP1).toEqual("0x");
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ZERO);

        // Check the Registred entries in UP2

        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP7tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });

      it("Should mint token D to UP2 and register the map and the key in the array", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenD.address.substr(2);

        let abi = LSP7tokenD.interface.encodeFunctionData("mint", [
          universalProfile2.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenD.address,
          0,
          abi,
        ]);
        await keyManager2.connect(owner2).execute(abiExecutor);

        // Check the Registred entries in UP2

        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenDMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item2AddressUP2)).toEqual(LSP7tokenD.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.TWO);
      });

      it("Should Transfer token D from UP2 to UP1 and remove all Token D entries", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP7tokenD.address.substr(2);

        let abi = LSP7tokenD.interface.encodeFunctionData("transfer", [
          universalProfile2.address,
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenD.address,
          0,
          abi,
        ]);
        await keyManager2.connect(owner2).execute(abiExecutor);

        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP1] = await universalProfile1
          .connect(owner1)
          .getData([tokenDMapAsset]);

        expect(indexAndInterfaceIdUP1).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP7);
        expect(await ethers.utils.getAddress(item1AddressUP1)).toEqual(LSP7tokenD.address);
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ONE);

        // Check the Registred entries in UP2
        // since token D is removed, the first item will be now the token E
        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenDMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x");
        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP7tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });
    });

    describe("Implementing URDRevert", () => {
      beforeAll(async () => {
        let abiSetData = universalProfile2.interface.encodeFunctionData("setData", [
          [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
          [URDRevert.address],
        ]);
        await keyManager2.connect(owner2).execute(abiSetData, { from: owner2.address });
      });

      it("Should revert when sending tokens from UP1 to UP2 that implement URDRevert", async () => {
        let abi = LSP7tokenD.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenD.address,
          0,
          abi,
        ]);
        await expect(keyManager1.execute(abiExecutor)).toBeRevertedWith("This Contract reverts");
      });

      it("Should not register any token in UP2 nor remove any in UP1", async () => {
        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);

        expect(await ethers.utils.getAddress(item1AddressUP1)).toEqual(LSP7tokenD.address);
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ONE);

        // Check the Registred entries in UP2
        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);

        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP7tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });

      it("Resetting normal UniversalReceiverDelegate", async () => {
        let abiSetData = universalProfile2.interface.encodeFunctionData("setData", [
          [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
          [universalReceiverDelegate.address],
        ]);
        await keyManager2.connect(owner2).execute(abiSetData, { from: owner2.address });
      });
      it("Burning all token in UP1 and UP2 and clear the entries", async () => {
        // burning token D in UP1
        let abi = LSP7tokenD.interface.encodeFunctionData("burn", [
          universalProfile1.address,
          "10",
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // burning token E in UP2
        let abi1 = LSP7tokenE.interface.encodeFunctionData("burn", [
          universalProfile2.address,
          "10",
          "0x",
        ]);
        let abiExecutor1 = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP7tokenE.address,
          0,
          abi1,
        ]);
        await keyManager2.execute(abiExecutor1, { from: owner2.address });
      });
    });
  });

  describe("LSP8-IdentifiableDigitalAsset", () => {
    let LSP8tokenA, LSP8tokenB, LSP8tokenC, LSP8tokenD, LSP8tokenE;
    beforeAll(async () => {
      LSP8tokenA = await new LSP8Tester__factory(owner1).deploy("TokenA", "TKA", owner1.address);
      LSP8tokenB = await new LSP8Tester__factory(owner1).deploy("TokenB", "TKB", owner1.address);
      LSP8tokenC = await new LSP8Tester__factory(owner1).deploy("TokenC", "TKC", owner1.address);
      LSP8tokenD = await new LSP8Tester__factory(owner1).deploy("TokenD", "TKD", owner1.address);
      LSP8tokenE = await new LSP8Tester__factory(owner1).deploy("TokenE", "TKE", owner1.address);
    });
    describe("Minting and Burning Behavior", () => {
      it("Should mint tokenA and Register the Map and the Key in the Array", async () => {
        // Token const
        const tokenAMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenA.address.substr(2);

        let abi = LSP8tokenA.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID.ONE,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Checking the Registred entries

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenAMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP8);
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP8tokenA.address);
      });

      it("Should mint TokenB and Register the Map and the Key in the Array and Update the length", async () => {
        // Token const
        const tokenBMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenB.address.substr(2);

        let abi = LSP8tokenB.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID.TWO,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenBMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP8);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP8tokenB.address);
      });

      it("Should mint token C and Register the Map and the key in the Array and update the length", async () => {
        // Token const
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenC.address.substr(2);

        let abi = LSP8tokenC.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID.THREE,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenC.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item3Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM3]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.TWO + RAW_INTERFACE_ID.LSP8);
        expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
        expect(await ethers.utils.getAddress(item3Address)).toEqual(LSP8tokenC.address);
      });

      it("Should Burn token B and update the key in the Array and remove the map", async () => {
        // Token const
        const tokenBMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenB.address.substr(2);
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenC.address.substr(2);

        let abi = LSP8tokenB.interface.encodeFunctionData("burn", [TOKEN_ID.TWO, "0x"]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [indexAndInterfaceIdForB] = await universalProfile1
          .connect(owner1)
          .getData([tokenBMapAsset]);
        let [indexAndInterfaceIdForC] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);

        // Now the Map of Token C takes the index of the removed Token B and item2 will be token C instead of B
        expect(indexAndInterfaceIdForC).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP8);
        expect(indexAndInterfaceIdForB).toEqual("0x");
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP8tokenC.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
      });

      it("Should mint Token D and registering the Map and the key in the Array", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenD.address.substr(2);

        let abi = LSP8tokenD.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID.FOUR,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenDMapAsset]);
        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item3Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM3]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.TWO + RAW_INTERFACE_ID.LSP8);
        expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
        expect(await ethers.utils.getAddress(item3Address)).toEqual(LSP8tokenD.address);
      });

      it("Should burn Token D and remove the Map and the key in the Array and update the length", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenD.address.substr(2);
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenC.address.substr(2);

        let abi = LSP8tokenD.interface.encodeFunctionData("burn", [TOKEN_ID.FOUR, "0x"]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [indexAndInterfaceIdForD] = await universalProfile1
          .connect(owner1)
          .getData([tokenDMapAsset]);
        let [indexAndInterfaceIdForC] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);

        /* Now the none of the existing map doesn't change the index since 
                the token removed is placed last in the array */
        expect(indexAndInterfaceIdForC).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP8);
        expect(indexAndInterfaceIdForD).toEqual("0x");
        expect(await ethers.utils.getAddress(item2Address)).toEqual(LSP8tokenC.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
      });

      it("Should burn token A and update the key in the array and remove Map and update array length", async () => {
        // Token const
        const tokenAMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenA.address.substr(2);
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenC.address.substr(2);

        let abi = LSP8tokenA.interface.encodeFunctionData("burn", [TOKEN_ID.ONE, "0x"]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdForC] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);
        let [indexAndInterfaceIdForA] = await universalProfile1
          .connect(owner1)
          .getData([tokenAMapAsset]);

        expect(indexAndInterfaceIdForA).toEqual("0x");
        expect(indexAndInterfaceIdForC).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP8);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP8tokenC.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
      });

      it("Should burn token C and update the key in the array and remove Map and update array length", async () => {
        // Token const
        const tokenCMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenC.address.substr(2);

        let abi = LSP8tokenC.interface.encodeFunctionData("burn", [TOKEN_ID.THREE, "0x"]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenC.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenCMapAsset]);

        expect(indexAndInterfaceId).toEqual("0x");
        expect(item1Address).toEqual("0x");
        expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
      });
      it("Should mint token E and register the Map and the key in the Array", async () => {
        // Token const
        const tokenEMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenE.address.substr(2);

        let abi = LSP8tokenE.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID.FIVE,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries

        let [arrayLength] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1Address] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceId] = await universalProfile1
          .connect(owner1)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceId).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP8);
        expect(await ethers.utils.getAddress(item1Address)).toEqual(LSP8tokenE.address);
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
      });
    });

    describe("Transferring tokens between 2 UP", () => {
      it("Should transfer token E to UP2 and register the entries in UP2 ", async () => {
        // Token const
        const tokenEMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenE.address.substr(2);

        let abi = LSP8tokenE.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          TOKEN_ID.FIVE,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner1.address });

        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP1] = await universalProfile1
          .connect(owner1)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceIdUP1).toEqual("0x");
        expect(item1AddressUP1).toEqual("0x");
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ZERO);

        // Check the Registred entries in UP2

        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenEMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP8);
        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP8tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });

      it("Should mint token D to UP2 and register the map and the key in the array", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenD.address.substr(2);

        let abi = LSP8tokenD.interface.encodeFunctionData("mint", [
          universalProfile2.address,
          TOKEN_ID.FOUR,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenD.address,
          0,
          abi,
        ]);
        await keyManager2.connect(owner2).execute(abiExecutor);

        // Check the Registred entries in UP2

        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item2AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM2]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenDMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x" + INDEX.ONE + RAW_INTERFACE_ID.LSP8);
        expect(await ethers.utils.getAddress(item2AddressUP2)).toEqual(LSP8tokenD.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.TWO);
      });

      it("Should Transfer token D from UP2 to UP1 and remove all Token D entries", async () => {
        // Token const
        const tokenDMapAsset =
          ERC725YKeys.LSP5["LSP5ReceivedAssetsMap:"] + LSP8tokenD.address.substr(2);

        let abi = LSP8tokenD.interface.encodeFunctionData("transfer", [
          universalProfile2.address,
          universalProfile1.address,
          TOKEN_ID.FOUR,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenD.address,
          0,
          abi,
        ]);
        await keyManager2.connect(owner2).execute(abiExecutor);

        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP1] = await universalProfile1
          .connect(owner1)
          .getData([tokenDMapAsset]);

        expect(indexAndInterfaceIdUP1).toEqual("0x" + INDEX.ZERO + RAW_INTERFACE_ID.LSP8);
        expect(await ethers.utils.getAddress(item1AddressUP1)).toEqual(LSP8tokenD.address);
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ONE);

        // Check the Registred entries in UP2
        // since token D is removed, the first item will be now the token E
        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);
        let [indexAndInterfaceIdUP2] = await universalProfile2
          .connect(owner2)
          .getData([tokenDMapAsset]);

        expect(indexAndInterfaceIdUP2).toEqual("0x");
        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP8tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });
    });

    describe("Implementing URDRevert", () => {
      beforeAll(async () => {
        let abiSetData = universalProfile2.interface.encodeFunctionData("setData", [
          [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
          [URDRevert.address],
        ]);
        await keyManager2.connect(owner2).execute(abiSetData, { from: owner2.address });
      });

      it("Should revert when sending tokens from UP1 to UP2 that implement URDRevert", async () => {
        let abi = LSP8tokenD.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          TOKEN_ID.FOUR,
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          LSP8tokenD.address,
          0,
          abi,
        ]);
        await expect(keyManager1.execute(abiExecutor)).toBeRevertedWith("This Contract reverts");
      });

      it("Should not register any token in UP2 nor remove any in UP1", async () => {
        // Check the Registred entries in UP1

        let [arrayLengthUP1] = await universalProfile1
          .connect(owner1)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP1] = await universalProfile1
          .connect(owner1)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);

        expect(await ethers.utils.getAddress(item1AddressUP1)).toEqual(LSP8tokenD.address);
        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ONE);

        // Check the Registred entries in UP2
        let [arrayLengthUP2] = await universalProfile2
          .connect(owner2)
          .getData([ERC725YKeys.LSP5["LSP5ReceivedAssets[]"]]);
        let [item1AddressUP2] = await universalProfile2
          .connect(owner2)
          .getData([ITEMS_ARRAY_KEY.ITEM1]);

        expect(await ethers.utils.getAddress(item1AddressUP2)).toEqual(LSP8tokenE.address);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ONE);
      });
    });
  });
});
