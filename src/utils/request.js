import axios from "axios";

const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api";
const useProxy = import.meta.env.VITE_USE_PROXY !== "false";
const directBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

// 重试配置
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

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
    // 初始化重试计数
    if (!config.retries) {
      config.retries = 0;
    }
    
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
    const config = error.config;

    // 检查是否需要重试
    if (config && config.retries < MAX_RETRIES) {
      config.retries += 1;
      console.log(`请求失败，正在重试 (${config.retries}/${MAX_RETRIES})...`);

      // 延迟重试
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(request(config));
        }, RETRY_DELAY);
      });
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "请求失败";

    return Promise.reject(new Error(message));
  },
);

export default request;
