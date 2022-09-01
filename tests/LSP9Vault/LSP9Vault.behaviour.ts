import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";

// types
import {
  LSP6KeyManager,
  LSP9Vault,
  UniversalProfile,
  UniversalReceiverDelegateVaultSetter__factory,
} from "../../types";

// helpers
import { ARRAY_LENGTH, generateKeysAndValues } from "../utils/helpers";

// errors
import { NotAllowedAddressError } from "../utils/errors";

// fixtures
import { callPayload } from "../utils/fixtures";

// constants
import {
  ERC725YKeys,
  INTERFACE_IDS,
  SupportedStandards,
  PERMISSIONS,
  OPERATION_TYPES,
} from "../../constants";
import { lsp9Vault } from "../../types/contracts";

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

  before(async () => {
    context = await buildContext();
  });

  describe("when testing setting data", () => {
    it("owner should be able to setData", async () => {
      const [keys, values] = generateKeysAndValues("random");
      await context.lsp9Vault
        .connect(context.accounts.owner)
        ["setData(bytes32,bytes)"](keys[0], values[0]);

      const result = await context.lsp9Vault.callStatic["getData(bytes32)"](
        keys[0]
      );
      expect(result).to.equal(values[0]);
    });

    it("non-owner shouldn't be able to setData", async () => {
      const [keys, values] = generateKeysAndValues("random");
      await expect(
        context.lsp9Vault
          .connect(context.accounts.random)
          ["setData(bytes32,bytes)"](keys[0], values[0])
      ).to.be.revertedWith("Only Owner or Universal Receiver Delegate allowed");
    });

    it("UniversalReceiverDelegate should be able to setData", async () => {
      // setting UniversalReceiverDelegate that setData
      const lsp1UniversalReceiverDelegateVaultSetter =
        await new UniversalReceiverDelegateVaultSetter__factory(
          context.accounts.anyone
        ).deploy();
      await context.lsp9Vault
        .connect(context.accounts.owner)
        ["setData(bytes32,bytes)"](
          ERC725YKeys.LSP1.LSP1UniversalReceiverDelegate,
          lsp1UniversalReceiverDelegateVaultSetter.address
        );

      const [keys, values] = generateKeysAndValues("random");
      await lsp1UniversalReceiverDelegateVaultSetter
        .connect(context.accounts.anyone)
        .universalReceiverDelegate(
          context.lsp9Vault.address,
          keys[0],
          values[0]
        );

      const result = await context.lsp9Vault.callStatic["getData(bytes32)"](
        keys[0]
      );
      expect(result).to.equal(values[0]);
    });
  });

  describe("when using vault with UniversalProfile", () => {
    describe("when transferring ownership of the vault to the universalProfile", () => {
      before(async () => {
        await context.lsp9Vault
          .connect(context.accounts.owner)
          .transferOwnership(context.universalProfile.address);

        let claimOwnershipSelector =
          context.universalProfile.interface.getSighash("claimOwnership");

        let executePayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            context.lsp9Vault.address,
            0,
            claimOwnershipSelector,
          ]);

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(executePayload);
      });

      it("should register lsp10 keys of the vault on the profile", async () => {
        const arrayLength = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](ERC725YKeys.LSP10["LSP10Vaults[]"].length);
        expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
      });
    });

    describe("when restricitng address to only talk to the vault", () => {
      before(async () => {
        let abiCoder = await ethers.utils.defaultAbiCoder;
        let friendPermissions = PERMISSIONS.CALL;
        const payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
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
          "setData(bytes32,bytes)",
          [keys[0], values[0]]
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

        const res = await context.lsp9Vault.callStatic["getData(bytes32)"](
          keys[0]
        );
        expect(res).to.equal(values[0]);
      });

      it("should fail when friend is interfacting with other contracts", async () => {
        const [keys, values] = generateKeysAndValues("any string");
        const payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [keys[0], values[0]]
        );

        let disallowedAddress = ethers.utils.getAddress(
          context.universalProfile.address
        );

        await expect(
          context.lsp6KeyManager
            .connect(context.accounts.friend)
            .execute(
              callPayload(
                context.universalProfile,
                context.universalProfile.address,
                payload
              )
            )
        )
          .to.be.revertedWithCustomError(
            context.lsp6KeyManager,
            "NotAllowedAddress"
          )
          .withArgs(context.accounts.friend.address, disallowedAddress);
      });
    });

    describe("when renouncing ownership of the vault", async () => {
      before(async () => {
        await network.provider.send("hardhat_mine", ["0xffff"]);
      });

      beforeEach(async () => {
        context = await buildContext();
      });

      it("should fail to confirm if delay didn't expire", async () => {
        const renounceOwnershipOnce = context.lsp9Vault
          .connect(context.accounts.owner)
          .renounceOwnership();

        await expect(renounceOwnershipOnce).to.emit(
          context.lsp9Vault,
          "RenounceOwnershipInitiated"
        );

        expect(await context.lsp9Vault.owner()).to.equal(
          context.accounts.owner.address
        );

        await network.provider.send("hardhat_mine", ["0x62"]); // skip 98 blocks

        const renounceOwnershipSecond = context.lsp9Vault
          .connect(context.accounts.owner)
          .renounceOwnership();

        await expect(renounceOwnershipSecond)
          .to.be.revertedWithCustomError(
            context.lsp9Vault,
            "RenounceOwnershipAvailableAtBlockNumber"
          )
          .withArgs((await renounceOwnershipOnce).blockNumber + 100);

        expect(await context.lsp9Vault.owner()).to.equal(
          context.accounts.owner.address
        );
      });

      it("should renounce ownership in a 2-step process after delay expires", async () => {
        const renounceOwnershipOnce = context.lsp9Vault
          .connect(context.accounts.owner)
          .renounceOwnership();

        await expect(renounceOwnershipOnce).to.emit(
          context.lsp9Vault,
          "RenounceOwnershipInitiated"
        );

        expect(await context.lsp9Vault.owner()).to.equal(
          context.accounts.owner.address
        );

        await network.provider.send("hardhat_mine", ["0x63"]); // skip 99 blocks

        const renounceOwnershipSecond = context.lsp9Vault
          .connect(context.accounts.owner)
          .renounceOwnership();

        await expect(renounceOwnershipSecond)
          .to.emit(context.lsp9Vault, "OwnershipTransferred")
          .withArgs(
            context.accounts.owner.address,
            ethers.constants.AddressZero
          );

        expect(await context.lsp9Vault.owner()).to.equal(
          ethers.constants.AddressZero
        );
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
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).to.be.true;
    });

    it("should have registered the ERC725X interface", async () => {
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.ERC725X
      );
      expect(result).to.be.true;
    });

    it("should have registered the ERC725Y interface", async () => {
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.ERC725Y
      );
      expect(result).to.be.true;
    });

    it("should have registered the LSP9 interface", async () => {
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.LSP9Vault
      );
      expect(result).to.be.true;
    });

    it("should have registered the LSP1 interface", async () => {
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.LSP1UniversalReceiver
      );
      expect(result).to.be.true;
    });

    it("should support ClaimOwnership interface", async () => {
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.ClaimOwnership
      );
      expect(result).to.be.true;
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp9Vault, "DataChanged")
        .withArgs(SupportedStandards.LSP9Vault.key);
      expect(
        await context.lsp9Vault["getData(bytes32)"](
          SupportedStandards.LSP9Vault.key
        )
      ).to.equal(SupportedStandards.LSP9Vault.value);
    });
  });
};
