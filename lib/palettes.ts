export const PALETTES = [
  { id: 'terracotta', colors: [
    '#f5f3ee',
    '#dc613d',
    '#ba785f',
  ] },
  { id: 'moss', colors: [
    '#f0f3ed',
    '#5c7851',
    '#849377',
  ] },
  { id: 'ocean', colors: [
    '#eef3f5',
    '#37738b',
    '#6993a2',
  ] },
  { id: 'plum', colors: [
    '#f5eff3',
    '#996480',
    '#b1849b',
  ] },
  { id: 'graphite', colors: [
    '#f1f1f0',
    '#55575b',
    '#8a8d91',
  ] },
] as const

export type Palette = (typeof PALETTES)[number]['id']
