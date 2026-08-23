const COLOR_NAME_MAP: Record<string, string> = {
  black: '#111827',
  white: '#F8FAFC',
  blue: '#2563EB',
  navy: '#1E3A8A',
  green: '#15803D',
  red: '#DC2626',
  terracotta: '#C2410C',
  charcoal: '#374151',
  gray: '#6B7280',
  grey: '#6B7280',
  beige: '#D6CFC7',
  brown: '#78350F',
  pink: '#DB2777',
  purple: '#7C3AED',
  yellow: '#EAB308',
  gold: '#CA8A04',
  silver: '#94A3B8',
  orange: '#EA580C',
  cream: '#FEF3C7',
  ivory: '#FFFBEB',
  maroon: '#7F1D1D',
  teal: '#0F766E',
  coral: '#FB7185',
  lavender: '#A78BFA',
  mint: '#6EE7B7',
};

export function isColorAttributeName(attributeName: string): boolean {
  const normalized = attributeName.trim().toLowerCase();
  return normalized === 'color' || normalized === 'colour' || normalized === 'colors';
}

export function resolveColorSwatch(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (COLOR_NAME_MAP[normalized]) {
    return COLOR_NAME_MAP[normalized];
  }

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    return normalized;
  }

  const partial = Object.entries(COLOR_NAME_MAP).find(([name]) => normalized.includes(name));
  if (partial) {
    return partial[1];
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = normalized.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 52%)`;
}
