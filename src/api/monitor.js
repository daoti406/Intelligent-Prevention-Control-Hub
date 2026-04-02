/**
 * 监控相关API接口
 * 提供实时监控数据、设备状态、现场画面等功能
 */

import request from "../utils/request";

// 模拟监控摄像头数据
const mockCameras = [
  {
    id: 1,
    name: "A区猪舍1号",
    status: "online",
    animals: 20,
    location: "A区1号棚",
    healthRate: "90%",
    warnings: 2,
    gifUrl: "/src/assets/images/猪2.gif",
    temperature: 28.5,
    humidity: 65,
    airQuality: "良好",
    lastUpdate: "2025-01-11 10:30:00"
  },
  {
    id: 2,
    name: "A区猪舍2号",
    status: "online",
    animals: 12,
    location: "A区2号棚",
    healthRate: "100%",
    warnings: 0,
    gifUrl: "/src/assets/images/猪.gif",
    temperature: 26.8,
    humidity: 62,
    airQuality: "优秀",
    lastUpdate: "2025-01-11 10:28:00"
  },
  {
    id: 3,
    name: "B区鸡舍1号",
    status: "online",
    animals: 50,
    location: "B区1号棚",
    healthRate: "99%",
    warnings: 0,
    gifUrl: "/src/assets/images/鸡.gif",
    temperature: 24.3,
    humidity: 58,
    airQuality: "良好",
    lastUpdate: "2025-01-11 10:25:00"
  },
  {
    id: 4,
    name: "B区鸡舍2号",
    status: "online",
    animals: 50,
    location: "B区2号棚",
    healthRate: "96%",
    warnings: 3,
    gifUrl: "/src/assets/images/鸡.gif",
    temperature: 25.1,
    humidity: 61,
    airQuality: "一般",
    lastUpdate: "2025-01-11 10:22:00"
  },
  {
    id: 5,
    name: "C区牛舍1号",
    status: "online",
    animals: 14,
    location: "C区1号棚",
    healthRate: "85%",
    warnings: 2,
    gifUrl: "/src/assets/images/牛.gif",
    temperature: 22.7,
    humidity: 55,
    airQuality: "良好",
    lastUpdate: "2025-01-11 10:20:00"
  },
  {
    id: 6,
    name: "C区牛舍2号",
    status: "online",
    animals: 12,
    location: "C区2号棚",
    healthRate: "83.3%",
    warnings: 2,
    gifUrl: "/src/assets/images/牛2.gif",
    temperature: 23.2,
    humidity: 56,
    airQuality: "良好",
    lastUpdate: "2025-01-11 10:15:00"
  }
];

// 获取所有监控摄像头
export function getMonitors() {
  // 返回模拟数据
  return Promise.resolve(mockCameras);
}

// 获取指定监控摄像头的实时数据
export function getMonitorById(id) {
  const camera = mockCameras.find(cam => cam.id === parseInt(id));
  if (!camera) {
    return Promise.reject(new Error(`摄像头 ${id} 不存在`));
  }
  
  // 模拟实时数据更新
  const updatedCamera = {
    ...camera,
    temperature: (camera.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1),
    humidity: Math.max(40, Math.min(80, camera.humidity + (Math.random() * 4 - 2))),
    lastUpdate: new Date().toLocaleString('zh-CN'),
    // 模拟动物活动数据
    activityLevel: Math.floor(Math.random() * 100),
    // 模拟AI分析状态
    aiAnalysis: {
      status: Math.random() > 0.1 ? 'normal' : 'warning',
      confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
      lastAnalysis: new Date().toLocaleString('zh-CN')
    }
  };
  
  return Promise.resolve(updatedCamera);
}

// 监控统计信息
export function getMonitorStats() {
  const stats = {
    totalCameras: mockCameras.length,
    onlineCameras: mockCameras.filter(cam => cam.status === 'online').length,
    offlineCameras: mockCameras.filter(cam => cam.status === 'offline').length,
    totalAnimals: mockCameras.reduce((sum, cam) => sum + cam.animals, 0),
    totalWarnings: mockCameras.reduce((sum, cam) => sum + cam.warnings, 0),
    avgHealthRate: (mockCameras.reduce((sum, cam) => {
      return sum + parseFloat(cam.healthRate);
    }, 0) / mockCameras.length).toFixed(1) + '%',
    // 普惠AI特有统计
    aiEnabledCameras: mockCameras.filter(() => Math.random() > 0.3).length,
    costSavings: (mockCameras.length * 1250).toLocaleString() // 每摄像头节省1250元
  };
  
  return Promise.resolve(stats);
}

// 获取监控历史数据
export function getMonitorHistory(cameraId, days = 7) {
  const baseDate = new Date();
  const history = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      temperature: 22 + Math.random() * 8,
      humidity: 50 + Math.random() * 20,
      warnings: Math.floor(Math.random() * 5),
      healthRate: 85 + Math.random() * 15,
      activityLevel: Math.floor(Math.random() * 100)
    });
  }
  
  return Promise.resolve(history);
}

// 控制监控设备
export function controlMonitor(cameraId, action) {
  // 模拟设备控制
  return new Promise((resolve) => {
    setTimeout(() => {
      const camera = mockCameras.find(cam => cam.id === parseInt(cameraId));
      if (!camera) {
        resolve({ success: false, message: '摄像头不存在' });
        return;
      }
      
      const actions = {
        'restart': { success: Math.random() > 0.1, message: '设备重启成功' },
        'snapshot': { success: true, message: '快照已保存' },
        'record': { success: Math.random() > 0.2, message: '开始录制' },
        'ai_analysis': { success: true, message: 'AI分析已启动' }
      };
      
      const result = actions[action] || { success: false, message: '不支持的操作' };
      resolve(result);
    }, 1000);
  });
}

// 普惠AI视觉分析状态
export function getAIVisualAnalysis(cameraId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const analysis = {
        cameraId: parseInt(cameraId),
        timestamp: new Date().toISOString(),
        // 动物行为分析
        behaviorAnalysis: {
          normalActivity: Math.floor(Math.random() * 80 + 20),
          abnormalBehavior: Math.floor(Math.random() * 10),
          restingCount: Math.floor(Math.random() * 30),
          feedingCount: Math.floor(Math.random() * 40)
        },
        // 健康状态评估
        healthAssessment: {
          overallScore: Math.floor(Math.random() * 20 + 80),
          riskLevel: Math.random() > 0.7 ? 'medium' : 'low',
          issuesDetected: Math.floor(Math.random() * 3)
        },
        // 环境分析
        environmentAnalysis: {
          temperatureAnomaly: Math.random() > 0.8,
          humidityWarning: Math.random() > 0.9,
          airQuality: Math.random() > 0.6 ? '良好' : '一般'
        },
        // AI处理结果
        aiRecommendations: [
          Math.random() > 0.5 ? '环境参数正常，无需调整' : '建议调节通风系统',
          Math.random() > 0.7 ? '检测到轻度异常，继续观察' : '动物行为正常'
        ]
      };
      
      resolve(analysis);
    }, 500);
  });
}

// 获取摄像头配置
export function getCameraConfig(cameraId) {
  const configs = {
    1: { resolution: '1080p', fps: 30, aiModel: 'behavior_v2', storageDays: 30 },
    2: { resolution: '720p', fps: 25, aiModel: 'health_v1', storageDays: 15 },
    3: { resolution: '1080p', fps: 30, aiModel: 'environment_v1', storageDays: 30 },
    4: { resolution: '720p', fps: 25, aiModel: 'behavior_v1', storageDays: 15 },
    5: { resolution: '1080p', fps: 30, aiModel: 'health_v2', storageDays: 30 },
    6: { resolution: '720p', fps: 25, aiModel: 'environment_v1', storageDays: 15 }
  };
  
  return Promise.resolve(configs[cameraId] || configs[1]);
}

// 更新摄像头配置
export function updateCameraConfig(cameraId, config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '配置更新成功',
        config: { ...config, updatedAt: new Date().toISOString() }
      });
    }, 800);
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