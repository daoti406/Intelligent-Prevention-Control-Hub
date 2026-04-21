import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPrefix = env.VITE_API_PREFIX || "/api";
  const apiTarget = env.VITE_API_BASE_URL || "http://127.0.0.1:8081";
  const useProxy = env.VITE_USE_PROXY !== "false";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'lodash-es': 'lodash',
        'lodash-unified': 'lodash'
      },
      dedupe: ['vue', 'lodash', 'lodash-es', 'lodash-unified']
    },
    optimizeDeps: {
      include: ['lodash']
    },
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
