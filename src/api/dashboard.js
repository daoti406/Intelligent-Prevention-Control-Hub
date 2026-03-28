import request from "../utils/request";

export function getDashboardStats() {
  return request({
    url: "/dashboard/stats",
    method: "get",
  });
}

export function getNotifications() {
  return request({
    url: "/notifications",
    method: "get",
  });
}

export function getCameras() {
  return request({
    url: "/cameras",
    method: "get",
  });
}
