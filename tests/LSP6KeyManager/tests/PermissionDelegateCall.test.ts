import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import { DUMMY_PAYLOAD } from "../../utils/helpers";

export const shouldBehaveLikePermissionDelegateCall = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanDelegateCall: SignerWithAddress;

  beforeEach(async () => {
    context = await buildContext();

    addressCanDelegateCall = context.accounts[1];

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanDelegateCall.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.DELEGATECALL, 32),
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when trying to make a DELEGATECALL via UP", () => {
    it("should revert, even if caller has ALL PERMISSIONS", async () => {
      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.DELEGATECALL,
          "0xcafecafecafecafecafecafecafecafecafecafe",
          0,
          DUMMY_PAYLOAD,
        ]);

      await expect(
        context.keyManager.connect(context.owner).execute(executePayload)
      ).toBeRevertedWith(
        "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
      );
    });

    it("should revert, even if caller is has permission DELEGATECALL", async () => {
      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.DELEGATECALL,
          "0xcafecafecafecafecafecafecafecafecafecafe",
          0,
          DUMMY_PAYLOAD,
        ]);

      await expect(
        context.keyManager
          .connect(addressCanDelegateCall)
          .execute(executePayload)
      ).toBeRevertedWith(
        "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
      );
    });
  });
};
