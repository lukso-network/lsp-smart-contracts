import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { LSP6KeyManager, UniversalProfile } from "../../types";

import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  ERC1271,
  INTERFACE_IDS,
  PERMISSIONS,
} from "../../constants";

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  owner: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP6 = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  const setupKeyManager = async (
    _permissionsKeys: string[],
    _permissionsValues: string[]
  ) => {
    await context.universalProfile
      .connect(context.owner)
      .setData(_permissionsKeys, _permissionsValues);

    await context.universalProfile
      .connect(context.owner)
      .transferOwnership(context.keyManager.address);
  };

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("test permission SIGN (ERC1271)", () => {
    let signer, nonSigner, noPermissionsSet;
    const dataToSign = "0xcafecafe";

    beforeAll(async () => {
      signer = context.accounts[1];
      nonSigner = context.accounts[2];
      noPermissionsSet = context.accounts[3];

      /** @todo put all of this in a fixture to setUpKeyManager(...) */
      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          signer.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          nonSigner.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
      ];

      await setupKeyManager(permissionsKeys, permissionsValues);
    });

    it("can verify signature from owner on KeyManager", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await context.owner.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.MAGIC_VALUE);
    });

    it("can verify signature from signer on KeyManager", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.MAGIC_VALUE);
    });

    it("should fail when verifying signature from address with no SIGN permission", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await nonSigner.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.FAIL_VALUE);
    });

    it("should fail when verifying signature from address with no permissions set", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await noPermissionsSet.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.FAIL_VALUE);
    });
  });

  describe("test permission TRANSFERVALUE", () => {
    let provider = ethers.provider;

    let canTransferValue, cannotTransferValue;

    beforeAll(async () => {
      canTransferValue = context.accounts[1];
      cannotTransferValue = context.accounts[2];

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canTransferValue.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          cannotTransferValue.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
      ];

      await setupKeyManager(permissionsKeys, permissionsValues);
    });

    it("owner should be allowed to transfer value", async () => {});

    it("address with permission TRANSFER VALUE should be allowed to transfer value", async () => {});

    it("address with no permission TRANSFERVALUE should revert", async () => {});
  });
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
