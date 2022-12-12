import { expect } from "chai";
import { ethers } from "hardhat";

//types
import { BytesLike } from "ethers";
import { UniversalProfile__factory } from "../../../../types";

// constants
import { ERC725YDataKeys } from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";

// helpers
import {
  encodeCompactBytesArray,
  combineAllowedCalls,
} from "../../../utils/helpers";
import {
  // Types
  TransferValueTestCase,
  SetDataTestCase,
  SimplePermissionTestCase,
  ReentrancyContext,
  // Test cases
  transferValueTestCases,
  setDataTestCases,
  addPermissionsTestCases,
  changePermissionsTestCases,
  addUniversalReceiverDelegateTestCases,
  changeUniversalReceiverDelegateTestCases,
  generateExecutePayload,
} from "./reentrancyHelpers";

const loadTestCase = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase | SimplePermissionTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext
) => {
  let permissionKeys: BytesLike[];
  let permissionValues: BytesLike[];

  switch (payloadType) {
    case "TRANSFERVALUE": {
      permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          reentrancyContext.reentrantContract.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          reentrancyContext.reentrantContract.address.substring(2),
      ];

      permissionValues = [
        testCase.permissions,
        (testCase as TransferValueTestCase).allowedCalls
          ? combineAllowedCalls(
              ["0xffffffff"],
              [reentrancyContext.reentrantContract.address],
              ["0xffffffff"]
            )
          : "0x",
      ];
      break;
    }
    case "SETDATA": {
      permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          reentrancyContext.reentrantContract.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          reentrancyContext.reentrantContract.address.substring(2),
      ];

      permissionValues = [
        testCase.permissions,
        (testCase as SetDataTestCase).allowedERC725YDataKeys
          ? encodeCompactBytesArray([
              ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
              ),
            ])
          : "0x",
      ];
      break;
    }
    default: {
      permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          reentrancyContext.reentrantContract.address.substring(2),
      ];

      permissionValues = [testCase.permissions];
    }
  }

  const permissionsPayload =
    new UniversalProfile__factory().interface.encodeFunctionData(
      "setData(bytes32[],bytes[])",
      [permissionKeys, permissionValues]
    );
  await context.keyManager
    .connect(reentrancyContext.owner)
    ["execute(bytes)"](permissionsPayload);
};

export const testSingleExecuteToSingleExecute = (
  buildContext: () => Promise<LSP6TestContext>,
  buildReentrancyContext: (
    context: LSP6TestContext
  ) => Promise<ReentrancyContext>
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;

  before(async () => {
    context = await buildContext();
    reentrancyContext = await buildReentrancyContext(context);
  });

  describe("when reentering and transferring value", () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        context.keyManager.address,
        reentrancyContext.reentrantContract.address,
        "TRANSFERVALUE"
      );
    });

    transferValueTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permissions: ${testCase.permissionsText}`, async () => {
        await loadTestCase(
          "TRANSFERVALUE",
          testCase,
          context,
          reentrancyContext
        );

        await expect(
          context.keyManager
            .connect(reentrancyContext.caller)
            ["execute(bytes)"](executePayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(
            reentrancyContext.reentrantContract.address,
            testCase.missingPermission
          );
      });
    });

    it("should revert if the reentrant contract has the following permissions: REENTRANCY, TRANSFERVALUE & NO AllowedCalls", async () => {
      await loadTestCase(
        "TRANSFERVALUE",
        transferValueTestCases.NoCallsAllowed,
        context,
        reentrancyContext
      );

      await expect(
        context.keyManager
          .connect(reentrancyContext.caller)
          ["execute(bytes)"](executePayload)
      ).to.be.revertedWithCustomError(context.keyManager, "NoCallsAllowed");
    });

    it("should pass if the reentrant contract has the following permissions: REENTRANCY, TRANSFERVALUE & AllowedCalls", async () => {
      await loadTestCase(
        "TRANSFERVALUE",
        transferValueTestCases.ValidCase,
        context,
        reentrancyContext
      );

      expect(
        await context.universalProfile.provider.getBalance(
          context.universalProfile.address
        )
      ).to.equal(ethers.utils.parseEther("10"));

      await context.keyManager
        .connect(reentrancyContext.caller)
        ["execute(bytes)"](executePayload);

      expect(
        await context.universalProfile.provider.getBalance(
          context.universalProfile.address
        )
      ).to.equal(ethers.utils.parseEther("9"));

      expect(
        await context.universalProfile.provider.getBalance(
          reentrancyContext.reentrantContract.address
        )
      ).to.equal(ethers.utils.parseEther("1"));
    });
  });

  describe("when reentering and setting data", () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        context.keyManager.address,
        reentrancyContext.reentrantContract.address,
        "SETDATA"
      );
    });

    setDataTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permissions: ${testCase.permissionsText}`, async () => {
        await loadTestCase("SETDATA", testCase, context, reentrancyContext);

        await expect(
          context.keyManager
            .connect(reentrancyContext.caller)
            ["execute(bytes)"](executePayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(
            reentrancyContext.reentrantContract.address,
            testCase.missingPermission
          );
      });
    });

    it("should revert if the reentrant contract has the following permissions: REENTRANCY, SETDATA & NO AllowedERC725YDataKeys", async () => {
      await loadTestCase(
        "SETDATA",
        setDataTestCases.NoERC725YDataKeysAllowed,
        context,
        reentrancyContext
      );

      await expect(
        context.keyManager
          .connect(reentrancyContext.caller)
          ["execute(bytes)"](executePayload)
      ).to.be.revertedWithCustomError(
        context.keyManager,
        "NoERC725YDataKeysAllowed"
      );
    });

    it("should pass if the reentrant contract has the following permissions: REENTRANCY, SETDATA & AllowedERC725YDataKeys", async () => {
      await loadTestCase(
        "SETDATA",
        setDataTestCases.ValidCase,
        context,
        reentrancyContext
      );

      await context.keyManager
        .connect(reentrancyContext.caller)
        ["execute(bytes)"](executePayload);

      const hardcodedKey = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
      );
      const hardcodedValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
      );

      expect(
        await context.universalProfile["getData(bytes32)"](hardcodedKey)
      ).to.equal(hardcodedValue);
    });
  });

  describe("when reentering and adding permissions", () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        context.keyManager.address,
        reentrancyContext.reentrantContract.address,
        "ADDPERMISSIONS"
      );
    });

    addPermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permissions: ${testCase.permissionsText}`, async () => {
        await loadTestCase(
          "ADDPERMISSIONS",
          testCase,
          context,
          reentrancyContext
        );

        await expect(
          context.keyManager
            .connect(reentrancyContext.caller)
            ["execute(bytes)"](executePayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(
            reentrancyContext.reentrantContract.address,
            testCase.missingPermission
          );
      });
    });

    it("should pass if the reentrant contract has the following permissions: REENTRANCY, ADDPERMISSIONS", async () => {
      await loadTestCase(
        "ADDPERMISSIONS",
        addPermissionsTestCases.ValidCase,
        context,
        reentrancyContext
      );

      await context.keyManager
        .connect(reentrancyContext.caller)
        ["execute(bytes)"](executePayload);

      const hardcodedPermissionKey =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        reentrancyContext.newControllerAddress.substring(2);
      const hardcodedPermissionValue =
        "0x0000000000000000000000000000000000000000000000000000000000000010";

      expect(
        await context.universalProfile["getData(bytes32)"](
          hardcodedPermissionKey
        )
      ).to.equal(hardcodedPermissionValue);
    });
  });

  describe("when reentering and changing permissions", () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        context.keyManager.address,
        reentrancyContext.reentrantContract.address,
        "CHANGEPERMISSIONS"
      );
    });

    changePermissionsTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permissions: ${testCase.permissionsText}`, async () => {
        await loadTestCase(
          "CHANGEPERMISSIONS",
          testCase,
          context,
          reentrancyContext
        );

        await expect(
          context.keyManager
            .connect(reentrancyContext.caller)
            ["execute(bytes)"](executePayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(
            reentrancyContext.reentrantContract.address,
            testCase.missingPermission
          );
      });
    });

    it("should pass if the reentrant contract has the following permissions: REENTRANCY, CHANGEPERMISSIONS", async () => {
      await loadTestCase(
        "CHANGEPERMISSIONS",
        changePermissionsTestCases.ValidCase,
        context,
        reentrancyContext
      );

      await context.keyManager
        .connect(reentrancyContext.caller)
        ["execute(bytes)"](executePayload);

      const hardcodedPermissionKey =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        reentrancyContext.newControllerAddress.substring(2);
      const hardcodedPermissionValue = "0x";

      expect(
        await context.universalProfile["getData(bytes32)"](
          hardcodedPermissionKey
        )
      ).to.equal(hardcodedPermissionValue);
    });
  });

  describe("when reentering and adding URD", () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        context.keyManager.address,
        reentrancyContext.reentrantContract.address,
        "ADDUNIVERSALRECEIVERDELEGATE"
      );
    });

    addUniversalReceiverDelegateTestCases.NotAuthorised.forEach((testCase) => {
      it(`should revert if the reentrant contract has the following permissions: ${testCase.permissionsText}`, async () => {
        await loadTestCase(
          "ADDUNIVERSALRECEIVERDELEGATE",
          testCase,
          context,
          reentrancyContext
        );

        await expect(
          context.keyManager
            .connect(reentrancyContext.caller)
            ["execute(bytes)"](executePayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(
            reentrancyContext.reentrantContract.address,
            testCase.missingPermission
          );
      });
    });

    it("should pass if the reentrant contract has the following permissions: REENTRANCY, ADDUNIVERSALRECEIVERDELEGATE", async () => {
      await loadTestCase(
        "ADDUNIVERSALRECEIVERDELEGATE",
        addUniversalReceiverDelegateTestCases.ValidCase,
        context,
        reentrancyContext
      );

      await context.keyManager
        .connect(reentrancyContext.caller)
        ["execute(bytes)"](executePayload);

      const hardcodedLSP1Key =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        reentrancyContext.randomLSP1TypeId.substring(2, 42);

      const hardcodedLSP1Value = reentrancyContext.newURDAddress;

      expect(
        await context.universalProfile["getData(bytes32)"](hardcodedLSP1Key)
      ).to.equal(hardcodedLSP1Value.toLowerCase());
    });
  });

  describe("when reentering and changing URD", () => {
    let executePayload: BytesLike;
    before(async () => {
      executePayload = generateExecutePayload(
        context.keyManager.address,
        reentrancyContext.reentrantContract.address,
        "CHANGEUNIVERSALRECEIVERDELEGATE"
      );
    });

    changeUniversalReceiverDelegateTestCases.NotAuthorised.forEach(
      (testCase) => {
        it(`should revert if the reentrant contract has the following permissions: ${testCase.permissionsText}`, async () => {
          await loadTestCase(
            "CHANGEUNIVERSALRECEIVERDELEGATE",
            testCase,
            context,
            reentrancyContext
          );

          await expect(
            context.keyManager
              .connect(reentrancyContext.caller)
              ["execute(bytes)"](executePayload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(
              reentrancyContext.reentrantContract.address,
              testCase.missingPermission
            );
        });
      }
    );

    it("should pass if the reentrant contract has the following permissions: REENTRANCY, CHANGEUNIVERSALRECEIVERDELEGATE", async () => {
      await loadTestCase(
        "CHANGEUNIVERSALRECEIVERDELEGATE",
        changeUniversalReceiverDelegateTestCases.ValidCase,
        context,
        reentrancyContext
      );

      await context.keyManager
        .connect(reentrancyContext.caller)
        ["execute(bytes)"](executePayload);

      const hardcodedLSP1Key =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        reentrancyContext.randomLSP1TypeId.substring(2, 42);

      const hardcodedLSP1Value = "0x";

      expect(
        await context.universalProfile["getData(bytes32)"](hardcodedLSP1Key)
      ).to.equal(hardcodedLSP1Value.toLowerCase());
    });
  });

  after(async () => {
    await reentrancyContext.owner.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther("1"),
    });
  });
};
