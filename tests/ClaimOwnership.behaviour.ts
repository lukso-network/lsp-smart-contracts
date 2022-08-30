import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LSP0ERC725Account, LSP9Vault } from "../types";

// constants
import { OPERATION_TYPES } from "../constants";

// helpers
import { provider } from "./utils/helpers";

export type ClaimOwnershipTestContext = {
  accounts: SignerWithAddress[];
  contract: LSP0ERC725Account | LSP9Vault;
  deployParams: { owner: SignerWithAddress };
  onlyOwnerRevertString: string;
};

export const shouldBehaveLikeClaimOwnership = (
  buildContext: () => Promise<ClaimOwnershipTestContext>
) => {
  let context: ClaimOwnershipTestContext;
  let newOwner: SignerWithAddress;

  beforeEach(async () => {
    context = await buildContext();

    newOwner = context.accounts[1];

    // fund the account
    await context.deployParams.owner.sendTransaction({
      to: context.contract.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  describe("when owner call transferOwnership(...)", () => {
    beforeEach(async () => {
      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(newOwner.address);
    });

    it("should have set the pendingOwner", async () => {
      let pendingOwner = await context.contract.pendingOwner();
      expect(pendingOwner).to.equal(newOwner.address);
    });

    it("owner should remain the current owner", async () => {
      let newOwner = ethers.Wallet.createRandom();

      const ownerBefore = await context.contract.owner();

      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(newOwner.address);

      const ownerAfter = await context.contract.owner();

      expect(ownerBefore).to.equal(ownerAfter);
    });

    it("should override the pendingOwner when transferOwnership(...) is called twice", async () => {
      let overridenNewOwner = ethers.Wallet.createRandom();

      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(overridenNewOwner.address);

      const pendingOwner = await context.contract.pendingOwner();
      expect(pendingOwner).to.equal(overridenNewOwner.address);
    });

    it("should revert when transferring Ownership to the contract itself", async () => {
      await expect(
        context.contract
          .connect(context.deployParams.owner)
          .transferOwnership(context.contract.address)
      ).to.be.revertedWithCustomError(
        context.contract,
        "CannotSelfTransferOwnership"
      );
    });

    describe("it should still be allowed to call onlyOwner functions", () => {
      it("setData(...)", async () => {
        const key =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
        const value = "0xabcd";

        await context.contract
          .connect(context.deployParams.owner)
          ["setData(bytes32,bytes)"](key, value);

        const result = await context.contract["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("execute(...) - LYX transfer", async () => {
        const recipient = context.accounts[3];
        const amount = ethers.utils.parseEther("3");

        const recipientBalanceBefore = await provider.getBalance(
          recipient.address
        );
        const accountBalanceBefore = await provider.getBalance(
          context.contract.address
        );

        await context.contract
          .connect(context.deployParams.owner)
          .execute(OPERATION_TYPES.CALL, recipient.address, amount, "0x");

        const recipientBalanceAfter = await provider.getBalance(
          recipient.address
        );
        const accountBalanceAfter = await provider.getBalance(
          context.contract.address
        );

        // recipient balance should have gone up
        expect(recipientBalanceAfter).to.be.gt(recipientBalanceBefore);

        // account balance should have gone down
        expect(accountBalanceAfter).to.be.lt(accountBalanceBefore);
      });
    });
  });

  describe("when non-owner call transferOwnership(...)", () => {
    it("should revert", async () => {
      let newOwner = context.accounts[2];

      await expect(
        context.contract
          .connect(context.accounts[1])
          .transferOwnership(newOwner.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("when calling claimOwnership(...)", () => {
    it("should revert when caller is not the pending owner", async () => {
      let newOwner = context.accounts[1];

      await context.contract
        .connect(context.deployParams.owner)
        .transferOwnership(newOwner.address);

      await expect(
        context.contract.connect(context.accounts[2]).claimOwnership()
      ).to.be.revertedWith("OwnableClaim: caller is not the pendingOwner");
    });

    describe("when caller is the pending owner", () => {
      let newOwner: SignerWithAddress;

      beforeEach(async () => {
        newOwner = context.accounts[1];

        await context.contract
          .connect(context.deployParams.owner)
          .transferOwnership(newOwner.address);
      });

      it("should change the contract owner to the pendingOwner", async () => {
        let pendingOwner = await context.contract.pendingOwner();

        await context.contract.connect(newOwner).claimOwnership();

        let updatedOwner = await context.contract.owner();
        expect(updatedOwner).to.equal(pendingOwner);
      });

      it("should have cleared the pendingOwner after transferring ownership", async () => {
        await context.contract.connect(newOwner).claimOwnership();

        let newPendingOwner = await context.contract.pendingOwner();
        expect(newPendingOwner).to.equal(ethers.constants.AddressZero);
      });

      it("should have emitted a OwnershipTransferred event", async () => {
        const owner = await context.contract.owner();

        await expect(await context.contract.connect(newOwner).claimOwnership())
          .to.emit(context.contract, "OwnershipTransferred")
          .withArgs(
            owner, // previous owner
            newOwner.address // new owner
          );
      });
    });

    describe("after pendingOwner has claimed ownership", () => {
      let previousOwner: SignerWithAddress, newOwner: SignerWithAddress;

      beforeEach(async () => {
        previousOwner = context.deployParams.owner;
        newOwner = context.accounts[1];

        await context.contract
          .connect(context.deployParams.owner)
          .transferOwnership(newOwner.address);
        await context.contract.connect(newOwner).claimOwnership();
      });

      describe("previous owner should not be allowed anymore to call onlyOwner functions", () => {
        it("should revert when calling `setData(...)`", async () => {
          const key =
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
          const value = "0xabcd";

          await expect(
            context.contract
              .connect(previousOwner)
              ["setData(bytes32,bytes)"](key, value)
          ).to.be.revertedWith(context.onlyOwnerRevertString);
        });

        it("should revert when calling `execute(...)`", async () => {
          const recipient = context.accounts[3];
          const amount = ethers.utils.parseEther("3");

          await expect(
            context.contract
              .connect(previousOwner)
              .execute(OPERATION_TYPES.CALL, recipient.address, amount, "0x")
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should revert when calling `renounceOwnership(...)`", async () => {
          await expect(
            context.contract.connect(previousOwner).renounceOwnership()
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });

      describe("new owner should be allowed to call onlyOwner functions", () => {
        it("setData(...)", async () => {
          const key =
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
          const value = "0xabcd";

          await context.contract
            .connect(newOwner)
            ["setData(bytes32,bytes)"](key, value);

          const result = await context.contract["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("execute(...) - LYX transfer", async () => {
          const recipient = context.accounts[3];
          const amount = ethers.utils.parseEther("3");

          await expect(() =>
            context.contract
              .connect(newOwner)
              .execute(OPERATION_TYPES.CALL, recipient.address, amount, "0x")
          ).to.changeEtherBalances(
            [context.contract.address, recipient.address],
            [
              `-${amount}`, // account balance should have gone down
              amount, // recipient balance should have gone up
            ]
          );
        });
      });
    });
  });
};
