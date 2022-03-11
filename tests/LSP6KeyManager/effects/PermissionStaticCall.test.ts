import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// constants
// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
} from "../../../constants";

// helpers
import { NotAuthorisedError } from "../../utils/helpers";

export const shouldBehaveLikePermissionStaticCall = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let abiCoder = ethers.utils.defaultAbiCoder;

  let addressCanMakeStaticCall: SignerWithAddress,
    addressCannotMakeStaticCall: SignerWithAddress;

  let targetContract: TargetContract;

  beforeEach(async () => {
    context = await buildContext();

    addressCanMakeStaticCall = context.accounts[1];
    addressCannotMakeStaticCall = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanMakeStaticCall.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCannotMakeStaticCall.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.STATICCALL, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when caller has ALL PERMISSIONS", () => {
    it("should pass and return data", async () => {
      let expectedName = await targetContract.callStatic.getName();

      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getName");

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.STATICCALL,
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
  });

  describe("when caller has permission STATICCALL", () => {
    it("should pass and return data", async () => {
      let expectedName = await targetContract.callStatic.getName();

      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getName");

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      let result = await context.keyManager
        .connect(addressCanMakeStaticCall)
        .callStatic.execute(executePayload);

      let [decodedResult] = abiCoder.decode(["string"], result);
      expect(decodedResult).toEqual(expectedName);
    });

    it("should revert when trying to change state at the target contract", async () => {
      let initialValue = await targetContract.callStatic.getName();

      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["modified name"]
      );

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      await expect(
        context.keyManager
          .connect(addressCanMakeStaticCall)
          .execute(executePayload)
      ).toBeReverted();

      // ensure state hasn't changed.
      let newValue = await targetContract.callStatic.getName();
      expect(initialValue).toEqual(newValue);
    });

    it("should revert when caller try to make a CALL", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["modified name"]
      );

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      try {
        await context.keyManager
          .connect(addressCanMakeStaticCall)
          .execute(executePayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(addressCanMakeStaticCall.address, "CALL")
        );
      }
    });
  });

  describe("when caller does not have permission STATICCALL", () => {
    it("should revert", async () => {
      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getName");

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      try {
        const result = await context.keyManager
          .connect(addressCannotMakeStaticCall)
          .execute(executePayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(addressCannotMakeStaticCall.address, "STATICCALL")
        );
      }
    });
  });
};
