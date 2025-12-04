import type { HardhatUserConfig } from 'hardhat/config';
import type { HardhatConfig } from 'hardhat/types/config';
import type { HardhatUserConfigValidationError } from 'hardhat/types/hooks';

export async function validateUserConfig(
  userConfig: HardhatUserConfig,
): Promise<HardhatUserConfigValidationError[]> {
  if (userConfig.packager === undefined) {
    return [];
  }

  if (typeof userConfig.packager !== 'object') {
    return [
      {
        path: ['packager'],
        message: 'Expected an object with contracts and includeFactories options.',
      },
    ];
  }

  const { contracts, includeFactories } = userConfig.packager;
  const errors: HardhatUserConfigValidationError[] = [];

  if (contracts !== undefined) {
    if (!Array.isArray(contracts)) {
      errors.push({
        path: ['packager', 'contracts'],
        message: 'Expected an array of contract names.',
      });
    } else {
      contracts.forEach((contract, index) => {
        if (typeof contract !== 'string' || contract.length === 0) {
          errors.push({
            path: ['packager', 'contracts', index.toString()],
            message: 'Expected a non-empty string.',
          });
        }
      });
    }
  }

  if (includeFactories !== undefined && typeof includeFactories !== 'boolean') {
    errors.push({
      path: ['packager', 'includeFactories'],
      message: 'Expected a boolean value.',
    });
  }

  return errors;
}

export async function resolveUserConfig(
  userConfig: HardhatUserConfig,
  partiallyResolvedConfig: HardhatConfig,
): Promise<HardhatConfig> {
  const contracts = userConfig.packager?.contracts ?? [];
  const includeTypes = userConfig.packager?.includeTypes ?? false;
  const includeFactories = userConfig.packager?.includeFactories ?? false;

  const packager = { contracts, includeTypes, includeFactories };

  return {
    ...partiallyResolvedConfig,
    packager,
  };
}
