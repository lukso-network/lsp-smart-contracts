/**
 * Set of constants values as defined by the LUKSO Standards Proposals.
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md
 */

// ERC165
// ----------

export const enum INTERFACE_IDS {
  ERC165 = "0x01ffc9a7",
  ERC1271 = "0x1626ba7e",
  ERC20 = "0x36372b07",
  ERC721 = "0x80ac58cd",
  ERC721Metadata = "0x5b5e139f",
  ERC725X = "0x44c028fe",
  ERC725Y = "0x5a988c0f",
  ERC725Account = "0x63cb749b",
  LSP1 = "0x6bb56a14",
  LSP1Delegate = "0xc2d7bcc1",
  LSP6 = "0x6f4df48b",
  LSP7 = "0xe33f65c3",
  LSP8 = "0x49399145",
  LSP9 = "0x75edcee5",
}

// ERC1271
// ----------

export const enum ERC1271 {
  MAGIC_VALUE = "0x1626ba7e",
  FAIL_VALUE = "0xffffffff",
}

// ERC725X
// ----------

export const enum OPERATIONS {
  CALL = 0,
  CREATE = 1,
  CREATE2 = 2,
  STATICCALL = 3,
  DELEGATECALL = 4,
}

// ERC725Y
// ----------

export const SupportedStandards = {
  LSP3UniversalProfile: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
    value: "0xabe425d6",
  },
  LSP4DigitalAsset: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624",
    value: "0xa4d96624",
  },
  LSP9Vault: {
    key: "0xeafec4d89fa9619884b6b891356264550000000000000000000000007c0334a1",
    value: "0x7c0334a1",
  },
};

/**
 * For more infos on the type of each keys
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md
 */
export const ERC725YKeys = {
  LSP0: {
    // keccak256('LSP1UniversalReceiverDelegate')
    LSP1UniversalReceiverDelegate:
      "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
  },
  LSP3: {
    // keccak256('LSP3Profile')
    LSP3Profile:
      "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    // LSP3IssuedAssetsMap:<address>
    LSP3IssuedAssetsMap: "0x83f5e77bfb14241600000000",
    // keccak256('LSP3IssuedAssets[]')
    "LSP3IssuedAssets[]":
      "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
  },
  LSP4: {
    // keccak256('LSP4TokenName')
    LSP4TokenName:
      "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
    // keccak256('LSP4TokenSymbol')
    LSP4TokenSymbol:
      "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756",
    // keccak256('LSP4Metadata')
    LSP4Metadata:
      "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
    // keccak256('"LSP4Creators[]')
    "LSP4Creators[]":
      "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7",
  },
  LSP5: {
    // LSP5ReceivedAssetsMap:<address>
    LSP5ReceivedAssetsMap: "0x812c4334633eb81600000000",
    // keccak256('LSP5ReceivedAssets[]')
    "LSP5ReceivedAssets[]":
      "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
  },
  LSP6: {
    // keccak256('AddressPermissions[]')
    "AddressPermissions[]":
      "0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3",
    // AddressPermissions:Permissions:<address>
    "AddressPermissions:Permissions": "0x4b80742d0000000082ac0000",
    // AddressPermissions:AllowedAddresses:<address>
    "AddressPermissions:AllowedAddresses": "0x4b80742d00000000c6dd0000",
    // AddressPermissions:AllowedFunctions:<address>
    "AddressPermissions:AllowedFunctions": "0x4b80742d000000008efe0000",
    // AddressPermissions:AllowedStandards:<address>
    "AddressPermissions:AllowedStandards": "0x4b80742d000000003efa0000",
  },
  LSP10: {
    // keccak256('LSP10VaultsMap')
    LSP10VaultsMap: "0x192448c3c0f88c7f00000000",
    // keccak256('LSP10Vaults[]')
    "LSP10Vaults[]":
      "0x55482936e01da86729a45d2b87a6b1d3bc582bea0ec00e38bdb340e3af6f9f06",
  },
};

export const BasicUPSetup_Schema = [
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
  },
];

// LSP6
// ----------

// binary = .... 1111 1111 1111 (only 1s)
export const ALL_PERMISSIONS_SET =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
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
        SIGN              = 0x0000000000000000000000000000000000000000000000000000000000000200, // .... 0010 .... ....
    }

// ----------

export const EventSignatures = {
  ERC173: {
    /**
     * event OwnershipTransferred(
     *    address indexed previousOwner,
     *    address indexed newOwner,
     * );
     *
     * signature = keccak256('OwnershipTransferred(address,address)')
     */
    OwnershipTransfered:
      "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
  },
  ERC725X: {
    /**
     * event ContractCreated(
     *     uint256 indexed _operation,
     *     address indexed _contractAddress,
     *     uint256 indexed _value
     * );
     *
     * signature = keccak256('ContractCreated(uint256,address,uint256)')
     */
    ContractCreated:
      "0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f",
    /**
     * event Executed(
     *      uint256 indexed _operation,
     *      address indexed _to,
     *      uint256 indexed _value,
     *      bytes _data
     * );
     *
     * signature = keccak256('Executed(uint256,address,uint256,bytes)')
     */
    Executed:
      "0x1f920dbda597d7bf95035464170fa58d0a4b57f13a1c315ace6793b9f63688b8",
  },
  ERC725Y: {
    /**
     * event DataChanged(
     *      bytes32 indexed key,
     *      bytes value
     * );
     *
     * signature = keccak256('DataChanged(bytes32,bytes)')
     */
    DataChanged:
      "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2",
  },
  // ERC725Account
  LSP0: {
    /**
     * event ValueReceived(
     *      address indexed sender,
     *      uint256 indexed value
     * );
     *
     * signature = keccak256('ValueReceived(address,uint256)')
     */
    ValueReceived:
      "0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493",
  },
  LSP1: {
    /**
     * event UniversalReceiver(
     *    address indexed from,
     *    bytes32 indexed typeId,
     *    bytes32 indexed returnedValue,
     *    bytes receivedData
     * );
     *
     * signature = keccak256('UniversalReceiver(address,bytes32,bytes32,bytes)')
     */
    UniversalReceiver:
      "0x8187df79ab47ad16102e7bc8760349a115b3ba9869b8cedd78996f930ac9cac3",
  },
  LSP6: {
    /**
     * event Executed(
     *     uint256 indexed _value,
     *     bytes _data
     * );
     *
     * signature = keccak256('Executed(uint256,bytes)')
     */
    Executed:
      "0x2e733a17851169f232b3859260eb3ad2a086afd54e999eb4ea9afb7791702e41",
  },
  LSP7: {
    /**
     * event Transfer(
     *     address indexed operator,
     *     address indexed from,
     *     address indexed to,
     *     uint256 amount,
     *     bool force,
     *     bytes data
     * );
     *
     * signature = keccak256('Transfer(address,address,address,uint256,bool,bytes)')
     */
    Transfer:
      "0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6",
    /**
     * event AuthorizedOperator(
     *     address indexed operator,
     *     address indexed tokenOwner,
     *     uint256 indexed amount
     * );
     *
     * signature = keccak256('AuthorizedOperator(address,address,uint256)')
     */
    AuthorizedOperator:
      "0xd66aff874162a96578e919097b6f6d153dfd89a5cec41bb331fdb0c4aec16e2c",
    /**
     * event RevokedOperator(
     *     address indexed operator,
     *     address indexed tokenOwner
     * );
     *
     * signature = keccak256('RevokedOperator(address,address)')
     */
    RevokedOperator:
      "0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1",
  },
  LSP8: {
    /**
     * event Transfer(
     *     address operator,
     *     address indexed from,
     *     address indexed to,
     *     bytes32 indexed tokenId,
     *     bool force,
     *     bytes data
     * );
     *
     * signature = keccak256('Transfer(address,address,address,bytes32,bool,bytes)')
     */
    Transfer:
      "b333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf",
    /**
     * event AuthorizedOperator(
     *     address indexed operator,
     *     address indexed tokenOwner,
     *     bytes32 indexed tokenId
     * );
     *
     * signature = keccak256('AuthorizedOperator(address,address,bytes32)')
     */
    AuthorizedOperator:
      "34b797fc5a526f7bf1d2b5de25f6564fd85ae364e3ee939aee7c1ac27871a988",
    /**
     * event RevokedOperator(
     *     address indexed operator,
     *     address indexed tokenOwner,
     *     bytes32 indexed tokenId
     * );
     *
     * signature = keccak256('RevokedOperator(address,address,bytes32)')
     */
    RevokedOperator:
      "17d5389f6ab6adb2647dfa0aa365c323d37adacc30b33a65310b6158ce1373d5",
  },
  Helpers: {
    /**
     * event ReceivedERC777(
     *    address indexed token,
     *    address indexed _operator,
     *    address indexed _from,
     *    address _to,
     *    uint256 _amount
     * );
     *
     * signature = keccak256('ReceivedERC777(address,address,address,address,uint256)')
     */
    ReceivedERC777:
      "0xdc38539587ea4d67f9f649ad9269646bab26927bad175bdcdfdab5dd297d5e1c",
  },
};
