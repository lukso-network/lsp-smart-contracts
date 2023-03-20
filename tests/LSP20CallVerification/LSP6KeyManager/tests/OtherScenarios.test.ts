import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract__factory, TargetContract } from "../../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  PERMISSIONS,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { setupKeyManager } from "../../../utils/fixtures";

export const otherTestScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let superAdmin: SignerWithAddress,
    superAdminNoSign: SignerWithAddress,
    superAdminCustomPermissions: SignerWithAddress;

  let addressCanMakeCall: SignerWithAddress;
  let targetContract: TargetContract;

  before(async () => {
    context = await buildContext();

    superAdmin = context.accounts[1];
    superAdminNoSign = context.accounts[2];
    superAdminCustomPermissions = context.accounts[3];

    addressCanMakeCall = context.accounts[4];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    const permissionsKeys = [
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanMakeCall.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS, PERMISSIONS.CALL];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("payload", () => {
    describe("when the payload is smaller than 4 bytes", () => {
      it("should revert when using `execute(..)` with a payload smaller than 4 bytes", async () => {
        await expect(context.keyManager["execute(bytes)"]("0xaabbcc"))
          .to.be.revertedWithCustomError(context.keyManager, "InvalidPayload")
          .withArgs("0xaabbcc");
      });

      it("should revert when using `executeRelayCall(..)` with a payload smaller than 4 bytes", async () => {
        await expect(
          context.keyManager["executeRelayCall(bytes,uint256,bytes)"](
            "0x",
            0,
            "0xaabbcc"
          )
        )
          .to.be.revertedWithCustomError(context.keyManager, "InvalidPayload")
          .withArgs("0xaabbcc");
      });
    });

    it("should fail when sending an empty payload to `keyManager.execute('0x')`", async () => {
      await expect(context.keyManager["execute(bytes)"]("0x"))
        .to.be.revertedWithCustomError(context.keyManager, "InvalidPayload")
        .withArgs("0x");
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      const INVALID_PAYLOAD = "0xbad000000000000000000000000bad";
      await expect(
        context.keyManager
          .connect(addressCanMakeCall)
          ["execute(bytes)"](INVALID_PAYLOAD)
      )
        .to.be.revertedWithCustomError(
          context.keyManager,
          "InvalidERC725Function"
        )
        .withArgs(INVALID_PAYLOAD.slice(0, 10));
    });
  });

  describe("wrong operation type", () => {
    it("Should revert because of wrong operation type when caller has ALL PERMISSIONS", async () => {
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["new name"]
      );

      const INVALID_OPERATION_TYPE = 8;

      await expect(
        context.universalProfile
          .connect(context.owner)
          ["execute(uint256,address,uint256,bytes)"](
            INVALID_OPERATION_TYPE,
            targetContract.address,
            0,
            targetPayload
          )
      ).to.be.revertedWithCustomError(
        context.universalProfile,
        "ERC725X_UnknownOperationType"
      );
    });

    it("Should revert because of wrong operation type when caller has not ALL PERMISSIONS", async () => {
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["new name"]
      );

      const INVALID_OPERATION_TYPE = 8;

      await expect(
        context.universalProfile
          .connect(addressCanMakeCall)
          ["execute(uint256,address,uint256,bytes)"](
            INVALID_OPERATION_TYPE,
            targetContract.address,
            0,
            targetPayload
          )
      ).to.be.revertedWithCustomError(
        context.universalProfile,
        "ERC725X_UnknownOperationType"
      );
    });
  });
};
