import { Verification } from 'lsp2';

export type LSP3ProfileMetadataJSON = {
  LSP3Profile: LSP3ProfileMetadata;
};

export type LSP3ProfileMetadata = {
  name: string;
  description: string;
  profileImage?: ImageMetadata[];
  backgroundImage?: ImageMetadata[];
  tags?: string[];
  links?: LinkMetadata[];
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

export type AssetMetadata = {
  verification?: Verification;
  url: string;
  fileType: string;
};

export const LSP3SupportedStandard = {
  key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
  value: '0x5ef83ad9',
};

export const LSP3DataKeys = {
  SupportedStandards_LSP3: LSP3SupportedStandard.key,
  // keccak256('LSP3Profile')
  LSP3Profile: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
};
