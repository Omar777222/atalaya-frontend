import { request } from './httpClient.js';

export const idsService = {
  overview: (token) => request('/ids/overview', { token }),
  alerts: (token, { sensor, objective, limit, after } = {}) => request('/ids/alerts', { token, query: { sensor, objective, limit, after } }),
  setup: (token) => request('/ids/setup', { token }),
  reset: (token) => request('/ids/reset', { method: 'POST', token }),
};
