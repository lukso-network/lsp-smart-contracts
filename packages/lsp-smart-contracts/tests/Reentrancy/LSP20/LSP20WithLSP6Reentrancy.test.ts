// setup
import { type LSP6TestContext } from '../../utils/context.js';
import { buildReentrancyContext } from './reentrancyHelpers.js';

// tests
import { testERC725XExecuteToERC725XExecute } from './ERC725XExecuteToERC725XExecute.test.js';
import { testERC725XExecuteToLSP6ExecuteRelayCall } from './ERC725XExecuteToLSP6ExecuteRelayCall.test.js';

import { testERC725XBatchExecuteToERC725XExecute } from './ERC725XBatchExecuteToERC725XExecute.test.js';
import { testERC725XExecuteToLSP6BatchExecuteRelayCall } from './ERC725XExecuteToLSP6BatchExecuteRelayCall.test.js';
import { testERC725XExecuteToERC725XExecuteBatch } from './ERC725XExecuteToERC725XBatchExecute.test.js';

export const shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
) => {
  describe('first call through `execute(uint256,address,uint256,bytes)`, second call through `execute(uint256,address,uint256,bytes)`', () => {
    testERC725XExecuteToERC725XExecute(buildContext, buildReentrancyContext);
  });

  describe('first call through `execute(uint256,address,uint256,bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`', () => {
    testERC725XExecuteToLSP6ExecuteRelayCall(buildContext, buildReentrancyContext);
  });

  describe('first call through `execute(uint256[],address[],uint256[],bytes[])`, second call through `execute(uint256,address,uint256,bytes)`', () => {
    testERC725XBatchExecuteToERC725XExecute(buildContext, buildReentrancyContext);
  });

  describe('first call through `execute(uint256,address,uint256,bytes)`, second call through `execute(uint256[],address[],uint256[],bytes[])`', () => {
    testERC725XExecuteToERC725XExecuteBatch(buildContext, buildReentrancyContext);
  });

  describe('first call through `ERC725X.execute(bytes)`, second call through `LSP6.executeRelayCall(bytes[],uint256[],uint256[],bytes[])`', () => {
    testERC725XExecuteToLSP6BatchExecuteRelayCall(buildContext, buildReentrancyContext);
  });
};
