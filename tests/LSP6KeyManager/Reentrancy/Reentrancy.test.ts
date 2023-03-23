// types
import { BigNumber } from "ethers";

// setup
import { LSP6TestContext } from "../../utils/context";
import { buildReentrancyContext } from "./reentrancyHelpers";

// tests
import { testSingleExecuteToSingleExecute } from "./SingleExecuteToSingleExecute.test";
import { testSingleExecuteRelayCallToSingleExecute } from "./SingleExecuteRelayCallToSingleExecute.test";
import { testSingleExecuteToSingleExecuteRelayCall } from "./SingleExecuteToSingleExecuteRelayCall.test";
import { testSingleExecuteRelayCallToSingleExecuteRelayCall } from "./SingleExecuteRelayCallToSingleExecuteRelayCall.test";

import { testSingleExecuteToBatchExecute } from "./SingleExecuteToBatchExecute.test";
import { testSingleExecuteToBatchExecuteRelayCall } from "./SingleExecuteToBatchExecuteRelayCall.test";

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

  describe("first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`", () => {
    testSingleExecuteToBatchExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`", () => {
    testSingleExecuteToBatchExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });
};
