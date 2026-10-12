import { request } from './httpClient.js';

export const assetsService = {
  search: (token, q) => request('/assets', { token, query: { q } }),
};
