import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers.js';
import { KeyManagerInternalTester, LSP6KeyManager, UniversalProfile } from '../../types/index.js';

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
  initialFunding?: bigint;
};

export type LSP6InternalsTestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManagerInternalTester: KeyManagerInternalTester;
};
