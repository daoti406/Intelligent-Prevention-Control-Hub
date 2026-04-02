import request from "../utils/request";
import { requestFirstAvailable } from "./fallback";
import { getPovertyAIStats } from "./povertyAI";

// 本地模拟数据
const mockStats = [
  { label: "总监测数量", value: "24", type: "success" },
  { label: "异常数量", value: "5", type: "warning" },
  { label: "预警数量", value: "5", type: "error" },
  { label: "平均健康率", value: "97.8%", type: "success" },
];

const mockNotifications = [
  {
    id: 1,
    title: "A区3号棚温度异常",
    time: "10分钟前",
    type: "warning",
    status: "预警",
    read: false,
  },
  {
    id: 2,
    title: "B区健康检查完成",
    time: "1小时前",
    type: "success",
    status: "正常",
    read: true,
  },
  {
    id: 3,
    title: "防疫知识更新通知",
    time: "2小时前",
    type: "info",
    status: "信息",
    read: true,
  },
  {
    id: 4,
    title: "系统维护计划",
    time: "5小时前",
    type: "info",
    status: "通知",
    read: true,
  },
];

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
  },
];

export function getDashboardStats() {
  // 返回本地模拟数据
  return Promise.resolve(mockStats);
}

export function getNotifications() {
  // 返回本地模拟数据
  return Promise.resolve(mockNotifications);
}

export function getCameras() {
  // 返回本地模拟数据
  return Promise.resolve(mockCameras);
}

// 获取普惠AI统计数据
export function getPovertyDashboardStats() {
  return Promise.resolve({
    traditionalCost: 15000,
    aiCost: 5000,
    costReduction: 66.7,
    sensorsReplaced: 8,
    aiAccuracy: 92.5,
    monthlySavings: 830,
    roiMonths: 6
  });
}

// 获取综合仪表盘数据（包含普惠AI统计）
export function getComprehensiveDashboardData() {
  return Promise.all([
    getDashboardStats(),
    getPovertyAIStats(),
    getCameras()
  ]).then(([stats, aiStats, cameras]) => ({
    basicStats: stats,
    aiStats: aiStats,
    cameras: cameras,
    timestamp: new Date().toISOString()
  }));
}
