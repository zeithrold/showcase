import config from '@ztd-me/eslint'

export default config({
  react: { framework: 'vinext' },
  typescript: { tsconfigPath: 'tsconfig.lint.json' },
  ignores: [
    'dist/**',
    '.next/**',
    '.vinext/**',
    '.wrangler/**',
    '.zt/**',
    // Upstream documentation bytes are checked by the source receipt.
    'components/ui/ztd-me/README.md',
    'components/ui/ztd-me/foundation.md',
    'next-env.d.ts',
  ],
}, {
  files: ['**/*.d.ts'],
  // Native/global declaration merging requires interfaces, with the rule still enforced.
  rules: { 'ts/consistent-type-definitions': ['error', 'interface'] },
}, {
  files: ['**/*.md/**'],
  // Virtual documentation snippets keep syntax checks without the application's type program.
  languageOptions: { parserOptions: { project: null, projectService: false } },
})
