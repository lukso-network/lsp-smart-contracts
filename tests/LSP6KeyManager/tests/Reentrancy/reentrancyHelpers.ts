import { ethers } from "hardhat";

//types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BytesLike, Wallet } from "ethers";
import {
  ReentrantContract__factory,
  ReentrantContract,
  LSP6KeyManager,
  UniversalProfile,
  BatchReentrancyRelayer,
  SingleReentrancyRelayer,
  SingleReentrancyRelayer__factory,
  BatchReentrancyRelayer__factory,
} from "../../../../types";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";

// helpers
import {
  combinePermissions,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
  signLSP6ExecuteRelayCall,
} from "../../../utils/helpers";

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
  newControllerAddress: string;
  newURDAddress: string;
  reentrantContract: ReentrantContract;
  reentrantSigner: Wallet;
  singleReentarncyRelayer: SingleReentrancyRelayer;
  batchReentarncyRelayer: BatchReentrancyRelayer;
  randomLSP1TypeId: string;
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

export const buildReentrancyContext = async (context: LSP6TestContext) => {
  const owner = context.accounts[0];
  const caller = context.accounts[1];
  const signer = new ethers.Wallet(LOCAL_PRIVATE_KEYS.ACCOUNT2);
  const newControllerAddress = context.accounts[3].address;
  const newURDAddress = context.accounts[4].address;

  const reentrantContract = await new ReentrantContract__factory(owner).deploy(
    newControllerAddress,
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomLSP1TypeId")),
    newURDAddress
  );

  const reentrantSigner = new ethers.Wallet(LOCAL_PRIVATE_KEYS.ACCOUNT5);

  const singleReentarncyRelayer = await new SingleReentrancyRelayer__factory(
    owner
  ).deploy();
  const batchReentarncyRelayer = await new BatchReentrancyRelayer__factory(
    owner
  ).deploy();

  const permissionKeys = [
    ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
      owner.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
      caller.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
      caller.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
      signer.address.substring(2),
    ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
      signer.address.substring(2),
  ];

  const permissionValues = [
    ALL_PERMISSIONS,
    PERMISSIONS.CALL,
    combineAllowedCalls(
      ["0xffffffff", "0xffffffff", "0xffffffff"],
      [
        reentrantContract.address,
        singleReentarncyRelayer.address,
        batchReentarncyRelayer.address,
      ],
      ["0xffffffff", "0xffffffff", "0xffffffff"]
    ),
    PERMISSIONS.CALL,
    combineAllowedCalls(
      ["0xffffffff", "0xffffffff", "0xffffffff"],
      [
        reentrantContract.address,
        singleReentarncyRelayer.address,
        batchReentarncyRelayer.address,
      ],
      ["0xffffffff", "0xffffffff", "0xffffffff"]
    ),
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
    newControllerAddress,
    newURDAddress,
    reentrantContract,
    reentrantSigner,
    singleReentarncyRelayer,
    batchReentarncyRelayer,
    randomLSP1TypeId,
  };
};

export const generateRelayCall = async (
  keyManager: LSP6KeyManager,
  payload: BytesLike,
  signer: Wallet
) => {
  let nonce = await keyManager.callStatic.getNonce(signer.address, 1);
  let msgValue = 0;
  let signature = await signLSP6ExecuteRelayCall(
    keyManager,
    nonce.toString(),
    signer.privateKey,
    msgValue,
    payload.toString()
  );

  const relayCallContext: {
    signature: BytesLike;
    nonce: BigNumber;
    payload: BytesLike;
  } = {
    signature,
    nonce,
    payload,
  };

  return relayCallContext;
};

export const generateSingleRelayPayload = async (
  reentrancyRelayer: SingleReentrancyRelayer,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager,
  reentrantSigner: Wallet,
  payloadType: string,
  newControllerAddress: string,
  newURDAddress: string
) => {
  let payload: BytesLike;
  switch (payloadType) {
    case "TRANSFERVALUE":
      payload = universalProfile.interface.encodeFunctionData(
        "execute(uint256,address,uint256,bytes)",
        [0, reentrancyRelayer.address, ethers.utils.parseEther("1"), "0x"]
      );
      break;
    case "SETDATA":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
          ),
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("SomeRandomTextUsed")),
        ]
      );
      break;
    case "ADDPERMISSIONS":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newControllerAddress.substring(2),
          "0x0000000000000000000000000000000000000000000000000000000000000010",
        ]
      );
      break;
    case "CHANGEPERMISSIONS":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newControllerAddress.substring(2),
          "0x",
        ]
      );
      break;
    case "ADDUNIVERSALRECEIVERDELEGATE":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("RandomLSP1TypeId"))
              .substring(2, 42),
          newURDAddress,
        ]
      );
      break;
    case "CHANGEUNIVERSALRECEIVERDELEGATE":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("RandomLSP1TypeId"))
              .substring(2, 42),
          "0x",
        ]
      );
      break;
    default:
      payload = "0x";
      break;
  }

  let nonce = await keyManager.callStatic.getNonce(reentrantSigner.address, 1);
  let msgValue = 0;
  let signature = await signLSP6ExecuteRelayCall(
    keyManager,
    nonce.toString(),
    reentrantSigner.privateKey,
    msgValue,
    payload
  );

  await reentrancyRelayer.prepareRelayCall(signature, nonce, payload);
};

export const generateBatchRelayPayload = async (
  reentrancyRelayer: BatchReentrancyRelayer,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager,
  reentrantSigner: Wallet,
  payloadType: string,
  newControllerAddress: string,
  newURDAddress: string
) => {
  let payload: BytesLike;
  switch (payloadType) {
    case "TRANSFERVALUE":
      payload = universalProfile.interface.encodeFunctionData(
        "execute(uint256,address,uint256,bytes)",
        [0, reentrancyRelayer.address, ethers.utils.parseEther("1"), "0x"]
      );
      break;
    case "SETDATA":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
          ),
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("SomeRandomTextUsed")),
        ]
      );
      break;
    case "ADDPERMISSIONS":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newControllerAddress.substring(2),
          "0x0000000000000000000000000000000000000000000000000000000000000010",
        ]
      );
      break;
    case "CHANGEPERMISSIONS":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newControllerAddress.substring(2),
          "0x",
        ]
      );
      break;
    case "ADDUNIVERSALRECEIVERDELEGATE":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("RandomLSP1TypeId"))
              .substring(2, 42),
          newURDAddress,
        ]
      );
      break;
    case "CHANGEUNIVERSALRECEIVERDELEGATE":
      payload = universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("RandomLSP1TypeId"))
              .substring(2, 42),
          "0x",
        ]
      );
      break;
    default:
      payload = "0x";
      break;
  }

  let nonce = await keyManager.callStatic.getNonce(reentrantSigner.address, 1);
  let msgValue = 0;
  let signature = await signLSP6ExecuteRelayCall(
    keyManager,
    nonce.toString(),
    reentrantSigner.privateKey,
    msgValue,
    payload
  );

  await reentrancyRelayer.prepareRelayCall(
    [signature],
    [nonce],
    [msgValue],
    [payload]
  );
};
