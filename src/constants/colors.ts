// src/constants/colors.ts

const BrandPalette = {
  goldDark: '#c37b1e',
  gold: '#e0a02e',
  mist: '#dfe1e3',
  navy: '#112552',
  sand: '#eecd7e',
  slate: '#7a797c',
  cobalt: '#1e406b',
  bronze: '#b48242',
} as const;

const DerivedPalette = {
  primarySoft: '#eef2f8',
  secondarySoft: '#f8ecd6',
  goldDeep: '#8f5f23',
  neutral50: '#f8f9fa',
  neutral100: '#f2f4f5',
  neutral300: '#c4c7cc',
  neutral400: '#a4a4aa',
  neutral600: '#636267',
  neutral700: '#4c4b50',
  neutral800: '#2d3442',
  neutral900: '#161d2c',
  surfaceMuted: '#f6f7f8',
} as const;

const AlphaPalette = {
  white12: 'rgba(255, 255, 255, 0.12)',
  white14: 'rgba(255, 255, 255, 0.14)',
  white18: 'rgba(255, 255, 255, 0.18)',
  white20: 'rgba(255, 255, 255, 0.20)',
  white25: 'rgba(255, 255, 255, 0.25)',
  white30: 'rgba(255, 255, 255, 0.30)',
  white40: 'rgba(255, 255, 255, 0.40)',
  white50: 'rgba(255, 255, 255, 0.50)',
  white65: 'rgba(255, 255, 255, 0.65)',
  white78: 'rgba(255, 255, 255, 0.78)',
  white85: 'rgba(255, 255, 255, 0.85)',
  black03: 'rgba(0, 0, 0, 0.03)',
  black50: 'rgba(0, 0, 0, 0.50)',
  black60: 'rgba(0, 0, 0, 0.60)',
  black90: 'rgba(0, 0, 0, 0.90)',
  slate15: 'rgba(122, 121, 124, 0.15)',
  primary08: 'rgba(17, 37, 82, 0.08)',
  primary12: 'rgba(17, 37, 82, 0.125)',
  primary20: 'rgba(17, 37, 82, 0.20)',
  secondary13: 'rgba(195, 123, 30, 0.133)',
  success12: 'rgba(143, 95, 35, 0.125)',
  error06: 'rgba(180, 130, 66, 0.063)',
  error12: 'rgba(180, 130, 66, 0.125)',
  warning06: 'rgba(195, 123, 30, 0.063)',
  warning12: 'rgba(195, 123, 30, 0.125)',
  info12: 'rgba(30, 64, 107, 0.125)',
  expired12: 'rgba(122, 121, 124, 0.125)',
} as const;

export const Colors = {
  palette: BrandPalette,
  transparent: 'transparent',
  alpha: AlphaPalette,

  // Brand colors
  primary: BrandPalette.navy,
  primaryLight: BrandPalette.cobalt,
  primarySoft: DerivedPalette.primarySoft,

  secondary: BrandPalette.goldDark,
  secondaryLight: BrandPalette.gold,
  secondarySoft: DerivedPalette.secondarySoft,

  tertiary: BrandPalette.bronze,

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: DerivedPalette.surfaceMuted,
    tertiary: '#eef1f3',
    light: '#FFFFFF',
    dark: BrandPalette.navy,
    muted: DerivedPalette.surfaceMuted,
    overlay: 'rgba(17, 37, 82, 0.6)',

    // Legacy aliases kept for compatibility with older screens/components
    red: BrandPalette.cobalt,
    yellow: BrandPalette.bronze,
    orange: BrandPalette.goldDark,
    green: DerivedPalette.goldDeep,
    blue: BrandPalette.navy,
    indigo: BrandPalette.cobalt,
    purple: BrandPalette.bronze,
    pink: BrandPalette.gold,
    gray: BrandPalette.slate,
  },

  // Text colors
  text: {
    primary: BrandPalette.navy,
    secondary: BrandPalette.slate,
    tertiary: DerivedPalette.neutral400,
    disabled: DerivedPalette.neutral300,
    inverted: '#FFFFFF',
    placeholder: DerivedPalette.neutral400,
    link: BrandPalette.cobalt,
  },

  // Status colors
  status: {
    success: DerivedPalette.goldDeep,
    error: BrandPalette.bronze,
    warning: BrandPalette.goldDark,
    info: BrandPalette.cobalt,
    pending: BrandPalette.bronze,
    inProgress: BrandPalette.cobalt,
    completed: DerivedPalette.goldDeep,
    cancelled: BrandPalette.slate,
  },

  // Service status
  service: {
    pending: BrandPalette.goldDark,
    inProgress: BrandPalette.cobalt,
    completed: DerivedPalette.goldDeep,
    cancelled: BrandPalette.slate,
    warranty: BrandPalette.bronze,
  },

  // Neutral scale
  neutral: {
    50: DerivedPalette.neutral50,
    100: DerivedPalette.neutral100,
    200: BrandPalette.mist,
    300: DerivedPalette.neutral300,
    400: DerivedPalette.neutral400,
    500: BrandPalette.slate,
    600: DerivedPalette.neutral600,
    700: DerivedPalette.neutral700,
    800: DerivedPalette.neutral800,
    900: DerivedPalette.neutral900,
  },

  // Accent colors
  accent: {
    green: BrandPalette.goldDark,
    blue: BrandPalette.cobalt,
    yellow: BrandPalette.gold,
    orange: BrandPalette.bronze,
    purple: BrandPalette.bronze,
    pink: BrandPalette.sand,
  },

  // UI elements
  border: {
    light: BrandPalette.mist,
    default: DerivedPalette.neutral300,
    focus: BrandPalette.cobalt,
    error: BrandPalette.bronze,
  },

  divider: BrandPalette.mist,

  shadow: {
    default: '#11255214',
    primary: '#11255226',
    red: '#c37b1e24',
  },

  overlay: '#00000066',

  // Surface colors
  surface: {
    default: '#FFFFFF',
    elevated: '#FFFFFF',
    muted: DerivedPalette.surfaceMuted,
  },

  // Interactive states
  interactive: {
    hover: 'rgba(17, 37, 82, 0.04)',
    pressed: 'rgba(17, 37, 82, 0.08)',
    focus: 'rgba(17, 37, 82, 0.12)',
    disabled: DerivedPalette.neutral100,
  },

  // Button colors
  button: {
    primary: {
      bg: BrandPalette.navy,
      text: '#FFFFFF',
      hover: BrandPalette.cobalt,
      disabled: DerivedPalette.neutral300,
    },
    secondary: {
      bg: BrandPalette.goldDark,
      text: BrandPalette.navy,
      hover: BrandPalette.gold,
    },
    ghost: {
      bg: 'transparent',
      text: BrandPalette.navy,
      hover: DerivedPalette.primarySoft,
    },
    outline: {
      bg: 'transparent',
      border: BrandPalette.mist,
      text: BrandPalette.navy,
      hover: DerivedPalette.surfaceMuted,
    },
  },

  // Warranty / Service status
  warranty: {
    active: BrandPalette.goldDark,
    expiring: BrandPalette.gold,
    expired: BrandPalette.slate,
  },

  // Priority colors
  priority: {
    critical: BrandPalette.bronze,
    high: BrandPalette.goldDark,
    medium: BrandPalette.cobalt,
    low: BrandPalette.slate,
  },

  // Gradients
  gradients: {
    primary: [BrandPalette.navy, BrandPalette.cobalt],
    primaryReverse: [BrandPalette.cobalt, BrandPalette.navy],
    secondary: [BrandPalette.goldDark, BrandPalette.gold],
    brand: [BrandPalette.navy, BrandPalette.cobalt, BrandPalette.gold],
    light: ['#FFFFFF', DerivedPalette.surfaceMuted],
    dark: [BrandPalette.cobalt, BrandPalette.navy],
    shimmer: [DerivedPalette.surfaceMuted, BrandPalette.mist, DerivedPalette.surfaceMuted],
    overlay: ['rgba(17,37,82,0)', 'rgba(17,37,82,0.82)'],
  },

  // Chart colors
  chart: [
    BrandPalette.navy,
    BrandPalette.cobalt,
    BrandPalette.goldDark,
    BrandPalette.gold,
    BrandPalette.bronze,
    BrandPalette.slate,
  ],
};
