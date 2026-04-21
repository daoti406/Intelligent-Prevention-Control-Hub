import axios from "axios";

const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api";
const useProxy = import.meta.env.VITE_USE_PROXY !== "false";
const directBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

const request = axios.create({
  baseURL: useProxy ? "" : directBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const SESSION_ID_PATTERN = /sessionId:\s*([A-Za-z0-9]+)/i;
const ASCII_HEADER_VALUE_PATTERN = /^[\x20-\x7E]+$/;

function sanitizeToken(rawToken) {
  if (!rawToken) return "";

  const token = String(rawToken).trim();
  const matchedSessionId = token.match(SESSION_ID_PATTERN);
  const normalizedToken = matchedSessionId?.[1] || token;

  return ASCII_HEADER_VALUE_PATTERN.test(normalizedToken) ? normalizedToken : "";
}

request.interceptors.request.use(
  (config) => {
    const token = sanitizeToken(localStorage.getItem("authToken"));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
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
