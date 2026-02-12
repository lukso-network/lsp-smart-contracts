import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';
import './type-extensions.js';

const plugin: HardhatPlugin = {
  id: 'hardhat-natspec-docs',
  hookHandlers: {
    config: () => import('./hooks/config.js'),
    // Solidity hook for runOnCompile feature
    // Note: Hook availability depends on Hardhat version
    // solidity: () => import('./hooks/solidity.js'),
  },
  tasks: [
    task('docs', 'Generate NatSpec documentation from contract comments')
      .addOption({
        name: 'output',
        description: 'Output directory for documentation',
        type: ArgumentType.STRING_WITHOUT_DEFAULT,
        defaultValue: undefined,
      })
      .setAction(() => import('./tasks/docs.js'))
      .build(),
  ],
};

export default plugin;
