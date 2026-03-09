<template>
  <div class="monitor-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>📹 实时监控中心</h2>
      <p>实时查看各养殖区域的监控画面与环境数据</p>
    </div>

    <!-- 监控摄像头 - 严格一排三个大画面 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8" v-for="(camera, index) in cameras.slice(0, 3)" :key="index">
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
            <!-- 摄像头画面 - 大画面 -->
            <div class="video-placeholder-large">
              <div v-if="camera.status === 'online'" class="video-content">
                <div class="video-mock">
                  <div class="video-grid">
                    <div class="grid-item" v-for="i in 9" :key="i"></div>
                  </div>
                  <div class="video-info-overlay">
                    <span class="video-timestamp">{{ getCurrentTime() }}</span>
                    <span class="video-location">{{ camera.location }}</span>
                  </div>
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
                <span class="info-label">
                  <i class="fas fa-map-marker-alt"></i> 位置
                </span>
                <span class="info-value">{{ camera.location }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">
                  <i class="fas fa-heartbeat"></i> 健康率
                </span>
                <span class="info-value" :style="{ color: getHealthColor(camera.healthRate) }">
                  {{ camera.healthRate }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">
                  <i class="fas fa-exclamation-triangle"></i> 预警数
                </span>
                <span class="info-value" :style="{ color: camera.warnings > 0 ? '#ff9800' : '#4caf50' }">
                  {{ camera.warnings }} 条
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">
                  <i class="fas fa-paw"></i> 动物数
                </span>
                <span class="info-value">{{ camera.animals }} 头</span>
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
              <el-button size="small" @click="handleRecord(camera)">
                <i class="fas fa-circle"></i> 录制
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
            <div class="chart-header">
              <i class="fas fa-thermometer-half"></i> 环境监测数据
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(env, index) in environmentData" :key="index">
              <div class="env-card">
                <div class="env-icon" :style="{ background: env.color }">
                  <i :class="env.icon"></i>
                </div>
                <div class="env-info">
                  <div class="env-label">{{ env.label }}</div>
                  <div class="env-value">{{ env.value }}</div>
                  <div class="env-status" :style="{ color: env.statusColor }">
                    {{ env.status }}
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 温度/湿度监测图表 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i> 温度趋势（24小时）
            </div>
          </template>
          <div class="chart-container" id="temperatureChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i> 湿度趋势（24小时）
            </div>
          </template>
          <div class="chart-container" id="humidityChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

const cameras = ref([
  {
    id: 1,
    name: "A区摄像头",
    location: "猪舍 - 1号舍",
    status: "online",
    healthRate: "96%",
    warnings: 0,
    animals: 120,
    gifUrl: null,
  },
  {
    id: 2,
    name: "B区摄像头",
    location: "鸡舍 - 2号舍",
    status: "online",
    healthRate: "92%",
    warnings: 2,
    animals: 280,
    gifUrl: null,
  },
  {
    id: 3,
    name: "C区摄像头",
    location: "牛舍 - 3号舍",
    status: "online",
    healthRate: "95%",
    warnings: 1,
    animals: 45,
    gifUrl: null,
  },
]);

const environmentData = ref([
  {
    label: "温度",
    value: "23.5°C",
    icon: "fas fa-thermometer-half",
    color: "rgba(255, 152, 0, 0.1)",
    status: "正常",
    statusColor: "#4caf50",
  },
  {
    label: "湿度",
    value: "65%",
    icon: "fas fa-water",
    color: "rgba(33, 150, 243, 0.1)",
    status: "正常",
    statusColor: "#4caf50",
  },
  {
    label: "氨气",
    value: "12 ppm",
    icon: "fas fa-wind",
    color: "rgba(76, 175, 80, 0.1)",
    status: "安全",
    statusColor: "#4caf50",
  },
  {
    label: "CO₂",
    value: "1200 ppm",
    icon: "fas fa-cloud",
    color: "rgba(156, 39, 176, 0.1)",
    status: "安全",
    statusColor: "#4caf50",
  },
]);

let temperatureChart = null;
let humidityChart = null;

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
};

const getHealthColor = (healthRate) => {
  const rate = parseInt(healthRate);
  if (rate >= 95) return "#4caf50";
  if (rate >= 90) return "#ff9800";
  return "#f44336";
};

const handlePlayVideo = (camera) => {
  ElMessage.info(`正在播放 ${camera.name} 的视频...`);
};

const handleSnapshot = (camera) => {
  ElMessage.success(`已截图 ${camera.name}`);
};

const handleRecord = (camera) => {
  ElMessage.info(`开始录制 ${camera.name}...`);
};

const initTemperatureChart = () => {
  const dom = document.getElementById("temperatureChart");
  if (!dom) return;

  if (temperatureChart) temperatureChart.dispose();

  temperatureChart = echarts.init(dom);
  temperatureChart.setOption({
    color: ["#ff9800", "#2196f3", "#4caf50"],
    tooltip: { trigger: "axis" },
    legend: { data: ["A区", "B区", "C区"] },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: [
        "0:00", "2:00", "4:00", "6:00", "8:00", "10:00",
        "12:00", "14:00", "16:00", "18:00", "20:00", "22:00",
      ],
    },
    yAxis: { type: "value", name: "温度(°C)" },
    series: [
      {
        name: "A区",
        type: "line",
        smooth: true,
        data: [18, 17, 16, 15, 18, 22, 24, 23, 22, 20, 19, 18],
        lineStyle: { width: 3 },
      },
      {
        name: "B区",
        type: "line",
        smooth: true,
        data: [19, 18, 17, 16, 19, 24, 26, 25, 23, 21, 20, 19],
        lineStyle: { width: 3 },
      },
      {
        name: "C区",
        type: "line",
        smooth: true,
        data: [17, 16, 15, 14, 17, 21, 23, 22, 21, 19, 18, 17],
        lineStyle: { width: 3 },
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
    color: ["#2196f3", "#4caf50", "#ff9800"],
    tooltip: { trigger: "axis" },
    legend: { data: ["A区", "B区", "C区"] },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: [
        "0:00", "2:00", "4:00", "6:00", "8:00", "10:00",
        "12:00", "14:00", "16:00", "18:00", "20:00", "22:00",
      ],
    },
    yAxis: { type: "value", name: "湿度(%)" },
    series: [
      {
        name: "A区",
        type: "line",
        smooth: true,
        data: [62, 63, 64, 65, 64, 60, 58, 59, 61, 63, 64, 65],
        lineStyle: { width: 3 },
      },
      {
        name: "B区",
        type: "line",
        smooth: true,
        data: [68, 69, 70, 71, 70, 65, 62, 64, 66, 68, 70, 72],
        lineStyle: { width: 3 },
      },
      {
        name: "C区",
        type: "line",
        smooth: true,
        data: [60, 61, 62, 63, 62, 58, 56, 57, 59, 61, 62, 63],
        lineStyle: { width: 3 },
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
  color: #2e7d32;
  font-size: 24px;
  font-weight: 700;
}

.page-header p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.camera-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
}

.camera-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
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
  font-size: 14px;
}

.camera-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 大画面 */
.video-placeholder-large {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-mock {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  width: 100%;
  height: 100%;
  padding: 8px;
}

.grid-item {
  background: rgba(46, 125, 50, 0.1);
  border: 1px solid rgba(46, 125, 50, 0.2);
  border-radius: 4px;
}

.video-info-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 10px;
  border-radius: 4px;
}

.video-timestamp {
  font-weight: 600;
  font-family: monospace;
}

.video-location {
  font-size: 10px;
}

.video-offline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
}

.video-offline i {
  font-size: 32px;
}

.video-offline p {
  margin: 0;
  font-size: 12px;
}

.camera-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.info-label {
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-value {
  font-weight: 600;
  color: #333;
}

.camera-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.camera-actions :deep(.el-button) {
  flex: 1;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2e7d32;
  font-size: 16px;
}

.env-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.env-card:hover {
  border-color: #2e7d32;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.env-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #2e7d32;
  flex-shrink: 0;
}

.env-info {
  flex: 1;
}

.env-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.env-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.env-status {
  font-size: 11px;
  font-weight: 600;
}

.chart-container {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .video-placeholder-large {
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 768px) {
  .camera-info {
    padding: 8px;
  }

  .info-row {
    font-size: 11px;
  }

  .camera-actions {
    flex-direction: column;
  }

  .camera-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
