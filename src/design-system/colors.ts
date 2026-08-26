/**
 * AFOMA brand colors — aligned with the web storefront.
 *
 * | Role | Token | Hex | Web |
 * |------|-------|-----|-----|
 * | **Actions** — buttons, Add to Cart, Checkout, +/- , tags, tab icons, links | `primary`, `textLink` | `#1F628E` | `primary`, `.buttonprimary` |
 * | **Text** — titles, labels, body | `textPrimary`, `brandBlue` | `#172554` | `text-blue-950` |
 *
 * Warm orange surfaces (`background`, `surface`) pair with navy text and primary-blue actions.
 */
export const colors = {
  /** Primary brand blue — all actions (CTAs, tags, footer icons, links). */
  primary: '#1F628E',
  primaryPressed: '#184F73',
  primaryHover: '#1F628EA1',
  primarySoft: '#E8F2F8',

  /** Dark navy — readable text only (not action fills). */
  brandBlue: '#172554',

  /** Warm marketing accent (navigation loader, promotional emphasis). */
  secondary: '#F16217',
  secondarySoft: '#FF8C42',
  secondaryMuted: '#FFEDD5',

  /** Page background — web `bg-orange-50`. */
  background: '#FFF7ED',

  /** Card and panel fill — web `bg-orange-100`. */
  surface: '#FFEDD5',

  /** Nested/subtle panels and image placeholders — web `bg-orange-50`. */
  surfaceMuted: '#FFF7ED',

  surfaceSecondary: '#FFEDD5',

  /** True white — text fields, modals, sheets. */
  surfaceWhite: '#FFFFFF',

  /** Neutral grey — muted input/chip fills (no cool slate tint). */
  surfaceGrey: '#F0F0F0',

  /** Typography — dark navy for text content. */
  textPrimary: '#172554',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textInverse: '#FFFFFF',
  /** Interactive links — primary blue (same as actions). */
  textLink: '#1F628E',

  border: '#FED7AA',
  borderStrong: '#E2E8F0',
  borderForm: 'rgba(71, 85, 105, 0.5)',
  divider: '#FFEDD5',

  success: '#047857',
  successSoft: '#A0E193',
  successBg: '#ECFDF5',
  warning: '#EA580C',
  warningText: '#C2410C',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',

  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
  disabledBg: '#F1F5F9',

  price: '#172554',
  priceSale: '#C2410C',
  priceStrike: '#B91C1C',

  overlay: 'rgba(23, 37, 84, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
