import type { HardhatUserConfig } from 'hardhat/config';
import type { HardhatConfig } from 'hardhat/types/config';
import type { HardhatUserConfigValidationError } from 'hardhat/types/hooks';

export async function validateUserConfig(
  userConfig: HardhatUserConfig,
): Promise<HardhatUserConfigValidationError[]> {
  if (userConfig.natspecDocs === undefined) {
    return [];
  }

  if (typeof userConfig.natspecDocs !== 'object') {
    return [
      {
        path: ['natspecDocs'],
        message: 'Expected an object with include, exclude, outputDir, and runOnCompile options.',
      },
    ];
  }

  const { include, exclude, outputDir, runOnCompile } = userConfig.natspecDocs;
  const errors: HardhatUserConfigValidationError[] = [];

  if (include !== undefined) {
    if (!Array.isArray(include)) {
      errors.push({
        path: ['natspecDocs', 'include'],
        message: 'Expected an array of contract path globs.',
      });
    } else {
      include.forEach((pattern, index) => {
        if (typeof pattern !== 'string' || pattern.length === 0) {
          errors.push({
            path: ['natspecDocs', 'include', index.toString()],
            message: 'Expected a non-empty string.',
          });
        }
      });
    }
  }

  if (exclude !== undefined) {
    if (!Array.isArray(exclude)) {
      errors.push({
        path: ['natspecDocs', 'exclude'],
        message: 'Expected an array of contract path globs.',
      });
    } else {
      exclude.forEach((pattern, index) => {
        if (typeof pattern !== 'string' || pattern.length === 0) {
          errors.push({
            path: ['natspecDocs', 'exclude', index.toString()],
            message: 'Expected a non-empty string.',
          });
        }
      });
    }
  }

  if (outputDir !== undefined && typeof outputDir !== 'string') {
    errors.push({
      path: ['natspecDocs', 'outputDir'],
      message: 'Expected a string value.',
    });
  }

  if (runOnCompile !== undefined && typeof runOnCompile !== 'boolean') {
    errors.push({
      path: ['natspecDocs', 'runOnCompile'],
      message: 'Expected a boolean value.',
    });
  }

  return errors;
}

export async function resolveUserConfig(
  userConfig: HardhatUserConfig,
  partiallyResolvedConfig: HardhatConfig,
): Promise<HardhatConfig> {
  const include = userConfig.natspecDocs?.include ?? ['**/*'];
  const exclude = userConfig.natspecDocs?.exclude ?? [];
  const outputDir = userConfig.natspecDocs?.outputDir ?? 'docs';
  const runOnCompile = userConfig.natspecDocs?.runOnCompile ?? false;

  const natspecDocs = { include, exclude, outputDir, runOnCompile };

  return {
    ...partiallyResolvedConfig,
    natspecDocs,
  };
}
