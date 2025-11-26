import type { PackagerConfig, PackagerUserConfig } from './types.js';

import 'hardhat/types/config';
declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    packager?: PackagerUserConfig;
  }

  interface HardhatConfig {
    packager: PackagerConfig;
  }
}
