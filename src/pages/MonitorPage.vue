<template>
  <div class="monitor-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">实时监控中心</h3>
              <div>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleRefresh"
                  :loading="refreshSpinning"
                >
                  <i
                    class="fas fa-sync-alt"
                    :class="{ 'fa-spin': refreshSpinning }"
                  ></i>
                  {{ refreshSpinning ? "刷新中..." : "刷新" }}
                </el-button>
              </div>
            </div>
          </template>
          <div class="camera-grid">
            <div
              v-for="(camera, index) in cameras"
              :key="index"
              class="camera-card"
            >
              <el-card shadow="hover">
                <template #header>
                  <div class="camera-header">
                    <span>{{ camera.name }}</span>
                    <div class="camera-status">
                      <el-tag
                        size="small"
                        :type="
                          camera.status === 'online' ? 'success' : 'danger'
                        "
                      >
                        {{ camera.status === "online" ? "在线" : "离线" }}
                      </el-tag>
                      <span class="camera-animals">{{ camera.animals }}头</span>
                    </div>
                  </div>
                </template>
                <div class="camera-preview">
                  <div
                    v-if="camera.status === 'online' && camera.gifUrl"
                    style="width: 100%; height: 100%"
                  >
                    <img
                      :src="camera.gifUrl"
                      :alt="camera.name"
                      style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 4px;
                      "
                    />
                    <p
                      style="
                        font-size: 12px;
                        text-align: center;
                        margin-top: 5px;
                        color: #ccc;
                      "
                    >
                      {{ camera.location }} (动态模拟)
                    </p>
                  </div>
                  <div v-else style="text-align: center">
                    <i class="fas fa-video-slash" style="font-size: 48px"></i>
                    <p>设备离线</p>
                  </div>
                </div>
                <div class="camera-info">
                  <div>
                    <span style="font-weight: bold; color: #2e7d32"
                      >健康率:</span
                    >
                    {{ camera.healthRate }}
                  </div>
                  <div>
                    <span style="font-weight: bold; color: #faad14">预警:</span>
                    {{ camera.warnings }}个
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header
            ><div class="chart-header">
              <i class="fas fa-thermometer-half"></i> 温度监测
            </div></template
          >
          <div class="chart-container" id="temperatureChart" style="height: 280px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header
            ><div class="chart-header">
              <i class="fas fa-tint"></i> 湿度监测
            </div></template
          >
          <div class="chart-container" id="humidityChart" style="height: 280px;"></div>
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
const refreshSpinning = ref(false);
let temperatureChart = null;
let humidityChart = null;

const handleRefresh = () => {
  refreshSpinning.value = true;
  ElMessage.info("正在刷新监控数据...");
  cameras.value.forEach((camera) => {
    if (camera.status === "online") {
      const randomChange = Math.random() * 0.1 - 0.05;
      const currentHealth = parseFloat(camera.healthRate);
      const newHealth = Math.min(
        100,
        Math.max(0, currentHealth + randomChange * 100)
      );
      camera.healthRate = newHealth.toFixed(1) + "%";
      if (Math.random() > 0.7) camera.warnings = Math.floor(Math.random() * 5);
    }
  });
  setTimeout(() => {
    refreshSpinning.value = false;
    ElMessage.success("监控数据已更新");
  }, 1500);
};

const initTemperatureChart = () => {
  const dom = document.getElementById("temperatureChart");
  if (!dom) return;

  if (temperatureChart) temperatureChart.dispose();

  temperatureChart = echarts.init(dom);
  temperatureChart.setOption({
    tooltip: { trigger: "axis" },
    xAxis: {
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: {},
    series: [
      {
        type: "line",
        data: [22, 23, 24, 26, 27, 25, 23],
        smooth: true,
        itemStyle: { color: "#ff4d4f" },
        lineStyle: { color: "#ff4d4f" },
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
    tooltip: { trigger: "axis" },
    xAxis: {
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: {},
    series: [
      {
        type: "line",
        data: [45, 50, 52, 60, 58, 55, 52],
        smooth: true,
        itemStyle: { color: "#40a9ff" },
        lineStyle: { color: "#40a9ff" },
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
.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.camera-card {
  min-width: 0;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-status {
  display: flex;
  gap: 10px;
  align-items: center;
}

.camera-animals {
  font-size: 12px;
  color: #666;
}

.camera-preview {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-info {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
