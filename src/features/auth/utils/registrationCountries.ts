import { useMemo } from 'react';

import { getCountrySelectOptions, type SelectOption } from '../../../utils/regionOptions';
import { BLOCKED_REGISTRATION_COUNTRIES } from '../constants/registrationOptions';

const blockedCountrySet = new Set(
  BLOCKED_REGISTRATION_COUNTRIES.map((country) => country.toLowerCase()),
);

export function getRegistrationCountryOptions(): SelectOption[] {
  return getCountrySelectOptions().filter(
    (option) => !blockedCountrySet.has(option.value.toLowerCase()),
  );
}

export function useRegistrationCountryOptions(): SelectOption[] {
  return useMemo(() => getRegistrationCountryOptions(), []);
}
