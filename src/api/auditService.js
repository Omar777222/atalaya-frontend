import { request } from './httpClient.js';

export const auditService = {
  list: (token, { type, limit = 50 } = {}) => request('/audit', { token, query: { type, limit } }),
};
