import { Country, State, type ICountry, type IState } from 'country-state-city';

import { resolveCountryCode, resolveStateCode } from '../features/checkout/utils/resolveAddressRegionCodes';

export interface SelectOption {
  label: string;
  value: string;
}

export interface CountryStateSelection {
  country: string;
  state: string;
  countryCode: string;
  stateCode: string;
}

export function getCountrySelectOptions(): SelectOption[] {
  return Country.getAllCountries()
    .map((country) => ({
      label: country.name,
      value: country.name,
      isoCode: country.isoCode,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
    .map(({ label, value }) => ({ label, value }));
}

export function getStateSelectOptions(countryCode: string): SelectOption[] {
  const code = countryCode.trim().toUpperCase();
  if (!code) {
    return [];
  }

  return State.getStatesOfCountry(code)
    .map((state) => ({
      label: state.name,
      value: state.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function findCountryByName(countryName: string): ICountry | undefined {
  const trimmed = countryName.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.toLowerCase();
  return (
    Country.getAllCountries().find(
      (country) =>
        country.name.toLowerCase() === normalized ||
        country.isoCode.toLowerCase() === normalized,
    ) ?? undefined
  );
}

export function findStateByName(countryCode: string, stateName: string): IState | undefined {
  const trimmedState = stateName.trim();
  const code = countryCode.trim().toUpperCase();

  if (!trimmedState || !code) {
    return undefined;
  }

  const normalized = trimmedState.toLowerCase();
  return (
    State.getStatesOfCountry(code).find(
      (state) =>
        state.name.toLowerCase() === normalized ||
        state.isoCode.toLowerCase() === normalized,
    ) ?? undefined
  );
}

export function resolveCountryStateSelection(params: {
  country?: string;
  state?: string;
  countryCode?: string;
  stateCode?: string;
}): CountryStateSelection {
  const matchedCountry = params.country ? findCountryByName(params.country) : undefined;
  const countryCode =
    params.countryCode?.trim().toUpperCase() ||
    matchedCountry?.isoCode ||
    resolveCountryCode(params.country ?? '');

  const matchedState =
    countryCode && params.state ? findStateByName(countryCode, params.state) : undefined;

  const stateCode =
    params.stateCode?.trim().toUpperCase() ||
    matchedState?.isoCode ||
    resolveStateCode(countryCode, params.state ?? '');

  return {
    country: matchedCountry?.name ?? params.country?.trim() ?? '',
    state: matchedState?.name ?? params.state?.trim() ?? '',
    countryCode,
    stateCode,
  };
}

export function createCountryStateSelection(
  countryName: string,
  stateName = '',
  existing?: Partial<CountryStateSelection>,
): CountryStateSelection {
  const country = findCountryByName(countryName);
  const countryCode = country?.isoCode ?? existing?.countryCode ?? resolveCountryCode(countryName);

  if (!stateName.trim()) {
    return {
      country: country?.name ?? countryName,
      state: '',
      countryCode,
      stateCode: '',
    };
  }

  const state = findStateByName(countryCode, stateName);
  return {
    country: country?.name ?? countryName,
    state: state?.name ?? stateName,
    countryCode,
    stateCode: state?.isoCode ?? existing?.stateCode ?? resolveStateCode(countryCode, stateName),
  };
}
