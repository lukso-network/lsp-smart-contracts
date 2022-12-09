import { expect } from "chai";
import { ethers } from "hardhat";

//types
import { BytesLike } from "ethers";
import {
  RelaySingleReentrancy__factory,
  UniversalProfile__factory,
} from "../../../../types";

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
  generateSingleRelayPayload,
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
          reentrancyContext.reentrantSigner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          reentrancyContext.reentrantSigner.address.substring(2),
      ];

      permissionValues = [
        testCase.permissions,
        (testCase as TransferValueTestCase).allowedCalls
          ? combineAllowedCalls(
              ["0xffffffff"],
              [reentrancyContext.singleReentarncyRelayer.address],
              ["0xffffffff"]
            )
          : "0x",
      ];
      break;
    }
    case "SETDATA": {
      permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          reentrancyContext.reentrantSigner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          reentrancyContext.reentrantSigner.address.substring(2),
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
          reentrancyContext.reentrantSigner.address.substring(2),
      ];

      permissionValues = [testCase.permissions];
      break;
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

const testNotAuthorisedErrorCase = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase | SimplePermissionTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext,
  executePayload: BytesLike
) => {
  await generateSingleRelayPayload(
    reentrancyContext.singleReentarncyRelayer,
    context.universalProfile,
    context.keyManager,
    reentrancyContext.reentrantSigner,
    payloadType,
    reentrancyContext.newControllerAddress,
    reentrancyContext.newURDAddress
  );

  await expect(
    context.keyManager
      .connect(reentrancyContext.caller)
      ["execute(bytes)"](executePayload)
  )
    .to.be.revertedWithCustomError(context.keyManager, testCase.customErrorName)
    .withArgs(
      reentrancyContext.reentrantSigner.address,
      testCase.customErrorArgs.permission
    );
};

const testEmptyCustomErrorCase = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext,
  executePayload: BytesLike
) => {
  await generateSingleRelayPayload(
    reentrancyContext.singleReentarncyRelayer,
    context.universalProfile,
    context.keyManager,
    reentrancyContext.reentrantSigner,
    payloadType,
    reentrancyContext.newControllerAddress,
    reentrancyContext.newURDAddress
  );

  await expect(
    context.keyManager
      .connect(reentrancyContext.caller)
      ["execute(bytes)"](executePayload)
  ).to.be.revertedWithCustomError(context.keyManager, testCase.customErrorName);
};

const testValidCase = async (
  payloadType: string,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext,
  executePayload: BytesLike
) => {
  await generateSingleRelayPayload(
    reentrancyContext.singleReentarncyRelayer,
    context.universalProfile,
    context.keyManager,
    reentrancyContext.reentrantSigner,
    payloadType,
    reentrancyContext.newControllerAddress,
    reentrancyContext.newURDAddress
  );

  switch (payloadType) {
    case "TRANSFERVALUE": {
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
          reentrancyContext.singleReentarncyRelayer.address
        )
      ).to.equal(ethers.utils.parseEther("1"));
      break;
    }
    case "SETDATA": {
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
      break;
    }
    case "ADDPERMISSIONS": {
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
      break;
    }
    case "CHANGEPERMISSIONS": {
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
      break;
    }
    case "ADDUNIVERSALRECEIVERDELEGATE": {
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
      break;
    }
    case "CHANGEUNIVERSALRECEIVERDELEGATE": {
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
      break;
    }
  }
};

const testCasesByType = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase | SimplePermissionTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext,
  executePayload: BytesLike
) => {
  await loadTestCase(payloadType, testCase, context, reentrancyContext);

  if (testCase.customErrorName == "NotAuthorised")
    await testNotAuthorisedErrorCase(
      payloadType,
      testCase,
      context,
      reentrancyContext,
      executePayload
    );
  else if (
    testCase.customErrorName == "NoCallsAllowed" ||
    testCase.customErrorName == "NoERC725YDataKeysAllowed"
  )
    switch (payloadType) {
      case "TRANSFERVALUE": {
        await testEmptyCustomErrorCase(
          payloadType,
          testCase as TransferValueTestCase,
          context,
          reentrancyContext,
          executePayload
        );
        break;
      }
      case "SETDATA": {
        await testEmptyCustomErrorCase(
          payloadType,
          testCase as SetDataTestCase,
          context,
          reentrancyContext,
          executePayload
        );
        break;
      }
    }
  else if (testCase.customErrorName == "")
    await testValidCase(
      payloadType,
      context,
      reentrancyContext,
      executePayload
    );
};

export const testSingleExecuteToSingleExecuteRelayCall = (
  buildContext: () => Promise<LSP6TestContext>,
  buildReentrancyContext: (
    context: LSP6TestContext
  ) => Promise<ReentrancyContext>
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;
  let executePayload: BytesLike;

  before(async () => {
    context = await buildContext();
    reentrancyContext = await buildReentrancyContext(context);

    const reentrantCallPayload =
      new RelaySingleReentrancy__factory().interface.encodeFunctionData(
        "universalReceiver",
        [
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
          "0x",
        ]
      );
    executePayload =
      new UniversalProfile__factory().interface.encodeFunctionData(
        "execute(uint256,address,uint256,bytes)",
        [
          0,
          reentrancyContext.singleReentarncyRelayer.address,
          0,
          reentrantCallPayload,
        ]
      );
  });

  describe("when reentering and transferring value", () => {
    transferValueTestCases.forEach((testCase) => {
      it(`${testCase.testDescription}`, async () => {
        await testCasesByType(
          "TRANSFERVALUE",
          testCase,
          context,
          reentrancyContext,
          executePayload
        );
      });
    });
  });

  describe("when reentering and setting data", () => {
    setDataTestCases.forEach((testCase) => {
      it(`${testCase.testDescription}`, async () => {
        await testCasesByType(
          "SETDATA",
          testCase,
          context,
          reentrancyContext,
          executePayload
        );
      });
    });
  });

  describe("when reentering and adding permissions", () => {
    addPermissionsTestCases.forEach((testCase) => {
      it(`${testCase.testDescription}`, async () => {
        await testCasesByType(
          "ADDPERMISSIONS",
          testCase,
          context,
          reentrancyContext,
          executePayload
        );
      });
    });
  });

  describe("when reentering and changing permissions", () => {
    changePermissionsTestCases.forEach((testCase) => {
      it(`${testCase.testDescription}`, async () => {
        await testCasesByType(
          "CHANGEPERMISSIONS",
          testCase,
          context,
          reentrancyContext,
          executePayload
        );
      });
    });
  });

  describe("when reentering and adding URD", () => {
    addUniversalReceiverDelegateTestCases.forEach((testCase) => {
      it(`${testCase.testDescription}`, async () => {
        await testCasesByType(
          "ADDUNIVERSALRECEIVERDELEGATE",
          testCase,
          context,
          reentrancyContext,
          executePayload
        );
      });
    });
  });

  describe("when reentering and changing URD", () => {
    changeUniversalReceiverDelegateTestCases.forEach((testCase) => {
      it(`${testCase.testDescription}`, async () => {
        await testCasesByType(
          "CHANGEUNIVERSALRECEIVERDELEGATE",
          testCase,
          context,
          reentrancyContext,
          executePayload
        );
      });
    });
  });

  after(async () => {
    await reentrancyContext.owner.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther("1"),
    });
  });
};
