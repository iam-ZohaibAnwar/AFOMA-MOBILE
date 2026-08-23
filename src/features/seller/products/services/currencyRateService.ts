const CURRENCY_LIST_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';

export interface CurrencyOption {
  value: string;
  label: string;
}

let cachedCurrencyOptions: CurrencyOption[] | null = null;

export async function fetchCurrencyOptions(): Promise<CurrencyOption[]> {
  if (cachedCurrencyOptions) {
    return cachedCurrencyOptions;
  }

  const response = await fetch(CURRENCY_LIST_URL);
  if (!response.ok) {
    throw new Error('Failed to load currency list');
  }

  const data = (await response.json()) as Record<string, string>;
  cachedCurrencyOptions = Object.keys(data).map((key) => ({
    value: key,
    label: `${key.toUpperCase()} - ${data[key]}`,
  }));

  return cachedCurrencyOptions;
}

/** Returns CAD conversion rate for 1 unit of `currency`, or null if unavailable. */
export async function fetchCurrencyRateToCad(currency: string): Promise<number | null> {
  const normalized = currency.trim().toLowerCase();
  if (!normalized || normalized === 'cad') {
    return 1;
  }

  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${normalized}.json`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Record<string, Record<string, number>>;
  const rate = data[normalized]?.cad;
  return typeof rate === 'number' && Number.isFinite(rate) ? rate : null;
}

export function convertToCadPrice(localPrice: string, rate: number): string {
  const value = parseFloat(localPrice);
  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(rate)) {
    return '';
  }

  return (value * rate).toFixed(2);
}
