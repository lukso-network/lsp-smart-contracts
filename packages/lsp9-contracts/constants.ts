// ERC165 Interface ID
// ----------
export const INTERFACE_ID_LSP9 = '0x28af17e6';

// ERC725X
// ----------

/**
 * @dev list of ERC725X operation types.
 * @see https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#execute
 */
export const OPERATION_TYPES = {
  CALL: 0,
  CREATE: 1,
  CREATE2: 2,
  STATICCALL: 3,
  DELEGATECALL: 4,
} as const;

/**
 * @dev list of ERC725Y keys from the LSP standards.
 * Can be used to detect if a contract implements a specific LSP Metadata standard
 * and contain a set of pre-defined ERC725Y Data Keys.
 */
export const LSP9SupportedStandard = {
  key: '0xeafec4d89fa9619884b600007c0334a14085fefa8b51ae5a40895018882bdb90',
  value: '0x7c0334a1',
} as const;

export const LSP9DataKeys = {
  SupportedStandards_LSP9: LSP9SupportedStandard.key,
} as const;

/**
 * @dev list of standard type IDs ("hooks") defined in the LSPs that can be used to notify
 * a LSP1 compliant contract about certain type of transactions or information
 * (e.g: token transfer, vault transfer, ownership transfer, etc...)
 */
export const LSP9_TYPE_IDS = {
  // keccak256('LSP9ValueReceived')
  LSP9ValueReceived: '0x468cd1581d7bc001c3b685513d2b929b55437be34700410383d58f3aa1ea0abc',

  // keccak256('LSP9OwnershipTransferStarted')
  LSP9OwnershipTransferStarted:
    '0xaefd43f45fed1bcd8992f23c803b6f4ec45cf6b62b0d404d565f290a471e763f',

  // keccak256('LSP9OwnershipTransferred_SenderNotification')
  LSP9OwnershipTransferred_SenderNotification:
    '0x0c622e58e6b7089ae35f1af1c86d997be92fcdd8c9509652022d41aa65169471',

  // keccak256('LSP9OwnershipTransferred_RecipientNotification')
  LSP9OwnershipTransferred_RecipientNotification:
    '0x79855c97dbc259ce395421d933d7bc0699b0f1561f988f09a9e8633fd542fe5c',
} as const;
