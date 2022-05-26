import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract__factory, TargetContract } from "../../../types";

import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

import { ALL_PERMISSIONS, ERC725YKeys, PERMISSIONS } from "../../../constants";

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
        addressCanMakeCall.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS, PERMISSIONS.CALL];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("payload", () => {
    it.skip("should fail when sending an empty payload to `keyManager.execute('0x')`", async () => {
      await context.keyManager.connect(context.owner).execute("0x");
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      const INVALID_PAYLOAD = "0xbad000000000000000000000000bad";
      await expect(
        context.keyManager.connect(addressCanMakeCall).execute(INVALID_PAYLOAD)
      ).toBeRevertedWith("_verifyPermissions: invalid ERC725 selector");
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

      await expect(
        context.keyManager.connect(context.owner).execute(payload)
      ).toBeRevertedWith("LSP6KeyManager: invalid operation type");
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
