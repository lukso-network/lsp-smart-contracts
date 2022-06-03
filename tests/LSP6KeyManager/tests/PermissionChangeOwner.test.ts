import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import { ERC725YKeys, PERMISSIONS, OPERATION_TYPES } from "../../../constants";

import { LSP6KeyManager, LSP6KeyManager__factory } from "../../../types";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";
import { NotAuthorisedError, provider } from "../../utils/helpers";

export const shouldBehaveLikePermissionChangeOwner = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let canChangeOwner: SignerWithAddress, cannotChangeOwner: SignerWithAddress;

  let permissionsKeys: string[];
  let permissionsValues: string[];

  beforeEach(async () => {
    context = await buildContext();

    canChangeOwner = context.accounts[1];
    cannotChangeOwner = context.accounts[2];

    permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        canChangeOwner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        cannotChangeOwner.address.substring(2),
    ];

    permissionsValues = [PERMISSIONS.CHANGEOWNER, PERMISSIONS.SETDATA];

    await setupKeyManager(context, permissionsKeys, permissionsValues);

    // fund the UP
    await context.owner.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  describe("when upgrading to a new KeyManager via transferOwnership(...)", () => {
    let newKeyManager: LSP6KeyManager;

    describe("when caller does not have have CHANGEOWNER permission", () => {
      beforeEach(async () => {
        newKeyManager = await new LSP6KeyManager__factory(context.owner).deploy(
          context.universalProfile.address
        );

        let transferOwnershipPayload =
          context.universalProfile.interface.encodeFunctionData(
            "transferOwnership",
            [newKeyManager.address]
          );

        await context.keyManager
          .connect(canChangeOwner)
          .execute(transferOwnershipPayload);
      });
      it("should revert", async () => {
        let transferOwnershipPayload =
          context.universalProfile.interface.encodeFunctionData(
            "transferOwnership",
            [newKeyManager.address]
          );

        await expect(
          context.keyManager
            .connect(cannotChangeOwner)
            .execute(transferOwnershipPayload)
        ).toBeRevertedWith(
          NotAuthorisedError(cannotChangeOwner.address, "TRANSFEROWNERSHIP")
        );
      });
    });

    describe("when caller has ALL PERMISSIONS", () => {
      beforeEach(async () => {
        newKeyManager = await new LSP6KeyManager__factory(context.owner).deploy(
          context.universalProfile.address
        );

        let transferOwnershipPayload =
          context.universalProfile.interface.encodeFunctionData(
            "transferOwnership",
            [newKeyManager.address]
          );

        await context.keyManager
          .connect(context.owner)
          .execute(transferOwnershipPayload);
      });
      it("should have set newKeyManager as pendingOwner", async () => {
        let pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).toEqual(newKeyManager.address);
      });

      it("owner should remain the current KeyManager", async () => {
        const ownerBefore = await context.universalProfile.owner();

        let transferOwnershipPayload =
          context.universalProfile.interface.encodeFunctionData(
            "transferOwnership",
            [newKeyManager.address]
          );

        await context.keyManager
          .connect(context.owner)
          .execute(transferOwnershipPayload);

        const ownerAfter = await context.universalProfile.owner();

        expect(ownerBefore).toEqual(context.keyManager.address);
        expect(ownerAfter).toEqual(context.keyManager.address);
      });

      it("should override the pendingOwner when transferOwnership(...) is called twice", async () => {
        let overridenPendingOwner = await new LSP6KeyManager__factory(
          context.owner
        ).deploy(context.universalProfile.address);

        await context.keyManager
          .connect(context.owner)
          .execute(
            context.universalProfile.interface.encodeFunctionData(
              "transferOwnership",
              [overridenPendingOwner.address]
            )
          );

        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).toEqual(overridenPendingOwner.address);
      });

      describe("it should still be possible to call onlyOwner functions via the old KeyManager", () => {
        it("setData(...)", async () => {
          const key =
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
          const value = "0xabcd";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(value);
        });

        it("execute(...) - LYX transfer", async () => {
          const recipient = context.accounts[8];
          const amount = ethers.utils.parseEther("3");

          const recipientBalanceBefore = await provider.getBalance(
            recipient.address
          );
          const accountBalanceBefore = await provider.getBalance(
            context.universalProfile.address
          );

          let payload = context.universalProfile.interface.encodeFunctionData(
            "execute",
            [OPERATION_TYPES.CALL, recipient.address, amount, "0x"]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          const recipientBalanceAfter = await provider.getBalance(
            recipient.address
          );
          const accountBalanceAfter = await provider.getBalance(
            context.universalProfile.address
          );

          // recipient balance should have gone up
          expect(parseInt(recipientBalanceAfter)).toBeGreaterThan(
            parseInt(recipientBalanceBefore)
          );

          // account balance should have gone down
          expect(parseInt(accountBalanceAfter)).toBeLessThan(
            parseInt(accountBalanceBefore)
          );
        });
      });
    });

    describe("when caller has only CHANGE0OWNER permission", () => {
      beforeEach(async () => {
        newKeyManager = await new LSP6KeyManager__factory(context.owner).deploy(
          context.universalProfile.address
        );

        let transferOwnershipPayload =
          context.universalProfile.interface.encodeFunctionData(
            "transferOwnership",
            [newKeyManager.address]
          );

        await context.keyManager
          .connect(canChangeOwner)
          .execute(transferOwnershipPayload);
      });

      it("should have set newKeyManager as pendingOwner", async () => {
        let pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).toEqual(newKeyManager.address);
      });

      it("owner should remain the current KeyManager", async () => {
        const ownerBefore = await context.universalProfile.owner();

        let transferOwnershipPayload =
          context.universalProfile.interface.encodeFunctionData(
            "transferOwnership",
            [newKeyManager.address]
          );

        await context.keyManager
          .connect(canChangeOwner)
          .execute(transferOwnershipPayload);

        const ownerAfter = await context.universalProfile.owner();

        expect(ownerBefore).toEqual(context.keyManager.address);
        expect(ownerAfter).toEqual(context.keyManager.address);
      });

      it("should override the pendingOwner when transferOwnership(...) is called twice", async () => {
        let overridenPendingOwner = await new LSP6KeyManager__factory(
          context.owner
        ).deploy(context.universalProfile.address);

        await context.keyManager
          .connect(canChangeOwner)
          .execute(
            context.universalProfile.interface.encodeFunctionData(
              "transferOwnership",
              [overridenPendingOwner.address]
            )
          );

        const pendingOwner = await context.universalProfile.pendingOwner();
        expect(pendingOwner).toEqual(overridenPendingOwner.address);
      });
    });
  });

  describe("when calling claimOwnership(...) from a KeyManager that is not the pendingOwner", () => {
    let newKeyManager: LSP6KeyManager;

    beforeEach(async () => {
      newKeyManager = await new LSP6KeyManager__factory(context.owner).deploy(
        context.universalProfile.address
      );

      let transferOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newKeyManager.address]
        );

      await context.keyManager
        .connect(context.owner)
        .execute(transferOwnershipPayload);
    });

    it("should revert", async () => {
      let notPendingKeyManager = await new LSP6KeyManager__factory(
        context.accounts[5]
      ).deploy(context.universalProfile.address);

      let payload =
        context.universalProfile.interface.getSighash("claimOwnership");

      await expect(
        notPendingKeyManager.connect(context.owner).execute(payload)
      ).toBeRevertedWith("OwnableClaim: caller is not the pendingOwner");
    });
  });

  describe("when calling claimOwnership(...) via the pending new KeyManager", () => {
    let newKeyManager: LSP6KeyManager;

    beforeEach(async () => {
      newKeyManager = await new LSP6KeyManager__factory(context.owner).deploy(
        context.universalProfile.address
      );

      let transferOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newKeyManager.address]
        );

      await context.keyManager
        .connect(context.owner)
        .execute(transferOwnershipPayload);
    });

    it("should have change the account's owner to the pendingOwner (= pending KeyManager)", async () => {
      let payload =
        context.universalProfile.interface.getSighash("claimOwnership");

      let pendingOwner = await context.universalProfile.pendingOwner();

      await newKeyManager.connect(context.owner).execute(payload);

      let updatedOwner = await context.universalProfile.owner();
      expect(updatedOwner).toEqual(pendingOwner);
    });

    it("should have cleared the pendingOwner after transfering ownership", async () => {
      let payload =
        context.universalProfile.interface.getSighash("claimOwnership");

      await newKeyManager.connect(context.owner).execute(payload);

      let newPendingOwner = await context.universalProfile.pendingOwner();
      expect(newPendingOwner).toEqual(ethers.constants.AddressZero);
    });
  });

  describe("after KeyManager has been upgraded via claimOwnership(...)", () => {
    let oldKeyManager: LSP6KeyManager, newKeyManager: LSP6KeyManager;

    beforeEach(async () => {
      oldKeyManager = context.keyManager;

      newKeyManager = await new LSP6KeyManager__factory(context.owner).deploy(
        context.universalProfile.address
      );

      let transferOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newKeyManager.address]
        );

      await context.keyManager
        .connect(context.owner)
        .execute(transferOwnershipPayload);

      let claimOwnershipPayload =
        context.universalProfile.interface.getSighash("claimOwnership");

      await newKeyManager.connect(context.owner).execute(claimOwnershipPayload);
    });

    describe("old KeyManager should not be allowed to call onlyOwner functions anymore", () => {
      it("should revert when calling `setData(...)`", async () => {
        const key =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
        const value = "0xabcd";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          oldKeyManager.connect(context.owner).execute(payload)
        ).toBeRevertedWith("Ownable: caller is not the owner");
      });

      it("should revert when calling `execute(...)`", async () => {
        let recipient = context.accounts[3];
        let amount = ethers.utils.parseEther("3");

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATION_TYPES.CALL, recipient.address, amount, "0x"]
        );

        await expect(
          oldKeyManager.connect(context.owner).execute(payload)
        ).toBeRevertedWith("Ownable: caller is not the owner");
      });
    });

    describe("new Key Manager should be allowed to call onlyOwner functions", () => {
      it("setData(...)", async () => {
        const key =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
        const value = "0xabcd";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await newKeyManager.connect(context.owner).execute(payload);

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).toEqual(value);
      });

      it("execute(...) - LYX transfer", async () => {
        const recipient = context.accounts[3];
        const amount = ethers.utils.parseEther("3");

        const recipientBalanceBefore = await provider.getBalance(
          recipient.address
        );
        const accountBalanceBefore = await provider.getBalance(
          context.universalProfile.address
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATION_TYPES.CALL, recipient.address, amount, "0x"]
        );

        await newKeyManager.connect(context.owner).execute(payload);

        const recipientBalanceAfter = await provider.getBalance(
          recipient.address
        );
        const accountBalanceAfter = await provider.getBalance(
          context.universalProfile.address
        );

        // recipient balance should have gone up
        expect(parseInt(recipientBalanceAfter)).toBeGreaterThan(
          parseInt(recipientBalanceBefore)
        );

        // account balance should have gone down
        expect(parseInt(accountBalanceAfter)).toBeLessThan(
          parseInt(accountBalanceBefore)
        );
      });
    });
  });
};
