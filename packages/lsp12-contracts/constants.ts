import type { LSP2ArrayKey } from '@lukso/lsp2-contracts';

export const LSP12DataKeys = {
  // LSP12IssuedAssetsMap:<address>  + bytes2(0)
  LSP12IssuedAssetsMap: '0x74ac2555c10b9349e78f0000',

  // keccak256('LSP12IssuedAssets[]')
  'LSP12IssuedAssets[]': {
    length: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    index: '0x7c8c3416d6cda87cd42c71ea1843df28',
  } as LSP2ArrayKey,
} as const;
