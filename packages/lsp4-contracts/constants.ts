import type { Verification, LSP2ArrayKey } from '@lukso/lsp2-contracts';

export type LSP4DigitalAssetMetadataJSON = {
  LSP4Metadata: LSP4DigitalAssetMetadata;
};

export type LSP4DigitalAssetMetadata = {
  name: string;
  description: string;
  links: LinkMetadata[];
  images: ImageMetadata[][];
  assets: AssetMetadata[];
  icon: ImageMetadata[];
  attributes?: AttributeMetadata[];
};

export type LinkMetadata = {
  title: string;
  url: string;
};

export type ImageMetadata = {
  width: number;
  height: number;
  verification?: Verification;
  url: string;
};

export type AssetMetadata = FileAsset | ContractAsset;

export type FileAsset = {
  verification?: Verification;
  url: string;
};

export type ContractAsset = {
  address: string;
  tokenId?: string;
};

export type AttributeMetadata = {
  key: string;
  value: string;
  type: string | number | boolean;
};

export const LSP4SupportedStandard = {
  key: '0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c',
  value: '0xa4d96624',
} as const;

export const LSP4DataKeys = {
  SupportedStandards_LSP4: LSP4SupportedStandard.key,

  // keccak256('LSP4TokenName')
  LSP4TokenName: '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1',

  // keccak256('LSP4TokenSymbol')
  LSP4TokenSymbol: '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756',

  // keccak256('LSP4TokenType)
  LSP4TokenType: '0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3',

  // keccak256('LSP4Metadata')
  LSP4Metadata: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',

  // LSP4CreatorsMap:<address>  + bytes2(0)
  LSP4CreatorsMap: '0x6de85eaf5d982b4e5da00000',

  // keccak256('"LSP4Creators[]')
  'LSP4Creators[]': {
    length: '0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7',
    index: '0x114bd03b3a46d48759680d81ebb2b414',
  } as LSP2ArrayKey,
} as const;

/**
 * @dev List of LSP4 Token types to describe the type of token a digital asset contract represents.
 * @see for details see: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#lsp4tokentype
 */
export const LSP4_TOKEN_TYPES = {
  TOKEN: 0,
  NFT: 1,
  COLLECTION: 2,
} as const;
