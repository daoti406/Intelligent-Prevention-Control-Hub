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
                <el-button
                  type="success"
                  size="small"
                  @click="toggleFullscreen"
                >
                  <i
                    :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"
                  ></i>
                  {{ isFullscreen ? "退出全屏" : "全屏" }}
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
                  <div
                    v-else-if="camera.status === 'online'"
                    style="text-align: center"
                  >
                    <i class="fas fa-video" style="font-size: 48px"></i>
                    <p>监控画面</p>
                    <p style="font-size: 12px">{{ camera.location }}</p>
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
          <template #header>
            <div class="chart-header">
              <i class="fas fa-temperature-high"></i> 温湿度趋势分析
            </div>
          </template>
          <div
            class="chart-container"
            id="envTrendChart"
            style="height: 280px"
          ></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i> 畜禽活动量监测
            </div>
          </template>
          <div
            class="chart-container"
            id="activityChart"
            style="height: 280px"
          ></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";
const cameras = inject("cameras");
const refreshSpinning = inject("refreshSpinning");
const isFullscreen = inject("isFullscreen");
const handleRefresh = inject("handleRefresh");
const toggleFullscreen = inject("toggleFullscreen");
const activeIndex = inject("activeIndex");

let envTrendChart = null;
let activityChart = null;

onMounted(() => {
  setTimeout(() => {
    initEnvTrendChart();
    initActivityChart();
  }, 300);
});

onUnmounted(() => {
  envTrendChart?.dispose();
  activityChart?.dispose();
});

// 监听路由变化，当切换到 monitor 页面时重新初始化图表
watch(
  () => activeIndex.value,
  (newIndex) => {
    if (newIndex === "monitor") {
      setTimeout(() => {
        initEnvTrendChart();
        initActivityChart();
      }, 100);
    }
  }
);

// 温湿度趋势图
function initEnvTrendChart() {
  const dom = document.getElementById("envTrendChart");
  if (!dom) return;
  if (envTrendChart) envTrendChart.dispose();
  envTrendChart = echarts.init(dom);
  envTrendChart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["温度 (°C)", "湿度 (%)"] },
    xAxis: {
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: [
      { type: 'value', name: '温度', min: 10, max: 40 },
      { type: 'value', name: '湿度', min: 0, max: 100 }
    ],
    series: [
      {
        name: "温度 (°C)",
        type: "line",
        yAxisIndex: 0,
        data: [22, 23, 24, 26, 27, 25, 23],
        smooth: true,
        itemStyle: { color: "#ff4d4f" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0)' }
          ])
        }
      },
      {
        name: "湿度 (%)",
        type: "line",
        yAxisIndex: 1,
        data: [45, 50, 52, 60, 58, 55, 52],
        smooth: true,
        itemStyle: { color: "#40a9ff" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 169, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 169, 255, 0)' }
          ])
        }
      },
    ],
  });
}

// 活动量分析图
function initActivityChart() {
  const dom = document.getElementById("activityChart");
  if (!dom) return;
  if (activityChart) activityChart.dispose();
  activityChart = echarts.init(dom);
  activityChart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["猪只活跃度", "采食频率"] },
    xAxis: {
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: "猪只活跃度",
        type: "line",
        data: [30, 20, 60, 85, 70, 90, 40],
        smooth: true,
        itemStyle: { color: "#52c41a" },
        lineStyle: { width: 3 }
      },
      {
        name: "采食频率",
        type: "bar",
        data: [10, 5, 40, 60, 30, 50, 20],
        itemStyle: { color: "rgba(82, 196, 26, 0.4)", borderRadius: [4, 4, 0, 0] }
      },
    ],
  });
}
</script>

<style scoped></style>
