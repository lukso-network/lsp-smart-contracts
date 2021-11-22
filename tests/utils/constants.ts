import { ethers } from "hardhat";
import { ERC725JSONSchema } from "@erc725/erc725.js";

// ERC165
// ----------

export const enum INTERFACE_IDS {
  ERC165 = "0x01ffc9a7",
  ERC1271 = "0x1626ba7e",
  ERC725X = "0x44c028fe",
  ERC725Y = "0x5a988c0f",
  ERC725Account = "0x63cb749b",
  LSP1 = "0x6bb56a14",
  LSP1Delegate = "0xc2d7bcc1",
  LSP6 = "0x6f4df48b",
  LSP7 = "0xe33f65c3",
  LSP8 = "0x49399145",
}

// ERC725Y
// ----------

export const SupportedStandards = {
  LSP3UniversalProfile: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
    value: "0xabe425d6",
  },
  LSP4DigitalCertificate: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abf0613c",
    value: "0xabf0613c",
  },
  LSP4DigitalAsset: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624",
    value: "0xa4d96624",
  },
};

export const ERC725YKeys = {
  LSP0: {
    // keccak256('LSP1UniversalReceiverDelegate')
    LSP1UniversalReceiverDelegate:
      "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
  },
  LSP3: {
    // keccak256('LSP3Profile')
    LSP3Profile: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    // LSP3IssuedAssetsMap:<address> --> bytes
    "LSP3IssuedAssetsMap:": "0x83f5e77bfb14241600000000",
    // keccak256('LSP3IssuedAssets[]')
    "LSP3IssuedAssets[]": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
  },
  LSP5: {
    // LSP5ReceivedAssetsMap:<address>
    "LSP5ReceivedAssetsMap:": "0x812c4334633eb81600000000",
    // LSP5ReceivedAssets[]
    "LSP5ReceivedAssets[]": "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
  },
  LSP6: {
    // AddressPermissions[]
    "AddressPermissions[]": "0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3",
    // AddressPermissions:Permissions:<address> --> bytes1
    "AddressPermissions:Permissions:": "0x4b80742d0000000082ac0000",
    // AddressPermissions:AllowedAddresses:<address> --> address[]
    "AddressPermissions:AllowedAddresses:": "0x4b80742d00000000c6dd0000",
    // AddressPermissions:AllowedFunctions:<address> --> bytes4[]
    "AddressPermissions:AllowedFunctions:": "0x4b80742d000000008efe0000",
  },
};

export const BasicUPSetup_Schema: ERC725JSONSchema[] = [
  {
    name: "LSP3Profile",
    key: ERC725YKeys.LSP3["LSP3Profile"],
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP1UniversalReceiverDelegate",
    key: ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"],
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
  {
    name: "LSP3IssuedAssets[]",
    key: ERC725YKeys.LSP3["LSP3IssuedAssets[]"],
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
];

// ----------

export const EventSignatures = {
  /**
   * event UniversalReceiver(
   *    address indexed from,
   *    bytes32 indexed typeId,
   *    bytes32 indexed returnedValue,
   *    bytes receivedData
   * )
   *
   * signature = keccak256('UniversalReceiver(address,bytes32,bytes32,bytes)')
   */
  UniversalReceiver: "0x8187df79ab47ad16102e7bc8760349a115b3ba9869b8cedd78996f930ac9cac3",
  /**
   * event ReceivedERC777(
   *    address indexed token,
   *    address indexed _operator,
   *    address indexed _from,
   *    address _to,
   *    uint256 _amount
   * )
   *
   * signature = keccak256('ReceivedERC777(address,address,address,address,uint256)')
   */
  ReceivedERC777: "0xdc38539587ea4d67f9f649ad9269646bab26927bad175bdcdfdab5dd297d5e1c",
};

// LSP0
// ----------

export const enum OPERATIONS {
  CALL = 0,
  CREATE = 1,
  CREATE2 = 2,
  STATICCALL = 3,
  DELEGATECALL = 4,
}

// LSP6
// ----------

// hex =    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// binary = .... 1111 1111 1111 (only 1s)
export const ALL_PERMISSIONS_SET = ethers.utils.hexlify(ethers.constants.MaxUint256);

// prettier-ignore
export const enum PERMISSIONS {
    CHANGEOWNER       = 0x0000000000000000000000000000000000000000000000000000000000000001, // .... 0000 0000 0001
    CHANGEPERMISSIONS = 0x0000000000000000000000000000000000000000000000000000000000000002, // .... .... .... 0010
    ADDPERMISSIONS    = 0x0000000000000000000000000000000000000000000000000000000000000004, // .... .... .... 0100
    SETDATA           = 0x0000000000000000000000000000000000000000000000000000000000000008, // .... .... .... 1000
    CALL              = 0x0000000000000000000000000000000000000000000000000000000000000010, // .... .... 0001 ....
    STATICCALL        = 0x0000000000000000000000000000000000000000000000000000000000000020, // .... .... 0010 ....
    DELEGATECALL      = 0x0000000000000000000000000000000000000000000000000000000000000040, // .... .... 0100 ....
    DEPLOY            = 0x0000000000000000000000000000000000000000000000000000000000000080, // .... .... 1000 ....
    TRANSFERVALUE     = 0x0000000000000000000000000000000000000000000000000000000000000100, // .... 0001 .... ....
    SIGN              = 0x0000000000000000000000000000000000000000000000000000000000000200  // .... 0010 .... ....
}

// ERC1271
// ----------

export const enum ERC1271 {
  MAGIC_VALUE = "0x1626ba7e",
  FAIL_VALUE = "0xffffffff",
}
