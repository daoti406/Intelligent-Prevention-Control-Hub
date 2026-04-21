import request from "../utils/request";
import { POVERTY_AI_CONFIG } from "../config/povertyAI";

export function getWarnings(params) {
  return request({
    url: "/api/warning",
    method: "get",
    params
  });
}

export function updateWarningStatus(id, data) {
  return request({
    url: `/api/warning/${id}`,
    method: "put",
    data
  });
}

// 获取适合普惠AI处理的预警列表
export function getAISuitableWarnings() {
  return request({
    url: "/api/warning/ai-suitable",
    method: "get"
  });
}

// 使用普惠AI处理预警
export function handleWarningWithAI(warningId, options = {}) {
  return request({
    url: `/api/warning/${warningId}/handle-with-ai`,
    method: "post",
    data: options
  });
}

// 获取普惠AI预警分析统计
export function getAIWarningStats() {
  return request({
    url: "/api/warning/ai-stats",
    method: "get"
  });
}

// 预警趋势分析
export function getWarningTrendAnalysis(days = 30) {
  return request({
    url: "/api/warning/trend",
    method: "get",
    params: { days }
  });
}

// 普惠AI预警配置
export function getAIConfig() {
  return request({
    url: "/api/warning/ai-config",
    method: "get"
  });
}
