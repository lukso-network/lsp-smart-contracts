import type { LSP2ArrayKey } from '@lukso/lsp2-contracts';

export const LSP10DataKeys = {
  // keccak256('LSP10VaultsMap') + bytes2(0)
  LSP10VaultsMap: '0x192448c3c0f88c7f238c0000',

  // keccak256('LSP10Vaults[]')
  'LSP10Vaults[]': {
    length: '0x55482936e01da86729a45d2b87a6b1d3bc582bea0ec00e38bdb340e3af6f9f06',
    index: '0x55482936e01da86729a45d2b87a6b1d3',
  } as LSP2ArrayKey,
} as const;
