import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { BytesLike } from "ethers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

// types
import {
  LSP6KeyManager,
  LSP9Vault,
  UniversalProfile,
  UniversalReceiverDelegateVaultSetter__factory,
} from "../../types";

// helpers
import {
  ARRAY_LENGTH,
  generateKeysAndValues,
  NotAllowedAddressError,
} from "../utils/helpers";

// fixtures
import { callPayload } from "../utils/fixtures";

// constants
import {
  ERC725YKeys,
  INTERFACE_IDS,
  SupportedStandards,
  PERMISSIONS,
} from "../../constants";

export type LSP9TestAccounts = {
  owner: SignerWithAddress;
  friend: SignerWithAddress;
  random: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP9TestAccounts> => {
  const [owner, friend, random, anyone] = await ethers.getSigners();
  return { owner, friend, random, anyone };
};

export type LSP9DeployParams = {
  newOwner: string;
};

export type LSP9TestContext = {
  accounts: LSP9TestAccounts;
  lsp9Vault: LSP9Vault;
  deployParams: LSP9DeployParams;
  universalProfile: UniversalProfile;
  lsp6KeyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP9 = (
  buildContext: () => Promise<LSP9TestContext>
) => {
  let context: LSP9TestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("when testing setting data", () => {
    it("owner should be able to setData", async () => {
      const [keys, values] = generateKeysAndValues("random");
      await context.lsp9Vault
        .connect(context.accounts.owner)
        .setData([keys[0]], [values[0]]);

      const [result] = await context.lsp9Vault.callStatic.getData([keys[0]]);
      expect(result).toEqual(values[0]);
    });

    it("non-owner shouldn't be able to setData", async () => {
      const [keys, values] = generateKeysAndValues("random");
      await expect(
        context.lsp9Vault
          .connect(context.accounts.random)
          .setData([keys[0]], [values[0]])
      ).toBeRevertedWith("Only Owner or Universal Receiver Delegate allowed");
    });

    it("UniversalReceiverDelegate should be able to setData", async () => {
      // setting UniversalReceiverDelegate that setData
      const lsp1UniversalReceiverDelegateVaultSetter =
        await new UniversalReceiverDelegateVaultSetter__factory(
          context.accounts.anyone
        ).deploy();
      await context.lsp9Vault
        .connect(context.accounts.owner)
        .setData(
          [ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate],
          [lsp1UniversalReceiverDelegateVaultSetter.address]
        );

      const [keys, values] = generateKeysAndValues("random");
      await lsp1UniversalReceiverDelegateVaultSetter
        .connect(context.accounts.anyone)
        .universalReceiverDelegate(
          context.lsp9Vault.address,
          keys[0],
          values[0]
        );

      const [result] = await context.lsp9Vault.callStatic.getData([keys[0]]);
      expect(result).toEqual(values[0]);
    });
  });

  describe("when using vault with UniversalProfile", () => {
    describe("when transferring ownership of the vault to the universalProfile", () => {
      beforeAll(async () => {
        await context.lsp9Vault
          .connect(context.accounts.owner)
          .transferOwnership(context.universalProfile.address);
      });

      it("should register lsp10 keys of the vault on the profile", async () => {
        const [arrayLength] = await context.universalProfile.callStatic.getData(
          [ERC725YKeys.LSP10["LSP10Vaults[]"]]
        );
        expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
      });
    });

    describe("when restricitng address to only talk to the vault", () => {
      beforeAll(async () => {
        let abiCoder = await ethers.utils.defaultAbiCoder;
        let friendPermissions = ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32);
        const payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [
            [
              ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
                context.accounts.friend.address.substr(2),
              ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
                context.accounts.friend.address.substr(2),
            ],
            [
              friendPermissions,
              abiCoder.encode(["address[]"], [[context.lsp9Vault.address]]),
            ],
          ]
        );

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(payload);
      });

      it("should allow friend to talk to the vault", async () => {
        const [keys, values] = generateKeysAndValues("any");
        const payload = context.lsp9Vault.interface.encodeFunctionData(
          "setData",
          [[keys[0]], [values[0]]]
        );
        await context.lsp6KeyManager
          .connect(context.accounts.friend)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp9Vault.address,
              payload
            )
          );

        const [res] = await context.lsp9Vault.callStatic.getData([keys[0]]);
        expect(res).toEqual(values[0]);
      });

      it("shoudl fail when friend is interfacting with other contracts", async () => {
        const [keys, values] = generateKeysAndValues("any string");
        const payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[keys[0]], [values[0]]]
        );

        let disallowedAddress = ethers.utils.getAddress(
          context.universalProfile.address
        );

        try {
          await context.lsp6KeyManager
            .connect(context.accounts.friend)
            .execute(
              callPayload(
                context.universalProfile,
                context.universalProfile.address,
                payload
              )
            );
        } catch (error) {
          expect(error.message).toMatch(
            NotAllowedAddressError(
              context.accounts.friend.address,
              disallowedAddress
            )
          );
        }
      });
    });
  });
};

export type LSP9InitializeTestContext = {
  lsp9Vault: LSP9Vault;
  initializeTransaction: TransactionResponse;
  deployParams: LSP9DeployParams;
};

export const shouldInitializeLikeLSP9 = (
  buildContext: () => Promise<LSP9InitializeTestContext>
) => {
  let context: LSP9InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should have registered the ERC165 interface", async () => {
      expect(await context.lsp9Vault.supportsInterface(INTERFACE_IDS.ERC165));
    });

    it("should have registered the ERC725X interface", async () => {
      expect(await context.lsp9Vault.supportsInterface(INTERFACE_IDS.ERC725X));
    });

    it("should have registered the ERC725Y interface", async () => {
      expect(await context.lsp9Vault.supportsInterface(INTERFACE_IDS.ERC725Y));
    });

    it("should have registered the LSP9 interface", async () => {
      expect(await context.lsp9Vault.supportsInterface(INTERFACE_IDS.LSP9));
    });

    it("should have registered the LSP1 interface", async () => {
      expect(await context.lsp9Vault.supportsInterface(INTERFACE_IDS.LSP1));
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction).toHaveEmittedWith(
        context.lsp9Vault,
        "DataChanged",
        [SupportedStandards.LSP9Vault.key, SupportedStandards.LSP9Vault.value]
      );
      expect(
        await context.lsp9Vault.getData([SupportedStandards.LSP9Vault.key])
      ).toEqual([SupportedStandards.LSP9Vault.value]);
    });
  });
};
