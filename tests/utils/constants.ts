export const INTERFACE_IDS = {
  ERC165: "0x01ffc9a7",
  ERC725X: "0x44c028fe",
  ERC725Y: "0x5a988c0f",
  ERC1271: "0x1626ba7e",
  LSP1: "0x6bb56a14",
  LSP1Delegate: "0xc2d7bcc1",
  LSP7: "0xe33f65c3",
  LSP8: "0x49399145",
  LSP6: "0x6f4df48b",
  ERC725Account: "0x63cb749b",
  LSP0: "",
};

export const ERC1271 = {
  MAGIC_VALUE: "0x1626ba7e",
  FAIL_VALUE: "0xffffffff",
};

export const SupportedStandards = {
  ERC725Account: {
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6",
    value: "0xafdeb5d6", // bytes4(keccak256('ERC725Account'))
  },
};

// KeyManager

// Get key: keccak256('AddressPermissions[]')
export const ADDRESSPERMISSIONS_KEY =
  "0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3";

// Universal Receiver

// Get key: keccak256('LSP1UniversalReceiverDelegate')
export const UNIVERSALRECEIVER_KEY =
  "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";

export const RANDOM_BYTES32 = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
export const ERC777TokensRecipient =
  "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
