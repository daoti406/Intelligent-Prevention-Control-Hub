/**
 * mmcow视觉AI系统配置
 * 基于视觉传感器替代技术，实现成本优化的普惠农业AI方案
 */

export const POVERTY_AI_CONFIG = {
  // 基础配置
  name: "慧牧云眸-mmcow视觉AI系统",
  version: "2.0.0",
  
  // 视觉传感器替代技术配置
  visualSensorReplacement: {
    enabled: true,
    costReductionTarget: 70, // 目标成本降低70%
    devicesSupported: [
      "普通高清摄像头",
      "红外摄像头", 
      "多光谱摄像头"
    ],
    softwareEnhancements: [
      "图像增强算法",
      "虚拟环境传感器",
      "边缘计算预处理",
      "AI数据融合"
    ]
  },
  
  // 小样本学习配置
  fewShotLearning: {
    enabled: true,
    minimumSamples: 50, // 最少50个样本开始学习
    activeLearning: true,
    transferLearning: {
      baseModel: "ResNet50",
      fineTuning: "领域自适应"
    }
  },
  
  // 成本优化配置
  costOptimization: {
    hardwareSaving: {
      traditional: 15000, // 传统传感器投入 ¥15,000
      povertyAI: 5000,    // mmcow视觉AI设备投入 ¥5,000
      savingPercent: 66.7  // 节省66.7%
    },
    deploymentScenarios: {
      // 不同规模的部署配置
      smallFarm: {
        cameras: 3,
        aiServers: 1,
        estimatedCost: 8000,
        traditionalCost: 25000,
        saving: 17000
      },
      mediumFarm: {
        cameras: 8,
        aiServers: 2,
        estimatedCost: 18000,
        traditionalCost: 65000,
        saving: 47000
      },
      largeFarm: {
        cameras: 20,
        aiServers: 3,
        estimatedCost: 35000,
        traditionalCost: 150000,
        saving: 115000
      }
    }
  },
  
  // AI模型配置
  aiModels: {
    // 行为识别模型
    behaviorRecognition: {
      accuracy: 92.5,
      latency: "<100ms",
      features: ["异常行为", "健康状况", "应激反应"]
    },
    // 健康监测模型
    healthMonitoring: {
      accuracy: 89.3,
      latency: "<200ms", 
      features: ["体温异常", "呼吸频率", "食欲状态"]
    },
    // 环境分析模型
    environmentAnalysis: {
      accuracy: 95.1,
      latency: "<150ms",
      features: ["温度异常", "湿度异常", "空气质量"]
    }
  },
  
  // 边缘计算配置
  edgeComputing: {
    enabled: true,
    predictionInterval: 5, // 5秒预测间隔
    localProcessing: true,
    syncToCloud: false, // 仅在必要时同步云端
    optimizationMethods: [
      "模型量化",
      "模型剪枝", 
      "缓存优化",
      "并行计算"
    ]
  },
  
  // 预警阈值配置
  warningThresholds: {
    // 适合mmcow视觉AI处理的预警类型
    suitableTypes: [
      "温度异常",
      "湿度异常", 
      "空气质量异常",
      "进食异常",
      "轻度行为异常"
    ],
    // 不适合AI处理的高风险预警
    highRiskTypes: [
      "设备离线",
      "紧急健康异常",
      "高危险性行为"
    ],
    // 自动处理阈值
    autoHandleThreshold: 0.4, // 风险系数低于0.4可自动处理
    manualReviewThreshold: 0.6  // 风险系数高于0.6需人工审核
  },
  
  // 性能监控配置
  performanceMonitoring: {
    collectMetrics: true,
    metricsToTrack: [
      "ai_accuracy",
      "response_time", 
      "cost_savings",
      "warning_handled",
      "prediction_accuracy"
    ],
    alertThresholds: {
      accuracyBelow: 85,
      responseTimeAbove: 500, // ms
      falsePositiveAbove: 5    // %
    }
  }
};

// mmcow视觉AI分析类型定义
export const POVERTY_AI_ANALYSIS_TYPES = {
  COST_SAVING: 'cost_saving',
  RISK_ASSESSMENT: 'risk_assessment',
  HEALTH_PREDICTION: 'health_prediction',
  BEHAVIOR_ANALYSIS: 'behavior_analysis',
  ENVIRONMENT_OPTIMIZATION: 'environment_optimization'
};

// mmcow视觉AI处理结果类型
export const POVERTY_AI_ACTIONS = {
  AUTO_HANDLE: 'auto_handle',       // 自动处理
  MANUAL_REVIEW: 'manual_review',    // 人工审核
  ESCALATE: 'escalate',             // 升级处理
  MONITOR_ONLY: 'monitor_only'      // 仅监控
};

// 系统状态常量
export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  MAINTENANCE: 'maintenance',
  DEGRADED: 'degraded',
  OFFLINE: 'offline'
};

export default POVERTY_AI_CONFIG;