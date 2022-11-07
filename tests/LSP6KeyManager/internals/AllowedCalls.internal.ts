import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YKeys,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6InternalsTestContext } from "../../utils/context";
import { setupKeyManagerHelper } from "../../utils/fixtures";

// helpers
import { combinePermissions, combineAllowedCalls } from "../../utils/helpers";

export const testAllowedCallsInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  let context: LSP6InternalsTestContext;

  describe("testing 2 x addresses encoded as LSP2 CompactBytesArray under `AllowedCalls`", () => {
    let canCallOnlyTwoAddresses: SignerWithAddress;

    let allowedEOA: SignerWithAddress,
      notAllowedEOA: SignerWithAddress,
      allowedTargetContract: TargetContract,
      notAllowedTargetContract: TargetContract;

    let encodedAllowedCalls: string;

    beforeEach(async () => {
      context = await buildContext();

      canCallOnlyTwoAddresses = context.accounts[1];
      allowedEOA = context.accounts[2];
      notAllowedEOA = context.accounts[3];

      allowedTargetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      notAllowedTargetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      encodedAllowedCalls = combineAllowedCalls(
        ["0xffffffff", "0xffffffff"],
        [allowedEOA.address, allowedTargetContract.address],
        ["0xffffffff", "0xffffffff"]
      );

      let permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canCallOnlyTwoAddresses.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          canCallOnlyTwoAddresses.address.substring(2),
      ];

      let permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        encodedAllowedCalls,
      ];

      await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
    });

    describe("`getAllowedCallsFor(...)`", () => {
      it("should return the list of allowed calls", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedCallsFor(
            canCallOnlyTwoAddresses.address
          );

        expect(bytesResult).to.equal(encodedAllowedCalls);
      });

      it("should return no bytes when no allowed calls were set", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedCallsFor(
            context.owner.address
          );
        expect(bytesResult).to.equal("0x");

        let resultFromAccount = await context.universalProfile[
          "getData(bytes32)"
        ](
          ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
            context.owner.address.substring(2)
        );
        expect(resultFromAccount).to.equal("0x");
      });
    });

    describe("`verifyAllowedCall(...)`", () => {
      it("should not revert when payload = send 1 LYX to an address listed in allowed calls list", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            allowedEOA.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            canCallOnlyTwoAddresses.address,
            payload
          )
        ).to.not.be.reverted;

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            canCallOnlyTwoAddresses.address,
            payload
          )
        ).to.not.be.reverted;
      });

      it("should revert when payload = send 1 LYX to an address not listed in allowed calls list", async () => {
        let disallowedAddress = ethers.utils.getAddress(
          "0xdeadbeefdeadbeefdeaddeadbeefdeadbeefdead"
        );

        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            disallowedAddress,
            ethers.utils.parseEther("1"),
            "0x",
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            canCallOnlyTwoAddresses.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            canCallOnlyTwoAddresses.address,
            disallowedAddress,
            "0x00000000"
          );
      });

      it("should not revert when payload = send 1 LYX, and caller has no bytes stored under AllowedCalls (= all addresses whitelisted)", async () => {
        let randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            randomAddress,
            ethers.utils.parseEther("1"),
            "0x",
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            context.owner.address,
            payload
          )
        ).to.not.be.reverted;
      });
    });
  });

  describe("testing 'zero bytes' stored under AddressPermission:AllowedCalls:<address>", () => {
    type ControllersContext = {
      noBytes: SignerWithAddress;
      oneZeroByte: SignerWithAddress;
      tenZeroBytes: SignerWithAddress;
      twentyZeroBytes: SignerWithAddress;
      thirtyTwoZeroBytes: SignerWithAddress;
      fourtyZeroBytes: SignerWithAddress;
      sixtyFourZeroBytes: SignerWithAddress;
      hundredZeroBytes: SignerWithAddress;
    };

    const zeroBytesValues = [
      "0x",
      "0x" + "00".repeat(1),
      "0x" + "00".repeat(10),
      "0x" + "00".repeat(20),
      "0x" + "00".repeat(32),
      "0x" + "00".repeat(40),
      "0x" + "00".repeat(64),
      "0x" + "00".repeat(100),
    ];

    let controller: ControllersContext;

    before(async () => {
      context = await buildContext();

      controller = {
        noBytes: context.accounts[1],
        oneZeroByte: context.accounts[2],
        tenZeroBytes: context.accounts[3],
        twentyZeroBytes: context.accounts[4],
        thirtyTwoZeroBytes: context.accounts[5],
        fourtyZeroBytes: context.accounts[6],
        sixtyFourZeroBytes: context.accounts[7],
        hundredZeroBytes: context.accounts[8],
      };

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ...Object.values(controller).map(
          (controller) =>
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            controller.address.substring(2)
        ),
        ...Object.values(controller).map(
          (controller) =>
            ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
            controller.address.substring(2)
        ),
      ];

      let permissionValues = [ALL_PERMISSIONS];

      for (let ii = 0; ii < Object.values(controller).length; ii++) {
        permissionValues.push(
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE)
        );
      }

      permissionValues = permissionValues.concat(zeroBytesValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedCall(...)`", () => {
      const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();
      const randomData = "0xaabbccdd";

      let payload: string;

      beforeEach(async () => {
        payload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            randomAddress,
            ethers.utils.parseEther("1"),
            randomData,
          ]
        );
      });

      describe("should not revert and consider the stored value as any call (standards + address + function) whitelisted for:", () => {
        it(`noBytes -> ${zeroBytesValues[0]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.noBytes.address,
              payload
            )
          ).to.not.be.reverted;
        });

        it(`oneZeroByte -> ${zeroBytesValues[1]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.oneZeroByte.address,
              payload
            )
          ).to.not.be.reverted;
        });

        it(`tenZeroBytes -> ${zeroBytesValues[2]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.tenZeroBytes.address,
              payload
            )
          ).to.not.be.reverted;
        });

        it(`twentyZeroBytes -> ${zeroBytesValues[3]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.twentyZeroBytes.address,
              payload
            )
          ).to.not.be.reverted;
        });
      });

      /**
       * TODO: define the new behaviour when some empty zero bytes 0x00 are stored under `AddressPermissions:AllowedCalls:<address>`
       */
      describe("should revert with NotAllowedCall(...) error for:", () => {
        it.skip(`thirtyTwoZeroBytes -> ${zeroBytesValues[4]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.thirtyTwoZeroBytes.address,
              payload
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              controller.thirtyTwoZeroBytes.address,
              ethers.utils.getAddress(randomAddress),
              randomData
            );
        });

        it.skip(`fourtyZeroBytes -> ${zeroBytesValues[5]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.fourtyZeroBytes.address,
              randomAddress
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              controller.fourtyZeroBytes.address,
              ethers.utils.getAddress(randomAddress),
              randomData
            );
        });

        it.skip(`sixtyFourZeroBytes -> ${zeroBytesValues[6]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.sixtyFourZeroBytes.address,
              randomAddress
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedAddress"
            )
            .withArgs(
              controller.sixtyFourZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            );
        });

        it.skip(`hundredZeroBytes -> ${zeroBytesValues[7]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.hundredZeroBytes.address,
              randomAddress
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedAddress"
            )
            .withArgs(
              controller.hundredZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            );
        });
      });
    });
  });

  describe("testing random values under the key `AddressPermissions:AllowedCalls:<address>`", () => {
    type ControllersContext = {
      multipleOf29Bytes: SignerWithAddress;
      shortBytes: SignerWithAddress;
      longBytes: SignerWithAddress;
    };

    const randomValues = [
      "0x1c000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000",
      "0xaabbccdd",
      "0x1234567890abcdef1234567890abcdef",
    ];

    const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();
    const randomData = "0xaabbccdd";

    let payload: string;
    let controller: ControllersContext;

    before(async () => {
      context = await buildContext();

      payload = context.universalProfile.interface.encodeFunctionData(
        "execute(uint256,address,uint256,bytes)",
        [
          OPERATION_TYPES.CALL,
          randomAddress,
          ethers.utils.parseEther("1"),
          randomData,
        ]
      );

      controller = {
        multipleOf29Bytes: context.accounts[1],
        shortBytes: context.accounts[2],
        longBytes: context.accounts[3],
      };

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.multipleOf29Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.shortBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.longBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          controller.multipleOf29Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          controller.shortBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          controller.longBytes.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      ];

      permissionValues = permissionValues.concat(randomValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedCall(...)`", () => {
      describe("should revert with NotAllowedCall(...) error for:", () => {
        it(`multipleOf29Bytes -> ${randomValues[2]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.multipleOf29Bytes.address,
              payload
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              controller.multipleOf29Bytes.address,
              ethers.utils.getAddress(randomAddress),
              randomData
            );
        });
      });

      describe("should not revert and consider the incorrectly stored value as all calls (standards + address + functions) whitelisted for:", () => {
        it(`shortBytes -> ${randomValues[3]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedCall(
            controller.shortBytes.address,
            payload
          );
        });

        it(`longBytes -> ${randomValues[4]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedCall(
            controller.longBytes.address,
            randomAddress
          );
        });
      });
    });
  });
};
