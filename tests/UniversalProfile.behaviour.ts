import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { UniversalProfile } from "../types";

// constants
import { INTERFACE_IDS, SupportedStandards } from "../constants";

export type LSP3TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress };
};

export type LSP3InitializeTestContext = {
  universalProfile: UniversalProfile;
};

export const shouldInitializeLikeLSP3 = (
  buildContext: () => Promise<LSP3InitializeTestContext>
) => {
  let context: LSP3InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    // it("should have set the right contract owner", async () => {
    //   expect(await context.universalProfile.owner()).toEqual(
    //     context.deployParams.owner
    //   );
    // });
    it("should support ERC165 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC725X interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725X
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC725Y interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725Y
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP0 (ERC725Account) interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725Account
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP1 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP1
      );
      expect(result).toBeTruthy();
    });

    it("should have set key 'SupportedStandards:LSP3UniversalProfile'", async () => {
      const [result] = await context.universalProfile.getData([
        SupportedStandards.LSP3UniversalProfile.key,
      ]);

      expect(result).toEqual(SupportedStandards.LSP3UniversalProfile.value);
    });
  });
};
