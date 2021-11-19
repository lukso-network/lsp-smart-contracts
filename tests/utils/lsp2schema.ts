import { ERC725JSONSchema } from "@erc725/erc725.js";

export const SupportedStandards = {
  LSP3UniversalProfile: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
    value: "0xabe425d6",
  },
  LSP4DigitalCertificate: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abf0613c",
    value: "0xabf0613c",
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
