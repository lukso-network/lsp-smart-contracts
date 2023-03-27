import { BigNumber } from "ethers";
import { LSP6TestContext } from "../../utils/context";

import {
  shouldBehaveLikePermissionChangeOwner,
  shouldBehaveLikePermissionChangeOrAddController,
  shouldBehaveLikePermissionChangeOrAddExtensions,
  shouldBehaveLikePermissionChangeOrAddURD,
  shouldBehaveLikePermissionSetData,
  shouldBehaveLikePermissionCall,
  shouldBehaveLikePermissionStaticCall,
  shouldBehaveLikePermissionDelegateCall,
  shouldBehaveLikePermissionDeploy,
  shouldBehaveLikePermissionTransferValue,
  shouldBehaveLikeAllowedAddresses,
  shouldBehaveLikeAllowedFunctions,
  shouldBehaveLikeAllowedStandards,
  shouldBehaveLikeAllowedERC725YDataKeys,
  shouldBehaveLikeBatchExecute,
  testSecurityScenarios,
  otherTestScenarios,
  testReentrancyScenarios,
} from "./index";

export const shouldBehaveLikeLSP6 = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("CHANGEOWNER", () => {
    shouldBehaveLikePermissionChangeOwner(buildContext);
  });

  describe("CHANGE / ADD permissions", () => {
    shouldBehaveLikePermissionChangeOrAddController(buildContext);
  });

  describe("CHANGE / ADD extensions", () => {
    shouldBehaveLikePermissionChangeOrAddExtensions(buildContext);
  });

  describe("CHANGE / ADD UniversalReceiverDelegate", () => {
    shouldBehaveLikePermissionChangeOrAddURD(buildContext);
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

  describe("ALLOWED CALLS", () => {
    shouldBehaveLikeAllowedAddresses(buildContext);
    shouldBehaveLikeAllowedFunctions(buildContext);
    shouldBehaveLikeAllowedStandards(buildContext);
  });

  describe("AllowedERC725YDataKeys", () => {
    shouldBehaveLikeAllowedERC725YDataKeys(buildContext);
  });

  describe("batch execute", () => {
    shouldBehaveLikeBatchExecute(buildContext);
  });

  describe("miscellaneous", () => {
    otherTestScenarios(buildContext);
  });

  describe("Security", () => {
    testSecurityScenarios(buildContext);
  });

  describe("Reentrancy", () => {
    testReentrancyScenarios(buildContext);
  });
};
