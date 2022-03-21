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
        value: ethers.utils.parseEther("10"),
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
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("10"));

        await contractCanTransferValue.sendOneLyxHardcoded({
          gasLimit: GAS_PROVIDED,
        });

        let newUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newRecipientBalance = await provider.getBalance(hardcodedRecipient);

        expect(newUPBalance).toEqBN(ethers.utils.parseEther("9"));
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
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("10"));

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

        expect(newUPBalance).toEqBN(ethers.utils.parseEther("9"));
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
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("10"));

        await contractCanTransferValue.sendOneLyxHardcodedRawCall({
          gasLimit: GAS_PROVIDED,
        });

        let newUPBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newRecipientBalance = await provider.getBalance(hardcodedRecipient);

        expect(newUPBalance).toEqBN(ethers.utils.parseEther("9"));
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
        expect(initialUPBalance).toEqBN(ethers.utils.parseEther("10"));

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

        expect(newUPBalance).toEqBN(ethers.utils.parseEther("9"));
        expect(newRecipientBalance).toEqBN(
          initialRecipientBalance.add(ethers.utils.parseEther("1"))
        );
      });
    });
  });
};
