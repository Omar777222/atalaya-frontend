import { request } from './httpClient.js';

export const dashboardService = {
  get: (token) => request('/dashboard', { token }),
};
