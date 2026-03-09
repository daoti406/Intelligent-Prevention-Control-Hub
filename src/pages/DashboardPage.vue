<template>
  <div class="dashboard-container">
    <!-- 动态 Banner -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="banner-icon">🏡</div>
        <div class="banner-text">
          <h1 class="banner-title">智栏哨兵</h1>
          <p class="banner-subtitle">畜禽健康智能防控中枢系统</p>
          <p class="banner-desc">实时监测 · 智能预警 · AI 驱动</p>
        </div>
      </div>
      <div class="banner-animation"></div>
    </div>

    <!-- 系统状态 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="status-card">
          <div class="status-grid">
            <div class="status-item" v-for="(status, index) in systemStatus" :key="index">
              <div class="status-icon" :style="{ color: status.color }">
                <i :class="status.icon"></i>
              </div>
              <div class="status-info">
                <div class="status-label">{{ status.label }}</div>
                <div class="status-value">{{ status.value }}</div>
              </div>
              <div class="status-indicator" :class="status.status"></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关键数据指标 - 动态卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6" v-for="(metric, index) in keyMetrics" :key="index">
        <div class="metric-card" @click="handleMetricClick(metric)">
          <div class="metric-icon" :style="{ background: metric.bgColor }">
            <i :class="metric.icon"></i>
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-trend" :class="metric.trendClass">
              <i :class="metric.trendIcon"></i>
              {{ metric.trend }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 实时动态流 + 数据可视化 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 左侧：实时动态流 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-stream"></i>
              <span>实时动态流</span>
              <el-tag type="success" size="small" style="margin-left: auto">
                <i class="fas fa-circle" style="color: #4caf50; margin-right: 4px"></i>
                实时更新中
              </el-tag>
            </div>
          </template>
          <div class="dynamic-stream">
            <div v-for="(event, index) in dynamicEvents" :key="index" class="stream-item">
              <div class="stream-icon" :class="'stream-' + event.type">
                <i :class="event.icon"></i>
              </div>
              <div class="stream-content">
                <div class="stream-title">{{ event.title }}</div>
                <div class="stream-desc">{{ event.description }}</div>
                <div class="stream-time">{{ event.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：健康度趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-heartbeat"></i>
              <span>整体健康度趋势</span>
            </div>
          </template>
          <div class="chart-container" id="healthTrendChart" style="height: 280px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 区域监控概览 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-map"></i>
              <span>区域监控概览</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(zone, index) in monitoringZones" :key="index">
              <div class="zone-card" @click="handleZoneClick(zone)">
                <div class="zone-header">
                  <span class="zone-name">{{ zone.name }}</span>
                  <el-tag :type="getZoneStatus(zone.health)" size="small">
                    {{ zone.health }}%
                  </el-tag>
                </div>
                <div class="zone-progress">
                  <el-progress
                    :percentage="zone.health"
                    :color="getProgressColor(zone.health)"
                    :show-text="false"
                  />
                </div>
                <div class="zone-stats">
                  <div class="stat">
                    <span class="stat-label">动物数</span>
                    <span class="stat-value">{{ zone.animals }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">预警数</span>
                    <span class="stat-value" :style="{ color: zone.warnings > 0 ? '#ff9800' : '#4caf50' }">
                      {{ zone.warnings }}
                    </span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据对比分析 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-chart-bar"></i>
              <span>疫病类型分布</span>
            </div>
          </template>
          <div class="chart-container" id="diseaseChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-chart-line"></i>
              <span>预警趋势分析</span>
            </div>
          </template>
          <div class="chart-container" id="warningTrendChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" :title="selectedMetric?.label" width="50%">
      <div v-if="selectedMetric" class="metric-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <div class="detail-label">当前值</div>
              <div class="detail-value" :style="{ color: selectedMetric.color }">
                {{ selectedMetric.value }}
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <div class="detail-label">趋势</div>
              <div class="detail-value" :class="selectedMetric.trendClass">
                <i :class="selectedMetric.trendIcon"></i>
                {{ selectedMetric.trend }}
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="detail-chart" id="detailChart" style="height: 250px; margin-top: 20px;"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

const showDetailDialog = ref(false);
const selectedMetric = ref(null);

const systemStatus = ref([
  { label: "系统状态", value: "正常运行", icon: "fas fa-server", color: "#4caf50", status: "online" },
  { label: "监控摄像头", value: "6/6 在线", icon: "fas fa-video", color: "#2196f3", status: "online" },
  { label: "数据更新", value: "实时同步", icon: "fas fa-sync-alt", color: "#ff9800", status: "online" },
  { label: "AI 模型", value: "运行中", icon: "fas fa-brain", color: "#9c27b0", status: "online" },
]);

const keyMetrics = ref([
  {
    label: "整体健康率",
    value: "94.5%",
    icon: "fas fa-heart",
    bgColor: "rgba(76, 175, 80, 0.1)",
    color: "#4caf50",
    trend: "+2.3%",
    trendClass: "trend-up",
    trendIcon: "fas fa-arrow-up",
  },
  {
    label: "异常预警",
    value: "12",
    icon: "fas fa-exclamation-circle",
    bgColor: "rgba(255, 152, 0, 0.1)",
    color: "#ff9800",
    trend: "-5",
    trendClass: "trend-down",
    trendIcon: "fas fa-arrow-down",
  },
  {
    label: "监测点数",
    value: "48",
    icon: "fas fa-map-pin",
    bgColor: "rgba(33, 150, 243, 0.1)",
    color: "#2196f3",
    trend: "稳定",
    trendClass: "trend-stable",
    trendIcon: "fas fa-minus",
  },
  {
    label: "数据准确率",
    value: "99.8%",
    icon: "fas fa-check-circle",
    bgColor: "rgba(156, 39, 176, 0.1)",
    color: "#9c27b0",
    trend: "+0.2%",
    trendClass: "trend-up",
    trendIcon: "fas fa-arrow-up",
  },
]);

const dynamicEvents = ref([
  {
    type: "success",
    icon: "fas fa-check-circle",
    title: "A 区健康检查完成",
    description: "所有动物体温正常，无异常发现",
    time: "刚刚",
  },
  {
    type: "warning",
    icon: "fas fa-exclamation-triangle",
    title: "B 区温度异常告警",
    description: "温度升高 3°C，已启动自动调节",
    time: "5 分钟前",
  },
  {
    type: "info",
    icon: "fas fa-info-circle",
    title: "数据同步完成",
    description: "最新的监控数据已同步到系统",
    time: "10 分钟前",
  },
  {
    type: "success",
    icon: "fas fa-check-circle",
    title: "消毒程序完成",
    description: "C 区消毒间消毒程序已完成",
    time: "15 分钟前",
  },
  {
    type: "warning",
    icon: "fas fa-exclamation-triangle",
    title: "湿度预警",
    description: "D 区湿度过高，建议加强通风",
    time: "20 分钟前",
  },
]);

const monitoringZones = ref([
  { name: "A 区（猪舍）", health: 96, animals: 120, warnings: 0 },
  { name: "B 区（鸡舍）", health: 92, animals: 280, warnings: 2 },
  { name: "C 区（牛舍）", health: 95, animals: 45, warnings: 1 },
  { name: "D 区（隔离舍）", health: 88, animals: 8, warnings: 3 },
]);

let healthTrendChart = null;
let diseaseChart = null;
let warningTrendChart = null;
let detailChart = null;

const getZoneStatus = (health) => {
  if (health >= 95) return "success";
  if (health >= 85) return "warning";
  return "danger";
};

const getProgressColor = (health) => {
  if (health >= 95) return "#4caf50";
  if (health >= 85) return "#ff9800";
  return "#f44336";
};

const handleMetricClick = (metric) => {
  selectedMetric.value = metric;
  showDetailDialog.value = true;
  setTimeout(() => {
    initDetailChart();
  }, 300);
};

const handleZoneClick = (zone) => {
  ElMessage.info(`查看 ${zone.name} 的详细数据`);
};

const initHealthTrendChart = () => {
  const dom = document.getElementById("healthTrendChart");
  if (!dom) return;

  if (healthTrendChart) healthTrendChart.dispose();

  healthTrendChart = echarts.init(dom);
  healthTrendChart.setOption({
    color: ["#4caf50"],
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: { type: "value", min: 80, max: 100 },
    series: [
      {
        name: "健康度",
        type: "line",
        data: [92, 91, 93, 94, 95, 94, 94.5],
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: { color: "rgba(76, 175, 80, 0.2)" },
      },
    ],
  });
};

const initDiseaseChart = () => {
  const dom = document.getElementById("diseaseChart");
  if (!dom) return;

  if (diseaseChart) diseaseChart.dispose();

  diseaseChart = echarts.init(dom);
  diseaseChart.setOption({
    color: ["#ff9800", "#f44336", "#2196f3", "#4caf50"],
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "疫病类型",
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 35, name: "呼吸道疾病" },
          { value: 25, name: "消化道疾病" },
          { value: 20, name: "寄生虫病" },
          { value: 20, name: "其他" },
        ],
      },
    ],
  });
};

const initWarningTrendChart = () => {
  const dom = document.getElementById("warningTrendChart");
  if (!dom) return;

  if (warningTrendChart) warningTrendChart.dispose();

  warningTrendChart = echarts.init(dom);
  warningTrendChart.setOption({
    color: ["#ff9800", "#f44336"],
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "预警数",
        type: "bar",
        data: [15, 12, 18, 10, 14, 8, 12],
        itemStyle: { color: "#ff9800" },
      },
      {
        name: "已处理",
        type: "bar",
        data: [14, 11, 16, 9, 13, 7, 11],
        itemStyle: { color: "#4caf50" },
      },
    ],
  });
};

const initDetailChart = () => {
  const dom = document.getElementById("detailChart");
  if (!dom) return;

  if (detailChart) detailChart.dispose();

  detailChart = echarts.init(dom);
  detailChart.setOption({
    color: ["#2e7d32"],
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["00:00", "06:00", "12:00", "18:00", "24:00"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: selectedMetric.value?.label || "数据",
        type: "line",
        data: [92, 93, 94, 95, 94.5],
        smooth: true,
        lineStyle: { width: 2 },
      },
    ],
  });
};

onMounted(() => {
  setTimeout(() => {
    initHealthTrendChart();
    initDiseaseChart();
    initWarningTrendChart();
  }, 300);
});

onUnmounted(() => {
  healthTrendChart?.dispose();
  diseaseChart?.dispose();
  warningTrendChart?.dispose();
  detailChart?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

/* Banner 样式 */
.banner-section {
  position: relative;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 24px;
  overflow: hidden;
  color: white;
}

.banner-animation {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(20px) translateY(-10px);
  }
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.banner-icon {
  font-size: 48px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.banner-text h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
}

.banner-text p {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.banner-subtitle {
  font-size: 16px;
  margin-bottom: 8px !important;
}

.banner-desc {
  font-size: 12px;
  opacity: 0.8;
}

/* 状态卡片 */
.status-card :deep(.el-card__body) {
  padding: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #2e7d32;
}

.status-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.online {
  background-color: #4caf50;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 指标卡片 */
.metric-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-trend.trend-up {
  color: #4caf50;
}

.metric-trend.trend-down {
  color: #f44336;
}

.metric-trend.trend-stable {
  color: #2196f3;
}

/* 动态流 */
.dynamic-stream {
  max-height: 320px;
  overflow-y: auto;
}

.stream-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stream-item:hover {
  background-color: #fafafa;
}

.stream-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stream-success {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.stream-warning {
  background-color: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.stream-info {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.stream-content {
  flex: 1;
  min-width: 0;
}

.stream-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stream-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stream-time {
  font-size: 11px;
  color: #999;
}

/* 区域卡片 */
.zone-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.zone-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zone-name {
  font-weight: 600;
  color: #333;
}

.zone-progress {
  margin-bottom: 12px;
}

.zone-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

/* 详情对话框 */
.metric-detail {
  padding: 20px 0;
}

.detail-item {
  text-align: center;
}

.detail-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.section-header i {
  color: #2e7d32;
}

.chart-container {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .banner-section {
    padding: 24px;
  }

  .banner-text h1 {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .banner-section {
    padding: 16px;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-animation {
    display: none;
  }
}
</style>
