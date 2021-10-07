export const enum INTERFACE_IDS {
  ERC165 = "0x01ffc9a7",
  ERC725X = "0x44c028fe",
  ERC725Y = "0x5a988c0f",
  ERC1271 = "0x1626ba7e",
  LSP1 = "0x6bb56a14",
  LSP1Delegate = "0xc2d7bcc1",
  LSP6 = "0x6f4df48b",
  ERC725Account = "0x63cb749b",
  LSP0 = "",
}

export const enum ERC1271 {
  MAGIC_VALUE = "0x1626ba7e",
  FAIL_VALUE = "0xffffffff",
}

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
// Universal Receiver

export const RANDOM_BYTES32 = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
export const ERC777TokensRecipient =
  "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
