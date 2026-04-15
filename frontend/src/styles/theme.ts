// Philosophical Journal — Design Tokens
export const colors = {
  // Parchment scale
  parchment: '#F5F0E8',
  parchmentDark: '#EDE5D0',
  parchmentDeep: '#DDD0B8',
  parchmentRich: '#D4C4A8',
  cream: '#FAF7F2',
  creamWarm: '#FFF9F0',

  // Gold scale
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  goldBright: '#F5D97A',
  goldDark: '#A07830',
  goldDeep: '#8B6628',
  goldFaint: 'rgba(201,168,76,0.12)',
  goldGlow: 'rgba(201,168,76,0.25)',

  // Brown scale
  brown: '#3D2B1F',
  brownMid: '#6B4C35',
  brownWarm: '#8A6245',
  brownLight: '#9B7B5E',
  brownFaint: 'rgba(61,43,31,0.06)',

  // Dark backgrounds
  ink: '#1A0F0A',
  inkDeep: '#0D0705',
  inkMid: '#2A1A10',
  inkRich: '#1E1208',

  // Utility
  shadow: 'rgba(61,43,31,0.15)',
  shadowDeep: 'rgba(61,43,31,0.3)',
  shadowGold: 'rgba(201,168,76,0.2)',
  error: '#8B2020',
  errorBg: '#FDF0F0',
  success: '#2E7D32',
}

export const fonts = {
  serif: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
  sans: '"Segoe UI", system-ui, -apple-system, sans-serif',
}

export const shadows = {
  // 3-layer shadow system for depth
  card: '0 2px 8px rgba(61,43,31,0.06), 0 4px 16px rgba(61,43,31,0.08), 0 8px 32px rgba(61,43,31,0.04)',
  cardHover: '0 4px 12px rgba(61,43,31,0.10), 0 8px 24px rgba(61,43,31,0.12), 0 16px 48px rgba(61,43,31,0.08)',
  cardGold: '0 4px 16px rgba(201,168,76,0.12), 0 8px 32px rgba(201,168,76,0.08), 0 2px 8px rgba(61,43,31,0.10)',
  cardGoldHover: '0 6px 20px rgba(201,168,76,0.18), 0 12px 40px rgba(201,168,76,0.12), 0 4px 12px rgba(61,43,31,0.12)',
  input: 'inset 0 1px 3px rgba(61,43,31,0.08)',
  inputFocus: '0 0 0 4px rgba(201,168,76,0.25), 0 2px 8px rgba(201,168,76,0.15)',
  nav: '0 2px 20px rgba(0,0,0,0.35), 0 4px 40px rgba(0,0,0,0.15)',
  elevated: '0 8px 24px rgba(61,43,31,0.12), 0 16px 48px rgba(61,43,31,0.08), 0 4px 12px rgba(61,43,31,0.06)',
  glow: '0 0 20px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.15)',
}

// Reusable gradient strings
export const gradients = {
  page: `linear-gradient(160deg, #F5F0E8 0%, #FAF7F2 60%, #F0EBE0 100%)`,
  pageDark: `linear-gradient(160deg, #1E1008 0%, #130A05 60%, #0D0705 100%)`,
  gold: `linear-gradient(135deg, #C9A84C, #A07830)`,
  goldRich: `linear-gradient(135deg, #E8C96A 0%, #C9A84C 50%, #A07830 100%)`,
  goldShimmer: `linear-gradient(135deg, #F5D97A 0%, #E8C96A 25%, #C9A84C 50%, #A07830 75%, #8B6628 100%)`,
  goldSubtle: `linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))`,
  goldRadial: `radial-gradient(ellipse at center, rgba(201,168,76,0.2) 0%, transparent 70%)`,
  card: `linear-gradient(160deg, #F5F0E8 0%, #FAF7F2 100%)`,
  cardRich: `linear-gradient(160deg, #FAF7F2 0%, #F5F0E8 50%, #EDE5D0 100%)`,
  cardElevated: `linear-gradient(160deg, #FFF9F0 0%, #FAF7F2 50%, #F5F0E8 100%)`,
  divider: `linear-gradient(90deg, transparent, #C9A84C, transparent)`,
  dividerFaint: `linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)`,
  dividerGold: `linear-gradient(90deg, transparent 0%, #E8C96A 20%, #C9A84C 50%, #E8C96A 80%, transparent 100%)`,
  pageHeader: `linear-gradient(180deg, #2A1A10 0%, #3D2B1F 50%, #7A5540 72%, #C4A882 88%, #F5F0E8 100%)`,
  heroRich: `linear-gradient(180deg, #0D0705 0%, #1A0F0A 20%, #2A1A10 40%, #3D2B1F 60%, #6B4C35 75%, #9B7B5E 85%, #C4A882 92%, #F5F0E8 100%)`,
  accent: `linear-gradient(90deg, #8B6628 0%, #A07830 25%, #C9A84C 50%, #E8C96A 75%, #F5D97A 100%)`,
  accentVertical: `linear-gradient(180deg, #8B6628 0%, #A07830 25%, #C9A84C 50%, #E8C96A 75%, #F5D97A 100%)`,
}

// Animation timing functions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
