import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  LSP6KeyManager,
  TargetContract__factory,
  TargetContract,
} from "../../types";

// setup
import { LSP6TestContext } from "../utils/context";
import { setupKeyManager } from "../utils/fixtures";

// effects
import {
  shouldBehaveLikePermissionChangeOwner,
  shouldBehaveLikePermissionChangeOrAddPermissions,
  shouldBehaveLikePermissionCall,
  shouldBehaveLikePermissionStaticCall,
  shouldBehaveLikePermissionDelegateCall,
  shouldBehaveLikePermissionDeploy,
  shouldBehaveLikePermissionTransferValue,
  shouldBehaveLikePermissionSign,
  shouldBehaveLikeAllowedAddresses,
  shouldBehaveLikeAllowedFunctions,
} from "./effects";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  INTERFACE_IDS,
} from "../../constants";

export const shouldBehaveLikeLSP6 = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("CHANGEOWNER", () => {
    shouldBehaveLikePermissionChangeOwner(buildContext);
  });

  describe("CHANGE / ADD permissions", () => {
    shouldBehaveLikePermissionChangeOrAddPermissions(buildContext);
  });

  describe("CALL", () => {
    shouldBehaveLikePermissionCall(buildContext);
  });

  describe("STATICCALL", () => {
    shouldBehaveLikePermissionStaticCall(buildContext);
  });

  describe("DELEGATECALL", () => {
    shouldBehaveLikePermissionDelegateCall(buildContext);
  });

  describe("DEPLOY", () => {
    shouldBehaveLikePermissionDeploy(buildContext);
  });

  describe("TRANSFERVALUE", () => {
    shouldBehaveLikePermissionTransferValue(buildContext);
  });

  describe("SIGN (ERC1271)", () => {
    shouldBehaveLikePermissionSign(buildContext);
  });

  describe("ALLOWEDADDRESSES", () => {
    shouldBehaveLikeAllowedAddresses(buildContext);
  });

  describe("ALLOWEDFUNCTIONS", () => {
    shouldBehaveLikeAllowedFunctions(buildContext);
  });

  describe("miscellaneous", () => {
    let targetContract: TargetContract;

    beforeEach(async () => {
      context = await buildContext();

      targetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
      ];

      const permissionsValues = [ALL_PERMISSIONS_SET];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    it("Should revert because of wrong operation type", async () => {
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["new name"]
      );

      const INVALID_OPERATION_TYPE = 8;

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [INVALID_OPERATION_TYPE, targetContract.address, 0, targetPayload]
      );

      await expect(context.keyManager.execute(payload)).toBeRevertedWith(
        "_extractPermissionFromOperation: invalid operation type"
      );
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      const INVALID_PAYLOAD = "0xbad000000000000000000000000bad";
      await expect(
        context.keyManager.execute(INVALID_PAYLOAD)
      ).toBeRevertedWith("_verifyPermissions: unknown ERC725 selector");
    });
  });
};

export type LSP6InitializeTestContext = {
  keyManager: LSP6KeyManager;
};

export const shouldInitializeLikeLSP6 = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should support ERC165 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP6 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.LSP6
      );
      expect(result).toBeTruthy();
    });

    /// @todo it should have set the account it is linked to
  });
};
