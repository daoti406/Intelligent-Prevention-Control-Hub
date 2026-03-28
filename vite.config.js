import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPrefix = env.VITE_API_PREFIX || "/api";
  const apiTarget = env.VITE_API_BASE_URL || "http://127.0.0.1:8080";
  const useProxy = env.VITE_USE_PROXY !== "false";

  return {
    plugins: [vue()],
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: useProxy
        ? {
            [apiPrefix]: {
              target: apiTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  };
});
