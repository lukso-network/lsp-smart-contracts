import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Executor, Executor__factory } from "../../../types";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  provider,
  EMPTY_PAYLOAD,
  NotAuthorisedError,
} from "../../utils/helpers";

export const shouldBehaveLikePermissionTransferValue = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("when caller is an EOA", () => {
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

      await setupKeyManager(context, permissionsKeys, permissionsValues);

      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("address with ALL PERMISSIONS should be allowed to transfer value", async () => {
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

      await expect(
        context.keyManager.connect(cannotTransferValue).execute(transferPayload)
      ).toBeRevertedWith(
        NotAuthorisedError(cannotTransferValue.address, "TRANSFERVALUE")
      );

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

  describe("when caller is a contract", () => {
    let contractCanTransferValue: Executor;

    const hardcodedRecipient: string =
      "0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe";

    /**
     * @dev this is necessary when the function being called in the contract
     *  perform a raw / low-level call (in the function body)
     *  otherwise, the deeper layer of interaction (UP.execute) fails
     */
    const GAS_PROVIDED = 200_000;

    beforeEach(async () => {
      context = await buildContext();

      contractCanTransferValue = await new Executor__factory(
        context.accounts[0]
      ).deploy(context.universalProfile.address, context.keyManager.address);

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contractCanTransferValue.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);

      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("1"),
      });
    });

    describe("> Contract calls", () => {
      it("Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcoded`)", async () => {
        let initialUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let initialRecipientBalance = await provider.getBalance(
          hardcodedRecipient
        );
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("1"));

        await contractCanTransferValue.sendOneLyxHardcoded({
          gasLimit: GAS_PROVIDED,
        });

        let newUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newRecipientBalance = await provider.getBalance(hardcodedRecipient);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(
          initialRecipientBalance.add(ethers.utils.parseEther("1"))
        );
      });

      it("Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipient`)", async () => {
        let recipient = context.accounts[1];

        let initialUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let initialRecipientBalance = await provider.getBalance(
          recipient.address
        );
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("1"));

        await contractCanTransferValue.sendOneLyxToRecipient(
          recipient.address,
          {
            gasLimit: GAS_PROVIDED,
          }
        );

        let newUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newRecipientBalance = await provider.getBalance(recipient.address);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(
          initialRecipientBalance.add(ethers.utils.parseEther("1"))
        );
      });
    });

    describe("> Low-level calls", () => {
      it("Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcodedRawCall`)", async () => {
        let initialUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let initialRecipientBalance = await provider.getBalance(
          hardcodedRecipient
        );
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("1"));

        await contractCanTransferValue.sendOneLyxHardcodedRawCall({
          gasLimit: GAS_PROVIDED,
        });

        let newUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newRecipientBalance = await provider.getBalance(hardcodedRecipient);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(
          initialRecipientBalance.add(ethers.utils.parseEther("1"))
        );
      });

      it("Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipientRawCall`)", async () => {
        let recipient = context.accounts[1];

        let initialUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let initialRecipientBalance = await provider.getBalance(
          recipient.address
        );
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("1"));

        await contractCanTransferValue.sendOneLyxToRecipientRawCall(
          recipient.address,
          {
            gasLimit: GAS_PROVIDED,
          }
        );

        let newUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newRecipientBalance = await provider.getBalance(recipient.address);

        expect(newUPBalance).toEqBN(0);
        expect(newRecipientBalance).toEqBN(
          initialRecipientBalance.add(ethers.utils.parseEther("1"))
        );
      });
    });
  });

  describe("when caller is another UP (with a KeyManager as owner)", () => {
    // UP making the call
    let alice: SignerWithAddress;
    let aliceContext: LSP6TestContext;

    // UP being called
    let bob: SignerWithAddress;
    let bobContext: LSP6TestContext;

    beforeAll(async () => {
      aliceContext = await buildContext();
      alice = aliceContext.accounts[0];

      bobContext = await buildContext();
      bob = bobContext.accounts[1];

      const alicePermissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substring(2),
      ];
      const alicePermissionValues = [ALL_PERMISSIONS_SET];

      const bobPermissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          aliceContext.universalProfile.address.substring(2),
      ];

      const bobPermissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      await setupKeyManager(
        aliceContext,
        alicePermissionKeys,
        alicePermissionValues
      );
      await setupKeyManager(bobContext, bobPermissionKeys, bobPermissionValues);

      // fund Bob's Up with some LYX to be transfered
      await bob.sendTransaction({
        to: bobContext.universalProfile.address,
        value: ethers.utils.parseEther("5"),
      });
    });

    it("Alice should have ALL PERMISSIONS in her UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        alice.address.substring(2);

      // prettier-ignore
      const result = await aliceContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(ALL_PERMISSIONS_SET);
    });

    it("Bob should have ALL PERMISSIONS in his UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        bob.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(ALL_PERMISSIONS_SET);
    });

    it("Alice's UP should have permission SETDATA on Bob's UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        aliceContext.universalProfile.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        )
      );
    });

    it("Alice should be able to send 5 LYX from Bob's UP to her UP", async () => {
      let aliceUPBalanceBefore = await provider.getBalance(
        aliceContext.universalProfile.address
      );
      let bobUPBalanceBefore = await provider.getBalance(
        bobContext.universalProfile.address
      );
      expect(aliceUPBalanceBefore).toEqBN(0);
      expect(bobUPBalanceBefore).toEqBN(ethers.utils.parseEther("5"));

      let finalTransferLyxPayload =
        bobContext.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          aliceContext.universalProfile.address,
          ethers.utils.parseEther("5"),
          "0x",
        ]);

      let bobKeyManagerPayload =
        bobContext.keyManager.interface.encodeFunctionData("execute", [
          finalTransferLyxPayload,
        ]);

      let aliceUniversalProfilePayload =
        aliceContext.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          bobContext.keyManager.address,
          0,
          bobKeyManagerPayload,
        ]);

      let tx = await aliceContext.keyManager
        .connect(alice)
        .execute(aliceUniversalProfilePayload);
      let receipt = await tx.wait();
      console.log("gas used: ", receipt.gasUsed.toNumber());

      let aliceUPBalanceAfter = await provider.getBalance(
        aliceContext.universalProfile.address
      );
      let bobUPBalanceAfter = await provider.getBalance(
        bobContext.universalProfile.address
      );
      expect(aliceUPBalanceAfter).toEqBN(ethers.utils.parseEther("5"));
      expect(bobUPBalanceAfter).toEqBN(0);
    });
  });
};
