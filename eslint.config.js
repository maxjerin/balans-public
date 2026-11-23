// ESLint v9 flat config. Lint our own TS/React source; skip build output and
// vendored caches. Kept non-type-checked for speed — `bun run typecheck` already
// provides full type analysis.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['dist', 'dev-dist', 'node_modules', '**/*.tsbuildinfo'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Allow intentional `_`-prefixed discards (e.g. omitting a key via rest).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Config + Node-side files run under Node, not the browser.
    files: ['vite.config.ts', '*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
)
