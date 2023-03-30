import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EIP191Signer } from "@lukso/eip191-signer.js";

import {
  FallbackInitializer,
  FallbackInitializer__factory,
  FallbackRevert,
  FallbackRevert__factory,
  TargetContract,
  TargetContract__factory,
} from "../../../../types";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  LSP6_VERSION,
  OPERATION_TYPES,
  CALLTYPE,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { setupKeyManager } from "../../../utils/fixtures";

// helpers
import {
  abiCoder,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
} from "../../../utils/helpers";

export const shouldBehaveLikePermissionCall = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("when making an empty call via `ERC25X.execute(...)` -> (`data` = `0x`, `value` = 0)", () => {
    let addressCanMakeCallNoAllowedCalls: SignerWithAddress,
      addressCanMakeCallWithAllowedCalls: SignerWithAddress,
      addressCannotMakeCallNoAllowedCalls: SignerWithAddress,
      addressCannotMakeCallWithAllowedCalls: SignerWithAddress,
      addressWithSuperCall: SignerWithAddress;

    let allowedEOA: string;

    let allowedContractWithFallback: FallbackInitializer,
      allowedContractWithFallbackRevert: FallbackRevert;

    before(async () => {
      context = await buildContext();

      addressCannotMakeCallNoAllowedCalls = context.accounts[1];
      addressCannotMakeCallWithAllowedCalls = context.accounts[2];
      addressCanMakeCallNoAllowedCalls = context.accounts[3];
      addressCanMakeCallWithAllowedCalls = context.accounts[4];
      addressWithSuperCall = context.accounts[5];

      allowedEOA = context.accounts[6].address;

      allowedContractWithFallback = await new FallbackInitializer__factory(
        context.accounts[0]
      ).deploy();

      allowedContractWithFallbackRevert = await new FallbackRevert__factory(
        context.accounts[0]
      ).deploy();

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCannotMakeCallNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCannotMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanMakeCallNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressWithSuperCall.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          addressCannotMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
      ];

      const allowedCallsValues = combineAllowedCalls(
        [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
        [
          allowedEOA,
          allowedContractWithFallback.address,
          allowedContractWithFallbackRevert.address,
        ],
        ["0xffffffff", "0xffffffff", "0xffffffff"],
        ["0xffffffff", "0xffffffff", "0xffffffff"]
      );

      const permissionsValues = [
        PERMISSIONS.SIGN,
        PERMISSIONS.SIGN,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.SUPER_CALL,
        allowedCallsValues,
        allowedCallsValues,
      ];

      await setupKeyManager(context, permissionKeys, permissionsValues);
    });

    describe("when caller does not have permission CALL and no Allowed Calls", () => {
      it("should fail with `NotAuthorised` error when `to` is an EOA", async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallNoAllowedCalls)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetEOA,
              0,
              "0x"
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotMakeCallNoAllowedCalls.address, "CALL");
      });

      it("should fail with `NotAuthorised` error when `to` is a contract", async () => {
        const targetContract = await new TargetContract__factory(
          context.accounts[0]
        ).deploy();

        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, targetContract.address, 0, "0x"]
        );

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallNoAllowedCalls)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              "0x"
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotMakeCallNoAllowedCalls.address, "CALL");
      });
    });

    describe("when caller does not have permission CALL but have some Allowed Calls", () => {
      it("should fail with `NotAuthorised` error when `to` is an EOA", async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallWithAllowedCalls)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetEOA,
              0,
              "0x"
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotMakeCallWithAllowedCalls.address, "CALL");
      });

      it("should fail with `NotAuthorised` error when `to` is a contract", async () => {
        const targetContract = await new TargetContract__factory(
          context.accounts[0]
        ).deploy();

        await expect(
          context.universalProfile
            .connect(addressCannotMakeCallWithAllowedCalls)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              "0x"
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotMakeCallWithAllowedCalls.address, "CALL");
      });
    });

    describe("when caller has permission CALL, but no Allowed Calls", () => {
      it("should fail with `NoCallsAllowed` error when `to` is an EOA", async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await expect(
          context.universalProfile
            .connect(addressCanMakeCallNoAllowedCalls)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetEOA,
              0,
              "0x"
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NoCallsAllowed")
          .withArgs(addressCanMakeCallNoAllowedCalls.address);
      });

      it("should fail with `NoCallsAllowed` error when `to` is a contract", async () => {
        const targetContract = await new TargetContract__factory(
          context.accounts[0]
        ).deploy();

        await expect(
          context.universalProfile
            .connect(addressCanMakeCallNoAllowedCalls)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              "0x"
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NoCallsAllowed")
          .withArgs(addressCanMakeCallNoAllowedCalls.address);
      });
    });

    describe("when caller has permission CALL with some Allowed Calls", () => {
      describe("when `to` is an EOA", () => {
        describe("when `to` is NOT in the list of Allowed Calls", () => {
          it("should fail with `NotAllowedCall` error", async () => {
            const targetEOA = ethers.Wallet.createRandom().address;

            await expect(
              context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                ["execute(uint256,address,uint256,bytes)"](
                  OPERATION_TYPES.CALL,
                  targetEOA,
                  0,
                  "0x"
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAllowedCall"
              )
              .withArgs(
                addressCanMakeCallWithAllowedCalls.address,
                targetEOA,
                "0x00000000"
              );
          });
        });

        describe("when `to` is in the list of Allowed Calls", () => {
          it("should pass", async () => {
            await expect(
              context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                ["execute(uint256,address,uint256,bytes)"](
                  OPERATION_TYPES.CALL,
                  allowedEOA,
                  0,
                  "0x"
                )
            ).to.not.be.reverted;
          });
        });
      });

      describe("when `to` is a contract", () => {
        describe("when `to` is NOT in the list of Allowed Calls", () => {
          it("should fail with `NotAllowedCall` error", async () => {
            const targetContract = await new TargetContract__factory(
              context.accounts[0]
            ).deploy();

            await expect(
              context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                ["execute(uint256,address,uint256,bytes)"](
                  OPERATION_TYPES.CALL,
                  targetContract.address,
                  0,
                  "0x"
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAllowedCall"
              )
              .withArgs(
                addressCanMakeCallWithAllowedCalls.address,
                targetContract.address,
                "0x00000000"
              );
          });
        });

        describe("when `to` is in the list of Allowed Calls", () => {
          describe("if the `fallback()` function of `to` update some state", () => {
            it("should pass and update `to` contract's storage", async () => {
              await context.universalProfile
                .connect(addressCanMakeCallWithAllowedCalls)
                ["execute(uint256,address,uint256,bytes)"](
                  OPERATION_TYPES.CALL,
                  allowedContractWithFallback.address,
                  0,
                  "0x"
                );

              expect(await allowedContractWithFallback.caller()).to.equal(
                context.universalProfile.address
              );
            });
          });

          describe("if the `fallback()` function of `to` reverts", () => {
            it("should fail and bubble the error back to the Key Manager", async () => {
              await expect(
                context.universalProfile
                  .connect(addressCanMakeCallWithAllowedCalls)
                  ["execute(uint256,address,uint256,bytes)"](
                    OPERATION_TYPES.CALL,
                    allowedContractWithFallbackRevert.address,
                    0,
                    "0x"
                  )
              ).to.be.revertedWith("fallback reverted");
            });
          });
        });
      });
    });

    describe("when caller has permission SUPER_CALL", () => {
      it("should pass and allow to call an EOA", async () => {
        const targetEOA = ethers.Wallet.createRandom().address;

        await context.universalProfile
          .connect(addressWithSuperCall)
          ["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.CALL,
            targetEOA,
            0,
            "0x"
          );
      });

      describe("when `to` is a contract", () => {
        describe("if the `fallback()` function of `to` update some state", () => {
          it("should pass and update `to` contract's storage", async () => {
            const targetContractWithFallback =
              await new FallbackInitializer__factory(
                context.accounts[0]
              ).deploy();

            await context.universalProfile
              .connect(addressWithSuperCall)
              ["execute(uint256,address,uint256,bytes)"](
                OPERATION_TYPES.CALL,
                targetContractWithFallback.address,
                0,
                "0x"
              );

            expect(await targetContractWithFallback.caller()).to.equal(
              context.universalProfile.address
            );
          });
        });

        describe("if the `fallback()` function of `to` reverts", () => {
          it("should fail and bubble the error back to the Key Manager", async () => {
            const targetContractWithFallbackRevert =
              await new FallbackRevert__factory(context.accounts[0]).deploy();

            await expect(
              context.universalProfile
                .connect(addressWithSuperCall)
                ["execute(uint256,address,uint256,bytes)"](
                  OPERATION_TYPES.CALL,
                  targetContractWithFallbackRevert.address,
                  0,
                  "0x"
                )
            ).to.be.revertedWith("fallback reverted");
          });
        });
      });
    });
  });

  describe("when making a ERC25X.execute(...) call with some `data` payload", () => {
    let addressCanMakeCallNoAllowedCalls: SignerWithAddress,
      addressCanMakeCallWithAllowedCalls: SignerWithAddress,
      addressCannotMakeCall: SignerWithAddress;

    let targetContract: TargetContract;

    before(async () => {
      context = await buildContext();

      addressCanMakeCallNoAllowedCalls = context.accounts[1];
      addressCanMakeCallWithAllowedCalls = context.accounts[2];
      addressCannotMakeCall = context.accounts[3];

      targetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanMakeCallNoAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressCannotMakeCall.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          addressCanMakeCallWithAllowedCalls.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        PERMISSIONS.SETDATA,
        combineAllowedCalls(
          [CALLTYPE.CALL],
          [targetContract.address],
          ["0xffffffff"],
          ["0xffffffff"]
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionsValues);
    });

    describe("when the 'offset' of the `data` payload is not `0x00...80`", () => {
      it("should revert", async () => {
        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, targetContract.address, 0, "0xcafecafe"]
        );

        // edit the `data` offset
        payload = payload.replace(
          "0000000000000000000000000000000000000000000000000000000000000080",
          "0000000000000000000000000000000000000000000000000000000000000040"
        );

        await expect(
          addressCanMakeCallWithAllowedCalls.sendTransaction({
            to: context.universalProfile.address,
            data: payload,
          })
        )
          .to.be.revertedWithCustomError(context.keyManager, "InvalidPayload")
          .withArgs(payload);
      });
    });

    describe("when interacting via `execute(...)`", () => {
      describe("when caller has ALL PERMISSIONS", () => {
        it("should pass and change state at the target contract", async () => {
          let argument = "new name";

          let targetPayload = targetContract.interface.encodeFunctionData(
            "setName",
            [argument]
          );

          await context.universalProfile
            .connect(context.owner)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetPayload
            );

          const result = await targetContract.callStatic.getName();
          expect(result).to.equal(argument);
        });

        describe("when calling a function that returns some value", () => {
          it("should return the value to the Key Manager <- UP <- targetContract.getName()", async () => {
            let expectedName = await targetContract.callStatic.getName();

            let targetContractPayload =
              targetContract.interface.encodeFunctionData("getName");

            let result = await context.universalProfile
              .connect(context.owner)
              .callStatic["execute(uint256,address,uint256,bytes)"](
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContractPayload
              );

            let [decodedResult] = abiCoder.decode(["string"], result);
            expect(decodedResult).to.equal(expectedName);
          });

          it("Should return the value to the Key Manager <- UP <- targetContract.getNumber()", async () => {
            let expectedNumber = await targetContract.callStatic.getNumber();

            let targetContractPayload =
              targetContract.interface.encodeFunctionData("getNumber");

            let result = await context.universalProfile
              .connect(context.owner)
              .callStatic["execute(uint256,address,uint256,bytes)"](
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContractPayload
              );

            let [decodedResult] = abiCoder.decode(["uint256"], result);
            expect(decodedResult).to.equal(expectedNumber);
          });
        });

        describe("when calling a function that reverts", () => {
          it("should revert", async () => {
            let targetContractPayload =
              targetContract.interface.encodeFunctionData("revertCall");

            await expect(
              context.universalProfile[
                "execute(uint256,address,uint256,bytes)"
              ](
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetContractPayload
              )
            ).to.be.revertedWith(
              "TargetContract:revertCall: this function has reverted!"
            );
          });
        });
      });

      describe("when caller has permission CALL", () => {
        describe("when caller has no allowed calls set", () => {
          it("should revert with `NotAllowedCall(...)` error", async () => {
            let argument = "another name";

            let targetPayload = targetContract.interface.encodeFunctionData(
              "setName",
              [argument]
            );

            await expect(
              context.universalProfile
                .connect(addressCanMakeCallNoAllowedCalls)
                ["execute(uint256,address,uint256,bytes)"](
                  OPERATION_TYPES.CALL,
                  targetContract.address,
                  0,
                  targetPayload
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NoCallsAllowed"
              )
              .withArgs(addressCanMakeCallNoAllowedCalls.address);
          });
        });

        describe("when caller has some allowed calls set", () => {
          it("should pass and change state at the target contract", async () => {
            let argument = "another name";

            let targetPayload = targetContract.interface.encodeFunctionData(
              "setName",
              [argument]
            );

            await context.universalProfile
              .connect(addressCanMakeCallWithAllowedCalls)
              ["execute(uint256,address,uint256,bytes)"](
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetPayload
              );

            const result = await targetContract.callStatic.getName();
            expect(result).to.equal(argument);
          });
        });
      });

      describe("when caller does not have permission CALL", () => {
        it("should revert", async () => {
          let argument = "another name";

          let targetPayload = targetContract.interface.encodeFunctionData(
            "setName",
            [argument]
          );

          await expect(
            context.universalProfile
              .connect(addressCannotMakeCall)
              ["execute(uint256,address,uint256,bytes)"](
                OPERATION_TYPES.CALL,
                targetContract.address,
                0,
                targetPayload
              )
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(addressCannotMakeCall.address, "CALL");
        });
      });
    });
  });
};
