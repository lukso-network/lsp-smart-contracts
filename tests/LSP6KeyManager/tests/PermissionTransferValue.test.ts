import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  Executor,
  Executor__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
  UniversalProfile__factory,
} from "../../../types";

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
  NotAuthorisedError,
  abiCoder,
  NotAllowedAddressError,
} from "../../utils/helpers";

export const shouldBehaveLikePermissionTransferValue = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("when caller = EOA", () => {
    let canTransferValue: SignerWithAddress,
      canTransferValueAndCall: SignerWithAddress,
      cannotTransferValue: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canTransferValue = context.accounts[1];
      canTransferValueAndCall = context.accounts[2];
      cannotTransferValue = context.accounts[3];

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canTransferValue.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canTransferValueAndCall.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          cannotTransferValue.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32),
        ethers.utils.hexZeroPad(
          PERMISSIONS.TRANSFERVALUE + PERMISSIONS.CALL,
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

    describe("when recipient = EOA", () => {
      let recipient;

      beforeEach(async () => {
        recipient = context.accounts[3].address;
      });

      describe("when transferring value without bytes `_data`", () => {
        const data = "0x";

        it("should pass when caller has ALL PERMISSIONS", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );

          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await context.keyManager
            .connect(context.owner)
            .execute(transferPayload);

          let newBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          expect(parseInt(newBalanceUP)).toBeLessThan(
            parseInt(initialBalanceUP)
          );

          let newBalanceRecipient = await provider.getBalance(recipient);
          expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
            parseInt(initialBalanceRecipient)
          );
        });

        it("should pass when caller has permission TRANSFERVALUE only", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await context.keyManager
            .connect(canTransferValue)
            .execute(transferPayload);

          let newBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          expect(parseInt(newBalanceUP)).toBeLessThan(
            parseInt(initialBalanceUP)
          );

          let newBalanceRecipient = await provider.getBalance(recipient);
          expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
            parseInt(initialBalanceRecipient)
          );
        });

        it("should pass when caller has permission TRANSFERVALUE + CALL", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await context.keyManager
            .connect(canTransferValueAndCall)
            .execute(transferPayload);

          let newBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          expect(parseInt(newBalanceUP)).toBeLessThan(
            parseInt(initialBalanceUP)
          );

          let newBalanceRecipient = await provider.getBalance(recipient);
          expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
            parseInt(initialBalanceRecipient)
          );
        });

        it("should fail when caller does not have permission TRANSFERVALUE", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await expect(
            context.keyManager
              .connect(cannotTransferValue)
              .execute(transferPayload)
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

      describe("when transferring value with bytes `_data`", () => {
        const data = "0xaabbccdd";

        it("should pass when caller has ALL PERMISSIONS", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );

          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await context.keyManager
            .connect(context.owner)
            .execute(transferPayload);

          let newBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          expect(parseInt(newBalanceUP)).toBeLessThan(
            parseInt(initialBalanceUP)
          );

          let newBalanceRecipient = await provider.getBalance(recipient);
          expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
            parseInt(initialBalanceRecipient)
          );
        });

        it("should pass when caller has permission TRANSFERVALUE + CALL", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );

          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await context.keyManager
            .connect(canTransferValueAndCall)
            .execute(transferPayload);

          let newBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          expect(parseInt(newBalanceUP)).toBeLessThan(
            parseInt(initialBalanceUP)
          );

          let newBalanceRecipient = await provider.getBalance(recipient);
          expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
            parseInt(initialBalanceRecipient)
          );
        });

        it("should fail when caller has permission TRANSFERVALUE only", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await expect(
            context.keyManager
              .connect(canTransferValue)
              .execute(transferPayload)
          ).toBeRevertedWith(
            NotAuthorisedError(canTransferValue.address, "CALL")
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

        it("should fail when caller does not have permission TRANSFERVALUE", async () => {
          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          let initialBalanceRecipient = await provider.getBalance(recipient);

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient,
              ethers.utils.parseEther("3"),
              data,
            ]);

          await expect(
            context.keyManager
              .connect(cannotTransferValue)
              .execute(transferPayload)
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
    });

    // when recipient is a contract
  });

  describe("when caller = contract", () => {
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
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32),
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
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32),
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

    it("Alice's UP should have permission TRANSFERVALUE on Bob's UP", async () => {
      let key =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        aliceContext.universalProfile.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).toEqual(
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32)
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

  describe("when caller has SUPER_TRANSFERVALUE + CALL", () => {
    let caller: SignerWithAddress;
    let lsp7Token: LSP7Mintable;

    beforeEach(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      lsp7Token = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "LSP7 Token",
        "LSP7",
        context.accounts[0].address,
        false
      );

      await lsp7Token
        .connect(context.accounts[0])
        .mint(context.universalProfile.address, 100, false, "0x");

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          caller.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          caller.address.substring(2),
      ];

      const permissionsValues = [
        ethers.utils.hexZeroPad(
          PERMISSIONS.SUPER_TRANSFERVALUE + PERMISSIONS.CALL,
          32
        ),
        // restriction = only a specific address (e.g: an LSP7 contract)
        abiCoder.encode(["address[]"], [[lsp7Token.address]]),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);

      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    describe("should be allowed to send LYX to any EOA", () => {
      const recipients: SignerWithAddress[] = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];

      it.each(recipients)("should send LYX to EOA -> %s", async (recipient) => {
        let initialBalanceUP = await provider.getBalance(
          context.universalProfile.address
        );

        let initialBalanceRecipient = await provider.getBalance(recipient);

        let transferPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            recipient,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        await context.keyManager.connect(caller).execute(transferPayload);

        let newBalanceUP = await provider.getBalance(
          context.universalProfile.address
        );
        expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

        let newBalanceRecipient = await provider.getBalance(recipient);
        expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
          parseInt(initialBalanceRecipient)
        );
      });
    });

    describe("should be allowed to send LYX to any other UP contract", () => {
      for (let ii = 0; ii < 5; ii++) {
        it(`should send LYX to UP ${ii}`, async () => {
          let recipient = await new UniversalProfile__factory(
            context.accounts[0]
          ).deploy(context.accounts[0].address);

          let initialBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );

          let initialBalanceRecipient = await provider.getBalance(
            recipient.address
          );

          let transferPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATIONS.CALL,
              recipient.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]);

          await context.keyManager.connect(caller).execute(transferPayload);

          let newBalanceUP = await provider.getBalance(
            context.universalProfile.address
          );
          expect(parseInt(newBalanceUP)).toBeLessThan(
            parseInt(initialBalanceUP)
          );

          let newBalanceRecipient = await provider.getBalance(
            recipient.address
          );
          expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
            parseInt(initialBalanceRecipient)
          );
        });
      }
    });

    /**
     * @todo test that it can only interact with a specific contract only with some bytes calldata
     * tests should be the transfer(...) function.
     *
     *
     */
    //
    // test 1: deploy a new LSP7 contract, and test not allowed to interact with this specific address
    // test 2: allowed to interact with the only allowed LSP7 contract.

    it.skip("should not be allowed to interact with any LSP7 contract", async () => {
      let newLSP7Token = await new LSP7Mintable__factory(
        context.accounts[0]
      ).deploy("New LSP7 Token", "LSP7TKN", context.accounts[0].address, false);

      let lsp7TransferPayload = newLSP7Token.interface.encodeFunctionData(
        "transfer",
        [
          context.universalProfile.address,
          context.accounts[5].address,
          10,
          true, // sending to an EOA
          "0x",
        ]
      );

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          newLSP7Token.address,
          0,
          lsp7TransferPayload,
        ]);

      await expect(
        context.keyManager.connect(caller).execute(executePayload)
      ).toBeRevertedWith(
        NotAllowedAddressError(caller.address, newLSP7Token.address)
      );
    });

    it.skip("should be allowed to interact with the LSP7 contract in the allowed address", async () => {
      let lsp7TransferPayload = lsp7Token.interface.encodeFunctionData(
        "transfer",
        [
          context.universalProfile.address,
          context.accounts[5].address,
          10,
          true, // sending to an EOA
          "0x",
        ]
      );

      let executePayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          lsp7Token.address,
          0,
          lsp7TransferPayload,
        ]);
    });
  });
};
