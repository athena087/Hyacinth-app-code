/**
 * Design tokens — single source of truth, transcribed from the Hyacinth
 * Design System PDF (updated 2 July 2026). Hierarchy in this system comes from
 * size + weight + opacity, never from a separate gray color, so secondary text
 * is primary ink at reduced opacity rather than its own token.
 */

export type ColorTokens = {
  bg: string;
  surface: string;
  hairline: string;
  ink: string;
  tint: string;
  tintInk: string;
  soul: string;
  error: string;
};

export const light: ColorTokens = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  hairline: '#E4E4E4',
  ink: '#1A1A1A',
  tint: '#FCF6E6',
  tintInk: '#3D2E0A',
  soul: '#F6E199',
  error: '#D64545',
};

export const dark: ColorTokens = {
  bg: '#0E0E0E',
  surface: '#1C1C1C',
  hairline: '#2E2E2E',
  ink: '#F5F5F5',
  tint: '#362D14',
  tintInk: '#F6E199',
  soul: '#F6E199',
  error: '#D64545',
};

/** 4px base, strict scale. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

/** Corner radius scale. Hero photography is full-bleed (0). */
export const radius = {
  control: 6, // buttons, chips, inputs
  card: 10, // cards, sheets
  photo: 0, // full-bleed photography
} as const;

/** Lilex family names as registered by useFonts in _layout.tsx. */
export const font = {
  regular: 'Lilex_400Regular',
  medium: 'Lilex_500Medium',
  semibold: 'Lilex_600SemiBold',
} as const;

/**
 * Opacity levels standing in for the "secondary text" tone — primary ink,
 * dimmed. Matches the mock's use of opacity 0.55 for captions/eyebrow.
 */
export const textOpacity = {
  secondary: 0.55,
  faint: 0.7,
} as const;
