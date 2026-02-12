import type { NatSpecDocsConfig, NatSpecDocsUserConfig } from './types.js';

import 'hardhat/types/config';
declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    natspecDocs?: NatSpecDocsUserConfig;
  }

  interface HardhatConfig {
    natspecDocs: NatSpecDocsConfig;
  }
}
