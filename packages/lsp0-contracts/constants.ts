// ERC165 Interface ID
// ----------
export const INTERFACE_ID_LSP0 = '0x24871b3d';

// ERC1271
// ----------

/**
 * @dev values returned by the `isValidSignature` function of the ERC1271 standard.
 * Can be used to check if a signature is valid or not.
 */
export const ERC1271_VALUES = {
  SUCCESS_VALUE: '0x1626ba7e',
  FAIL_VALUE: '0xffffffff',
} as const;

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

export const LSP0_TYPE_IDS = {
  // keccak256('LSP0ValueReceived')
  LSP0ValueReceived: '0x9c4705229491d365fb5434052e12a386d6771d976bea61070a8c694e8affea3d',

  // keccak256('LSP0OwnershipTransferStarted')
  LSP0OwnershipTransferStarted:
    '0xe17117c9d2665d1dbeb479ed8058bbebde3c50ac50e2e65619f60006caac6926',

  // keccak256('LSP0OwnershipTransferred_SenderNotification')
  LSP0OwnershipTransferred_SenderNotification:
    '0xa4e59c931d14f7c8a7a35027f92ee40b5f2886b9fdcdb78f30bc5ecce5a2f814',

  // keccak256('LSP0OwnershipTransferred_RecipientNotification')
  LSP0OwnershipTransferred_RecipientNotification:
    '0xceca317f109c43507871523e82dc2a3cc64dfa18f12da0b6db14f6e23f995538',
} as const;
