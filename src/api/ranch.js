import request from "../utils/request";

// 尝试多个可能的接口
const farmEndpoints = {
  list: ["/farm/list"],
  add: ["/farm/add", "/farm", "/farm/create"],
  update: ["/farm/update", "/farm/edit"],
  delete: ["/farm/delete", "/farm/remove"],
};

async function tryRequest(urls, config) {
  let lastError = null;
  for (const url of urls) {
    try {
      return await request({ url, ...config });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function getRanches(params) {
  return tryRequest(farmEndpoints.list, { method: "get", params });
}

export function createRanch(data) {
  return tryRequest(farmEndpoints.add, { method: "post", data });
}

export function updateRanch(id, data) {
  return tryRequest(farmEndpoints.update, { method: "put", data: { id, ...data } });
}

export function deleteRanch(id) {
  return tryRequest(farmEndpoints.delete, { method: "delete", params: { id } });
}
