module.exports = {
  ignorePatterns: [
    'artifacts/',
    'cache/',
    'dist/',
    'types/',
    'typechain/',
    'contracts.ts',
    'abi.ts',
  ],
  extends: ['turbo', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
};
