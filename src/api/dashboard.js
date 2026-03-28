import request from "../utils/request";
import { requestFirstAvailable } from "./fallback";

export function getDashboardStats() {
  return requestFirstAvailable([
    { url: "/dashboard/stats", method: "get" },
    { url: "/data/stats", method: "get" },
    { url: "/home/stats", method: "get" },
    { url: "/overview/stats", method: "get" },
  ]);
}

export function getNotifications() {
  return requestFirstAvailable([
    { url: "/notifications", method: "get" },
    { url: "/notice/list", method: "get" },
    { url: "/message/list", method: "get" },
    { url: "/inform/list", method: "get" },
  ]);
}

export function getCameras() {
  return request({
    url: "/cameras",
    method: "get",
  });
}
