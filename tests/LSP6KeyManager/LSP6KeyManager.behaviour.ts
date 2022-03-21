import { TargetContract__factory, TargetContract } from "../../types";

// setup
import { LSP6TestContext, LSP6InternalsTestContext } from "../utils/context";
import { setupKeyManager } from "../utils/fixtures";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  INTERFACE_IDS,
} from "../../constants";

// effects
import {
  shouldBehaveLikePermissionChangeOwner,
  shouldBehaveLikePermissionChangeOrAddPermissions,
  shouldBehaveLikePermissionSetData,
  shouldBehaveLikePermissionCall,
  shouldBehaveLikePermissionStaticCall,
  shouldBehaveLikePermissionDelegateCall,
  shouldBehaveLikePermissionDeploy,
  shouldBehaveLikePermissionTransferValue,
  shouldBehaveLikePermissionSign,
  shouldBehaveLikeAllowedAddresses,
  shouldBehaveLikeAllowedFunctions,
  shouldBehaveLikeAllowedStandards,
  shouldBehaveLikeAllowedERC725YKeys,
  shouldBehaveLikeMultiChannelNonce,
  testSecurityScenarios,
} from "./tests";

// internals
import {
  testAllowedAddressesInternals,
  testAllowedFunctionsInternals,
  testReadingPermissionsInternals,
} from "./internals";

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

  describe("SETDATA", () => {
    shouldBehaveLikePermissionSetData(buildContext);
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

  describe.only("ALLOWEDSTANDARDS", () => {
    shouldBehaveLikeAllowedStandards(buildContext);
  });

  describe("ALLOWEDERC725YKeys", () => {
    shouldBehaveLikeAllowedERC725YKeys(buildContext);
  });

  describe("Multi Channel nonces", () => {
    shouldBehaveLikeMultiChannelNonce(buildContext);
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

    it.skip("send an empty payload to `keyManager.execute('0x')`", async () => {
      await context.keyManager.connect(context.owner).execute("0x");
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

  describe("Security", () => {
    testSecurityScenarios(buildContext);
  });
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

    it("should be linked to the right ERC725 account contract", async () => {
      let account = await context.keyManager.account();
      expect(account).toEqual(context.universalProfile.address);
    });
  });
};

export const testLSP6InternalFunctions = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  testAllowedAddressesInternals(buildContext);
  testAllowedFunctionsInternals(buildContext);
  testReadingPermissionsInternals(buildContext);
};
