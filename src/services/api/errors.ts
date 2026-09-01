import axios from 'axios';

export class ApiError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.error === 'string' && record.error.length > 0) {
        return record.error;
      }
      if (typeof record.message === 'string' && record.message.length > 0) {
        return record.message;
      }
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export function toApiError(error: unknown, fallback = 'Something went wrong'): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return new ApiError(getErrorMessage(error, fallback), error.response?.status);
  }

  return new ApiError(getErrorMessage(error, fallback));
}
