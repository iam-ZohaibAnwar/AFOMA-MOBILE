import type {
  AdminSellerBasicInfoFormValues,
  AdminSellerListItem,
} from '../types/adminSellerManagement';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALPHABETS_PATTERN = /^[A-Za-z\s]+$/;

export function adminBasicInfoFormFromSeller(
  seller?: AdminSellerListItem | null,
): AdminSellerBasicInfoFormValues {
  return {
    firstName: seller?.firstName?.trim() ?? '',
    lastName: seller?.lastName?.trim() ?? '',
    email: seller?.email?.trim() ?? '',
    gender: seller?.gender?.trim() ?? '',
    dob: seller?.DOB ? seller.DOB.slice(0, 10) : '',
    phone: seller?.phone?.trim() ?? '',
  };
}

export function validateAdminSellerBasicInfoForm(
  values: AdminSellerBasicInfoFormValues,
): Partial<Record<keyof AdminSellerBasicInfoFormValues, string>> {
  const errors: Partial<Record<keyof AdminSellerBasicInfoFormValues, string>> = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Required';
  } else if (!ALPHABETS_PATTERN.test(values.firstName.trim())) {
    errors.firstName = 'Only alphabets allowed';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Required';
  }

  if (!values.email.trim()) {
    errors.email = 'Required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Invalid email';
  }

  return errors;
}

/** Admin PUT payload — excludes approval/status and seller profileSetup flags. */
export function buildAdminSellerBasicInfoPayload(values: AdminSellerBasicInfoFormValues) {
  const payload: {
    firstName: string;
    lastName: string;
    email: string;
    DOB?: string;
    gender?: string;
    phone?: string;
  } = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
  };

  if (values.gender.trim()) {
    payload.gender = values.gender.trim();
  }

  if (values.dob.trim()) {
    payload.DOB = values.dob.trim();
  }

  if (values.phone.trim()) {
    payload.phone = values.phone.trim();
  }

  return payload;
}

export function formatAdminSellerDob(value?: string): string {
  if (!value?.trim()) {
    return '—';
  }

  const dateOnly = value.slice(0, 10);
  const parsed = new Date(`${dateOnly}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatAdminSellerGender(value?: string): string {
  if (!value?.trim()) {
    return '—';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  if (normalized === 'other') return 'Other';
  return value.trim();
}

export function formatAdminSellerField(value?: string | null): string {
  if (!value?.trim()) {
    return '—';
  }

  return value.trim();
}
