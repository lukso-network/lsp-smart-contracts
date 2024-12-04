export const INTERFACE_ID_LSP14 = '0x94be5999';

export const LSP14_TYPE_IDS = {
  // keccak256('LSP14OwnershipTransferStarted')
  LSP14OwnershipTransferStarted:
    '0xee9a7c0924f740a2ca33d59b7f0c2929821ea9837ce043ce91c1823e9c4e52c0',

  // keccak256('LSP14OwnershipTransferred_SenderNotification')
  LSP14OwnershipTransferred_SenderNotification:
    '0xa124442e1cc7b52d8e2ede2787d43527dc1f3ae0de87f50dd03e27a71834f74c',

  // keccak256('LSP14OwnershipTransferred_RecipientNotification')
  LSP14OwnershipTransferred_RecipientNotification:
    '0xe32c7debcb817925ba4883fdbfc52797187f28f73f860641dab1a68d9b32902c',
} as const;
