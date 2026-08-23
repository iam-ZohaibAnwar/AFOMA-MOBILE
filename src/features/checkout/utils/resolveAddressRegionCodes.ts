import { Country, State } from 'country-state-city';

const countryCodeCache = new Map<string, string>();

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export interface ResolvedAddressRegionCodes {
  countryCode: string;
  stateCode: string;
}

export function resolveCountryCode(countryName: string): string {
  const trimmed = countryName.trim();
  if (!trimmed) {
    return '';
  }

  if (/^[A-Z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const cacheKey = normalizeKey(trimmed);
  const cached = countryCodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const match =
    Country.getAllCountries().find(
      (country) =>
        normalizeKey(country.name) === cacheKey ||
        country.isoCode.toLowerCase() === cacheKey,
    ) ?? null;

  const countryCode = match?.isoCode ?? '';
  if (countryCode) {
    countryCodeCache.set(cacheKey, countryCode);
  }

  return countryCode;
}

export function resolveStateCode(countryCode: string, stateName: string): string {
  const trimmedState = stateName.trim();
  const trimmedCountry = countryCode.trim().toUpperCase();

  if (!trimmedState || !trimmedCountry) {
    return '';
  }

  if (/^[A-Z0-9]{1,3}$/i.test(trimmedState) && trimmedState.length <= 3) {
    return trimmedState.toUpperCase();
  }

  const states = State.getStatesOfCountry(trimmedCountry);
  const normalizedState = normalizeKey(trimmedState);

  const match =
    states.find(
      (state) =>
        normalizeKey(state.name) === normalizedState ||
        state.isoCode.toLowerCase() === normalizedState,
    ) ?? null;

  return match?.isoCode ?? '';
}

export function resolveAddressRegionCodes(params: {
  country?: string;
  state?: string;
  countryCode?: string;
  stateCode?: string;
}): ResolvedAddressRegionCodes {
  const countryCode =
    params.countryCode?.trim().toUpperCase() ||
    resolveCountryCode(params.country?.trim() ?? '');

  const stateCode =
    params.stateCode?.trim().toUpperCase() ||
    resolveStateCode(countryCode, params.state?.trim() ?? '');

  return {
    countryCode,
    stateCode,
  };
}
