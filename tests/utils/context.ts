import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  KeyManagerInternalTester,
  LSP6KeyManager,
  UniversalProfile,
} from "../../types";

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  owner: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
};

export type LSP6InternalsTestContext = {
  accounts: SignerWithAddress[];
  owner: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManagerInternalTester: KeyManagerInternalTester;
};
