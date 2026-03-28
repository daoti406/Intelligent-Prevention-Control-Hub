import request from "../utils/request";

export function getWarnings(params) {
  return request({
    url: "/warnings",
    method: "get",
    params,
  });
}

export function updateWarningStatus(id, data) {
  return request({
    url: `/warnings/${id}`,
    method: "patch",
    data,
  });
}
