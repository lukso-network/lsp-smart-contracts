export const INTERFACE_ID_LSP1 = '0x6bb56a14';

export const LSP1DataKeys = {
  // bytes10(keccak256('LSP1UniversalReceiverDelegate')) + bytes2(0)
  LSP1UniversalReceiverDelegatePrefix: '0x0cfc51aec37c55a4d0b10000',

  // keccak256('LSP1UniversalReceiverDelegate')
  LSP1UniversalReceiverDelegate:
    '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
} as const;
