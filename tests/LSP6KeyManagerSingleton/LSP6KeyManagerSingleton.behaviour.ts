import { BigNumber } from 'ethers';

import { LSP6SingletonTestContext } from '../utils/context';

import {
  // Relay
  shouldBehaveLikeMultiChannelNonce,
  shouldBehaveLikeExecuteRelayCall,
} from './index';

export const shouldBehaveLikeLSP6 = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6SingletonTestContext>,
) => {
  describe('Single + Batch Meta Transactions', () => {
    shouldBehaveLikeExecuteRelayCall(buildContext);
    shouldBehaveLikeMultiChannelNonce(buildContext);
  });
};
