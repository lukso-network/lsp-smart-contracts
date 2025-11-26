import { task } from 'hardhat/config';
import type { HardhatPlugin } from 'hardhat/types/plugins';
import './type-extensions.js';

const plugin: HardhatPlugin = {
  id: 'hardhat-packager-v3',
  hookHandlers: {
    config: () => import('./hooks/config.js'),
  },
  tasks: [
    task(
      'prepare-package',
      'Prepares contract artifacts and typechain-like bindings for npm package deployment',
    )
      .setAction(() => import('./tasks/prepare-package.js'))
      .build(),
  ],
};

export default plugin;
