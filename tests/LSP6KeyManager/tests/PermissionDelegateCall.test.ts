import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  ERC725YDelegateCall,
  ERC725YDelegateCall__factory,
} from "../../../types";

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

  let erc725YDelegateCallContract: ERC725YDelegateCall;

  beforeEach(async () => {
    context = await buildContext();

    addressCanDelegateCall = context.accounts[1];

    erc725YDelegateCallContract = await new ERC725YDelegateCall__factory(
      context.owner
    ).deploy(context.universalProfile.address);

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
    it("should pass when the caller has ALL PERMISSIONS", async () => {
      const key =
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const value = "0xbbbbbbbbbbbbbbbb";

      // first check that nothing is set under this key
      // inside the storage of the calling UP
      const [currentStorage] = await context.universalProfile.getData([key]);
      expect(currentStorage).toEqual("0x");

      // Doing a delegatecall to the setData function of another UP
      // should update the ERC725Y storage of the UP making the delegatecall
      let delegateCallPayload =
        erc725YDelegateCallContract.interface.encodeFunctionData("setData", [
          [key],
          [value],
        ]);

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.DELEGATECALL,
          erc725YDelegateCallContract.address,
          0,
          delegateCallPayload,
        ]);

      await context.keyManager.connect(context.owner).execute(executePayload);

      // verify that the setData ran in the context of the calling UP
      // and that it updated its ERC725Y storage
      const [newStorage] = await context.universalProfile.getData([key]);
      expect(newStorage).toEqual(value);
    });

    it("should revert, if caller has permission DELEGATECALL, but not ALL PERMISSIONS", async () => {
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
