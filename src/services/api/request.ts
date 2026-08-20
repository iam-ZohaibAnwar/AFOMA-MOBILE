import type { AxiosRequestConfig } from 'axios';

import { apiClient } from './client';
import { toApiError } from './errors';

export async function apiRequest<T>(
  config: AxiosRequestConfig,
  fallbackMessage = 'Request failed',
): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw toApiError(error, fallbackMessage);
  }
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
  fallbackMessage = 'Request failed',
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'GET', url }, fallbackMessage);
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallbackMessage = 'Request failed',
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'POST', url, data }, fallbackMessage);
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallbackMessage = 'Request failed',
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'PUT', url, data }, fallbackMessage);
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
  fallbackMessage = 'Request failed',
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'DELETE', url }, fallbackMessage);
}
