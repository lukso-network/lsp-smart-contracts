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
    /**
     * @todo these tests are temporary, as DELEGATECALL via the KeyManager will be allowed in the future
     */
    it("should revert even if when the caller has ALL PERMISSIONS", async () => {
      const key =
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const value = "0xbbbbbbbbbbbbbbbb";

      // first check that nothing is set under this key
      // inside the storage of the calling UP
      const currentStorage = await context.universalProfile["getData(bytes32)"](
        key
      );
      expect(currentStorage).toEqual("0x");

      // Doing a delegatecall to the setData function of another UP
      // should update the ERC725Y storage of the UP making the delegatecall
      let delegateCallPayload =
        erc725YDelegateCallContract.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [[key], [value]]
        );

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.DELEGATECALL,
          erc725YDelegateCallContract.address,
          0,
          delegateCallPayload,
        ]);

      await expect(
        context.keyManager.connect(context.owner).execute(executePayload)
      ).toBeRevertedWith(
        "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
      );

      // verify that the setData did NOT ran in the context of the calling UP
      // and that it did NOT update its ERC725Y storage
      const newStorage = await context.universalProfile["getData(bytes32)"](
        key
      );
      expect(newStorage).toEqual("0x");
    });

    it("should revert even if caller has permission DELEGATECALL", async () => {
      const key =
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const value = "0xbbbbbbbbbbbbbbbb";

      // first check that nothing is set under this key
      // inside the storage of the calling UP
      const currentStorage = await context.universalProfile["getData(bytes32)"](
        key
      );
      expect(currentStorage).toEqual("0x");

      // Doing a delegatecall to the setData function of another UP
      // should update the ERC725Y storage of the UP making the delegatecall
      let delegateCallPayload =
        erc725YDelegateCallContract.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [[key], [value]]
        );

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.DELEGATECALL,
          erc725YDelegateCallContract.address,
          0,
          delegateCallPayload,
        ]);

      await expect(
        context.keyManager
          .connect(addressCanDelegateCall)
          .execute(executePayload)
      ).toBeRevertedWith(
        "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
      );

      // verify that the setData did NOT ran in the context of the calling UP
      // and that it did NOT update its ERC725Y storage
      const newStorage = await context.universalProfile["getData(bytes32)"](
        key
      );
      expect(newStorage).toEqual("0x");
    });
  });
};
