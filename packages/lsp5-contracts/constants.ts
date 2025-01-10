import type { LSP2ArrayKey } from '@lukso/lsp2-contracts';

export const LSP5DataKeys = {
  // LSP5ReceivedAssetsMap:<address>  + bytes2(0)
  LSP5ReceivedAssetsMap: '0x812c4334633eb816c80d0000',

  // keccak256('LSP5ReceivedAssets[]')
  'LSP5ReceivedAssets[]': {
    length: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
    index: '0x6460ee3c0aac563ccbf76d6e1d07bada',
  } as LSP2ArrayKey,
} as const;
