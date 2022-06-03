import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

// constants
import { ERC725YKeys, OPERATION_TYPES, PERMISSIONS } from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import { abiCoder, NotAllowedFunctionError } from "../../utils/helpers";

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
          expect(result !== initialName);
          expect(result).toEqual(newName);
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
          expect(
            parseInt(ethers.BigNumber.from(result).toNumber(), 10) !==
              ethers.BigNumber.from(initialNumber).toNumber()
          );
          expect(
            parseInt(ethers.BigNumber.from(result).toNumber(), 10)
          ).toEqual(newNumber);
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

          let callResult = await context.keyManager
            .connect(addressCanCallOnlyOneFunction)
            .callStatic.execute(executePayload);
          expect(callResult).toBeTruthy();

          await context.keyManager
            .connect(addressCanCallOnlyOneFunction)
            .execute(executePayload);

          let result = await targetContract.callStatic.getName();
          expect(result !== initialName);
          expect(result).toEqual(newName);
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
          ).toBeRevertedWith(
            NotAllowedFunctionError(
              addressCanCallOnlyOneFunction.address,
              targetContract.interface.getSighash("setNumber")
            )
          );

          let result = await targetContract.callStatic.getNumber();
          expect(
            parseInt(ethers.BigNumber.from(result).toNumber(), 10) !== newNumber
          );
          expect(
            parseInt(ethers.BigNumber.from(result).toNumber(), 10)
          ).toEqual(ethers.BigNumber.from(initialNumber).toNumber());
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
        ).toBeRevertedWith(
          NotAllowedFunctionError(
            addressCanCallOnlyOneFunction.address,
            "0xbaadca11"
          )
        );
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

          let hash = ethers.utils.solidityKeccak256(
            ["uint256", "address", "uint256", "bytes"],
            [
              HARDHAT_CHAINID,
              context.keyManager.address,
              nonce,
              executeRelayCallPayload,
            ]
          );

          let signature = await addressCanCallOnlyOneFunction.signMessage(
            ethers.utils.arrayify(hash)
          );

          await context.keyManager.executeRelayCall(
            signature,
            nonce,
            executeRelayCallPayload
          );
          let endResult = await targetContract.callStatic.getName();
          expect(endResult).toEqual(newName);
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

          let hash = ethers.utils.solidityKeccak256(
            ["uint256", "address", "uint256", "bytes"],
            [
              HARDHAT_CHAINID,
              context.keyManager.address,
              nonce,
              executeRelayCallPayload,
            ]
          );

          let signature = await addressCanCallOnlyOneFunction.signMessage(
            ethers.utils.arrayify(hash)
          );

          await expect(
            context.keyManager.executeRelayCall(
              signature,
              nonce,
              executeRelayCallPayload
            )
          ).toBeRevertedWith(
            NotAllowedFunctionError(
              addressCanCallOnlyOneFunction.address,
              targetContract.interface.getSighash("setNumber")
            )
          );

          let endResult = await targetContract.callStatic.getNumber();
          expect(endResult.toString()).toEqual(currentNumber.toString());
        });
      });
    });
  });
};
