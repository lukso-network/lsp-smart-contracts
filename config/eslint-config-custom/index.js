import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const eslintconfig = [
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
  },
  {
    ignores: ['artifacts/', 'cache/', 'dist/', 'types/', 'typechain/', 'contracts.ts', 'abi.ts'],
  },
];
// {
//   extends: ['turbo', 'prettier'],
//   plugins: ['@typescript-eslint', 'prettier'],
//   rules: {
//     'prettier/prettier': 'error',
//     '@typescript-eslint/no-explicit-any': 'off',
//   },
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     sourceType: 'module',
//     ecmaVersion: 2020,
//   },
// };
