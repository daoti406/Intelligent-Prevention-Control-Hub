import axios from "axios";

const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api";
const useProxy = import.meta.env.VITE_USE_PROXY !== "false";
const directBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

const request = axios.create({
  baseURL: useProxy ? apiPrefix : directBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "请求失败";

    return Promise.reject(new Error(message));
  },
);

export default request;
