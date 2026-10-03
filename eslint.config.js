import config from '@ztd-me/eslint'

export default config({
  react: { framework: 'vinext' },
  typescript: { tsconfigPath: 'tsconfig.lint.json' },
  ignores: [
    'dist/**',
    '.next/**',
    '.vinext/**',
    '.wrangler/**',
    '.zt/unit/**',
    'next-env.d.ts',
  ],
})
