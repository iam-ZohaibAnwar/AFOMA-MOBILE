/**
 * AFOMA brand colors extracted from the web storefront source.
 *
 * Sources inspected:
 * - `afomaFrontend_STG/tailwind.config.js` → primary `#1F628E`
 * - `afomaFrontend_STG/styles/globals.css` → buttons, backgrounds, loader accent
 * - `afomaFrontend_STG/components/ProductCard.jsx` → product surfaces, badges, sale colors
 *
 * Note: The web UI pairs teal primary CTAs with warm orange page surfaces (`orange-50/100`).
 * Primary should be reserved for actions and links — not used as a full-screen fill.
 */
export const colors = {
  /** Main CTA / link color (`text-primary`, `.buttonprimary`). */
  primary: '#1F628E',
  primaryPressed: '#184F73',
  primaryHover: '#1F628EA1',
  primarySoft: '#E8F2F8',

  /** Warm marketing accent (navigation loader, promotional emphasis). */
  secondary: '#F16217',
  secondarySoft: '#FF8C42',
  secondaryMuted: '#FFEDD5',

  /** Page background — web `bg-orange-50`. */
  background: '#FFF7ED',

  /** Card and panel fill — web `bg-orange-100`. Not pure white. */
  surface: '#FFEDD5',

  /** Nested/subtle panels and image placeholders — web `bg-orange-50`. */
  surfaceMuted: '#FFF7ED',

  /** Same as surface; kept for semantic use (banners, chips). */
  surfaceSecondary: '#FFEDD5',

  /** True white — text fields, modals, sheets needing max contrast. */
  surfaceWhite: '#FFFFFF',

  /** Typography colors. */
  textPrimary: '#172554',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#1F628E',

  /** Borders and separators. */
  border: '#FED7AA',
  borderStrong: '#E2E8F0',
  /** Web `.st-form` input/select border — `border-[#47556980]`. */
  borderForm: 'rgba(71, 85, 105, 0.5)',
  divider: '#FFEDD5',

  /** Semantic states. */
  success: '#047857',
  successSoft: '#A0E193',
  successBg: '#ECFDF5',
  warning: '#EA580C',
  warningText: '#C2410C',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',

  /** Disabled UI. */
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
  disabledBg: '#F1F5F9',

  /** Commerce-specific accents from product cards. */
  price: '#172554',
  priceSale: '#C2410C',
  priceStrike: '#B91C1C',

  overlay: 'rgba(23, 37, 84, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
