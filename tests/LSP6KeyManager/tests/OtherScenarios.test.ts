import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract__factory, TargetContract } from "../../../types";

import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  OPERATIONS,
  PERMISSIONS,
} from "../../../constants";

export const otherTestScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let superAdmin: SignerWithAddress,
    superAdminNoSign: SignerWithAddress,
    superAdminCustomPermissions: SignerWithAddress;

  let addressCanMakeCall: SignerWithAddress;
  let targetContract: TargetContract;

  beforeEach(async () => {
    context = await buildContext();

    superAdmin = context.accounts[1];
    superAdminNoSign = context.accounts[2];
    superAdminCustomPermissions = context.accounts[3];

    addressCanMakeCall = context.accounts[4];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    const permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        superAdmin.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        superAdminNoSign.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        superAdminCustomPermissions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanMakeCall.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS_SET,
      ALL_PERMISSIONS_SET,
      "0x00000000000000000000000000000000000000000000000000000000000001ff",
      "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
      ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("admin permissions", () => {
    it("should bypass permissions check when caller has ALL PERMISSIONS", async () => {
      const newName = "Updated name";

      const targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );

      const payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager.connect(superAdmin).execute(payload);

      const result = await targetContract.getName();
      expect(result).toEqual(newName);
    });

    it("should bypass permissions check when caller has ALL PERMISSIONS except SIGN", async () => {
      const newName = "Updated name";

      const targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );

      const payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager.connect(superAdminNoSign).execute(payload);

      const result = await targetContract.getName();
      expect(result).toEqual(newName);
    });

    it("should bypass permissions check when caller has ALL PERMISSIONS + some additional custom permissions", async () => {
      const newName = "Updated name";

      const targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );

      const payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager
        .connect(superAdminCustomPermissions)
        .execute(payload);

      const result = await targetContract.getName();
      expect(result).toEqual(newName);
    });
  });

  describe("payload", () => {
    it.skip("should fail when sending an empty payload to `keyManager.execute('0x')`", async () => {
      await context.keyManager.connect(context.owner).execute("0x");
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      const INVALID_PAYLOAD = "0xbad000000000000000000000000bad";
      await expect(
        context.keyManager.execute(INVALID_PAYLOAD)
      ).toBeRevertedWith("unknown ERC725 selector");
    });
  });

  describe("wrong operation type", () => {
    it("Should revert because of wrong operation type when caller has ALL PERMISSIONS", async () => {
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["new name"]
      );

      const INVALID_OPERATION_TYPE = 8;

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [INVALID_OPERATION_TYPE, targetContract.address, 0, targetPayload]
      );

      await expect(context.keyManager.execute(payload)).toBeRevertedWith(
        "Wrong operation type"
      );
    });

    it("Should revert because of wrong operation type when caller has not ALL PERMISSIONS", async () => {
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["new name"]
      );

      const INVALID_OPERATION_TYPE = 8;

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [INVALID_OPERATION_TYPE, targetContract.address, 0, targetPayload]
      );

      await expect(
        context.keyManager.connect(addressCanMakeCall).execute(payload)
      ).toBeRevertedWith("LSP6KeyManager: invalid operation type");
    });
  });
};
