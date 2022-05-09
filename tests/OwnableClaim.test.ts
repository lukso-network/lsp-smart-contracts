import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LSP0ERC725Account, LSP0ERC725Account__factory } from "../types";

import { provider } from "./utils/helpers";
import { OPERATIONS } from "../constants";

describe("Ownable claim", () => {
  let accounts: SignerWithAddress[];

  let owner: SignerWithAddress;

  let erc725Account: LSP0ERC725Account;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    erc725Account = await new LSP0ERC725Account__factory(owner).deploy(
      owner.address
    );

    // fund the erc725Account
    await owner.sendTransaction({
      to: erc725Account.address,
      value: ethers.utils.parseEther("10"),
    });
  });
  describe("when owner call transferOwnership(...)", () => {
    it("should have set the pendingOwner", async () => {
      let newOwner = accounts[1];

      await erc725Account.connect(owner).transferOwnership(newOwner.address);

      let pendingOwner = await erc725Account.pendingOwner();

      expect(pendingOwner).toEqual(newOwner.address);
    });

    it("owner should remain the current owner", async () => {
      let newOwner = accounts[1];

      const ownerBefore = await erc725Account.owner();

      await erc725Account.connect(owner).transferOwnership(newOwner.address);

      const ownerAfter = await erc725Account.owner();

      expect(ownerBefore).toEqual(ownerAfter);
    });

    it("should override the pendingOwner when transferOwnership(...) is called twice", async () => {
      let newOwner = accounts[1];

      await erc725Account.connect(owner).transferOwnership(newOwner.address);

      let overridenNewOwner = accounts[2];

      await erc725Account
        .connect(owner)
        .transferOwnership(overridenNewOwner.address);

      const pendingOwner = await erc725Account.pendingOwner();
      expect(pendingOwner).toEqual(overridenNewOwner.address);
    });

    describe("it should still be allowed to call onlyOwner functions", () => {
      it("setData(...)", async () => {
        const key =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
        const value = "0xabcd";

        // prettier-ignore
        await erc725Account.connect(owner)["setData(bytes32,bytes)"](key, value);

        const result = await erc725Account["getData(bytes32)"](key);
        expect(result).toEqual(value);
      });

      it("execute(...) - LYX transfer", async () => {
        const recipient = accounts[3];
        const amount = ethers.utils.parseEther("3");

        const recipientBalanceBefore = await provider.getBalance(
          recipient.address
        );
        const accountBalanceBefore = await provider.getBalance(
          erc725Account.address
        );

        await erc725Account
          .connect(owner)
          .execute(OPERATIONS.CALL, recipient.address, amount, "0x");

        const recipientBalanceAfter = await provider.getBalance(
          recipient.address
        );
        const accountBalanceAfter = await provider.getBalance(
          erc725Account.address
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

  describe("when non-owner call transferOwnership(...)", () => {
    it("should revert", async () => {
      let newOwner = accounts[2];

      await expect(
        erc725Account.connect(accounts[1]).transferOwnership(newOwner.address)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });
  });

  describe("when calling claimOwnership(...)", () => {
    describe("when caller is not the pending owner", () => {
      it("should revert", async () => {
        let newOwner = accounts[1];

        await erc725Account.connect(owner).transferOwnership(newOwner.address);

        await expect(
          erc725Account.connect(accounts[2]).claimOwnership()
        ).toBeRevertedWith("OwnableClaim: caller is not the pendingOwner");
      });
    });

    describe("when caller is the pending owner", () => {
      it("should change the contract owner to the pendingOwner", async () => {
        let newOwner = accounts[1];
        await erc725Account.connect(owner).transferOwnership(newOwner.address);

        let pendingOwner = await erc725Account.pendingOwner();

        await erc725Account.connect(newOwner).claimOwnership();

        let currentOwner = await erc725Account.owner();
        expect(currentOwner).toEqual(pendingOwner);
      });

      it("should have cleared the pendingOwner after transferring ownership", async () => {
        let newOwner = accounts[1];
        await erc725Account.connect(owner).transferOwnership(newOwner.address);

        await erc725Account.connect(newOwner).claimOwnership();

        let newPendingOwner = await erc725Account.pendingOwner();
        expect(newPendingOwner).toEqual(ethers.constants.AddressZero);
      });
    });

    describe("after pendingOwner has claimed ownership", () => {
      let previousOwner: SignerWithAddress, newOwner: SignerWithAddress;

      beforeEach(async () => {
        previousOwner = owner;
        newOwner = accounts[1];

        await erc725Account.connect(owner).transferOwnership(newOwner.address);
        await erc725Account.connect(newOwner).claimOwnership();
      });
      describe("previous owner should not be allowed anymore to call onlyOwner functions", () => {
        it("should revert when calling `setData(...)`", async () => {
          const key =
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
          const value = "0xabcd";

          // prettier-ignore
          await expect(
            erc725Account.connect(previousOwner)["setData(bytes32,bytes)"](key, value)
          ).toBeRevertedWith("Ownable: caller is not the owner")
        });

        it("should revert when calling `execute(...)`", async () => {
          const recipient = accounts[3];
          const amount = ethers.utils.parseEther("3");

          await expect(
            erc725Account
              .connect(previousOwner)
              .execute(OPERATIONS.CALL, recipient.address, amount, "0x")
          ).toBeRevertedWith("Ownable: caller is not the owner");
        });

        it("should revert when calling `renounceOwnership(...)`", async () => {
          await expect(
            erc725Account.connect(previousOwner).renounceOwnership()
          ).toBeRevertedWith("Ownable: caller is not the owner");
        });
      });

      describe("new owner should be allowed to call onlyOwner functions", () => {
        it("setData(...)", async () => {
          const key =
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
          const value = "0xabcd";

          // prettier-ignore
          await erc725Account.connect(newOwner)["setData(bytes32,bytes)"](key, value);

          const result = await erc725Account["getData(bytes32)"](key);
          expect(result).toEqual(value);
        });

        it("execute(...) - LYX transfer", async () => {
          const recipient = accounts[3];
          const amount = ethers.utils.parseEther("3");

          const recipientBalanceBefore = await provider.getBalance(
            recipient.address
          );
          const accountBalanceBefore = await provider.getBalance(
            erc725Account.address
          );

          await erc725Account
            .connect(newOwner)
            .execute(OPERATIONS.CALL, recipient.address, amount, "0x");

          const recipientBalanceAfter = await provider.getBalance(
            recipient.address
          );
          const accountBalanceAfter = await provider.getBalance(
            erc725Account.address
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
  });
});
