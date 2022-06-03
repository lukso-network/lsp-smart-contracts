import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  OPERATION_TYPES,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import { abiCoder, NotAuthorisedError } from "../../utils/helpers";

export const shouldBehaveLikePermissionCall = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

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
      ALL_PERMISSIONS,
      PERMISSIONS.CALL,
      PERMISSIONS.SETDATA,
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when interacting via `execute(...)`", () => {
    describe("when caller has ALL PERMISSIONS", () => {
      it("should pass and change state at the target contract", async () => {
        let argument = "new name";

        let targetPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [argument]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
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
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
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
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
        );

        await expect(
          context.keyManager.connect(addressCannotMakeCall).execute(payload)
        ).toBeRevertedWith(
          NotAuthorisedError(addressCannotMakeCall.address, "CALL")
        );
      });
    });

    describe("when calling a function that returns some value", () => {
      it("should return the value to the Key Manager <- UP <- targetContract.getName()", async () => {
        let expectedName = await targetContract.callStatic.getName();

        let targetContractPayload =
          targetContract.interface.encodeFunctionData("getName");

        let executePayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
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
            OPERATION_TYPES.CALL,
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
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        await expect(context.keyManager.execute(payload)).toBeRevertedWith(
          "TargetContract:revertCall: this function has reverted!"
        );
      });
    });
  });

  describe("when interacting via `executeRelayCall(...)`", () => {
    // Use channelId = 0 for sequential nonce
    const channelId = 0;

    describe("when signer has ALL PERMISSIONS", () => {
      it("should execute successfully", async () => {
        let newName = "New Name";

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let nonce = await context.keyManager.callStatic.getNonce(
          context.owner.address,
          channelId
        );

        let executeRelayCallPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        const HARDHAT_CHAINID = 31337;

        let hash = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256", "bytes"],
          [
            HARDHAT_CHAINID,
            context.keyManager.address,
            nonce,
            executeRelayCallPayload,
          ]
        );

        let signature = await context.owner.signMessage(
          ethers.utils.arrayify(hash)
        );

        await context.keyManager.executeRelayCall(
          signature,
          nonce,
          executeRelayCallPayload
        );

        const result = await targetContract.callStatic.getName();
        expect(result).toEqual(newName);
      });
    });

    describe("when signer has permission CALL", () => {
      it("should execute successfully", async () => {
        let newName = "Another name";

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let nonce = await context.keyManager.callStatic.getNonce(
          addressCanMakeCall.address,
          channelId
        );

        let executeRelayCallPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        const HARDHAT_CHAINID = 31337;

        let hash = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256", "bytes"],
          [
            HARDHAT_CHAINID,
            context.keyManager.address,
            nonce,
            executeRelayCallPayload,
          ]
        );

        let signature = await addressCanMakeCall.signMessage(
          ethers.utils.arrayify(hash)
        );

        await context.keyManager.executeRelayCall(
          signature,
          nonce,
          executeRelayCallPayload
        );

        const result = await targetContract.callStatic.getName();
        expect(result).toEqual(newName);
      });
    });

    describe("when signer does not have permission CALL", () => {
      it("should fail", async () => {
        const initialName = await targetContract.callStatic.getName();

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          ["Random name"]
        );
        let nonce = await context.keyManager.callStatic.getNonce(
          addressCannotMakeCall.address,
          channelId
        );

        let executeRelayCallPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        const HARDHAT_CHAINID = 31337;

        let hash = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256", "bytes"],
          [
            HARDHAT_CHAINID,
            context.keyManager.address,
            nonce,
            executeRelayCallPayload,
          ]
        );

        let signature = await addressCannotMakeCall.signMessage(
          ethers.utils.arrayify(hash)
        );

        await expect(
          context.keyManager.executeRelayCall(
            signature,
            nonce,
            executeRelayCallPayload
          )
        ).toBeRevertedWith(
          NotAuthorisedError(addressCannotMakeCall.address, "CALL")
        );

        // ensure no state change at the target contract
        const result = await targetContract.callStatic.getName();
        expect(result).toEqual(initialName);
      });
    });
  });
};
