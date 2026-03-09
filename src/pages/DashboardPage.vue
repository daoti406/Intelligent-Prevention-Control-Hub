<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">数据统计</h3>
              <el-button type="primary" size="small" @click="handleRefresh" :loading="refreshSpinning">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshSpinning }"></i>
                {{ refreshSpinning ? "刷新中..." : "刷新" }}
              </el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(stat, index) in dataStats" :key="index">
              <el-card shadow="hover" style="text-align: center">
                <div class="data-highlight" :class="stat.type">
                  {{ stat.value }}
                </div>
                <div style="margin-top: 8px; color: #666">
                  {{ stat.label }}
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i> 健康趋势
            </div>
          </template>
          <div class="chart-container" id="healthChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-exclamation-triangle"></i> 预警分布
            </div>
          </template>
          <div class="chart-container" id="warningChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { getDataStats } from "../services/dataService";
import { ElMessage } from "element-plus";

const dataStats = ref(getDataStats());
const refreshSpinning = ref(false);
let healthChart = null;
let warningChart = null;

const handleRefresh = () => {
  refreshSpinning.value = true;
  setTimeout(() => {
    refreshSpinning.value = false;
    ElMessage.success("数据已刷新");
  }, 1500);
};

const initHealthChart = () => {
  const dom = document.getElementById("healthChart");
  if (!dom) return;

  if (healthChart) healthChart.dispose();

  healthChart = echarts.init(dom);
  healthChart.setOption({
    color: ["#52c41a", "#1890ff", "#faad14"],
    tooltip: { trigger: "axis" },
    legend: { data: ["健康率", "异常率", "预警率"] },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "健康率",
        type: "line",
        smooth: true,
        data: [91.5, 93.2, 95.8, 94.5, 97.6, 98.2, 98.5],
      },
      {
        name: "异常率",
        type: "line",
        smooth: true,
        data: [7.0, 5.3, 3.0, 4.0, 1.4, 0.8, 0.5],
      },
      {
        name: "预警率",
        type: "line",
        smooth: true,
        data: [1.5, 1.5, 1.2, 1.2, 1.0, 1.0, 1.0],
      },
    ],
  });
};

const initWarningChart = () => {
  const dom = document.getElementById("warningChart");
  if (!dom) return;

  if (warningChart) warningChart.dispose();

  warningChart = echarts.init(dom);
  warningChart.setOption({
    color: ["#ff4d4f", "#faad14", "#1890ff", "#52c41a"],
    tooltip: { trigger: "item" },
    legend: {
      orient: "vertical",
      left: "left",
      data: ["温度异常", "湿度异常", "行为异常", "其他异常"],
    },
    series: [
      {
        name: "预警类型分布",
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 35, name: "温度异常" },
          { value: 25, name: "湿度异常" },
          { value: 20, name: "行为异常" },
          { value: 20, name: "其他异常" },
        ],
      },
    ],
  });
};

onMounted(() => {
  setTimeout(() => {
    initHealthChart();
    initWarningChart();
  }, 300);
});

onUnmounted(() => {
  healthChart?.dispose();
  warningChart?.dispose();
});
</script>

<style scoped>
.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-highlight {
  font-size: 28px;
  font-weight: bold;
}

.data-highlight.success {
  color: #52c41a;
}

.data-highlight.warning {
  color: #faad14;
}

.data-highlight.error {
  color: #ff4d4f;
}
</style>
