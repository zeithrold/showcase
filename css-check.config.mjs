export default {
  files: ['app/**/*.css', 'components/ui/ztd-me/**/*.css'],
  tokenFiles: ['node_modules/tailwindcss/theme.css', 'components/ui/ztd-me/styles.css'],
  // Radix writes these exact placement/trigger values on menu elements at runtime.
  externalCustomProperties: [
    '--radix-dropdown-menu-content-transform-origin',
    '--radix-select-content-transform-origin',
    '--radix-select-trigger-width',
  ],
}
