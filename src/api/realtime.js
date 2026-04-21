/**
 * 实时监测API接口
 * 调用后端实时监测相关接口
 */

import request from '../utils/request';

// 获取最新的视频流分析结果 (前端会定时调用)
export function getLatestResult() {
  return request({
    url: '/api/latest',
    method: 'get',
    timeout: 5000,  // 设置超时，避免请求阻塞
    // 注意：你的Python后端需要在启动时处理跨域，或者你在本地开发时配置Vite代理。
    // 更多关于Vite代理的配置方法，可以参考文档： `https://cn.vitejs.dev/config/server-options.html#server-proxy` 
  }).catch(error => {
    console.error("获取最新结果失败，请检查后端服务是否启动:", error);
    // 关键：当后端未启动时，返回一个默认的空数据，防止前端界面报错
    return {
      animal: "后端未连接",
      confidence: 0,
      alert_level: "离线",
      advice: "请检查后端服务是否启动"
    };
  });
}

// 获取历史记录（最近20条）
export function getHistory() {
  return request({
    url: '/api/history',
    method: 'get',
    timeout: 5000
  }).catch(error => {
    console.error("获取历史记录失败:", error);
    return [];
  });
}

// 获取AI养殖建议
export function getAIAdvice(query, animal_type = '', context = '') {
  return request({
    url: '/api/ai/advice',
    method: 'post',
    timeout: 10000,
    data: {
      query,
      animal_type,
      context
    }
  }).catch(error => {
    console.error("获取AI建议失败:", error);
    return { advice: "获取建议失败，请稍后重试" };
  });
}

// 测试后端服务是否正常
export function testBackend() {
  return request({
    url: '/api',
    method: 'get',
    timeout: 5000
  }).catch(error => {
    console.error("后端服务测试失败:", error);
    return { status: "error" };
  });
}

// 获取指定摄像头详情
export function getMonitorById(id) {
  return request({
    url: `/api/monitor/${id}`,
    method: 'get'
  });
}

// 获取监控统计
export function getMonitorStats() {
  return request({
    url: '/api/monitor/stats',
    method: 'get'
  });
}

// 获取历史记录
export function getHistoryRecords(cameraId, days = 7) {
  return request({
    url: `/api/monitor/history`,
    method: 'get',
    params: { cameraId, days }
  });
}

// 控制监控设备
export function controlMonitor(cameraId, action) {
  return request({
    url: `/api/monitor/control`,
    method: 'post',
    data: { cameraId, action }
  });
}

// 获取AI视觉分析
export function getAIVisualAnalysis(cameraId) {
  return request({
    url: `/api/monitor/ai-analysis/${cameraId}`,
    method: 'get'
  });
}

// 获取仪表盘数据
export function getDashboardStats() {
  return request({
    url: '/api/dashboard/stats',
    method: 'get'
  });
}

// 获取通知列表
export function getNotifications() {
  return request({
    url: '/api/dashboard/notifications',
    method: 'get'
  });
}

// 获取摄像头列表
export function getCameras() {
  return request({
    url: '/api/dashboard/cameras',
    method: 'get'
  });
}

// 获取预警列表
export function getWarnings(params) {
  return request({
    url: '/api/warning',
    method: 'get',
    params
  });
}

// 更新预警状态
export function updateWarningStatus(id, data) {
  return request({
    url: `/api/warning/${id}`,
    method: 'put',
    data
  });
}

// 获取知识库
export function getKnowledge(params) {
  return request({
    url: '/api/knowledge',
    method: 'get',
    params
  });
}

// 获取普惠AI统计
export function getPovertyAIStats() {
  return request({
    url: '/api/poverty-ai/stats',
    method: 'get'
  });
}

// 登录
export function login(data) {
  return request({
    url: '/api/auth',
    method: 'post',
    data
  });
}

// 获取当前用户
export function getCurrentUser() {
  return request({
    url: '/api/user/me',
    method: 'get'
  });
}

export default {
  getLatestResult,
  getHistory,
  getAIAdvice,
  getMonitorById,
  getMonitorStats,
  getHistoryRecords,
  controlMonitor,
  getAIVisualAnalysis,
  getDashboardStats,
  getNotifications,
  getCameras,
  getWarnings,
  updateWarningStatus,
  getKnowledge,
  getPovertyAIStats,
  login,
  getCurrentUser
};