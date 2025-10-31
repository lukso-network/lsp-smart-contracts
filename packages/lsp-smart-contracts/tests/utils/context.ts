import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import type { NetworkHelpers } from '@nomicfoundation/hardhat-network-helpers/types';
import type { KeyManagerInternalTester } from '../../types/ethers-contracts/index.js';
import type { LSP6KeyManager } from '../../../lsp6-contracts/types/ethers-contracts/index.js';
import type { UniversalProfile } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';

export type LSP6TestContext = {
  ethers: HardhatEthers;
  networkHelpers: NetworkHelpers;
  accounts: HardhatEthersSigner[];
  mainController: HardhatEthersSigner;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
  initialFunding?: bigint;
};

export type LSP6InternalsTestContext = {
  ethers: HardhatEthers;
  accounts: HardhatEthersSigner[];
  mainController: HardhatEthersSigner;
  universalProfile: UniversalProfile;
  keyManagerInternalTester: KeyManagerInternalTester;
};
