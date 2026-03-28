import request from "../utils/request";

export function getRanches(params) {
  return request({
    url: "/ranches",
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
