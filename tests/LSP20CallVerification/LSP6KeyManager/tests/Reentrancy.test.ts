// types
import { BigNumber } from "ethers";

// setup
import { LSP6TestContext } from "../../utils/context";
import { buildReentrancyContext } from "./Reentrancy/reentrancyHelpers";

// tests
import { testSingleExecuteToSingleExecute } from "./Reentrancy/SingleExecuteToSingleExecute.test";
import { testSingleExecuteRelayCallToSingleExecute } from "./Reentrancy/SingleExecuteRelayCallToSingleExecute.test";
import { testSingleExecuteToSingleExecuteRelayCall } from "./Reentrancy/SingleExecuteToSingleExecuteRelayCall.test";
import { testSingleExecuteRelayCallToSingleExecuteRelayCall } from "./Reentrancy/SingleExecuteRelayCallToSingleExecuteRelayCall.test";

import { testBatchExecuteToSingleExecute } from "./Reentrancy/BatchExecuteToSingleExecute.test";
import { testSingleExecuteToBatchExecuteRelayCall } from "./Reentrancy/SingleExecuteToBatchExecuteRelayCall.test";

export const testReentrancyScenarios = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("first call through `execute(bytes)`, second call through `execute(bytes)`", () => {
    testSingleExecuteToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `execute(bytes)`", () => {
    testSingleExecuteRelayCallToSingleExecute(
      buildContext,
      buildReentrancyContext
    );
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`", () => {
    testSingleExecuteToSingleExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });

  describe("first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`", () => {
    testSingleExecuteRelayCallToSingleExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });

  // This tests will be enabled when we allow `ERC725X.execute(uint256[],address[],uint256[],bytes[])` in the LSP6.execute(bytes)
  describe.skip("first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`", () => {
    testBatchExecuteToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`", () => {
    testSingleExecuteToBatchExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });
};
