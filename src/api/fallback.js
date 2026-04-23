import request from "../utils/request";

export async function requestFirstAvailable(configs) {
  let lastError = null;

  for (const config of configs) {
    try {
      return await request(config);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("未找到可用接口");
}
