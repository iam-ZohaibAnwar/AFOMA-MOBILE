import { getUserShippingSurcharge } from '../api/shippingApi';
import {
  getStoredUserPricingInfo,
  setStoredUserPricingInfo,
} from '../storage/userPricingStorage';
import type { GeoLookupResult, UserPricingInfo } from './types';

const IPWHOIS_URL = 'https://ipwhois.app/json/';

const COUNTRY_CURRENCY_FALLBACK: Record<string, string> = {
  pakistan: 'PKR',
  nigeria: 'NGN',
  'united states': 'USD',
  'united kingdom': 'GBP',
  canada: 'CAD',
  india: 'INR',
  australia: 'AUD',
};

const currencyJsonInflightByBase = new Map<string, Promise<Record<string, unknown> | null>>();
const surchargeInflightByCountry = new Map<string, Promise<Record<string, number> | null>>();

function normalizeCountryKey(country: string): string {
  return country.trim().toLowerCase();
}

function resolveCurrencyForGeo(country: string, currencyCode?: string): string {
  const normalizedCode = currencyCode?.trim().toUpperCase();
  if (normalizedCode) {
    return normalizedCode;
  }

  return COUNTRY_CURRENCY_FALLBACK[normalizeCountryKey(country)] ?? 'CAD';
}

export function isValidStoredPricingInfo(stored: UserPricingInfo): boolean {
  const country = stored.country?.trim();
  const currency = stored.currency?.trim();
  const rate = Number(stored.currencyRate);

  if (!country || !currency || !Number.isFinite(rate) || rate <= 0) {
    return false;
  }

  // Stale entries often keep CAD after geo moved abroad.
  if (currency === 'CAD' && normalizeCountryKey(country) !== 'canada') {
    return false;
  }

  return true;
}

export async function getClientIpInBrowser(): Promise<string | null> {
  const services = ['https://api.ipify.org?format=json', 'https://api64.ipify.org?format=json'];

  for (const url of services) {
    try {
      const response = await fetch(url);
      const data = (await response.json()) as { ip?: string };
      const ip = data.ip?.trim();
      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        return ip;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function parseGeoPayload(data: Record<string, unknown>, fallbackIp?: string): GeoLookupResult | null {
  const success = data.success;
  if (success === false) {
    return null;
  }

  const ip = String(data.ip ?? data.query ?? fallbackIp ?? '').trim();
  const country = String(data.country ?? '').trim();
  const currency = resolveCurrencyForGeo(country, String(data.currency_code ?? data.currency ?? ''));

  if (!ip || !country) {
    return null;
  }

  return { ip, country, currency };
}

/** Match web geo lookup — ipwhois detects the request IP directly. */
export async function fetchGeoInfo(): Promise<GeoLookupResult> {
  try {
    const response = await fetch(IPWHOIS_URL);
    const data = (await response.json()) as Record<string, unknown>;
    const parsed = parseGeoPayload(data);
    if (parsed) {
      return parsed;
    }
  } catch {
    // Fall through to explicit IP lookup.
  }

  const visitorIp = await getClientIpInBrowser();
  if (!visitorIp) {
    throw new Error('Could not determine visitor IP for geo pricing.');
  }

  const response = await fetch(`${IPWHOIS_URL}${encodeURIComponent(visitorIp)}`);
  const data = (await response.json()) as Record<string, unknown>;
  const parsed = parseGeoPayload(data, visitorIp);
  if (!parsed) {
    throw new Error('Geo lookup failed.');
  }

  return parsed;
}

export async function fetchCurrencyRate(base: string, target: string): Promise<number | null> {
  const normalizedBase = (base || 'CAD').toLowerCase();
  const normalizedTarget = (target || '').toLowerCase();
  if (!normalizedTarget) {
    return null;
  }

  let payload: Record<string, unknown> | null;
  if (currencyJsonInflightByBase.has(normalizedBase)) {
    payload = await currencyJsonInflightByBase.get(normalizedBase)!;
  } else {
    const request = (async () => {
      try {
        const response = await fetch(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${normalizedBase}.json`,
        );
        return (await response.json()) as Record<string, unknown>;
      } catch {
        return null;
      } finally {
        currencyJsonInflightByBase.delete(normalizedBase);
      }
    })();
    currencyJsonInflightByBase.set(normalizedBase, request);
    payload = await request;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const rates = payload[normalizedBase] as Record<string, number> | undefined;
  return rates?.[normalizedTarget] ?? null;
}

export async function fetchSurchargeMap(country: string): Promise<Record<string, number> | null> {
  const key = country.trim();
  if (!key) {
    return null;
  }

  if (surchargeInflightByCountry.has(key)) {
    return surchargeInflightByCountry.get(key)!;
  }

  const request = (async () => {
    try {
      const response = await getUserShippingSurcharge(key);
      return (response ?? null) as Record<string, number> | null;
    } catch {
      return null;
    } finally {
      surchargeInflightByCountry.delete(key);
    }
  })();

  surchargeInflightByCountry.set(key, request);
  return request;
}

async function resolveCurrencyForCountry(countryName: string): Promise<string> {
  const fallback = COUNTRY_CURRENCY_FALLBACK[normalizeCountryKey(countryName)];
  if (fallback) {
    return fallback;
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=currencies`,
    );
    const data = (await response.json()) as Array<{ currencies?: Record<string, unknown> }>;
    const currencies = data[0]?.currencies;
    const code = currencies ? Object.keys(currencies)[0] : undefined;
    return code?.toUpperCase() ?? 'CAD';
  } catch {
    return 'CAD';
  }
}

function hasPricingContextChanged(prev: UserPricingInfo, next: UserPricingInfo): boolean {
  const prevRate = Number(prev.currencyRate ?? 1);
  const nextRate = Number(next.currencyRate ?? 1);

  return (
    String(prev.ip ?? '') !== String(next.ip ?? '') ||
    String(prev.country ?? '') !== String(next.country ?? '') ||
    String(prev.currency ?? '') !== String(next.currency ?? '') ||
    Math.abs(prevRate - nextRate) > 0.0001
  );
}

export function arePricingInfosEqual(prev: UserPricingInfo, next: UserPricingInfo): boolean {
  return !hasPricingContextChanged(prev, next);
}

export async function updateGuestPricingFromGeo(
  geoData: GeoLookupResult,
): Promise<{ userInfo: UserPricingInfo; changed: boolean }> {
  const prev = await getStoredUserPricingInfo();
  const currency = resolveCurrencyForGeo(geoData.country, geoData.currency);
  const currencyRate = (await fetchCurrencyRate('CAD', currency)) ?? 1;

  const userInfo: UserPricingInfo = {
    ip: geoData.ip,
    country: geoData.country,
    currency,
    currencyRate,
    surCharge: (await fetchSurchargeMap(geoData.country)) ?? undefined,
  };

  const changed = hasPricingContextChanged(prev, userInfo);
  await setStoredUserPricingInfo(userInfo);
  return { userInfo, changed };
}

export async function updateLoginPricingFromCountry(
  loginCountry: string,
  currentIp?: string | null,
): Promise<{ userInfo: UserPricingInfo; changed: boolean }> {
  const prev = await getStoredUserPricingInfo();
  const countryName = loginCountry.trim();
  const currency = await resolveCurrencyForCountry(countryName);
  const currencyRate = (await fetchCurrencyRate('CAD', currency)) ?? 1;

  const userInfo: UserPricingInfo = {
    ip: currentIp ?? prev.ip,
    country: countryName,
    currency,
    currencyRate,
    surCharge: (await fetchSurchargeMap(countryName)) ?? undefined,
  };

  const changed = hasPricingContextChanged(prev, userInfo);
  await setStoredUserPricingInfo(userInfo);
  return { userInfo, changed };
}

export async function refreshGuestGeoPricing(): Promise<{ userInfo: UserPricingInfo; changed: boolean }> {
  const stored = await getStoredUserPricingInfo();

  let geo: GeoLookupResult;
  try {
    geo = await fetchGeoInfo();
  } catch {
    if (isValidStoredPricingInfo(stored)) {
      return { userInfo: stored, changed: false };
    }

    return {
      userInfo: {
        currency: 'CAD',
        currencyRate: 1,
      },
      changed: !isValidStoredPricingInfo(stored),
    };
  }

  const currency = resolveCurrencyForGeo(geo.country, geo.currency);
  const storedCurrency = stored.currency?.trim().toUpperCase();
  const geoMatchesStored =
    stored.ip === geo.ip &&
    stored.country === geo.country &&
    storedCurrency === currency &&
    isValidStoredPricingInfo(stored);

  if (geoMatchesStored) {
    return { userInfo: stored, changed: false };
  }

  return updateGuestPricingFromGeo({ ...geo, currency });
}

export function resolveLoginCountry(profile: {
  country?: string;
  countryName?: string;
  Country?: string;
}): string | undefined {
  return profile.country?.trim() || profile.countryName?.trim() || profile.Country?.trim() || undefined;
}

export interface PricingBootstrapResult {
  userInfo: UserPricingInfo;
  changed: boolean;
  usedStoredSnapshot: boolean;
}

export async function bootstrapPricingContext(options: {
  isAuthenticated: boolean;
  loginCountry?: string;
}): Promise<PricingBootstrapResult> {
  if (options.isAuthenticated && options.loginCountry) {
    let currentIp: string | undefined;
    try {
      currentIp = (await fetchGeoInfo()).ip;
    } catch {
      const stored = await getStoredUserPricingInfo();
      currentIp = stored.ip;
    }

    const { userInfo, changed } = await updateLoginPricingFromCountry(
      options.loginCountry,
      currentIp,
    );
    return { userInfo, changed, usedStoredSnapshot: false };
  }

  const hadStoredSnapshot = isValidStoredPricingInfo(await getStoredUserPricingInfo());
  const { userInfo, changed } = await refreshGuestGeoPricing();
  return { userInfo, changed, usedStoredSnapshot: hadStoredSnapshot && !changed };
}
