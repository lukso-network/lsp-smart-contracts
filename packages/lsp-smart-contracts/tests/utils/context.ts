import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers.js';

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile;
  keyManager;
  initialFunding?: bigint;
};

export type LSP6InternalsTestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile;
  keyManagerInternalTester;
};
