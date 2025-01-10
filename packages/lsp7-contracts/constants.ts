export const INTERFACE_ID_LSP7 = '0xc52d6008';

export const INTERFACE_ID_LSP7_PREVIOUS = {
  'v0.14.0': '0xb3c4928f',
  'v0.12.0': '0xdaa746b7',
};

export const LSP7_TYPE_IDS = {
  // keccak256('LSP7Tokens_SenderNotification')
  LSP7Tokens_SenderNotification:
    '0x429ac7a06903dbc9c13dfcb3c9d11df8194581fa047c96d7a4171fc7402958ea',

  // keccak256('LSP7Tokens_RecipientNotification')
  LSP7Tokens_RecipientNotification:
    '0x20804611b3e2ea21c480dc465142210acf4a2485947541770ec1fb87dee4a55c',

  // keccak256('LSP7Tokens_OperatorNotification')
  LSP7Tokens_OperatorNotification:
    '0x386072cc5a58e61263b434c722725f21031cd06e7c552cfaa06db5de8a320dbc',

  // keccak256('LSP7Tokens_VotesDelegatorNotification')
  LSP7Tokens_VotesDelegatorNotification:
    '0x6117a486162c4ba8e38d646ef52b1e0e1be6bef05a980c041e232eba8c95e16f',

  // keccak256('LSP7Tokens_VotesDelegateeNotification')
  LSP7Tokens_VotesDelegateeNotification:
    '0x72cad372b29cde295ff0839b7b194597766b88f5fad4f7d6aef013e0c55dc492',
} as const;
