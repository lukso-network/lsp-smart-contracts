// types
import { BigNumber } from 'ethers';

// setup
import { LSP6TestContext } from '../../utils/context';
import { buildReentrancyContext } from './reentrancyHelpers';

// tests
import { testERC725XExecuteToERC725XExecute } from './ERC725XExecuteToERC725XExecute.test';
import { testERC725XExecuteToLSP6ExecuteRelayCall } from './ERC725XExecuteToLSP6ExecuteRelayCall.test';

import { testERC725XBatchExecuteToERC725XExecute } from './ERC725XBatchExecuteToERC725XExecute.test';
import { testERC725XExecuteToLSP6BatchExecuteRelayCall } from './ERC725XExecuteToLSP6BatchExecuteRelayCall.test';
import { testERC725XExecuteToERC725XExecuteBatch } from './ERC725XExecuteToERC725XBatchExecute.test';

export const shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
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
