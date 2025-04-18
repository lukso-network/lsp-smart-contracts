import { ethers } from 'hardhat';

// types
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { BytesLike, FunctionFragment, Wallet } from 'ethers';

// constants
import { ERC725YDataKeys } from '../../../constants';
import { ALL_PERMISSIONS, PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

// setup
import { LSP6TestContext } from '../../utils/context';

// helpers
import {
  combinePermissions,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
  signLSP6ExecuteRelayCall,
  encodeCompactBytesArray,
} from '../../utils/helpers';
import { setupKeyManager } from '../../utils/fixtures';

// Complex permission as it has AllowedCalls
export type TransferValueTestCase = {
  permissionsText: string;
  permissions: string;
  allowedCalls: boolean;
  missingPermission: string;
};

// Complex permission as it has AllowedERC725YDataKeys
export type SetDataTestCase = {
  permissionsText: string;
  permissions: string;
  allowedERC725YDataKeys: boolean;
  missingPermission: string;
};

//Other permissions, e.g.: ADDCONTROLLER, EDITPERMISSIONS, ADDUNIVERSALRECEIVERDELEGATE, CHANGEUNIVERSALRECEIVERDELEGATE
export type SimplePermissionTestCase = {
  permissionsText: string;
  permissions: string;
  missingPermission: string;
};

export type ReentrancyContext = {
  owner: SignerWithAddress;
  caller: SignerWithAddress;
  signer: Wallet;
  newControllerAddress: string;
  newURDAddress: string;
  reentrantContract;
  reentrantSigner: Wallet;
  singleReentarncyRelayer;
  batchReentarncyRelayer;
  randomLSP1TypeId: string;
};

export const transferValueTestCases = {
  NotAuthorised: [
    {
      permissionsText: 'NO Permissions',
      permissions: PERMISSIONS.EXECUTE_RELAY_CALL,
      allowedCalls: false,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'ALL_PERMISSIONS',
      permissions: ALL_PERMISSIONS,
      allowedCalls: false,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      allowedCalls: false,
      missingPermission: 'TRANSFERVALUE',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      allowedCalls: true,
      missingPermission: 'TRANSFERVALUE',
    },
    {
      permissionsText: 'TRANSFERVALUE',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.TRANSFERVALUE),
      allowedCalls: false,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'TRANSFERVALUE',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.TRANSFERVALUE),
      allowedCalls: true,
      missingPermission: 'REENTRANCY',
    },
  ],
  NoCallsAllowed: {
    permissionsText: 'REENTRANCY, TRANSFERVALUE',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.TRANSFERVALUE,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    allowedCalls: false,
    missingPermission: '',
  },
  ValidCase: {
    permissionsText: 'REENTRANCY, TRANSFERVALUE',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.TRANSFERVALUE,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    allowedCalls: true,
    missingPermission: '',
  },
};

export const setDataTestCases = {
  NotAuthorised: [
    {
      permissionsText: 'NO Permissions',
      permissions: PERMISSIONS.EXECUTE_RELAY_CALL,
      allowedERC725YDataKeys: false,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'ALL_PERMISSIONS',
      permissions: ALL_PERMISSIONS,
      allowedERC725YDataKeys: false,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      allowedERC725YDataKeys: false,
      missingPermission: 'SETDATA',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      allowedERC725YDataKeys: true,
      missingPermission: 'SETDATA',
    },
    {
      permissionsText: 'SETDATA',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.SETDATA),
      allowedERC725YDataKeys: false,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'SETDATA',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.SETDATA),
      allowedERC725YDataKeys: true,
      missingPermission: 'REENTRANCY',
    },
  ],
  NoERC725YDataKeysAllowed: {
    permissionsText: 'REENTRANCY, SETDATA',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.SETDATA,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    allowedERC725YDataKeys: false,
    missingPermission: '',
  },
  ValidCase: {
    permissionsText: 'REENTRANCY, SETDATA',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.SETDATA,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    allowedERC725YDataKeys: true,
    missingPermission: '',
  },
};

export const addPermissionsTestCases = {
  NotAuthorised: [
    {
      permissionsText: 'NO Permissions',
      permissions: PERMISSIONS.EXECUTE_RELAY_CALL,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'ALL_PERMISSIONS',
      permissions: ALL_PERMISSIONS,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      missingPermission: 'ADDCONTROLLER',
    },
    {
      permissionsText: 'ADDCONTROLLER',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.ADDCONTROLLER),
      missingPermission: 'REENTRANCY',
    },
  ],
  ValidCase: {
    permissionsText: 'REENTRANCY, ADDCONTROLLER',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.ADDCONTROLLER,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    missingPermission: '',
  },
};

export const editPermissionsTestCases = {
  NotAuthorised: [
    {
      permissionsText: 'NO Permissions',
      permissions: PERMISSIONS.EXECUTE_RELAY_CALL,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'ALL_PERMISSIONS',
      permissions: ALL_PERMISSIONS,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      missingPermission: 'EDITPERMISSIONS',
    },
    {
      permissionsText: 'EDITPERMISSIONS',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.EDITPERMISSIONS),
      missingPermission: 'REENTRANCY',
    },
  ],
  ValidCase: {
    permissionsText: 'REENTRANCY, EDITPERMISSIONS',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.EDITPERMISSIONS,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    missingPermission: '',
  },
};

export const addUniversalReceiverDelegateTestCases = {
  NotAuthorised: [
    {
      permissionsText: 'NO Permissions',
      permissions: PERMISSIONS.EXECUTE_RELAY_CALL,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'ALL_PERMISSIONS',
      permissions: ALL_PERMISSIONS,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      missingPermission: 'ADDUNIVERSALRECEIVERDELEGATE',
    },
    {
      permissionsText: 'ADDUNIVERSALRECEIVERDELEGATE',
      permissions: combinePermissions(
        PERMISSIONS.EXECUTE_RELAY_CALL,
        PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE,
      ),
      missingPermission: 'REENTRANCY',
    },
  ],
  ValidCase: {
    permissionsText: 'REENTRANCY, ADDUNIVERSALRECEIVERDELEGATE',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    missingPermission: '',
  },
};

export const changeUniversalReceiverDelegateTestCases = {
  NotAuthorised: [
    {
      permissionsText: 'NO Permissions',
      permissions: PERMISSIONS.EXECUTE_RELAY_CALL,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'ALL_PERMISSIONS',
      permissions: ALL_PERMISSIONS,
      missingPermission: 'REENTRANCY',
    },
    {
      permissionsText: 'REENTRANCY',
      permissions: combinePermissions(PERMISSIONS.EXECUTE_RELAY_CALL, PERMISSIONS.REENTRANCY),
      missingPermission: 'CHANGEUNIVERSALRECEIVERDELEGATE',
    },
    {
      permissionsText: 'CHANGEUNIVERSALRECEIVERDELEGATE',
      permissions: combinePermissions(
        PERMISSIONS.EXECUTE_RELAY_CALL,
        PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE,
      ),
      missingPermission: 'REENTRANCY',
    },
  ],
  ValidCase: {
    permissionsText: 'REENTRANCY, CHANGEUNIVERSALRECEIVERDELEGATE',
    permissions: combinePermissions(
      PERMISSIONS.REENTRANCY,
      PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE,
      PERMISSIONS.EXECUTE_RELAY_CALL,
    ),
    missingPermission: '',
  },
};

export const buildReentrancyContext = async (context: LSP6TestContext) => {
  const owner = context.accounts[0];
  const caller = context.accounts[1];
  const signer = new ethers.Wallet(LOCAL_PRIVATE_KEYS.ACCOUNT2);
  const newControllerAddress = context.accounts[3].address;
  const newURDAddress = context.accounts[4].address;

  const LSP20ReentrantContract__factory = await ethers.getContractFactory(
    'LSP20ReentrantContract',
    context.accounts[0],
  );
  const SingleReentrancyRelayer__factory = await ethers.getContractFactory(
    'LSP20ReentrantContract',
    context.accounts[0],
  );
  const BatchReentrancyRelayer__factory = await ethers.getContractFactory(
    'LSP20ReentrantContract',
    context.accounts[0],
  );

  const reentrantContract = await LSP20ReentrantContract__factory.deploy(
    newControllerAddress,
    ethers.keccak256(ethers.toUtf8Bytes('RandomLSP1TypeId')),
    newURDAddress,
  );

  const reentrantSigner = new ethers.Wallet(LOCAL_PRIVATE_KEYS.ACCOUNT5);

  const singleReentarncyRelayer = await SingleReentrancyRelayer__factory.deploy();
  const batchReentarncyRelayer = await BatchReentrancyRelayer__factory.deploy();

  const permissionKeys = [
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + owner.address.substring(2),
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
    ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
    ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + signer.address.substring(2),
    ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + signer.address.substring(2),
  ];

  const permissionValues = [
    ALL_PERMISSIONS,
    PERMISSIONS.CALL,
    combineAllowedCalls(
      // allow controller to call the 3 x addresses listed below
      [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
      [
        await reentrantContract.getAddress(),
        await singleReentarncyRelayer.getAddress(),
        await batchReentarncyRelayer.getAddress(),
      ],
      ['0xffffffff', '0xffffffff', '0xffffffff'],
      ['0xffffffff', '0xffffffff', '0xffffffff'],
    ),
    PERMISSIONS.CALL,
    combineAllowedCalls(
      // allow controller to call the 3 x addresses listed below
      [CALLTYPE.CALL, CALLTYPE.CALL, CALLTYPE.CALL],
      [
        await reentrantContract.getAddress(),
        await singleReentarncyRelayer.getAddress(),
        await batchReentarncyRelayer.getAddress(),
      ],
      ['0xffffffff', '0xffffffff', '0xffffffff'],
      ['0xffffffff', '0xffffffff', '0xffffffff'],
    ),
  ];

  await setupKeyManager(context, permissionKeys, permissionValues);

  const randomLSP1TypeId = ethers.keccak256(ethers.toUtf8Bytes('RandomLSP1TypeId'));

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

export const generateRelayCall = async (keyManager, payload: BytesLike, signer: Wallet) => {
  const nonce = await keyManager.getNonce(signer.address, 1);

  const validityTimestamps = 0;

  const msgValue = 0;
  const signature = await signLSP6ExecuteRelayCall(
    keyManager,
    nonce.toString(),
    validityTimestamps,
    signer.privateKey,
    msgValue,
    payload.toString(),
  );

  const relayCallContext: {
    signature: BytesLike;
    nonce: bigint;
    validityTimestamps: BytesLike | number;
    payload: BytesLike;
  } = {
    signature,
    nonce,
    validityTimestamps,
    payload,
  };

  return relayCallContext;
};

export const generateSingleRelayPayload = async (
  universalProfile,
  keyManager,
  payloadType: string,
  reentrancyRelayer,
  reentrantSigner: Wallet,
  newControllerAddress: string,
  newURDAddress: string,
) => {
  let payload: BytesLike;
  switch (payloadType) {
    case 'TRANSFERVALUE':
      payload = universalProfile.interface.encodeFunctionData('execute', [
        0,
        await reentrancyRelayer.getAddress(),
        ethers.parseEther('1'),
        '0x',
      ]);
      break;
    case 'SETDATA':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ethers.keccak256(ethers.toUtf8Bytes('SomeRandomTextUsed')),
        ethers.hexlify(ethers.toUtf8Bytes('SomeRandomTextUsed')),
      ]);
      break;
    case 'ADDCONTROLLER':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + newControllerAddress.substring(2),
        '0x0000000000000000000000000000000000000000000000000000000000000010',
      ]);
      break;
    case 'EDITPERMISSIONS':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + newControllerAddress.substring(2),
        '0x',
      ]);
      break;
    case 'ADDUNIVERSALRECEIVERDELEGATE':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
          ethers.keccak256(ethers.toUtf8Bytes('RandomLSP1TypeId')).substring(2, 42),
        newURDAddress,
      ]);
      break;
    case 'CHANGEUNIVERSALRECEIVERDELEGATE':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
          ethers.keccak256(ethers.toUtf8Bytes('RandomLSP1TypeId')).substring(2, 42),
        '0x',
      ]);
      break;
    default:
      payload = '0x';
      break;
  }

  const nonce = await keyManager.getNonce(reentrantSigner.address, 1);

  const validityTimestamps = 0;

  const msgValue = 0;
  const signature = await signLSP6ExecuteRelayCall(
    keyManager,
    nonce.toString(),
    validityTimestamps,
    reentrantSigner.privateKey,
    msgValue,
    payload,
  );

  await reentrancyRelayer.prepareRelayCall(signature, nonce, validityTimestamps, payload);
};

export const generateBatchRelayPayload = async (
  universalProfile,
  keyManager,
  payloadType: string,
  reentrancyRelayer,
  reentrantSigner: Wallet,
  newControllerAddress: string,
  newURDAddress: string,
) => {
  let payload: BytesLike;
  switch (payloadType) {
    case 'TRANSFERVALUE':
      payload = universalProfile.interface.encodeFunctionData('execute', [
        0,
        await reentrancyRelayer.getAddress(),
        ethers.parseEther('1'),
        '0x',
      ]);
      break;
    case 'SETDATA':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ethers.keccak256(ethers.toUtf8Bytes('SomeRandomTextUsed')),
        ethers.hexlify(ethers.toUtf8Bytes('SomeRandomTextUsed')),
      ]);
      break;
    case 'ADDCONTROLLER':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + newControllerAddress.substring(2),
        '0x0000000000000000000000000000000000000000000000000000000000000010',
      ]);
      break;
    case 'EDITPERMISSIONS':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + newControllerAddress.substring(2),
        '0x',
      ]);
      break;
    case 'ADDUNIVERSALRECEIVERDELEGATE':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
          ethers.keccak256(ethers.toUtf8Bytes('RandomLSP1TypeId')).substring(2, 42),
        newURDAddress,
      ]);
      break;
    case 'CHANGEUNIVERSALRECEIVERDELEGATE':
      payload = universalProfile.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
          ethers.keccak256(ethers.toUtf8Bytes('RandomLSP1TypeId')).substring(2, 42),
        '0x',
      ]);
      break;
    default:
      payload = '0x';
      break;
  }

  const nonce = await keyManager.getNonce(reentrantSigner.address, 1);

  const validityTimestamps = 0;

  const msgValue = 0;
  const signature = await signLSP6ExecuteRelayCall(
    keyManager,
    nonce.toString(),
    validityTimestamps,
    reentrantSigner.privateKey,
    msgValue,
    payload,
  );

  await reentrancyRelayer.prepareRelayCall(
    [signature],
    [nonce],
    [validityTimestamps],
    [msgValue],
    [payload],
  );
};

export const generateExecutePayload = async (
  keyManagerAddress: string,
  reentrantContractAddress: string,
  payloadType: string,
) => {
  // Create FunctionFragment for the reentrant contract's function
  const callThatReentersFunction = FunctionFragment.from(
    'function callThatReenters(address keyManagerAddress, string payloadType) external',
  );
  const executeFunction = FunctionFragment.from(
    'function execute(uint256,address,uint256,bytes) external',
  );

  // Create a minimal interface with just this function
  const reentrantInterface = new ethers.Interface([callThatReentersFunction]);
  const universalProfileInterface = new ethers.Interface([executeFunction]);

  const reentrantPayload = reentrantInterface.encodeFunctionData('callThatReenters', [
    keyManagerAddress,
    payloadType,
  ]);

  const executePayload = universalProfileInterface.encodeFunctionData('execute', [
    0,
    reentrantContractAddress,
    0,
    reentrantPayload,
  ]);

  return executePayload;
};

export const loadTestCase = async (
  payloadType: string,
  testCase: TransferValueTestCase | SetDataTestCase | SimplePermissionTestCase,
  context: LSP6TestContext,
  reentrantAddress: string,
  valueReceiverAddress: string,
) => {
  let permissionKeys: BytesLike[];
  let permissionValues: BytesLike[];

  switch (payloadType) {
    case 'TRANSFERVALUE': {
      permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + reentrantAddress.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + reentrantAddress.substring(2),
      ];

      permissionValues = [
        testCase.permissions,
        (testCase as TransferValueTestCase).allowedCalls
          ? combineAllowedCalls(
              // TODO: is the call permission enough here for this test?
              [CALLTYPE.VALUE],
              [valueReceiverAddress],
              ['0xffffffff'],
              ['0xffffffff'],
            )
          : '0x',
      ];
      break;
    }
    case 'SETDATA': {
      permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + reentrantAddress.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          reentrantAddress.substring(2),
      ];

      permissionValues = [
        testCase.permissions,
        (testCase as SetDataTestCase).allowedERC725YDataKeys
          ? encodeCompactBytesArray([ethers.keccak256(ethers.toUtf8Bytes('SomeRandomTextUsed'))])
          : '0x',
      ];
      break;
    }
    default: {
      permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + reentrantAddress.substring(2),
      ];

      permissionValues = [testCase.permissions];
    }
  }

  const setDataBatchFunction = FunctionFragment.from(
    'function setDataBatch(bytes32[],bytes[]) external',
  );
  const erc725YInterface = new ethers.Interface([setDataBatchFunction]);
  const permissionsPayload = erc725YInterface.encodeFunctionData('setDataBatch', [
    permissionKeys,
    permissionValues,
  ]);

  await context.keyManager.connect(context.mainController).execute(permissionsPayload);
};
