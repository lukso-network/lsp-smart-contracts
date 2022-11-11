import { ethers } from "hardhat";
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
import {
  ARRAY_LENGTH,
  generateKeysAndValues,
  abiCoder,
  combineAllowedCalls,
} from "../utils/helpers";

// fixtures
import { callPayload } from "../utils/fixtures";

// constants
import {
  ERC725YKeys,
  INTERFACE_IDS,
  SupportedStandards,
  PERMISSIONS,
  OPERATION_TYPES,
  LSP1_TYPE_IDS,
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

    describe("when setting a data key with a value less than 256 bytes", () => {
      it("should emit DataChanged event with the whole data value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(200));

        await expect(context.lsp9Vault["setData(bytes32,bytes)"](key, value))
          .to.emit(context.lsp9Vault, "DataChanged")
          .withArgs(key, value);

        const result = await context.lsp9Vault["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });

    describe("when setting a data key with a value more than 256 bytes", () => {
      it("should emit DataChanged event with only the first 256 bytes of the value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        await expect(context.lsp9Vault["setData(bytes32,bytes)"](key, value))
          .to.emit(context.lsp9Vault, "DataChanged")
          .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

        const result = await context.lsp9Vault["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });

    describe("when calling the contract without any value or data", () => {
      it("should pass and not emit the ValueReceived event", async () => {
        const sender = context.accounts.anyone;
        const amount = 0;

        // prettier-ignore
        await expect(
          sender.sendTransaction({
            to: context.lsp9Vault.address,
            value: amount,
          })
        ).to.not.be.reverted
         .to.not.emit(context.lsp9Vault, "ValueReceived");
      });
    });

    describe("when setting a data key with a value exactly 256 bytes long", () => {
      it("should emit DataChanged event with the whole data value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(context.lsp9Vault["setData(bytes32,bytes)"](key, value))
          .to.emit(context.lsp9Vault, "DataChanged")
          .withArgs(key, value);

        const result = await context.lsp9Vault["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });
  });

  describe("when testing setting execute", () => {
    describe("when executing operation (4) DELEGATECALL", () => {
      it("should revert with unknow operation type custom error", async () => {
        await expect(
          context.lsp9Vault["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.DELEGATECALL,
            context.accounts.random.address,
            0,
            "0x"
          )
        )
          .to.be.revertedWithCustomError(
            context.universalProfile,
            "ERC725X_UnknownOperationType"
          )
          .withArgs(OPERATION_TYPES.DELEGATECALL);
      });
    });
  });

  describe("when using vault with UniversalProfile", () => {
    describe("when transferring ownership of the vault to the universalProfile", () => {
      before(async () => {
        await context.lsp9Vault
          .connect(context.accounts.owner)
          .transferOwnership(context.universalProfile.address);

        let acceptOwnershipSelector =
          context.universalProfile.interface.getSighash("acceptOwnership");

        let executePayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              context.lsp9Vault.address,
              0,
              acceptOwnershipSelector,
            ]
          );

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          ["execute(bytes)"](executePayload);
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
                context.accounts.friend.address.substring(2),
              ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
                context.accounts.friend.address.substring(2),
            ],
            [
              friendPermissions,
              combineAllowedCalls(
                ["0xffffffff"],
                [context.lsp9Vault.address],
                ["0xffffffff"]
              ),
            ],
          ]
        );

        await context.lsp6KeyManager
          .connect(context.accounts.owner)
          ["execute(bytes)"](payload);
      });

      it("should allow friend to talk to the vault", async () => {
        const [keys, values] = generateKeysAndValues("any");
        const payload = context.lsp9Vault.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [keys[0], values[0]]
        );
        await context.lsp6KeyManager
          .connect(context.accounts.friend)
          ["execute(bytes)"](
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

      it("should fail when friend is interacting with other contracts", async () => {
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
            ["execute(bytes)"](
              callPayload(
                context.universalProfile,
                context.universalProfile.address,
                payload
              )
            )
        )
          .to.be.revertedWithCustomError(
            context.lsp6KeyManager,
            "NotAllowedCall"
          )
          .withArgs(
            context.accounts.friend.address,
            disallowedAddress,
            context.universalProfile.interface.getSighash(
              "setData(bytes32,bytes)"
            )
          );
      });
    });

    describe("when transferring ownership of the vault", () => {
      beforeEach(async () => {
        context = await buildContext();
      });

      it("should emit UniversalReceiver event", async () => {
        const transferOwnership = context.lsp9Vault
          .connect(context.accounts.owner)
          .transferOwnership(context.universalProfile.address);

        await expect(transferOwnership)
          .to.emit(context.universalProfile, "UniversalReceiver")
          .withArgs(
            context.lsp9Vault.address,
            0,
            LSP1_TYPE_IDS.LSP14OwnershipTransferStarted,
            "0x",
            abiCoder.encode(
              ["bytes", "bytes"],
              [
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("LSP1: typeId out of scope")
                ),
                "0x",
              ]
            )
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

    it("should support LSP14Ownable2Step interface", async () => {
      const result = await context.lsp9Vault.supportsInterface(
        INTERFACE_IDS.LSP14Ownable2Step
      );
      expect(result).to.be.true;
    });

    it("should have set expected entries with ERC725Y.setData", async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp9Vault, "DataChanged")
        .withArgs(
          SupportedStandards.LSP9Vault.key,
          SupportedStandards.LSP9Vault.value
        );
      expect(
        await context.lsp9Vault["getData(bytes32)"](
          SupportedStandards.LSP9Vault.key
        )
      ).to.equal(SupportedStandards.LSP9Vault.value);
    });
  });
};
