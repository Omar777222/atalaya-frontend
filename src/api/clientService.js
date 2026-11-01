import { request } from './httpClient.js';

export const clientService = {
  summary: (token) => request('/client/summary', { token }),
};
