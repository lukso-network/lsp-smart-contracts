import type { Verification } from '@lukso/lsp2-contracts';

export type LSP3ProfileMetadataJSON = {
  LSP3Profile: LSP3ProfileMetadata;
};

export type LSP3ProfileMetadata = {
  name: string;
  description: string;
  links?: LinkMetadata[];
  tags?: string[];
  profileImage?: ImageMetadata[];
  backgroundImage?: ImageMetadata[];
  avatar?: AssetMetadata[];
};

export type ImageMetadata = {
  width: number;
  height: number;
  verification?: Verification;
  url: string;
};

export type LinkMetadata = {
  title: string;
  url: string;
};

export type AssetMetadata = FileAsset | ContractAsset;

export type FileAsset = {
  verification?: Verification;
  url: string;
  fileType?: string;
};

export type DigitalAsset = {
  address: string;
  tokenId?: string;
};

export type ContractAsset = {
  address: string;
  tokenId?: string;
};

export const LSP3SupportedStandard = {
  key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
  value: '0x5ef83ad9',
} as const;

export const LSP3DataKeys = {
  SupportedStandards_LSP3: LSP3SupportedStandard.key,
  // keccak256('LSP3Profile')
  LSP3Profile: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
} as const;
