<template>
  <div class="monitor-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>📹 实时监控中心</h2>
      <p>实时查看各养殖区域的监控画面与环境数据</p>
    </div>

    <!-- 监控摄像头 - 一排三个 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8" v-for="(camera, index) in cameras" :key="index">
        <el-card class="camera-card">
          <template #header>
            <div class="camera-header">
              <span class="camera-name">{{ camera.name }}</span>
              <el-tag :type="camera.status === 'online' ? 'success' : 'danger'" size="small">
                {{ camera.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </div>
          </template>
          <div class="camera-content">
            <!-- 摄像头画面 -->
            <div class="video-placeholder">
              <div v-if="camera.status === 'online'" class="video-content">
                <img
                  v-if="camera.gifUrl"
                  :src="camera.gifUrl"
                  :alt="camera.name"
                  class="video-image"
                />
                <div v-else class="video-icon">
                  <i class="fas fa-video"></i>
                </div>
              </div>
              <div v-else class="video-offline">
                <i class="fas fa-video-slash"></i>
                <p>设备离线</p>
              </div>
            </div>
            
            <!-- 摄像头信息 -->
            <div class="camera-info">
              <div class="info-row">
                <span class="info-label">位置：</span>
                <span class="info-value">{{ camera.location }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">健康率：</span>
                <span class="info-value" :style="{ color: getHealthColor(camera.healthRate) }">
                  {{ camera.healthRate }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">预警数：</span>
                <span class="info-value" :style="{ color: camera.warnings > 0 ? '#ff9800' : '#4caf50' }">
                  {{ camera.warnings }}个
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">动物数：</span>
                <span class="info-value">{{ camera.animals }}头</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="camera-actions">
              <el-button type="primary" size="small" @click="handlePlayVideo(camera)">
                <i class="fas fa-play"></i> 播放
              </el-button>
              <el-button size="small" @click="handleSnapshot(camera)">
                <i class="fas fa-camera"></i> 截图
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 环境监测数据 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-thermometer-half"></i>
              <span>环境监测数据</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(env, index) in environmentData" :key="index">
              <div class="env-card">
                <div class="env-icon" :style="{ color: env.color }">
                  <i :class="env.icon"></i>
                </div>
                <div class="env-content">
                  <div class="env-label">{{ env.label }}</div>
                  <div class="env-value">{{ env.value }}</div>
                  <div class="env-unit">{{ env.unit }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 监控统计 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-chart-bar"></i>
              <span>温度监测</span>
            </div>
          </template>
          <div class="chart-container" id="temperatureChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-tint"></i>
              <span>湿度监测</span>
            </div>
          </template>
          <div class="chart-container" id="humidityChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { getCameras } from "../services/dataService";
import { ElMessage } from "element-plus";

const cameras = ref(getCameras());
const environmentData = ref([
  {
    label: "温度",
    value: "22.5",
    unit: "°C",
    icon: "fas fa-thermometer-half",
    color: "#ff9800",
  },
  {
    label: "湿度",
    value: "65",
    unit: "%",
    icon: "fas fa-water",
    color: "#2196f3",
  },
  {
    label: "氨气浓度",
    value: "15",
    unit: "ppm",
    icon: "fas fa-wind",
    color: "#4caf50",
  },
  {
    label: "二氧化碳",
    value: "450",
    unit: "ppm",
    icon: "fas fa-cloud",
    color: "#9c27b0",
  },
]);

let temperatureChart = null;
let humidityChart = null;

const getHealthColor = (healthRate) => {
  const value = parseFloat(healthRate);
  if (value >= 95) return "#4caf50";
  if (value >= 85) return "#ff9800";
  return "#f44336";
};

const handlePlayVideo = (camera) => {
  ElMessage.info(`正在播放 ${camera.name} 的视频流...`);
};

const handleSnapshot = (camera) => {
  ElMessage.success(`已截图 ${camera.name}，已保存到本地`);
};

const initTemperatureChart = () => {
  const dom = document.getElementById("temperatureChart");
  if (!dom) return;

  if (temperatureChart) temperatureChart.dispose();

  temperatureChart = echarts.init(dom);
  temperatureChart.setOption({
    color: ["#ff9800"],
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "温度",
        type: "line",
        data: [22, 23, 24, 26, 27, 25, 23],
        smooth: true,
        lineStyle: { width: 2 },
      },
    ],
  });
};

const initHumidityChart = () => {
  const dom = document.getElementById("humidityChart");
  if (!dom) return;

  if (humidityChart) humidityChart.dispose();

  humidityChart = echarts.init(dom);
  humidityChart.setOption({
    color: ["#2196f3"],
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "湿度",
        type: "line",
        data: [45, 50, 52, 60, 58, 55, 52],
        smooth: true,
        lineStyle: { width: 2 },
      },
    ],
  });
};

onMounted(() => {
  setTimeout(() => {
    initTemperatureChart();
    initHumidityChart();
  }, 300);
});

onUnmounted(() => {
  temperatureChart?.dispose();
  humidityChart?.dispose();
});
</script>

<style scoped>
.monitor-container {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 摄像头卡片 */
.camera-card :deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.camera-name {
  font-weight: 600;
  color: #333;
}

.camera-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-placeholder {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 4px;
  padding: 0;
  text-align: center;
  border: 1px solid #ddd;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-content {
  width: 100%;
  height: 100%;
}

.video-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-icon {
  font-size: 32px;
  color: #999;
}

.video-offline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.video-offline i {
  font-size: 32px;
  color: #999;
}

.video-offline p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.camera-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
}

.info-label {
  color: #999;
  font-weight: 600;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.camera-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.camera-actions :deep(.el-button) {
  flex: 1;
}

/* 环境监测卡片 */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.section-header i {
  color: #2e7d32;
}

.env-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #2e7d32;
}

.env-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.env-content {
  flex: 1;
}

.env-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.env-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.env-unit {
  font-size: 11px;
  color: #999;
}

.chart-container {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .monitor-container :deep(.el-col) {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 18px;
  }

  .video-placeholder {
    height: 150px;
  }
}
</style>
