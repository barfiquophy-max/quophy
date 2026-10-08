import axios, { AxiosError } from 'axios';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('quophy_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function apiError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === 'ERR_NETWORK') {
      return 'Connection problem. Please check your internet connection and try again.';
    }
    return (err.response?.data as any)?.error ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('quophy_token', token);
  else localStorage.removeItem('quophy_token');
}

export function imageUrl(path?: string | null) {
  if (!path) return '';
  return path.startsWith('http') ? path : path;
}
