import { LSP6TestContext, LSP6InternalsTestContext } from "../utils/context";

import { INTERFACE_IDS } from "../../constants";

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
  otherTestScenarios,
} from "./tests";

import {
  testAllowedAddressesInternals,
  testAllowedERC725YKeysInternals,
  testAllowedFunctionsInternals,
  testReadingPermissionsInternals,
} from "./internals";

export const shouldBehaveLikeLSP6 = (
  buildContext: () => Promise<LSP6TestContext>
) => {
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

  describe("ALLOWEDSTANDARDS", () => {
    shouldBehaveLikeAllowedStandards(buildContext);
  });

  describe("ALLOWEDERC725YKeys", () => {
    shouldBehaveLikeAllowedERC725YKeys(buildContext);
  });

  describe("Multi Channel nonces", () => {
    shouldBehaveLikeMultiChannelNonce(buildContext);
  });

  describe("miscellaneous", () => {
    otherTestScenarios(buildContext);
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
        INTERFACE_IDS.LSP6KeyManager
      );
      expect(result).toBeTruthy();
    });

    it("should be linked to the right ERC725 account contract", async () => {
      let account = await context.keyManager.target();
      expect(account).toEqual(context.universalProfile.address);
    });
  });
};

export const testLSP6InternalFunctions = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  testAllowedAddressesInternals(buildContext);
  testAllowedFunctionsInternals(buildContext);
  testAllowedERC725YKeysInternals(buildContext);
  testReadingPermissionsInternals(buildContext);
};
