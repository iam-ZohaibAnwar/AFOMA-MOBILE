/** Parse a stored `YYYY-MM-DD` value into a local calendar date. */
export function parseDateInputValue(value?: string): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Format a calendar date as `YYYY-MM-DD` for API/form state. */
export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateInputDisplay(value?: string): string {
  const parsed = parseDateInputValue(value);
  if (!parsed) {
    return value?.trim() ?? '';
  }

  return formatDateInputValue(parsed);
}

/** Local calendar date at start of today — useful as a date picker minimum. */
export function getTodayStartDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Local calendar date N years from now — useful as a far-future picker maximum. */
export function getDateYearsFromNow(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  date.setHours(23, 59, 59, 999);
  return date;
}
