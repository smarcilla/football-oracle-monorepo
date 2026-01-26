import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    // Global ignores
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/next-env.d.ts',
      'apps/web/.next/**',
      'services/scraper/**', // Python service
      'apps/web/next.config.js',
      'eslint.config.js',
      '**/vitest.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierRecommended,
  {
    // Base configuration for all TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: [
          './apps/api/tsconfig.json',
          './apps/web/tsconfig.json',
          './services/engine/tsconfig.json',
          './services/journalist/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Specific configuration for React (apps/web)
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Next.js doesn't need it
      'react/prop-types': 'off', // We use TypeScript
    },
  },
);
