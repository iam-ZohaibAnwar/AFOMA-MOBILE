import axios from 'axios';

import { env } from '../../app/config/env';
import { getAccessToken } from '../storage/secureStorage';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': env.apiKey,
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
