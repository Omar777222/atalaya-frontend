import { request } from './httpClient.js';

export const authService = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: (token) => request('/auth/me', { token }),
  logout: (token) => request('/auth/logout', { method: 'POST', token }),
};
