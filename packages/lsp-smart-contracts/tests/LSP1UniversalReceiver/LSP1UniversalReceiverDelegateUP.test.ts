import type { HardhatEthers } from '@nomicfoundation/hardhat-ethers/types';
import type { LSP1UniversalReceiverDelegateUP } from '../../../lsp1delegate-contracts/types/ethers-contracts/index.js';
import type { UniversalProfile } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import type { LSP6KeyManager } from '../../../lsp6-contracts/types/ethers-contracts/index.js';

import { setupProfileWithKeyManagerWithURD } from '../utils/fixtures.js';

import {
  type LSP1TestAccounts,
  type LSP1DelegateTestContext,
  shouldBehaveLikeLSP1Delegate,
  shouldInitializeLikeLSP1Delegate,
} from './LSP1UniversalReceiverDelegateUP.behaviour.js';
import { network } from 'hardhat';

async function getNamedAccounts(ethers: HardhatEthers): Promise<LSP1TestAccounts> {
  const [owner1, owner2, random, any] = await ethers.getSigners();
  return {
    owner1,
    owner2,
    random,
    any,
  };
}

describe('LSP1UniversalReceiverDelegateUP', () => {
  describe('when testing deployed contract', () => {
    const buildLSP1DelegateTestContext = async (): Promise<LSP1DelegateTestContext> => {
      const { ethers, networkHelpers } = await network.connect();
      const accounts = await getNamedAccounts(ethers);

      const [UP1, KM1, LSP1_URD_UP] = await setupProfileWithKeyManagerWithURD(accounts.owner1);

      const [UP2, KM2] = await setupProfileWithKeyManagerWithURD(accounts.owner2);
      const lsp1universalReceiverDelegateUP = LSP1_URD_UP as LSP1UniversalReceiverDelegateUP;

      const universalProfile1 = UP1 as UniversalProfile;
      const universalProfile2 = UP2 as UniversalProfile;
      const lsp6KeyManager1 = KM1 as LSP6KeyManager;
      const lsp6KeyManager2 = KM2 as LSP6KeyManager;

      return {
        accounts,
        ethers,
        networkHelpers,
        universalProfile1,
        lsp6KeyManager1,
        universalProfile2,
        lsp6KeyManager2,
        lsp1universalReceiverDelegateUP,
      };
    };

    describe('when deploying the contract', () => {
      let context: LSP1DelegateTestContext;

      before(async () => {
        context = await buildLSP1DelegateTestContext();
      });

      describe('when initializing the contract', () => {
        shouldInitializeLikeLSP1Delegate(async () => {
          const { lsp1universalReceiverDelegateUP } = context;

          return {
            lsp1universalReceiverDelegateUP,
          };
        });
      });
    });

    describe('when testing deployed contract', () => {
      shouldBehaveLikeLSP1Delegate(buildLSP1DelegateTestContext);
    });
  });
});
