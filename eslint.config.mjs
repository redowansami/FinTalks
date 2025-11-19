import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],

      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'prettier/prettier': 'error'
    }
  }
];
