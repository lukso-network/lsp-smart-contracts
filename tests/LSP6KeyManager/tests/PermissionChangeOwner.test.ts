import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

export const shouldBehaveLikePermissionChangeOwner = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let canChangeOwner: SignerWithAddress,
    cannotChangeOwner: SignerWithAddress,
    newOwner: SignerWithAddress;

  let permissionsKeys: string[];
  let permissionsValues: string[];

  beforeEach(async () => {
    context = await buildContext();

    canChangeOwner = context.accounts[1];
    cannotChangeOwner = context.accounts[2];
    newOwner = context.accounts[3];

    permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        canChangeOwner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        cannotChangeOwner.address.substring(2),
    ];

    permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.CHANGEOWNER, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("when caller has ALL PERMISSIONS and `transferOwnership(...)` to EOA", () => {
    it("UP owner() should have changed", async () => {
      let payload = context.universalProfile.interface.encodeFunctionData(
        "transferOwnership",
        [newOwner.address]
      );

      await context.keyManager.connect(context.owner).execute(payload);

      const upOwner = await context.universalProfile.callStatic.owner();
      expect(upOwner).toEqual(newOwner.address);
    });

    it("new UP owner should be able to interact directly (eg: setData(...) with UP", async () => {
      let payload = context.universalProfile.interface.encodeFunctionData(
        "transferOwnership",
        [newOwner.address]
      );

      await context.keyManager.connect(context.owner).execute(payload);

      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
      let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Value"));

      await context.universalProfile
        .connect(newOwner)
        ["setData(bytes32,bytes)"](key, value);

      const result = await context.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(value);
    });
  });

  describe("when caller is an address with permission CHANGEOWNER and `transferOwnership(...)` to EOA", () => {
    it("UP owner() should have changed", async () => {
      let payload = context.universalProfile.interface.encodeFunctionData(
        "transferOwnership",
        [newOwner.address]
      );

      await context.keyManager.connect(canChangeOwner).execute(payload);

      const upOwner = await context.universalProfile.callStatic.owner();
      expect(upOwner).toEqual(newOwner.address);
    });

    it("new UP owner should be able to interact directly (eg: setData(...) with UP", async () => {
      let payload = context.universalProfile.interface.encodeFunctionData(
        "transferOwnership",
        [newOwner.address]
      );

      await context.keyManager.connect(canChangeOwner).execute(payload);

      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
      let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Value"));

      await context.universalProfile
        .connect(newOwner)
        ["setData(bytes32,bytes)"](key, value);

      const result = await context.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(value);
    });
  });
};
