import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EIP191Signer } from "@lukso/eip191-signer.js";

import { TargetContract, TargetContract__factory } from "../../../types";

// constants
import {
  ERC725YKeys,
  OPERATION_TYPES,
  LSP6_VERSION,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import { abiCoder, LOCAL_PRIVATE_KEYS } from "../../utils/helpers";

export const shouldBehaveLikeAllowedFunctions = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanCallAnyFunctions: SignerWithAddress,
    addressCanCallOnlyOneFunction: SignerWithAddress;

  let targetContract: TargetContract;

  beforeEach(async () => {
    context = await buildContext();

    addressCanCallAnyFunctions = context.accounts[1];
    addressCanCallOnlyOneFunction = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    let permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanCallAnyFunctions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanCallOnlyOneFunction.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
        addressCanCallOnlyOneFunction.address.substring(2),
    ];

    let permissionsValues = [
      PERMISSIONS.CALL,
      PERMISSIONS.CALL,
      abiCoder.encode(
        ["bytes4[]"],
        [[targetContract.interface.getSighash("setName")]]
      ),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("when interacting via `execute(...)`", () => {
    describe("when caller has nothing listed under AllowedFunctions", () => {
      describe("when calling a contract", () => {
        it("should pass when calling any function (eg: `setName(...)`)", async () => {
          let initialName = await targetContract.callStatic.getName();
          let newName = "Updated Name";

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setName", [newName]);
          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await context.keyManager
            .connect(addressCanCallAnyFunctions)
            .execute(executePayload);

          let result = await targetContract.callStatic.getName();
          expect(result).to.not.equal(initialName);
          expect(result).to.equal(newName);
        });

        it("should pass when calling any function (eg: `setNumber(...)`)", async () => {
          let initialNumber = await targetContract.callStatic.getNumber();
          let newNumber = 18;

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setNumber", [
              newNumber,
            ]);
          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await context.keyManager
            .connect(addressCanCallAnyFunctions)
            .execute(executePayload);

          let result = await targetContract.callStatic.getNumber();
          expect(result).to.not.equal(initialNumber);
          expect(result).to.equal(newNumber);
        });
      });
    });

    describe("when caller has 1 x bytes4 function selector listed under AllowedFunctions", () => {
      describe("when calling a contract", () => {
        it("should pass when the bytes4 selector of the function called is listed in its AllowedFunctions", async () => {
          let initialName = await targetContract.callStatic.getName();
          let newName = "Updated Name";

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setName", [newName]);

          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await context.keyManager
            .connect(addressCanCallOnlyOneFunction)
            .execute(executePayload);

          let result = await targetContract.callStatic.getName();
          expect(result).to.not.equal(initialName);
          expect(result).to.equal(newName);
        });

        it("should revert when the bytes4 selector of the function called is NOT listed in its AllowedFunctions", async () => {
          let initialNumber = await targetContract.callStatic.getNumber();
          let newNumber = 18;

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setNumber", [
              newNumber,
            ]);
          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await expect(
            context.keyManager
              .connect(addressCanCallOnlyOneFunction)
              .execute(executePayload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "NotAllowedFunction"
            )
            .withArgs(
              addressCanCallOnlyOneFunction.address,
              targetContract.interface.getSighash("setNumber")
            );

          let result = await targetContract.callStatic.getNumber();
          expect(result).to.not.equal(newNumber);
          expect(result).to.equal(initialNumber);
        });
      });

      it("should revert when passing a random bytes payload with a random function selector", async () => {
        const randomPayload =
          "0xbaadca110000000000000000000000000000000000000000000000000000000123456789";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATION_TYPES.CALL, targetContract.address, 0, randomPayload]
        );

        await expect(
          context.keyManager
            .connect(addressCanCallOnlyOneFunction)
            .execute(payload)
        )
          .to.be.revertedWithCustomError(
            context.keyManager,
            "NotAllowedFunction"
          )
          .withArgs(addressCanCallOnlyOneFunction.address, "0xbaadca11");
      });
    });
  });

  describe("when interacting via `executeRelayCall(...)`", () => {
    const channelId = 0;

    describe("when signer has 1 x bytes4 function selector listed under AllowedFunctions", () => {
      describe("when calling a contract", () => {
        it("`setName(...)` - should pass when the bytes4 selector of the function called is listed in its AllowedFunctions", async () => {
          let newName = "Dagobah";

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setName", [newName]);
          let nonce = await context.keyManager.callStatic.getNonce(
            addressCanCallOnlyOneFunction.address,
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
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              nonce,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          let eip191Signer = new EIP191Signer();

          let signature = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT2
          );

          await context.keyManager.executeRelayCall(
            signature.signature,
            nonce,
            executeRelayCallPayload,
            { value: valueToSend }
          );
          let endResult = await targetContract.callStatic.getName();
          expect(endResult).to.equal(newName);
        });

        it("`setNumber(...)` - should revert when the bytes4 selector of the function called is NOT listed in its AllowedFunctions", async () => {
          let currentNumber = await targetContract.callStatic.getNumber();

          let nonce = await context.keyManager.callStatic.getNonce(
            addressCanCallOnlyOneFunction.address,
            channelId
          );
          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setNumber", [2354]);

          let executeRelayCallPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          const HARDHAT_CHAINID = 31337;
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              nonce,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          let eip191Signer = new EIP191Signer();

          let signature = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT2
          );

          await expect(
            context.keyManager.executeRelayCall(
              signature.signature,
              nonce,
              executeRelayCallPayload,
              { value: valueToSend }
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "NotAllowedFunction"
            )
            .withArgs(
              addressCanCallOnlyOneFunction.address,
              targetContract.interface.getSighash("setNumber")
            );

          let endResult = await targetContract.callStatic.getNumber();
          expect(endResult.toString()).to.equal(currentNumber.toString());
        });
      });
    });
  });
};
