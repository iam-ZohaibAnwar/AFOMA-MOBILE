export function parseGetPaidCommissionId(
  params: { token?: string; commissionId?: string } | undefined,
): string | null {
  const token = params?.token?.trim();
  if (token) {
    return token;
  }

  const commissionId = params?.commissionId?.trim();
  if (commissionId) {
    return commissionId;
  }

  return null;
}

/** Fallback parser for raw deep-link URLs outside React Navigation linking. */
export function parseGetPaidCommissionIdFromUrl(url: string): string | null {
  try {
    const normalized = url.includes('://') ? url : `https://${url}`;
    const parsed = new URL(normalized);
    const token = parsed.searchParams.get('token')?.trim();
    if (token) {
      return token;
    }

    const commissionId = parsed.searchParams.get('commissionId')?.trim();
    if (commissionId) {
      return commissionId;
    }

    return null;
  } catch {
    return null;
  }
}
