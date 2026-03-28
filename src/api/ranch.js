import request from "../utils/request";

export function getRanches(params) {
  return request({
    url: "/farm/page",
    method: "get",
    params: { current: 1, size: 100, ...params },
  });
}

export function createRanch(data) {
  return request({
    url: "/farm/add",
    method: "get",
    params: data,
  });
}

export function updateRanch(id, data) {
  return request({
    url: "/farm/update",
    method: "get",
    params: { id, ...data },
  });
}

export function deleteRanch(id) {
  return request({
    url: "/farm/delete",
    method: "get",
    params: { id },
  });
}
