// types
import { BigNumber } from "ethers";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { buildReentrancyContext } from "./Reentrancy/reentrancyHelpers";

// tests
import { testERC725XExecuteToERC725XExecute } from "./Reentrancy/ERC725XExecuteToERC725XExecute.test";
import { testERC725XExecuteToLSP6ExecuteRelayCall } from "./Reentrancy/ERC725XExecuteToLSP6ExecuteRelayCall.test";

import { testERC725XBatchExecuteToERC725XExecute } from "./Reentrancy/ERC725XBatchExecuteToERC725XExecute.test";
import { testERC725XExecuteToLSP6BatchExecuteRelayCall } from "./Reentrancy/ERC725XExecuteToLSP6BatchExecuteRelayCall.test";

export const testReentrancyScenarios = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("first call through `execute(bytes)`, second call through `execute(bytes)`", () => {
    testERC725XExecuteToERC725XExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`", () => {
    testERC725XExecuteToLSP6ExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });

  // This tests will be enabled when we allow `ERC725X.execute(uint256[],address[],uint256[],bytes[])` in the LSP6.execute(bytes)
  describe.skip("first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`", () => {
    testERC725XBatchExecuteToERC725XExecute(
      buildContext,
      buildReentrancyContext
    );
  });

  describe("first call through `ERC725X.execute(bytes)`, second call through `LSP6.executeRelayCall(bytes[],uint256[],uint256[],bytes[])`", () => {
    testERC725XExecuteToLSP6BatchExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });
};
