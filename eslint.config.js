import config from '@ztd-me/eslint'

export default config({
  react: { framework: 'vinext' },
  typescript: { tsconfigPath: 'tsconfig.json' },
  ignores: [
    'dist/**',
    '.next/**',
    '.vinext/**',
    '.wrangler/**',
    'next-env.d.ts',
  ],
})
