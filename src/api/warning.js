import request from "../utils/request";
import { requestFirstAvailable } from "./fallback";
import { POVERTY_AI_CONFIG } from "../config/povertyAI";

// 本地模拟数据
const mockWarnings = [
  {
    id: 1,
    time: "2025-01-11 10:23",
    location: "A区猪舍1号",
    type: "温度异常",
    description: "温度超过阈值28°C，当前28.5°C",
    level: "medium",
    status: "待处理",
  },
  {
    id: 2,
    time: "2025-01-11 09:15",
    location: "B区鸡舍2号",
    type: "湿度异常",
    description: "湿度过低，当前45%",
    level: "low",
    status: "处理中",
  },
  {
    id: 3,
    time: "2025-01-11 08:42",
    location: "A区猪舍2号",
    type: "设备离线",
    description: "摄像头设备连接断开",
    level: "high",
    status: "待处理",
  },
  {
    id: 4,
    time: "2025-01-11 07:30",
    location: "C区牛舍1号",
    type: "健康异常",
    description: "检测到异常行为模式",
    level: "medium",
    status: "已处理",
  },
  {
    id: 5,
    time: "2025-01-11 06:15",
    location: "B区鸡舍1号",
    type: "饲料不足",
    description: "饲料库存低于阈值",
    level: "low",
    status: "已处理",
  },
];

export function getWarnings(params) {
  // 返回本地模拟数据，支持搜索
  let filtered = [...mockWarnings];
  
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase();
    filtered = filtered.filter(w => 
      w.location.toLowerCase().includes(keyword) ||
      w.type.toLowerCase().includes(keyword) ||
      w.description.toLowerCase().includes(keyword) ||
      w.status.toLowerCase().includes(keyword)
    );
  }
  
  if (params?.level) {
    filtered = filtered.filter(w => w.level === params.level);
  }
  
  if (params?.status) {
    filtered = filtered.filter(w => w.status === params.status);
  }
  
  return Promise.resolve({
    data: filtered,
    total: filtered.length,
    current: 1,
    size: filtered.length
  });
}

export function updateWarningStatus(id, data) {
  // 模拟更新
  return Promise.resolve({ success: true });
}

// 获取适合普惠AI处理的预警列表
export function getAISuitableWarnings() {
  const suitableWarnings = mockWarnings.filter(warning => 
    POVERTY_AI_CONFIG.warningThresholds.suitableTypes.includes(warning.type) &&
    ['low', 'medium'].includes(warning.level)
  );
  
  return Promise.resolve({
    data: suitableWarnings,
    total: suitableWarnings.length,
    eligibilityRate: (suitableWarnings.length / mockWarnings.length * 100).toFixed(1)
  });
}

// 使用普惠AI处理预警
export function handleWarningWithAI(warningId, options = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const warning = mockWarnings.find(w => w.id === warningId);
      if (!warning) {
        resolve({ success: false, message: '预警不存在' });
        return;
      }
      
      // 模拟AI处理逻辑
      const isSuitable = POVERTY_AI_CONFIG.warningThresholds.suitableTypes.includes(warning.type);
      const riskLevel = warning.level === 'high' ? 0.7 : warning.level === 'medium' ? 0.5 : 0.2;
      
      const result = {
        success: true,
        warningId,
        handledByAI: isSuitable && riskLevel < 0.6,
        aiAnalysis: {
          riskScore: riskLevel,
          confidence: 0.85 + Math.random() * 0.15,
          costSaving: isSuitable ? 45 + Math.random() * 15 : 0,
          processingTime: Math.random() * 200 + 100
        },
        recommendations: isSuitable ? [
          '普惠AI自动处理已成功',
          '预计节省人工处理成本',
          '边缘计算节点已验证结果'
        ] : [
          '高风险预警，建议人工审核',
          'AI分析已完成，等待人工确认'
        ]
      };
      
      resolve(result);
    }, 1500);
  });
}

// 获取普惠AI预警分析统计
export function getAIWarningStats() {
  const totalWarnings = mockWarnings.length;
  const aiProcessed = mockWarnings.filter(w => 
    POVERTY_AI_CONFIG.warningThresholds.suitableTypes.includes(w.type) &&
    w.status === '已处理'
  ).length;
  
  return Promise.resolve({
    totalWarnings,
    aiProcessed,
    aiSuccessRate: (aiProcessed / totalWarnings * 100).toFixed(1),
    avgProcessingTime: 156,
    costSavingPerWarning: 125,
    monthlySavings: aiProcessed * 125
  });
}

// 预警趋势分析
export function getWarningTrendAnalysis(days = 30) {
  const baseDate = new Date();
  const trends = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      totalWarnings: Math.floor(Math.random() * 8 + 2),
      aiProcessed: Math.floor(Math.random() * 6 + 1),
      avgResponseTime: Math.floor(Math.random() * 100 + 50),
      successRate: 85 + Math.random() * 15
    });
  }
  
  return Promise.resolve(trends);
}

// 普惠AI预警配置
export function getAIConfig() {
  return Promise.resolve({
    enabled: true,
    autoProcessing: true,
    riskThresholds: POVERTY_AI_CONFIG.warningThresholds,
    models: POVERTY_AI_CONFIG.aiModels,
    performanceTargets: {
      accuracy: 90,
      responseTime: 200,
      costSaving: 40
    }
  });
}
