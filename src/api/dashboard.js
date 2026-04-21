import request from "../utils/request";
import { requestFirstAvailable } from "./fallback";

export function getDashboardStats() {
  return request({
    url: "/api/dashboard/stats",
    method: "get"
  });
}

export function getNotifications() {
  return request({
    url: "/api/dashboard/notifications",
    method: "get"
  });
}

export function getCameras() {
  return request({
    url: "/api/dashboard/cameras",
    method: "get"
  });
}

// 获取普惠AI统计数据
export function getPovertyDashboardStats() {
  return request({
    url: "/api/poverty-ai/stats",
    method: "get"
  });
}

// 获取综合仪表盘数据（包含普惠AI统计）
export function getComprehensiveDashboardData() {
  return Promise.all([
    getDashboardStats(),
    getPovertyDashboardStats(),
    getCameras()
  ]).then(([stats, aiStats, cameras]) => ({
    basicStats: stats,
    aiStats: aiStats,
    cameras: cameras,
    timestamp: new Date().toISOString()
  }));
}
