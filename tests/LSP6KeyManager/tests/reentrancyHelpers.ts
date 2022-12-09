import { expect } from "chai";
import { ethers } from "hardhat";

//types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BytesLike, Wallet } from "ethers";
import {
  ReentrantContract__factory,
  ReentrantContract,
  UniversalProfile__factory,
} from "../../../types";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";

// helpers
import {
  encodeCompactBytesArray,
  combinePermissions,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
} from "../../utils/helpers";

// Complex permission as it has AllowedCalls
export type TransferValueTestCase = {
  testDescription: string;
  permissions: string;
  allowedCalls: boolean;
  customErrorName: string;
  customErrorArgs: {
    permission: string;
  };
};

// Complex permission as it has AllowedERC725YDataKeys
export type SetDataTestCase = {
  testDescription: string;
  permissions: string;
  allowedERC725YDataKeys: boolean;
  customErrorName: string;
  customErrorArgs: {
    permission: string;
  };
};

//Other permissions, e.g.: ADDPERMISSIONS, CHANGEPERMISSIONS, ADDUNIVERSALRECEIVERDELEGATE, CHANGEUNIVERSALRECEIVERDELEGATE
export type SimplePermissionTestCase = {
  testDescription: string;
  permissions: string;
  customErrorName: string;
  customErrorArgs: {
    permission: string;
  };
};

export type ReentrancyContext = {
  owner: SignerWithAddress;
  caller: SignerWithAddress;
  signer: Wallet;
  reentrantContract: ReentrantContract;
  randomLSP1TypeId: string;
};

export const buildReentrancyContext = async (context: LSP6TestContext) => {
  const owner = context.accounts[7];
  const caller = context.accounts[8];
  const signer = new ethers.Wallet(LOCAL_PRIVATE_KEYS.ACCOUNT7);

  const reentrantContract = await await new ReentrantContract__factory(
    owner
  ).deploy(
    context.accounts[9].address,
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomLSP1TypeId")),
    context.accounts[9].address
  );

  const permissionKeys = [
    ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
      owner.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
      caller.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
      caller.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
      signer.address.substring(2),
  ];

  const permissionValues = [
    ALL_PERMISSIONS,
    PERMISSIONS.CALL,
    combineAllowedCalls(
      ["0xffffffff"],
      [reentrantContract.address],
      ["0xffffffff"]
    ),
    PERMISSIONS.CALL,
  ];

  await context.universalProfile
    .connect(context.accounts[0])
    ["setData(bytes32[],bytes[])"](permissionKeys, permissionValues);

  await context.universalProfile
    .connect(context.accounts[0])
    .transferOwnership(context.keyManager.address);

  const acceptOwnershipPayload =
    context.universalProfile.interface.encodeFunctionData("acceptOwnership");
  await context.keyManager
    .connect(owner)
    ["execute(bytes)"](acceptOwnershipPayload);

  // Fund Universal Profile with some LYXe
  await owner.sendTransaction({
    to: context.universalProfile.address,
    value: ethers.utils.parseEther("10"),
  });

  const randomLSP1TypeId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("RandomLSP1TypeId")
  );

  return {
    owner,
    caller,
    signer,
    reentrantContract,
    randomLSP1TypeId,
  };
};

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

const testNotAuthorisedErrorCase = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase | SimplePermissionTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext
) => {
  const reentrantPayload =
    new ReentrantContract__factory().interface.encodeFunctionData(
      "callThatReenters",
      [context.keyManager.address, payloadType]
    );

  const executePayload =
    new UniversalProfile__factory().interface.encodeFunctionData(
      "execute(uint256,address,uint256,bytes)",
      [0, reentrancyContext.reentrantContract.address, 0, reentrantPayload]
    );

  await expect(
    context.keyManager
      .connect(reentrancyContext.caller)
      ["execute(bytes)"](executePayload)
  )
    .to.be.revertedWithCustomError(context.keyManager, testCase.customErrorName)
    .withArgs(
      reentrancyContext.reentrantContract.address,
      testCase.customErrorArgs.permission
    );
};

const testEmptyCustomErrorCase = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext
) => {
  const reentrantPayload =
    new ReentrantContract__factory().interface.encodeFunctionData(
      "callThatReenters",
      [context.keyManager.address, payloadType]
    );

  const executePayload =
    new UniversalProfile__factory().interface.encodeFunctionData(
      "execute(uint256,address,uint256,bytes)",
      [0, reentrancyContext.reentrantContract.address, 0, reentrantPayload]
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
  reentrancyContext: ReentrancyContext
) => {
  const reentrantPayload =
    new ReentrantContract__factory().interface.encodeFunctionData(
      "callThatReenters",
      [context.keyManager.address, payloadType]
    );

  const executePayload =
    new UniversalProfile__factory().interface.encodeFunctionData(
      "execute(uint256,address,uint256,bytes)",
      [0, reentrancyContext.reentrantContract.address, 0, reentrantPayload]
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
          reentrancyContext.reentrantContract.address
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
        context.accounts[9].address.substring(2);
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
        context.accounts[9].address.substring(2);
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

      const hardcodedLSP1Value = context.accounts[9].address;

      expect(
        await context.universalProfile["getData(bytes32)"](hardcodedLSP1Key)
      ).to.equal(hardcodedLSP1Value);
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
      ).to.equal(hardcodedLSP1Value);
      break;
    }
  }
};

export const testCasesByType = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase | SimplePermissionTestCase,
  context: LSP6TestContext,
  reentrancyContext: ReentrancyContext
) => {
  await loadTestCase(payloadType, testCase, context, reentrancyContext);

  if (testCase.customErrorName == "NotAuthorised")
    await testNotAuthorisedErrorCase(
      payloadType,
      testCase,
      context,
      reentrancyContext
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
          reentrancyContext
        );
        break;
      }
      case "SETDATA": {
        await testEmptyCustomErrorCase(
          payloadType,
          testCase as SetDataTestCase,
          context,
          reentrancyContext
        );
        break;
      }
    }
  else if (testCase.customErrorName == "")
    await testValidCase(payloadType, context, reentrancyContext);
};

export const transferValueTestCases: TransferValueTestCase[] = [
  {
    testDescription:
      "should revert if the reentrant contract has NO PERMISSIONS",
    permissions: "0x",
    allowedCalls: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ALL_PERMISSIONS but REENTRANCY",
    permissions: ALL_PERMISSIONS,
    allowedCalls: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY REENTRANCY permission with NO AllowedCalls",
    permissions: PERMISSIONS.REENTRANCY,
    allowedCalls: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "TRANSFERVALUE",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY REENTRANCY permission with AllowedCalls",
    permissions: PERMISSIONS.REENTRANCY,
    allowedCalls: true,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "TRANSFERVALUE",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY TRANSFERVALUE permission with NO AllowedCalls",
    permissions: PERMISSIONS.TRANSFERVALUE,
    allowedCalls: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY TRANSFERVALUE permission with AllowedCalls",
    permissions: PERMISSIONS.TRANSFERVALUE,
    allowedCalls: true,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY TRANSFERVALUE and REENTRANCY permissions with NO AllowedCalls",
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.TRANSFERVALUE
    ),
    allowedCalls: false,
    customErrorName: "NoCallsAllowed",
    customErrorArgs: {
      permission: "",
    },
  },
  {
    testDescription:
      "should pass if the reentrant contract has ONLY TRANSFERVALUE and REENTRANCY permissions with AllowedCalls",
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.TRANSFERVALUE
    ),
    allowedCalls: true,
    customErrorName: "",
    customErrorArgs: {
      permission: "",
    },
  },
];

export const setDataTestCases: SetDataTestCase[] = [
  {
    testDescription:
      "should revert if the reentrant contract has NO PERMISSIONS",
    permissions: "0x",
    allowedERC725YDataKeys: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ALL_PERMISSIONS but REENTRANCY",
    permissions: ALL_PERMISSIONS,
    allowedERC725YDataKeys: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY REENTRANCY permission with NO AllowedERC725YDataKeys",
    permissions: PERMISSIONS.REENTRANCY,
    allowedERC725YDataKeys: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "SETDATA",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY REENTRANCY permission with AllowedERC725YDataKeys",
    permissions: PERMISSIONS.REENTRANCY,
    allowedERC725YDataKeys: true,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "SETDATA",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY SETDATA permission with NO AllowedERC725YDataKeys",
    permissions: PERMISSIONS.SETDATA,
    allowedERC725YDataKeys: false,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY SETDATA permission with AllowedERC725YDataKeys",
    permissions: PERMISSIONS.SETDATA,
    allowedERC725YDataKeys: true,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has SETDATA and REENTRANCY permissions with NO AllowedERC725YDataKeys",
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.SETDATA
    ),
    allowedERC725YDataKeys: false,
    customErrorName: "NoERC725YDataKeysAllowed",
    customErrorArgs: {
      permission: "",
    },
  },
  {
    testDescription:
      "should pass if the reentrant contract has SETDATA and REENTRANCY permissions with AllowedERC725YDataKeys",
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.SETDATA
    ),
    allowedERC725YDataKeys: true,
    customErrorName: "",
    customErrorArgs: {
      permission: "",
    },
  },
];

export const addPermissionsTestCases: SimplePermissionTestCase[] = [
  {
    testDescription:
      "should revert if the reentrant contract has NO PERMISSIONS",
    permissions: "0x",
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ALL_PERMISSIONS but REENTRANCY",
    permissions: ALL_PERMISSIONS,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY REENTRANCY permission",
    permissions: PERMISSIONS.REENTRANCY,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "ADDPERMISSIONS",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY ADDPERMISSIONS permission",
    permissions: PERMISSIONS.ADDPERMISSIONS,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should pass if the reentrant contract has ADDPERMISSIONS and REENTRANCY permissions",
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.ADDPERMISSIONS
    ),
    customErrorName: "",
    customErrorArgs: {
      permission: "",
    },
  },
];

export const changePermissionsTestCases: SimplePermissionTestCase[] = [
  {
    testDescription:
      "should revert if the reentrant contract has NO PERMISSIONS",
    permissions: "0x",
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ALL_PERMISSIONS but REENTRANCY",
    permissions: ALL_PERMISSIONS,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY REENTRANCY permission",
    permissions: PERMISSIONS.REENTRANCY,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "CHANGEPERMISSIONS",
    },
  },
  {
    testDescription:
      "should revert if the reentrant contract has ONLY CHANGEPERMISSIONS permission",
    permissions: PERMISSIONS.CHANGEPERMISSIONS,
    customErrorName: "NotAuthorised",
    customErrorArgs: {
      permission: "REENTRANCY",
    },
  },
  {
    testDescription:
      "should pass if the reentrant contract has CHANGEPERMISSIONS and REENTRANCY permissions",
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.CHANGEPERMISSIONS
    ),
    customErrorName: "",
    customErrorArgs: {
      permission: "",
    },
  },
];

export const addUniversalReceiverDelegateTestCases: SimplePermissionTestCase[] =
  [
    {
      testDescription:
        "should revert if the reentrant contract has NO PERMISSIONS",
      permissions: "0x",
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "REENTRANCY",
      },
    },
    {
      testDescription:
        "should revert if the reentrant contract has ALL_PERMISSIONS but REENTRANCY",
      permissions: ALL_PERMISSIONS,
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "REENTRANCY",
      },
    },
    {
      testDescription:
        "should revert if the reentrant contract has ONLY REENTRANCY permission",
      permissions: PERMISSIONS.REENTRANCY,
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "ADDUNIVERSALRECEIVERDELEGATE",
      },
    },
    {
      testDescription:
        "should revert if the reentrant contract has ONLY ADDUNIVERSALRECEIVERDELEGATE permission",
      permissions: PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE,
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "REENTRANCY",
      },
    },
    {
      testDescription:
        "should pass if the reentrant contract has ADDUNIVERSALRECEIVERDELEGATE and REENTRANCY permissions",
      permissions: combinePermissions(
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE
      ),
      customErrorName: "",
      customErrorArgs: {
        permission: "",
      },
    },
  ];

export const changeUniversalReceiverDelegateTestCases: SimplePermissionTestCase[] =
  [
    {
      testDescription:
        "should revert if the reentrant contract has NO PERMISSIONS",
      permissions: "0x",
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "REENTRANCY",
      },
    },
    {
      testDescription:
        "should revert if the reentrant contract has ALL_PERMISSIONS but REENTRANCY",
      permissions: ALL_PERMISSIONS,
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "REENTRANCY",
      },
    },
    {
      testDescription:
        "should revert if the reentrant contract has ONLY REENTRANCY permission",
      permissions: PERMISSIONS.REENTRANCY,
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "CHANGEUNIVERSALRECEIVERDELEGATE",
      },
    },
    {
      testDescription:
        "should revert if the reentrant contract has ONLY CHANGEUNIVERSALRECEIVERDELEGATE permission",
      permissions: PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE,
      customErrorName: "NotAuthorised",
      customErrorArgs: {
        permission: "REENTRANCY",
      },
    },
    {
      testDescription:
        "should pass if the reentrant contract has CHANGEUNIVERSALRECEIVERDELEGATE and REENTRANCY permissions",
      permissions: combinePermissions(
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE
      ),
      customErrorName: "",
      customErrorArgs: {
        permission: "",
      },
    },
  ];
