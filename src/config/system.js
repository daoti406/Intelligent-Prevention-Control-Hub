/**
 * 系统主配置文件
 * 管理整个智栏哨兵系统的配置和API接口
 */

import { POVERTY_AI_CONFIG } from './povertyAI';

// 系统基础配置
export const SYSTEM_CONFIG = {
  // 应用信息
  app: {
    name: "智栏哨兵",
    version: "2.0.0",
    description: "基于视觉传感器替代技术的普惠农业AI监测系统",
    author: "智能农业技术团队",
    lastUpdated: "2025-01-11"
  },
  
  // API配置
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    timeout: 10000,
    retryAttempts: 3,
    endpoints: {
      auth: "/auth",
      dashboard: "/dashboard",
      warning: "/warning", 
      povertyAI: "/poverty-ai",
      monitor: "/monitor",
      knowledge: "/knowledge"
    }
  },
  
  // 全局功能配置
  features: {
    povertyAIEnabled: true,
    edgeComputingEnabled: true,
    realTimeMonitoring: true,
    predictiveAlerts: true,
    costOptimization: true
  },
  
  // 视觉传感器替代技术配置
  visualSensorTechnology: {
    ...POVERTY_AI_CONFIG.visualSensorReplacement,
    deploymentPhases: [
      {
        phase: 1,
        name: "基础监控",
        features: ["普通摄像头部署", "基础行为识别", "温度监控"],
        timeline: "1-2周"
      },
      {
        phase: 2,
        name: "智能分析",
        features: ["AI模型集成", "边缘计算", "预测预警"],
        timeline: "2-3周"
      },
      {
        phase: 3,
        name: "成本优化",
        features: ["硬件优化", "自动化处理", "性能监控"],
        timeline: "1-2周"
      }
    ]
  },
  
  // 成本效益目标
  costBenefitTargets: {
    hardwareCostReduction: 70, // %
    deploymentTimeReduction: 50, // %
    maintenanceCostReduction: 60, // %
    roiTargetMonths: 18,
    accuracyImprovement: 30 // %
  },
  
  // 技术架构配置
  architecture: {
    frontend: {
      framework: "Vue 3",
      uiLibrary: "Element Plus",
      stateManagement: "Composition API",
      buildTool: "Vite"
    },
    aiModels: {
      behaviorRecognition: "YOLOv8 + Transformer",
      environmentAnalysis: "Custom CNN",
      healthMonitoring: "LSTM + Attention"
    },
    edgeComputing: {
      platform: "Edge AI Framework",
      deployment: "Docker + Kubernetes",
      monitoring: "Prometheus + Grafana"
    }
  },
  
  // 数据配置
  dataConfig: {
    storage: {
      warnings: "7天滚动存储",
      aiAnalysis: "30天历史数据",
      performance: "90天趋势数据"
    },
    backup: {
      enabled: true,
      interval: "daily",
      retention: "30天"
    }
  },
  
  // 安全配置
  security: {
    authentication: {
      type: "JWT",
      expiry: "24h",
      refreshEnabled: true
    },
    dataEncryption: {
      enabled: true,
      algorithm: "AES-256"
    }
  },
  
  // UI/UX配置
  uiConfig: {
    theme: {
      primaryColor: "#2e7d32",
      secondaryColor: "#4caf50",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI'",
      borderRadius: "8px"
    },
    responsive: {
      breakpoints: {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200,
        xl: 1920
      }
    }
  }
};

// 环境配置
export const ENV_CONFIG = {
  development: {
    debug: true,
    apiBase: "http://localhost:3000/api",
    mockData: true,
    logLevel: "debug"
  },
  production: {
    debug: false,
    apiBase: "https://api.zhilan-sentinel.com/api",
    mockData: false,
    logLevel: "error"
  }
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  // 缓存配置
  cache: {
    dashboardStats: 300000, // 5分钟
    warningList: 60000,     // 1分钟
    aiAnalysis: 120000      // 2分钟
  },
  
  // 加载优化
  lazyLoading: {
    enabled: true,
    components: ["charts", "images", "heavyModules"]
  },
  
  // 请求优化
  requestOptimization: {
    batchRequests: true,
    requestDebounce: 300, // ms
    retryDelay: 1000      // ms
  }
};

// 系统常量
export const SYSTEM_CONSTANTS = {
  // 预警类型
  WARNING_TYPES: {
    TEMPERATURE: "温度异常",
    HUMIDITY: "湿度异常", 
    AIR_QUALITY: "空气质量异常",
    BEHAVIOR: "行为异常",
    HEALTH: "健康异常",
    FEEDING: "进食异常",
    EQUIPMENT: "设备离线"
  },
  
  // 预警级别
  WARNING_LEVELS: {
    LOW: "low",
    MEDIUM: "medium", 
    HIGH: "high"
  },
  
  // 预警状态
  WARNING_STATUS: {
    PENDING: "待处理",
    PROCESSING: "处理中",
    RESOLVED: "已处理"
  },
  
  // AI分析状态
  AI_STATUS: {
    ANALYZING: "analyzing",
    COMPLETED: "completed",
    FAILED: "failed"
  }
};

// 事件类型常量
export const EVENT_TYPES = {
  WARNING_CREATED: "warning_created",
  WARNING_UPDATED: "warning_updated", 
  WARNING_RESOLVED: "warning_resolved",
  AI_ANALYSIS_START: "ai_analysis_start",
  AI_ANALYSIS_COMPLETE: "ai_analysis_complete",
  SYSTEM_HEALTH_CHANGE: "system_health_change"
};

// 配置验证函数
export function validateConfig(config) {
  const requiredFields = [
    'app.name',
    'app.version', 
    'api.baseURL',
    'features.povertyAIEnabled'
  ];
  
  const errors = [];
  
  requiredFields.forEach(field => {
    const value = getNestedValue(config, field);
    if (value === undefined || value === null || value === '') {
      errors.push(`缺少必要配置字段: ${field}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 辅助函数：获取嵌套对象值
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => 
    current && current[key] !== undefined ? current[key] : undefined, obj
  );
}

// 配置管理类
export class SystemConfigManager {
  constructor(config = SYSTEM_CONFIG) {
    this.config = { ...config };
  }
  
  // 更新配置
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
  }
  
  // 获取配置值
  getValue(path, defaultValue = null) {
    return getNestedValue(this.config, path) || defaultValue;
  }
  
  // 设置配置值
  setValue(path, value) {
    const keys = path.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.saveToStorage();
  }
  
  // 验证当前配置
  validate() {
    return validateConfig(this.config);
  }
  
  // 保存到本地存储
  saveToStorage() {
    try {
      localStorage.setItem('zhilan_system_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('无法保存配置到本地存储:', error);
    }
  }
  
  // 从本地存储加载
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('zhilan_system_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('无法从本地存储加载配置:', error);
    }
  }
  
  // 重置为默认配置
  reset() {
    this.config = { ...SYSTEM_CONFIG };
    localStorage.removeItem('zhilan_system_config');
  }
}

// 导出默认配置管理实例
export const configManager = new SystemConfigManager();

// 开发环境下加载存储的配置
if (import.meta.env.DEV) {
  configManager.loadFromStorage();
}

export default SYSTEM_CONFIG;