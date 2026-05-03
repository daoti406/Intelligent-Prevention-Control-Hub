/**
 * 实时监测 API
 * 对后端返回结构做兼容处理，避免前端页面因字段差异报错。
 */

import request from "../utils/request";

function unwrapPayload(payload) {
  if (!payload || typeof payload !== "object") return {};
  if (payload.data && typeof payload.data === "object") return payload.data;
  return payload;
}

function normalizeConfidence(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  return Math.max(0, Math.min(1, numeric));
}

function normalizeLatestResult(payload) {
  const data = unwrapPayload(payload);
  const result = data.result && typeof data.result === "object" ? data.result : data;

  return {
    animal: result.animal || "未知",
    confidence: normalizeConfidence(result.confidence),
    alert_level: result.alert_level || result.alertLevel || "低",
    advice: result.advice || "暂无建议",
    timestamp: result.timestamp || new Date().toISOString(),
  };
}

function offlineLatestResult() {
  return {
    animal: "后端未连接",
    confidence: 0,
    alert_level: "离线",
    advice: "请检查后端服务是否启动",
    timestamp: new Date().toISOString(),
  };
}

export function getLatestResult() {
  return request({
    url: "/api/latest",
    method: "get",
    timeout: 5000,
  })
    .then((res) => normalizeLatestResult(res))
    .catch((error) => {
      console.error("获取最新结果失败，请检查后端服务是否启动:", error);
      return offlineLatestResult();
    });
}

export function getRealtimeData() {
  return getLatestResult();
}

export function getHistory() {
  return request({
    url: "/api/history",
    method: "get",
    timeout: 5000,
  })
    .then((res) => {
      const data = unwrapPayload(res);
      return Array.isArray(data) ? data : Array.isArray(data.list) ? data.list : [];
    })
    .catch((error) => {
      console.error("获取历史记录失败:", error);
      return [];
    });
}

export function getAIAdvice(query, animal_type = "", context = "") {
  return request({
    url: "/api/ai/advice",
    method: "post",
    timeout: 10000,
    data: {
      query,
      animal_type,
      context,
    },
  })
    .then((res) => {
      const data = unwrapPayload(res);
      return {
        advice: data.advice || data.reply || "暂无建议",
      };
    })
    .catch((error) => {
      console.error("获取 AI 建议失败:", error);
      return { advice: "获取建议失败，请稍后重试" };
    });
}

export function sendAIChat(messages) {
  return request({
    url: "/api/ai/chat",
    method: "post",
    timeout: 30000,
    data: { messages },
  })
    .then((res) => {
      const data = unwrapPayload(res);
      return {
        reply: data.reply || data.content || data.answer || "",
      };
    })
    .catch((error) => {
      console.error("AI 对话请求失败:", error);
      return { reply: "网络异常，请检查后端服务是否启动" };
    });
}

export function testBackend() {
  return request({
    url: "/api/latest",
    method: "get",
    timeout: 5000,
  })
    .then((res) => {
      const data = normalizeLatestResult(res);
      return {
        status: "ok",
        ...data,
      };
    })
    .catch((error) => {
      console.error("后端服务测试失败:", error);
      return { status: "error" };
    });
}

export default {
  getLatestResult,
  getRealtimeData,
  getHistory,
  getAIAdvice,
  sendAIChat,
  testBackend,
};
