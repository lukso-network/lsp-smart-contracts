import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  UniversalProfileBis,
  UniversalProfileBis__factory,
  LSP6KeyManager,
  LSP6KeyManager__factory,
  LSP7Tester__factory,
  UniversalReceiverDelegateUP,
  UniversalReceiverDelegateUP__factory,
} from "../../types";

import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
  INTERFACE_IDS,
} from "../../constants";

import {
  LSP5_ARRAY_KEY,
  LSP10_ARRAY_KEY,
  ARRAY_LENGTH,
  INDEX,
  TOKEN_ID,
  getMapAndArrayKeyValues,
} from "../utils/helpers";

import { getLSP5MapAndArrayKeysValue } from "../utils/fixtures";

describe("Gas cost getData MODIFIED WITH URD", () => {
  let accounts: SignerWithAddress[];
  let owner1, owner2, owner3;

  let keyManager1: LSP6KeyManager,
    keyManager2: LSP6KeyManager,
    keyManager3: LSP6KeyManager;

  let universalReceiverDelegate: UniversalReceiverDelegateUP;

  let universalProfile1: UniversalProfileBis,
    universalProfile2: UniversalProfileBis,
    universalProfile3: UniversalProfileBis;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner1 = accounts[0];
    owner2 = accounts[1];
    owner3 = accounts[2];

    universalProfile1 = await new UniversalProfileBis__factory(owner1).deploy(
      owner1.address
    );
    universalProfile2 = await new UniversalProfileBis__factory(owner2).deploy(
      owner2.address
    );
    universalProfile3 = await new UniversalProfileBis__factory(owner3).deploy(
      owner3.address
    );
    keyManager1 = await new LSP6KeyManager__factory(owner1).deploy(
      universalProfile1.address
    );
    keyManager2 = await new LSP6KeyManager__factory(owner2).deploy(
      universalProfile2.address
    );
    keyManager3 = await new LSP6KeyManager__factory(owner3).deploy(
      universalProfile3.address
    );
    universalReceiverDelegate = await new UniversalReceiverDelegateUP__factory(
      owner1
    ).deploy();

    console.log("universalReceiverDelegate: ", universalReceiverDelegate);

    // Setting Permissions for UP1
    await universalProfile1.connect(owner1)["setData(bytes32[],bytes[])"](
      [
        // owner1 permissions
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner1.address.substring(2),
        // set the URD key
        ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"],
        // set URD permissions
        // ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        //   universalReceiverDelegate.address.substring(2),
      ],
      [
        ALL_PERMISSIONS_SET,
        universalReceiverDelegate.address,
        // ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ]
    );

    // switch account management to keyManager1
    await universalProfile1
      .connect(owner1)
      .transferOwnership(keyManager1.address);

    // Setting Permissions for UP2
    await universalProfile2.connect(owner2)["setData(bytes32[],bytes[])"](
      [
        // owner2 permission
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner2.address.substring(2),
        // set the URD Key
        ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"],
        // set URD permissions
        // ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        //   universalReceiverDelegate.address.substring(2),
      ],
      [
        ALL_PERMISSIONS_SET,
        universalReceiverDelegate.address,
        // ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ]
    );

    // switch account management to keyManager2
    await universalProfile2
      .connect(owner2)
      .transferOwnership(keyManager2.address);

    // Setting Permissions for UP3
    await universalProfile3.connect(owner3)["setData(bytes32[],bytes[])"](
      [
        // owner2 permission
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner3.address.substring(2),
        // set the URD Key
        ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"],
        // set URD permissions
        // ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        //   universalReceiverDelegate.address.substring(2),
      ],
      [
        ALL_PERMISSIONS_SET,
        universalReceiverDelegate.address,
        // ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ]
    );

    // switch account management to keyManager3
    await universalProfile3
      .connect(owner3)
      .transferOwnership(keyManager3.address);

    // fund each UP with ether
    await owner1.sendTransaction({
      to: universalProfile1.address,
      value: ethers.utils.parseEther("10"),
    });

    await owner2.sendTransaction({
      to: universalProfile2.address,
      value: ethers.utils.parseEther("10"),
    });
    await owner3.sendTransaction({
      to: universalProfile3.address,
      value: ethers.utils.parseEther("10"),
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
    });

    describe("background check", () => {
      it("owner of the UniversalReceiverDelegate should be the zero-address", async () => {
        let owner = await universalReceiverDelegate.owner();
        expect(owner).toEqual(ethers.constants.AddressZero);
      });

      it("should not be able to interact with the UniversalReceiverDelegate", async () => {
        await expect(
          universalReceiverDelegate["setData(bytes32,bytes)"](
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeef"
          )
        ).toBeRevertedWith("Ownable: caller is not the owner");
      });

      it("should have registered the URD address on the UP", async () => {
        const result = await universalProfile1["getData(bytes32)"](
          ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"]
        );
        console.log("result URD in key-value store: ", result);
      });
    });

    describe("First Transfer (Initiaiting the storage)", () => {
      it("Should mint 10 tokenA to UP1 : 288,533", async () => {
        let abi = LSP7tokenA.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenA.address, 0, abi]
        );

        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("1st transfer - mint: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer 5 tokenA from UP1 to UP2 (UP2 didn't have any token yet) : 320,251 gas", async () => {
        let abi = LSP7tokenA.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "5",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenA.address, 0, abi]
        );
        const tx = await keyManager1.connect(owner1).execute(abiExecutor);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("1st transfer - scenario 1: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);

        // let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        // const arrayResult = await universalProfile2["getData(bytes32)"](
        //   arrayKey
        // );
        // expect(arrayResult).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );
      });

      it("Should transfer 1 tokenA from UP1 to UP2 (UP1 and UP2 both have tokenA already) : 173,404", async () => {
        let abi = LSP7tokenA.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "1",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenA.address, 0, abi]
        );
        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("1st transfer - scenario 2: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer remaning tokenA from UP1 to UP2 (UP1 sending all the balance and UP2 has already from the token being sent) : 231,114 gas", async () => {
        let abi = LSP7tokenA.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "4",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenA.address, 0, abi]
        );
        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("1st transfer - scenario 3: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer all tokenA from UP2 to UP3 (Removing all tokens from UP2 and initiaiting the storage of UP3) : 379,961 gas", async () => {
        let abi = LSP7tokenA.interface.encodeFunctionData("transfer", [
          universalProfile2.address,
          universalProfile3.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenA.address, 0, abi]
        );
        const tx = await keyManager2.execute(abiExecutor, {
          from: owner2.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("1st transfer - scenario 4: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });
    });

    describe("Second Transfer ", () => {
      it("Should mint 10 tokenB to UP1 : 269,185", async () => {
        let abi = LSP7tokenB.interface.encodeFunctionData("mint", [
          universalProfile1.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenB.address, 0, abi]
        );
        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("2nd transfer - mint: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer 5 tokenB from UP1 to UP2 (UP2 didn't have any tokenB yet) : 300,903 gas", async () => {
        let abi = LSP7tokenB.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "5",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenB.address, 0, abi]
        );
        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("2nd transfer - scenario 1: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer 1 tokenB from UP1 to UP2 (UP1 and UP2 both have tokenB already) : 173,392", async () => {
        let abi = LSP7tokenB.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "1",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenB.address, 0, abi]
        );
        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("2nd transfer - scenario 2: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer remaning tokenB from UP1 to UP2 (UP1 sending all the balance and UP2 has already from the token being sent) : 231,102 gas", async () => {
        let abi = LSP7tokenB.interface.encodeFunctionData("transfer", [
          universalProfile1.address,
          universalProfile2.address,
          "4",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile1.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenB.address, 0, abi]
        );
        const tx = await keyManager1.execute(abiExecutor, {
          from: owner1.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("2nd transfer - scenario 3: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });

      it("Should transfer all tokenB from UP2 to UP3 (Removing all tokens from UP2 and initiaiting the storage of UP3) : 343,513 gas", async () => {
        let abi = LSP7tokenB.interface.encodeFunctionData("transfer", [
          universalProfile2.address,
          universalProfile3.address,
          "10",
          false,
          "0x",
        ]);
        let abiExecutor = universalProfile2.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, LSP7tokenB.address, 0, abi]
        );
        const tx = await keyManager2.execute(abiExecutor, {
          from: owner2.address,
        });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        console.log("2nd transfer - scenario 4: ", gasUsed);

        let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
        let result = await universalProfile1["getData(bytes32)"](arrayKey);

        console.log("array key result: ", result);
        // expect(result).toEqual(
        //   "0x0000000000000000000000000000000000000000000000000000000000000001"
        // );

        let arrayKeyIndex =
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substring(0, 34) +
          "00000000000000000000000000000000";
        let arrayIndexResult = await universalProfile1["getData(bytes32)"](
          arrayKeyIndex
        );
        console.log("arrayKeyIndex: ", arrayIndexResult);

        let mapKey =
          ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
          LSP7tokenA.address.substring(2);
        let mapValue = await universalProfile1["getData(bytes32)"](mapKey);

        console.log("map result: ", mapValue);
      });
    });
  });
});
