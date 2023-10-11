import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';
import {
  KeyManagerInternalTester,
  LSP6KeyManager,
  LSP6KeyManagerSingleton,
  UniversalProfile,
} from '../../types';

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
  initialFunding?: BigNumber;
};

export type LSP6SingletonTestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManagerSingleton;
  initialFunding?: BigNumber;
};

export type LSP6InternalsTestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManagerInternalTester: KeyManagerInternalTester;
};
