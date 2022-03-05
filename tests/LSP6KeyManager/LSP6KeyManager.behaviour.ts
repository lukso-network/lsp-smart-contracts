import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { LSP6KeyManager, UniversalProfile } from "../../types";

import { INTERFACE_IDS } from "../../constants";

export type LSP6TestContext = {
  owner: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
};

export type LSP6InitializeTestContext = {
  keyManager: LSP6KeyManager;
};

export const shouldInitializeLikeLSP6 = (
  buildContext: () => Promise<LSP6InitializeTestContext>
) => {
  let context: LSP6InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should support ERC165 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.LSP6
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP6 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.LSP6
      );
      expect(result).toBeTruthy();
    });

    /// @todo it should have set the account it is linked to
  });
};
