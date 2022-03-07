import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { LSP6KeyManager, UniversalProfile } from "../../types";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  ERC1271,
  INTERFACE_IDS,
  OPERATIONS,
  PERMISSIONS,
} from "../../constants";

// helpers
import { EMPTY_PAYLOAD, NotAuthorisedError } from "../utils/helpers";

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

  describe("CHANGE / ADD permissions", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress,
      // address being used to edit the permissions
      addressToEditPermissions: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];
      addressToEditPermissions = context.accounts[3];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.ADDPERMISSIONS, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.CHANGEPERMISSIONS, 32),
        // placeholder permission
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32),
      ];

      await setupKeyManager(permissionKeys, permissionsValues);
    });

    describe("when setting one permission key", () => {
      describe("when caller is UP owner", () => {
        it("should be allowed to ADD permissions", async () => {
          let newController = new ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)]]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          const [result] = await context.universalProfile.callStatic.getData([
            key,
          ]);
          expect(result).toEqual(
            ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)
          );
        });
      });
    });
  });

  describe("TRANSFERVALUE", () => {
    let provider = ethers.provider;

    let canTransferValue: SignerWithAddress,
      cannotTransferValue: SignerWithAddress;

    beforeAll(async () => {
      context = await buildContext();

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

      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("owner should be allowed to transfer value", async () => {
      let initialBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let recipient = context.accounts[3].address;
      let initialBalanceRecipient = await provider.getBalance(recipient);

      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          recipient,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]);

      await context.keyManager.connect(context.owner).execute(transferPayload);

      let newBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

      let newBalanceRecipient = await provider.getBalance(recipient);
      expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
        parseInt(initialBalanceRecipient)
      );
    });

    it("address with permission TRANSFER VALUE should be allowed to transfer value", async () => {
      let initialBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let recipient = context.accounts[3].address;
      let initialBalanceRecipient = await provider.getBalance(recipient);

      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          recipient,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]);

      await context.keyManager
        .connect(canTransferValue)
        .execute(transferPayload);

      let newBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

      let newBalanceRecipient = await provider.getBalance(recipient);
      expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
        parseInt(initialBalanceRecipient)
      );
    });

    it("address with no permission TRANSFERVALUE should revert", async () => {
      let initialBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let recipient = context.accounts[3].address;
      let initialBalanceRecipient = await provider.getBalance(recipient);

      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          recipient,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]);

      try {
        await context.keyManager
          .connect(cannotTransferValue)
          .execute(transferPayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(cannotTransferValue.address, "TRANSFERVALUE")
        );
      }

      let newBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let newBalanceRecipient = await provider.getBalance(recipient);

      expect(parseInt(newBalanceUP)).toBe(parseInt(initialBalanceUP));
      expect(parseInt(initialBalanceRecipient)).toBe(
        parseInt(newBalanceRecipient)
      );
    });
  });

  describe("SIGN (ERC1271)", () => {
    let signer, nonSigner, noPermissionsSet;
    const dataToSign = "0xcafecafe";

    beforeAll(async () => {
      context = await buildContext();

      signer = context.accounts[1];
      nonSigner = context.accounts[2];
      noPermissionsSet = context.accounts[3];

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
