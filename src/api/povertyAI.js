/**
 * 普惠AI专用API接口
 * 提供普惠AI分析、成本优化统计、预警智能处理等功能
 */

import request from "../utils/request";
import { POVERTY_AI_CONFIG, POVERTY_AI_ANALYSIS_TYPES, POVERTY_AI_ACTIONS } from "../config/povertyAI";
import { getWarnings } from "./warning";

// 普惠AI统计数据
export async function getPovertyAIStats() {
  return request({
    url: "/api/poverty-ai/stats",
    method: "get"
  });
}

// 普惠AI分析预警
export async function analyzeWarningWithPovertyAI(warningData) {
  return request({
    url: "/api/poverty-ai/analyze",
    method: "post",
    data: warningData
  });
}

// 获取普惠AI适处理预警列表
export async function getSuitableWarningsForAI(params = {}) {
  const response = await getWarnings(params);
  const allWarnings = response.data || [];

  const suitableWarnings = allWarnings.filter(warning =>
    POVERTY_AI_CONFIG.warningThresholds.suitableTypes.includes(warning.type) &&
    ['low', 'medium'].includes(warning.level)
  );

  return {
    data: suitableWarnings,
    total: suitableWarnings.length,
    aiEligibilityRatio: (suitableWarnings.length / allWarnings.length * 100).toFixed(1)
  };
}

// 普惠AI智能成本效益报告
export async function generateCostBenefitReport(farmSize = 'mediumFarm') {
  const config = POVERTY_AI_CONFIG.costOptimization.deploymentScenarios[farmSize] ||
                POVERTY_AI_CONFIG.costOptimization.deploymentScenarios.mediumFarm;

  return {
    reportId: `CB_${Date.now()}`,
    farmSize,
    traditionalInvestment: config.traditionalCost,
    aiInvestment: config.estimatedCost,
    totalSaving: config.saving,
    roiMonths: Math.ceil(config.estimatedCost / (config.saving / 12)),
    keyBenefits: [
      "硬件成本降低70%以上",
      "维护成本减少60%",
      "系统部署时间缩短50%",
      "预警准确率提升30%"
    ],
    deploymentTimeline: {
      hardwareSetup: "1-2周",
      aiModelTraining: "2-3天",
      systemIntegration: "1周",
      totalDeployment: "3-4周"
    }
  };
}

// 普惠AI性能监控数据
export async function getAIPerformanceMetrics(timeRange = '7d') {
  return request({
    url: "/api/poverty-ai/performance",
    method: "get",
    params: { timeRange }
  });
}

// 边缘智能API集成
export async function getEdgeComputingStatus() {
  return request({
    url: "/api/poverty-ai/edge-status",
    method: "get"
  });
}