import axios, { AxiosInstance } from "axios";
import { getCookie } from './utils/HandleCookie.tsx';

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptorを追加
httpClient.interceptors.request.use((config) => {
  const token = getCookie('token'); // トークンの取得方法に応じて適切に書き換えてください

  // トークンが存在すれば、ヘッダーに追加
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['Content-Type'] = 'application/json';

  return config;
}, (error) => {
  return Promise.reject(error);
});