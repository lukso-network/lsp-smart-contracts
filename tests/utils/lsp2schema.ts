import { ERC725JSONSchema } from "@erc725/erc725.js";

export const SupportedStandards = {
  /** @deprecated */
  ERC725Account: {
    // keccak256('ERC725Account)
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6",
    // bytes4(keccak256('ERC725Account'))
    value: "0xafdeb5d6",
  },
  LSP3UniversalProfile: {
    // keccak256('LSP3UniversalProfile')
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
    // bytes4(keccak256('LSP3UniversalProfile'))
    value: "0xabe425d6",
  },
};

export const LSP2Keys = {
  // keccak256('LSP1UniversalReceiverDelegate')
  UniversalReceiverDelegate: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
  // keccak256('LSP3Profile')
  LSP3Profile: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
  // keccak256('LSP3IssuedAssets[]')
  "LSP3IssuedAssets[]": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
  // keccak256("ERC777TokensRecipient")
  ERC777TokensRecipient: "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b",
};

export const BasicUPSetup_Schema: ERC725JSONSchema[] = [
  {
    name: "LSP3Profile",
    key: LSP2Keys["LSP3Profile"],
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP1UniversalReceiverDelegate",
    key: LSP2Keys["UniversalReceiverDelegate"],
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
  {
    name: "LSP3IssuedAssets[]",
    key: LSP2Keys["LSP3IssuedAssets[]"],
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
];
