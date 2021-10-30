import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  KeyManager__factory,
  UniversalReceiverDelegate,
  UniversalReceiverDelegate__factory,
} from "../../build/types";
import {
  UniversalProfile,
  UniversalProfile__factory,
  KeyManagerHelper,
  KeyManager,
  LSP8Tester,
  LSP8Tester__factory,
  URDRevert,
  URDRevert__factory,
} from "../../build/types";

import {
  ALL_PERMISSIONS_SET,
  KEYS,
  PERMISSIONS,
  OPERATIONS,
  allowedAddresses,
} from "../utils/keymanager";
import { INTERFACE_IDS, ADDRESSPERMISSIONS_KEY } from "../utils/constants";

// Get key: keccak256('LSP1UniversalReceiverDelegate')
const UNIVERSALRECEIVER_KEY = "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";
const LSP5_ASSET_MAP_HASH = "0x812c4334633eb81600000000";
const LSP5_ARRAY_HASH = "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b"; // keccak256("LSPASSETS[]")
const INTERFACE_ID = "49399145";
const TOKEN_ID1 = "0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5";
const TOKEN_ID2 = "0xd4d1a59767271eefdc7830a772b9732a11d503531d972ab8c981a6b1c0e666e5";
const TOKEN_ID3 = "0x3672b35640006da199633c5c75015da83589c4fb84ef8276b18076529e3d3196";
const TOKEN_ID4 = "0x80a6c6138772c2d7c710a3d49f4eea603028994b7e390f670dd68566005417f0";
const TOKEN_ID5 = "0x5c6f8b1aed769a328dad1ae15220e93730cdd52cb12817ae5fd8c15023d660d3";
const TOKEN_ID6 = "0x65ce3c3668a850c4f9fce91762a3fb886380399f02a9eb1495055234e7c0287a";
const TOKEN_ID7 = "0x00121ee2bd9802ce88a413ac1851c8afe6fe7474fb5d1b7da4475151b013da53";
const TOKEN_ID8 = "0x367f9d97f8dd1bece61f8b74c5db7616958147682674fd32de73490bd6347f60";

describe("Universal Receiver Delegate Contract", () => {
  describe("Deployement Testing", () => {
    let accounts: SignerWithAddress[];
    let abiCoder;
    let owner;
    let owner2;
    let keyManager1: KeyManager;
    let keyManager2: KeyManager;
    let universalReceiverDelegate1: UniversalReceiverDelegate;
    let universalReceiverDelegate2: UniversalReceiverDelegate;
    let universalProfile1: UniversalProfile;
    let universalProfile2: UniversalProfile;
    let tokenA: LSP8Tester;
    let tokenB: LSP8Tester;
    let tokenC: LSP8Tester;
    let tokenD: LSP8Tester;
    let tokenE: LSP8Tester;
    let URDrevert: URDRevert;

    beforeAll(async () => {
      accounts = await ethers.getSigners();
      abiCoder = await ethers.utils.defaultAbiCoder;
      owner = accounts[0];
      owner2 = accounts[1];
      universalProfile1 = await new UniversalProfile__factory(owner).deploy(owner.address);
      universalProfile2 = await new UniversalProfile__factory(owner2).deploy(owner2.address);
      tokenA = await new LSP8Tester__factory(owner).deploy("TokenA", "TKA", owner.address);
      tokenB = await new LSP8Tester__factory(owner).deploy("TokenB", "TKB", owner.address);
      tokenC = await new LSP8Tester__factory(owner).deploy("TokenC", "TKC", owner.address);
      tokenD = await new LSP8Tester__factory(owner).deploy("TokenD", "TKD", owner.address);
      tokenE = await new LSP8Tester__factory(owner).deploy("TokenE", "TKE", owner.address);
      universalReceiverDelegate1 = await new UniversalReceiverDelegate__factory(owner).deploy();
      universalReceiverDelegate2 = await new UniversalReceiverDelegate__factory(owner2).deploy();
      URDrevert = await new URDRevert__factory(owner).deploy();
      keyManager1 = await new KeyManager__factory(owner).deploy(universalProfile1.address);
      keyManager2 = await new KeyManager__factory(owner2).deploy(universalProfile2.address);

      // FOR UNIVERSALPROFILE 1

      // owner permission

      await universalProfile1
        .connect(owner)
        .setData([KEYS.PERMISSIONS + owner.address.substr(2)], [ALL_PERMISSIONS_SET]);

      // set the URD Key
      await universalProfile1
        .connect(owner)
        .setData([UNIVERSALRECEIVER_KEY], [universalReceiverDelegate1.address]);

      // set URD permissions
      let URDPermissions = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32);
      await universalProfile1
        .connect(owner)
        .setData(
          [KEYS.PERMISSIONS + universalReceiverDelegate1.address.substr(2)],
          [URDPermissions]
        );

      // set URDRevert permissions

      let URDRevertPermissions = ethers.utils.hexZeroPad(
        PERMISSIONS.SETDATA + PERMISSIONS.CALL,
        32
      );
      await universalProfile1
        .connect(owner)
        .setData([KEYS.PERMISSIONS + URDrevert.address.substr(2)], [URDRevertPermissions]);

      // switch account management to keyManager1
      await universalProfile1.connect(owner).transferOwnership(keyManager1.address);

      // fund UP with ether
      await owner.sendTransaction({
        to: universalProfile1.address,
        value: ethers.utils.parseEther("10"),
      });

      // FOR UNIVERSALPROFILE 2

      // owner2 permission

      await universalProfile2
        .connect(owner2)
        .setData([KEYS.PERMISSIONS + owner2.address.substr(2)], [ALL_PERMISSIONS_SET]);

      // set the URD Key
      await universalProfile2
        .connect(owner2)
        .setData([UNIVERSALRECEIVER_KEY], [universalReceiverDelegate2.address]);

      // set URD permissions
      let URDPermissions2 = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32);
      await universalProfile2
        .connect(owner2)
        .setData(
          [KEYS.PERMISSIONS + universalReceiverDelegate2.address.substr(2)],
          [URDPermissions2]
        );

      // set URDRevert permissions

      let URDRevertPermissions2 = ethers.utils.hexZeroPad(
        PERMISSIONS.SETDATA + PERMISSIONS.CALL,
        32
      );
      await universalProfile2
        .connect(owner2)
        .setData([KEYS.PERMISSIONS + URDrevert.address.substr(2)], [URDRevertPermissions2]);

      // switch account management to keyManager2
      await universalProfile2.connect(owner2).transferOwnership(keyManager2.address);

      // fund UP with ether
      await owner2.sendTransaction({
        to: universalProfile2.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    beforeEach(async () => {
      universalProfile1.connect(owner.address);
      keyManager1.connect(owner.address);
      universalProfile2.connect(owner2.address);
      keyManager2.connect(owner2.address);
    });

    it("Should read ISLP1 Delegate interface id", async () => {
      const interfaceID = "0xc2d7bcc1";
      const result = await universalReceiverDelegate1.callStatic.supportsInterface(interfaceID);
      const resultSecond = await universalReceiverDelegate2.callStatic.supportsInterface(
        interfaceID
      );

      expect(result).toBeTruthy();
      expect(resultSecond).toBeTruthy();
    });

    it("Deploys correctly, and compare owners", async () => {
      const idOwner = await universalProfile1.callStatic.owner();
      expect(idOwner).toEqual(keyManager1.address);
      const idOwnerSecond = await universalProfile2.callStatic.owner();
      expect(idOwnerSecond).toEqual(keyManager2.address);
    });

    it("Should be able to read UR key", async () => {
      // UP1
      const [gettedAddress] = await universalProfile1
        .connect(owner)
        .getData([UNIVERSALRECEIVER_KEY]);
      expect(await ethers.utils.getAddress(gettedAddress)).toEqual(
        universalReceiverDelegate1.address
      );
      // UP2
      const [gettedAddressSecond] = await universalProfile2
        .connect(owner2)
        .getData([UNIVERSALRECEIVER_KEY]);
      expect(await ethers.utils.getAddress(gettedAddressSecond)).toEqual(
        universalReceiverDelegate2.address
      );
    });

    it("ensures owner is still universalProfile1's admin (=all permissions)", async () => {
      let [permissions] = await universalProfile1.getData([
        KEYS.PERMISSIONS + owner.address.substr(2),
      ]);
      expect(permissions).toEqual(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "Owner should have all permissions set"
      );

      // UP2
      let [permissionsSecond] = await universalProfile2.getData([
        KEYS.PERMISSIONS + owner2.address.substr(2),
      ]);
      expect(permissionsSecond).toEqual(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "Owner should have all permissions set"
      );
    });

    it("get URD permissions", async () => {
      let [permissions] = await universalProfile1.getData([
        KEYS.PERMISSIONS + universalReceiverDelegate1.address.substr(2),
      ]);
      expect(permissions).toEqual(
        "0x000000000000000000000000000000000000000000000000000000000000000c",
        "URD should have permissions"
      ); // to setData and call

      // UP2
      let [permissionsSecond] = await universalProfile2.getData([
        KEYS.PERMISSIONS + universalReceiverDelegate2.address.substr(2),
      ]);
      expect(permissionsSecond).toEqual(
        "0x000000000000000000000000000000000000000000000000000000000000000c",
        "URD should have permissions"
      ); // to setData and call
    });

    it("Owner should be allowed to change keys", async () => {
      // change universalReceiverDelegate1's permissions
      let key = KEYS.PERMISSIONS + universalReceiverDelegate1.address.substr(2);

      let payload = universalProfile1.interface.encodeFunctionData("setData", [
        [key],
        [PERMISSIONS.SETDATA],
      ]);

      let result = await keyManager1.connect(owner).callStatic.execute(payload);
      expect(result).toBeTruthy();

      await keyManager1.connect(owner).execute(payload);
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
    describe("Recepient Hook", () => {
      beforeAll(async () => {
        
        let abi = tokenA.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID1,
          false,
          "0x34",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });
      it("=> Should Register the Asset Map for Token A with index 0 and interface Id", async () => {
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenAMapAsset]);
        

        expect(gettedResult[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });

      it("=> Should Register the Length of The Array : `1`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        // length of the array is 1
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );
      });

      it("=> Should Register the Address of Token A in the first Key in the Array", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item1_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenA.address);
      });

      it("=> Should Have the Second Key in the Array empty for now", async () => {

        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item2_Array_Key]);

        expect(gettedResult).toEqual("0x");
      });

      it("=> Transfer Token B", async () => {
        
        let abi = tokenB.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID2,
          false,
          "0x32",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Register the Asset Map for Token B with index 1 and interface Id", async () => {
        const tokenBMapAsset = LSP5_ASSET_MAP_HASH + tokenB.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenBMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000001" + INTERFACE_ID);
      });

      it("=> Should Update the Length of The Array to `2`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000002"
        );
      });

      it("=> Should Register the Address of Token B in the Second Key in the Array", async () => {

        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item2_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenB.address);
      });

      it("=> Safety Check for all Registred tokens", async () => {
        // LSP5MAP for Token A
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);

        let gettedResult0 = await universalProfile1.connect(owner).getData([tokenAMapAsset]);

        expect(gettedResult0[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);

        // LSP5MAP for Token B
        const tokenBMapAsset = LSP5_ASSET_MAP_HASH + tokenB.address.substr(2);

        let gettedResult1 = await universalProfile1.connect(owner).getData([tokenBMapAsset]);

        expect(gettedResult1[0]).toEqual("0x" + "0000000000000001" + INTERFACE_ID);

        // LSP5Array Length equal 2 (Token A + B)
        let gettedResult2 = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);

        expect(gettedResult2[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000002"
        );

        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult3] = await universalProfile1.connect(owner).getData([item1_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult3)).toEqual(tokenA.address);

        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult4] = await universalProfile1.connect(owner).getData([item2_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult4)).toEqual(tokenB.address);
      });

      it("=> Should Have the Third Key in the Array empty for now", async () => {
        
        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item3_Array_Key]);

        expect(gettedResult).toEqual("0x");
      });

      it("=> Transfer Token C", async () => {
        let abi = tokenC.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID3,
          false,
          "0x34",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenC.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Register the Asset Map for Token C with index 2 and interface Id", async () => {
        const tokenCMapAsset = LSP5_ASSET_MAP_HASH + tokenC.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenCMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000002" + INTERFACE_ID);
      });

      it("=> Should Update the Length of The Array to `3`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000003"
        );
      });

      it("=> Should Register the Address of Token C in the Third Key in the Array", async () => {
        
        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item3_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenC.address);
      });
    });

    describe("Sender Hook", () => {
      it("=> Eliminating Token B", async () => {
        
        let abi = tokenB.interface.encodeFunctionData("burn", [TOKEN_ID2, "0x43"]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenB.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `2`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000002"
        );
      });

      it("=> Item 2 in the LSP5ASSET Array Should be the address of Token C", async () => {
        
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item2_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenC.address);
      });

      it("=> Item 3 Should not exist", async () => {
        
        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item3_Array_Key]);

        expect(gettedResult).toEqual("0x");
      });

      it("=> Asset Map for Token B should not exist anymore", async () => {
        const tokenBMapAsset = LSP5_ASSET_MAP_HASH + tokenB.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenBMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x");
      });

      it("=> Asset Map for Token C refer to index 1 now", async () => {
        const tokenCMapAsset = LSP5_ASSET_MAP_HASH + tokenC.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenCMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000001" + INTERFACE_ID);
      });
    });

    describe("Testing adding and eliminating behavior", () => {
      it("Receive new token D", async () => {
        let abi = tokenD.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID4,
          false,
          "0x43",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `3`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000003"
        );
      });

      it("=> Should Register the Address of Token D in the third Key in the Array", async () => {

        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item3_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenD.address);
      });

      it("=> Asset Map for Token D refer to index 2 now", async () => {
        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenDMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000002" + INTERFACE_ID);
      });

      it("=> Eliminating Token D", async () => {
        let abi = tokenD.interface.encodeFunctionData("burn", [
          TOKEN_ID4,
          "0x22",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenD.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `2`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000002"
        );
      });

      it("=> Asset Map for Token D should be empty now", async () => {
        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenDMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x");
      });

      it("=> Should remove the Address of Token D from the third Key in the Array", async () => {
        
        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item3_Array_Key]);
        expect(gettedResult).toEqual("0x");
      });

      it("=> Next slot should be empty", async () => {
        
        const item4_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000003";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item4_Array_Key]);
        expect(gettedResult).toEqual("0x");
      });

      it("=> Safety Check for Token A and C", async () => {
        // LSP5MAP for Token A
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);

        let gettedResult0 = await universalProfile1.connect(owner).getData([tokenAMapAsset]);
        
        expect(gettedResult0[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);

        // LSP5MAP for Token C
        const tokenCMapAsset = LSP5_ASSET_MAP_HASH + tokenC.address.substr(2);

        let gettedResult1 = await universalProfile1.connect(owner).getData([tokenCMapAsset]);
        
        expect(gettedResult1[0]).toEqual("0x" + "0000000000000001" + INTERFACE_ID);

        // LSP5Array Length equal 2 (Token A + C)
        let gettedResult2 = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult2[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000002"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult3] = await universalProfile1.connect(owner).getData([item1_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult3)).toEqual(tokenA.address);

        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult4] = await universalProfile1.connect(owner).getData([item2_Array_Key]);

        expect(await ethers.utils.getAddress(gettedResult4)).toEqual(tokenC.address);
      });

      it("=> Next slot should be empty", async () => {
        
        const item4_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000003";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item4_Array_Key]);
        expect(gettedResult).toEqual("0x");
      });

      it("=> Eliminating Token A", async () => {
        
        let abi = tokenA.interface.encodeFunctionData("burn", [
          TOKEN_ID1,
          "0x22",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `1`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );
      });

      it("=> Asset Map for Token A should be empty now", async () => {
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenAMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x");
      });

      it("=> Should remove the Address of Token A from the first Key in the Array and replace it with token C", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenC.address);
      });

      it("=> Next slot should be empty", async () => {
        
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item2_Array_Key]);
        expect(gettedResult).toEqual("0x");
      });

      it("=> Eliminating Token C", async () => {
        let abi = tokenC.interface.encodeFunctionData("burn", [
          
          TOKEN_ID3,
          "0x11",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenC.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `0`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000000"
        );
      });

      it("=> Asset Map for Token C should be empty now", async () => {
        const tokenCMapAsset = LSP5_ASSET_MAP_HASH + tokenC.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenCMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x");
      });

      it("=> Should remove the Address of Token C from the first Key ", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(gettedResult).toEqual("0x");
      });

      it("=> Next slot should be empty", async () => {
        
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item2_Array_Key]);
        expect(gettedResult).toEqual("0x");
      });

      it("=> Keys Should be Empty", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        const item4_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000003";
        const item5_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000004";
        const Items = [
          item1_Array_Key,
          item2_Array_Key,
          item3_Array_Key,
          item4_Array_Key,
          item5_Array_Key,
        ];
        let gettedResult = await universalProfile1.connect(owner).getData(Items);
        expect(gettedResult).toEqual(["0x", "0x", "0x", "0x", "0x"]);
      });

      it("=> Token AssetMap Should be Empty", async () => {
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);
        const tokenBMapAsset = LSP5_ASSET_MAP_HASH + tokenB.address.substr(2);
        const tokenCMapAsset = LSP5_ASSET_MAP_HASH + tokenC.address.substr(2);
        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);
        const AssetMap = [tokenAMapAsset, tokenBMapAsset, tokenCMapAsset, tokenDMapAsset];
        let gettedResult = await universalProfile1.connect(owner).getData(AssetMap);
        expect(gettedResult).toEqual(["0x", "0x", "0x", "0x"]);
      });

      it("Receive token A again ", async () => {
        let abi = tokenA.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID1,
          false,
          "0x22",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `1`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );
      });

      it("=> Should Register the Address of Token A in the first Key in the Array", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenA.address);
      });

      it("=> Asset Map for Token A refer to index 0 ", async () => {
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenAMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });

      it("Eliminate token A again ", async () => {
        let abi = tokenA.interface.encodeFunctionData("burn", [
          
          TOKEN_ID1,
          "0x22",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenA.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("Receive token E ", async () => {
        let abi = tokenE.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          TOKEN_ID5,
          false,
          "0x22",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("=> Should Update the Length of The Array to `1`", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );
      });

      it("=> Should Register the Address of Token E in the first Key in the Array", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult)).toEqual(tokenE.address);
      });

      it("=> Asset Map for Token E refer to index 0 ", async () => {
        const tokenEMapAsset = LSP5_ASSET_MAP_HASH + tokenE.address.substr(2);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenEMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });

      it("=> Keys Should be Empty bur first Key should exist", async () => {
        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        const item3_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002";
        const item4_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000003";
        const item5_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000004";
        const Items = [item2_Array_Key, item3_Array_Key, item4_Array_Key, item5_Array_Key];
        let gettedResult = await universalProfile1.connect(owner).getData(Items);
        expect(gettedResult).toEqual(["0x", "0x", "0x", "0x"]);

        let [gettedAsset] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedAsset)).toEqual(tokenE.address);
      });

      it("=> Token AssetMap Should be Empty but for E should exist", async () => {
        const tokenAMapAsset = LSP5_ASSET_MAP_HASH + tokenA.address.substr(2);
        const tokenBMapAsset = LSP5_ASSET_MAP_HASH + tokenB.address.substr(2);
        const tokenCMapAsset = LSP5_ASSET_MAP_HASH + tokenC.address.substr(2);
        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);
        const tokenEMapAsset = LSP5_ASSET_MAP_HASH + tokenE.address.substr(2);

        const AssetMap = [tokenAMapAsset, tokenBMapAsset, tokenCMapAsset, tokenDMapAsset];
        let gettedMaps = await universalProfile1.connect(owner).getData(AssetMap);
        expect(gettedMaps).toEqual(["0x", "0x", "0x", "0x"]);

        let gettedResult = await universalProfile1.connect(owner).getData([tokenEMapAsset]);
        
        expect(gettedResult[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });
    });

    describe("Transfering tokens between 2 UP", () => {
      it("Should transfer TOKEN_ID5 of tokensE to UP2", async () => {
        let abi = tokenE.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          TOKEN_ID5,
          false,
          "0x22",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenE.address,
          0,
          abi,
        ]);
        await keyManager1.execute(abiExecutor, { from: owner.address });
      });

      it("Shouldnt keep All keys in UP1 intact", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000000"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult1] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(gettedResult1).toEqual("0x");

        const tokenEMapAsset = LSP5_ASSET_MAP_HASH + tokenE.address.substr(2);

        let gettedResult2 = await universalProfile1.connect(owner).getData([tokenEMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x");
      });

      it("Check if keys are registred after sending tokens in UP2", async () => {
        let gettedResult = await universalProfile2.connect(owner2).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult1] = await universalProfile2.connect(owner2).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult1)).toEqual(tokenE.address);

        const tokenEMapAsset = LSP5_ASSET_MAP_HASH + tokenE.address.substr(2);

        let gettedResult2 = await universalProfile2.connect(owner2).getData([tokenEMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });

      it("Keys in UP2 Should be registred", async () => {
        let gettedResult = await universalProfile2.connect(owner2).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult1] = await universalProfile2.connect(owner2).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult1)).toEqual(tokenE.address);

        const tokenEMapAsset = LSP5_ASSET_MAP_HASH + tokenE.address.substr(2);

        let gettedResult2 = await universalProfile2.connect(owner2).getData([tokenEMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });

      it("Next slot should be intact in UP2", async () => {
        
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult1] = await universalProfile2.connect(owner2).getData([item2_Array_Key]);
        expect(gettedResult1).toEqual("0x");
      });

      it("Should clear keys from UP1 as balance of tokensE is 0", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000000"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult1] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(gettedResult1).toEqual("0x");

        const tokenEMapAsset = LSP5_ASSET_MAP_HASH + tokenE.address.substr(2);

        let gettedResult2 = await universalProfile1.connect(owner).getData([tokenEMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x");
      });

      it("Mint tokensD to UP2", async () => {
        let abi = tokenD.interface.encodeFunctionData("mint", [
          universalProfile2.address,
          TOKEN_ID4,
          false,
          "0x11",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenD.address,
          0,
          abi,
        ]);
        await keyManager2.connect(owner2).execute(abiExecutor);
      });

      it("Check if keys are registred after sending tokensD in UP2", async () => {
        let gettedResult = await universalProfile2.connect(owner2).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000002"
        );

        
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult1] = await universalProfile2.connect(owner2).getData([item2_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult1)).toEqual(tokenD.address);

        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);

        let gettedResult2 = await universalProfile2.connect(owner2).getData([tokenDMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x" + "0000000000000001" + INTERFACE_ID);
      });

      it("Should Transfer tokenD from UP2 to UP1: clear tokenD from UP2 and register it in UP1", async () => {
        let abi = tokenD.interface.encodeFunctionData("transfer", [
          universalProfile2.address,
          universalProfile1.address,
          TOKEN_ID4,
          false,
          "0x11",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenD.address,
          0,
          abi,
        ]);
        await keyManager2.connect(owner2).execute(abiExecutor);
      });

      it("Should remove tokenD keys after sending tokensD from UP2 to UP1", async () => {
        let gettedResult = await universalProfile2.connect(owner2).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );

        
        const item2_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001";
        let [gettedResult1] = await universalProfile2.connect(owner2).getData([item2_Array_Key]);
        expect(gettedResult1).toEqual("0x");

        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);

        let gettedResult2 = await universalProfile2.connect(owner2).getData([tokenDMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x");
      });

      it("Should regsiter tokenD keys after sending tokensD from UP2 to UP1", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult1] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult1)).toEqual(tokenD.address);

        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);

        let gettedResult2 = await universalProfile1.connect(owner).getData([tokenDMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });
    });

    describe("Implementing URD that reverts", () => {
      beforeAll(async () => {
        let abiSetData = universalProfile2.interface.encodeFunctionData("setData", [
          [UNIVERSALRECEIVER_KEY],
          [URDrevert.address],
        ]);
        await keyManager2.connect(owner2).execute(abiSetData, { from: owner2.address });
      });

      it("Should revert when sending tokens to UP2 (Transfer Function that have the hook after deducting amount)", async () => {
        let abi = tokenD.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          TOKEN_ID4,
          false,
          "0x11",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          tokenD.address,
          0,
          abi,
        ]);
        await expect(keyManager1.execute(abiExecutor)).toBeRevertedWith("This Contract reverts");
      });

      it("Should check that token didn't get send", async () => {
        let gettedResult = await universalProfile1.connect(owner).getData([LSP5_ARRAY_HASH]);
        //
        expect(gettedResult[0]).toEqual(
          "0x" + "0000000000000000000000000000000000000000000000000000000000000001"
        );

        
        const item1_Array_Key =
          "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000";
        let [gettedResult1] = await universalProfile1.connect(owner).getData([item1_Array_Key]);
        expect(await ethers.utils.getAddress(gettedResult1)).toEqual(tokenD.address);

        const tokenDMapAsset = LSP5_ASSET_MAP_HASH + tokenD.address.substr(2);

        let gettedResult2 = await universalProfile1.connect(owner).getData([tokenDMapAsset]);
        
        expect(gettedResult2[0]).toEqual("0x" + "0000000000000000" + INTERFACE_ID);
      });
    });
  });
});
