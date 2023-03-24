// types
import { BigNumber } from "ethers";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { buildReentrancyContext } from "./Reentrancy/reentrancyHelpers";

// tests
import { testSingleExecuteToSingleExecute } from "./Reentrancy/SingleExecuteToSingleExecute.test";
import { testSingleExecuteToSingleExecuteRelayCall } from "./Reentrancy/SingleExecuteToSingleExecuteRelayCall.test";

import { testBatchExecuteToSingleExecute } from "./Reentrancy/BatchExecuteToSingleExecute.test";
import { testERC725XExecuteToLSP6BatchExecuteRelayCall } from "./Reentrancy/ERC725XExecuteToLSP6BatchExecuteRelayCall.test";

export const testReentrancyScenarios = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("first call through `execute(bytes)`, second call through `execute(bytes)`", () => {
    testSingleExecuteToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`", () => {
    testSingleExecuteToSingleExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });

  // This tests will be enabled when we allow `ERC725X.execute(uint256[],address[],uint256[],bytes[])` in the LSP6.execute(bytes)
  describe.skip("first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`", () => {
    testBatchExecuteToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `ERC725X.execute(bytes)`, second call through `LSP6.executeRelayCall(bytes[],uint256[],uint256[],bytes[])`", () => {
    testERC725XExecuteToLSP6BatchExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });
};
