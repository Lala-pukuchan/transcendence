import axios, { AxiosInstance } from "axios";

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});