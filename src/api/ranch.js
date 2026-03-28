import request from "../utils/request";

const farmBaseUrl = import.meta.env.VITE_FARM_API_BASE_URL || "";

export function getRanches(params) {
  return request({
    url: farmBaseUrl ? `${farmBaseUrl}/farm/list` : "/farm/list",
    method: "get",
    params,
  });
}

export function createRanch(data) {
  return request({
    url: "/ranches",
    method: "post",
    data,
  });
}

export function updateRanch(id, data) {
  return request({
    url: `/ranches/${id}`,
    method: "put",
    data,
  });
}

export function deleteRanch(id) {
  return request({
    url: `/ranches/${id}`,
    method: "delete",
  });
}
