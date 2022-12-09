// setup
import { LSP6TestContext } from "../../utils/context";
import { buildReentrancyContext } from "./Reentrancy/reentrancyHelpers";

// tests
import { testSingleExecuteToSingleExecute } from "./Reentrancy/SingleExecuteToSingleExecute.test";
import { testSingleExecuteRelayCallToSingleExecute } from "./Reentrancy/SingleExecuteRelayCallToSingleExecute.test";
import { testSingleExecuteToSingleExecuteRelayCall } from "./Reentrancy/SingleExecuteToSingleExecuteRelayCall.test";
import { testSingleExecuteRelayCallToSingleExecuteRelayCall } from "./Reentrancy/SingleExecuteRelayCallToSingleExecuteRelayCall.test";

import { testSingleExecuteToBatchExecute } from "./Reentrancy/SingleExecuteToBatchExecute.test";
//import { testSingleExecuteToBatchExecuteRelayCall } from "./Reentrancy/SingleExecuteToBatchExecuteRelayCall.test";

export const testReentrancyScenarios = (
  buildContext: () => Promise<LSP6TestContext>
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

  describe("first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`", () => {
    testSingleExecuteToBatchExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`", () => {
    //testSingleExecuteToBatchExecuteRelayCall(buildContext, buildReentrancyContext);
  });
};
