/**
 * API接口统一导出文件
 * 集成所有系统API接口，便于统一管理和调用
 */

// 认证相关API
export * from './auth';

// 仪表盘相关API
export * from './dashboard';

// 监控相关API
export * from './monitor';

// 预警相关API
export * from './warning';

// 知识库相关API
export * from './knowledge';

// 牧场相关API
export * from './ranch';

// mmcow视觉AI相关API（兼容保留）
export * from './povertyAI';

// 备用API
export * from './fallback';

// 实时监测API
export * from './realtime';

// API工具类
export { default as request } from '../utils/request';

// 系统配置
export { SYSTEM_CONFIG, configManager } from '../config/system';
export { POVERTY_AI_CONFIG } from '../config/povertyAI';

// API状态检测
export async function checkAPIStatus() {
  try {
    const checkPoints = [
      { name: '认证服务', api: () => getCurrentUser() },
      { name: '预警服务', api: () => getWarnings({ limit: 1 }) },
      { name: 'mmcow视觉AI服务', api: () => getPovertyAIStats() }
    ];
    
    const results = await Promise.allSettled(
      checkPoints.map(check => check.api())
    );
    
    return checkPoints.map((check, index) => ({
      service: check.name,
      status: results[index].status === 'fulfilled' ? 'online' : 'offline',
      error: results[index].status === 'rejected' ? results[index].reason.message : null
    }));
  } catch (error) {
    throw new Error(`API状态检测失败: ${error.message}`);
  }
}

// 批量API调用工具
export class BatchAPI {
  constructor() {
    this.pendingRequests = new Map();
  }
  
  // 添加请求
  addRequest(key, apiCall) {
    this.pendingRequests.set(key, apiCall);
    return this;
  }
  
  // 执行批处理
  async execute() {
    const keys = Array.from(this.pendingRequests.keys());
    const promises = Array.from(this.pendingRequests.values());
    
    const results = await Promise.allSettled(promises);
    
    const data = {};
    const errors = {};
    
    results.forEach((result, index) => {
      const key = keys[index];
      if (result.status === 'fulfilled') {
        data[key] = result.value;
      } else {
        errors[key] = result.reason.message;
      }
    });
    
    return {
      data,
      errors,
      success: Object.keys(errors).length === 0,
      timestamp: new Date().toISOString()
    };
  }
  
  // 静态方法：快速批处理
  static async batch(requests) {
    const batch = new BatchAPI();
    Object.entries(requests).forEach(([key, apiCall]) => {
      batch.addRequest(key, apiCall);
    });
    return await batch.execute();
  }
}

// API版本信息
export const API_VERSION = {
  v1: {
    version: '1.0.0',
    endpoints: ['/auth', '/dashboard', '/warning'],
    deprecated: false
  },
  v2: {
    version: '2.0.0',
    endpoints: ['/poverty-ai', '/edge-computing', '/cost-analysis'],
    deprecated: false,
    features: ['mmcow视觉分析', 'DeepSeek大模型', '健康预警']
  }
};

export default {
  // 认证
  ...require('./auth'),
  
  // 仪表盘
  ...require('./dashboard'),
  
  // 监控
  ...require('./monitor'),
  
  // 预警
  ...require('./warning'),
  
  // 知识库
  ...require('./knowledge'),
  
  // 牧场
  ...require('./ranch'),
  
  // mmcow视觉AI（兼容保留）
  ...require('./povertyAI'),
  
  // 工具类
  BatchAPI,
  checkAPIStatus,
  API_VERSION
};