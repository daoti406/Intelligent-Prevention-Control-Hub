import request from "../utils/request";
import { requestFirstAvailable } from "./fallback";

export function getWarnings(params) {
  return requestFirstAvailable([
    { url: "/warnings", method: "get", params },
    { url: "/warning/list", method: "get", params },
    { url: "/alert/list", method: "get", params },
    { url: "/warn/list", method: "get", params },
  ]);
}

export function updateWarningStatus(id, data) {
  return request({
    url: `/warnings/${id}`,
    method: "patch",
    data,
  });
}
