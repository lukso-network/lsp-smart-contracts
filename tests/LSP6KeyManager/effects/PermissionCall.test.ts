import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
} from "../../../constants";

// helpers
import { NotAuthorisedError } from "../../utils/helpers";

export const shouldBehaveLikePermissionCall = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let abiCoder = ethers.utils.defaultAbiCoder;

  let addressCanMakeCall: SignerWithAddress,
    addressCannotMakeCall: SignerWithAddress;
  let targetContract: TargetContract;

  beforeEach(async () => {
    context = await buildContext();

    addressCanMakeCall = context.accounts[1];
    addressCannotMakeCall = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanMakeCall.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCannotMakeCall.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when caller has ALL PERMISSIONS", () => {
    it("should pass and change state at the target contract", async () => {
      let argument = "new name";

      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [argument]
      );

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager.connect(context.owner).execute(payload);

      const result = await targetContract.callStatic.getName();
      expect(result).toEqual(argument);
    });
  });

  describe("when caller has permission CALL", () => {
    it("should pass and change state at the target contract", async () => {
      let argument = "another name";

      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [argument]
      );

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager.connect(addressCanMakeCall).execute(payload);

      const result = await targetContract.callStatic.getName();
      expect(result).toEqual(argument);
    });
  });

  describe("when caller does not have permission CALL", () => {
    it("should revert", async () => {
      let argument = "another name";

      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [argument]
      );

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
      );

      try {
        await context.keyManager
          .connect(addressCannotMakeCall)
          .execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(addressCannotMakeCall.address, "CALL")
        );
      }
    });
  });

  describe("when calling a function that returns some value", () => {
    it("should return the value to the Key Manager <- UP <- targetContract.getName()", async () => {
      let expectedName = await targetContract.callStatic.getName();

      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getName");

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      let result = await context.keyManager
        .connect(context.owner)
        .callStatic.execute(executePayload);

      let [decodedResult] = abiCoder.decode(["string"], result);
      expect(decodedResult).toEqual(expectedName);
    });

    it("Should return the value to the Key Manager <- UP <- targetContract.getNumber()", async () => {
      let expectedNumber = await targetContract.callStatic.getNumber();

      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getNumber");

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      let result = await context.keyManager
        .connect(context.owner)
        .callStatic.execute(executePayload);

      let [decodedResult] = abiCoder.decode(["uint256"], result);
      expect(decodedResult).toEqual(expectedNumber);
    });
  });

  describe("when calling a function that reverts", () => {
    it("should revert", async () => {
      let targetContractPayload =
        targetContract.interface.encodeFunctionData("revertCall");

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      await expect(context.keyManager.execute(payload)).toBeRevertedWith(
        "TargetContract:revertCall: this function has reverted!"
      );
    });
  });
};
