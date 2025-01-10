export const INTERFACE_ID_LSP8 = '0x3a271706';

export const INTERFACE_ID_LSP8_PREVIOUS = {
  'v0.14.0': '0xecad9f75',
  'v0.12.0': '0x30dc5278',
};

export const LSP8DataKeys = {
  LSP8TokenIdFormat: '0xf675e9361af1c1664c1868cfa3eb97672d6b1a513aa5b81dec34c9ee330e818d',
  LSP8TokenMetadataBaseURI: '0x1a7628600c3bac7101f53697f48df381ddc36b9015e7d7c9c5633d1252aa2843',
  LSP8ReferenceContract: '0x708e7b881795f2e6b6c2752108c177ec89248458de3bf69d0d43480b3e5034e6',
} as const;

export const LSP8_TYPE_IDS = {
  // keccak256('LSP8Tokens_SenderNotification')
  LSP8Tokens_SenderNotification:
    '0xb23eae7e6d1564b295b4c3e3be402d9a2f0776c57bdf365903496f6fa481ab00',

  // keccak256('LSP8Tokens_RecipientNotification')
  LSP8Tokens_RecipientNotification:
    '0x0b084a55ebf70fd3c06fd755269dac2212c4d3f0f4d09079780bfa50c1b2984d',

  // keccak256('LSP8Tokens_OperatorNotification')
  LSP8Tokens_OperatorNotification:
    '0x8a1c15a8799f71b547e08e2bcb2e85257e81b0a07eee2ce6712549eef1f00970',

  // keccak256('LSP8Tokens_VotesDelegateeNotification')
  LSP8Tokens_VotesDelegateeNotification:
    '0x19419598f788eae88574bbb83ec563ad0cb43cd7ddbbc88857b2efa2d8faa8eb',

  // keccak256('LSP8Tokens_VotesDelegatorNotification')
  LSP8Tokens_VotesDelegatorNotification:
    '0x2f6d3f668c2e57dbae4c255f2d9e0b69d47a8848d69a2251cce137529e34743e',
} as const;

/**
 * @dev List of LSP8 Token ID Formats that can be used to create different types of NFTs and represent each NFT identifiers (= tokenIds) differently.
 * @see For details see: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenidformat
 */
export const LSP8_TOKEN_ID_FORMAT = {
  NUMBER: 0,
  STRING: 1,
  ADDRESS: 2,
  UNIQUE_ID: 3,
  HASH: 4,
  MIXED_DEFAULT_NUMBER: 100,
  MIXED_DEFAULT_STRING: 101,
  MIXED_DEFAULT_ADDRESS: 102,
  MIXED_DEFAULT_UNIQUE_ID: 103,
  MIXED_DEFAULT_HASH: 104,
} as const;
