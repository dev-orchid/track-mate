import axios from "axios";
import { getValidToken } from "./authHelper";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

axiosInstance.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // config.headers.Authorization = '';
  }
  return config;
});

export default axiosInstance;
