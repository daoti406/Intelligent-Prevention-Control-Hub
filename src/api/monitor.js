/**
 * 监控相关API接口
 * 提供实时监控数据、设备状态、现场画面等功能
 */

import request from "../utils/request";

// 获取所有监控摄像头
export function getMonitors() {
  return request({
    url: "/api/monitor",
    method: "get"
  });
}

// 获取指定监控摄像头的实时数据
export function getMonitorById(id) {
  return request({
    url: `/api/monitor/${id}`,
    method: "get"
  });
}

// 监控统计信息
export function getMonitorStats() {
  return request({
    url: "/api/monitor/stats",
    method: "get"
  });
}

// 获取监控历史数据
export function getMonitorHistory(cameraId, days = 7) {
  return request({
    url: "/api/monitor/history",
    method: "get",
    params: { cameraId, days }
  });
}

// 控制监控设备
export function controlMonitor(cameraId, action) {
  return request({
    url: "/api/monitor/control",
    method: "post",
    data: { cameraId, action }
  });
}

// mmcow视觉分析状态（MOCK模拟）
export function getAIVisualAnalysis(cameraId) {
  return request({
    url: `/api/monitor/ai-analysis/${cameraId}`,
    method: "get"
  });
}

// 获取摄像头配置
export function getCameraConfig(cameraId) {
  return request({
    url: `/api/monitor/config/${cameraId}`,
    method: "get"
  });
}

// 更新摄像头配置
export function updateCameraConfig(cameraId, config) {
  return request({
    url: `/api/monitor/config/${cameraId}`,
    method: "put",
    data: config
  });
}

export default {
  getMonitors,
  getMonitorById,
  getMonitorStats,
  getMonitorHistory,
  controlMonitor,
  getAIVisualAnalysis,
  getCameraConfig,
  updateCameraConfig
};