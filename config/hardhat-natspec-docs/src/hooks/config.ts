import type { ConfigHooks } from 'hardhat/types/hooks';
import {
  resolveUserConfig as resolvePluginConfig,
  validateUserConfig as validatePluginConfig,
} from '../config.js';

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
    async validateUserConfig(userConfig) {
      return validatePluginConfig(userConfig);
    },
    async resolveUserConfig(userConfig, resolveConfigurationVariable, next) {
      const partiallyResolvedConfig = await next(userConfig, resolveConfigurationVariable);

      return resolvePluginConfig(userConfig, partiallyResolvedConfig);
    },
  };

  return handlers;
};
