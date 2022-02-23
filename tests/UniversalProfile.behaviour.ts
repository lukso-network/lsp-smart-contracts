import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { UniversalProfile } from "../types";

// constants
import { ERC1271, INTERFACE_IDS, SupportedStandards } from "../constants";

export type LSP3TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress };
};

export const shouldBehaveLikeLSP3 = (
  buildContext: () => Promise<LSP3TestContext>
) => {
  let context: LSP3TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when using `isValidSignature()` from ERC1271", () => {
    it("should verify signature from owner", async () => {
      const signer = context.deployParams.owner;

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.MAGIC_VALUE);
    });

    it("should fail when verifying signature from non-owner", async () => {
      const owner = context.deployParams.owner;
      const signer = context.accounts[1];

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.FAIL_VALUE);
    });
  });
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
