import { task } from 'hardhat/config';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: 'hardhat-verify-balance',
  tasks: [
    task('verify-balance', 'Verify the balance of the EOA deployer address before deployment')
      .setAction(() => import('./tasks/verify-balance.js'))
      .build(),
  ],
};

export default plugin;
