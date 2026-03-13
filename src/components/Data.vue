<template>
  <div class="data-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="header flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32; flex: 1">数据分析中心</h3>
              <div>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  style="width: 240px; margin-right: 10px"
                />
                <el-button type="primary" size="small" @click="exportData">
                  <i class="fas fa-download"></i> 导出数据
                </el-button>
              </div>
            </div>
          </template>
          <div>
            <el-row :gutter="20">
              <el-col :span="6" v-for="(stat, index) in dataStats" :key="index">
                <el-card shadow="hover" class="stat-card">
                  <div style="text-align: center; padding: 20px 0;">
                    <div class="data-highlight" :class="stat.type" style="font-size: 28px; margin-bottom: 12px;">
                      {{ stat.value }}
                    </div>
                    <div style="color: #909399; font-size: 14px; font-weight: 500;">
                      {{ stat.label }}
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="mt-4">
              <el-col :span="24">
                <el-card>
                  <template #header
                    ><div class="chart-header">
                      <i class="fas fa-chart-area"></i>
                      2025年畜禽疫病趋势分析(季度)
                    </div></template
                  >
                  <div class="chart-container" id="diseaseChart" style="height: 320px;"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-brain"></i> AI大模型智能分析
              <el-button
                type="primary"
                size="small"
                style="float: right"
                @click="fetchAIAnalysis"
                :loading="aiLoading"
              >
                <i class="fas fa-sync-alt"></i> 重新分析
              </el-button>
            </div>
          </template>
          <div v-if="aiAnalysisResult" class="ai-result" v-html="aiAnalysisResult"></div>
          <div v-else-if="!aiLoading" class="ai-analysis-placeholder">
            <div style="text-align: center; padding: 40px 20px;">
              <i class="fas fa-robot" style="font-size: 48px; color: #52c41a; margin-bottom: 16px; display: block;"></i>
              <p style="color: #909399; margin: 0;">AI智能分析系统就绪</p>
              <p style="color: #c0c4cc; font-size: 12px; margin-top: 8px;">Click “Re-analyze” button to get AI insights based on 2025 data</p>
            </div>
          </div>
          <div v-else style="text-align: center; padding: 40px 20px;">
            <el-spin size="large" />
            <p style="color: #909399; margin-top: 16px;">AI正在深度分析中...</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject ,onMounted,onUnmounted} from "vue";
import* as echarts from "echarts";
const dataStats = inject("dataStats");
const dateRange = inject("dateRange");
const exportData = inject("exportData");
const aiAnalysisResult = inject("aiAnalysisResult");
const aiLoading = inject("aiLoading");
const fetchAIAnalysis = inject("fetchAIAnalysis");
let diseaseChart= null;
onMounted(() => {
  setTimeout(() => {
    initDiseaseChart();
  }, 300);
});
onUnmounted(() => {
  diseaseChart?.dispose();
});
// 畜禽疫病趋势图
function initDiseaseChart() {
  const dom = document.getElementById("diseaseChart");
  if (!dom) return;

  if (diseaseChart) diseaseChart.dispose();

  diseaseChart = echarts.init(dom);
  diseaseChart.setOption({
    tooltip: {
      trigger: "axis",
      // 显示所有疾病的数据，方便对比
      axisPointer: { type: "shadow" }
    },
    legend: {
      data: ["呼吸道感染", "消化道疾病", "皮肤寄生虫"],
      top: 10 
    },

    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    },

    yAxis: {
      type: "value",
      name: "病例数", 
      nameTextStyle: { color: "#666" }
    },

    // 系列数据：3种疾病，自动区分颜色
    series: [
      {
        name: "呼吸道感染", // 必须和图例data对应
        type: "line",
        data: [28, 35, 42, 25, 18, 12, 10, 15, 22, 30, 38, 32],
        smooth: true, 
        symbol: "circle", 
        symbolSize: 6, 
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255, 77, 79, 0.3)" },
            { offset: 1, color: "rgba(255, 77, 79, 0)" }
          ])
        },
        lineStyle: { width: 3, color: "#ff4d4f" }, 
        itemStyle: { color: "#ff4d4f" }
      },
      {
        name: "消化道疾病",
        type: "line",
        data: [15, 12, 10, 8, 12, 20, 25, 30, 28, 22, 18, 15],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(64, 169, 255, 0.3)" },
            { offset: 1, color: "rgba(64, 169, 255, 0)" }
          ])
        },
        lineStyle: { width: 3, color: "#40a9ff" }, 
        itemStyle: { color: "#40a9ff" }
      },
      {
        name: "皮肤寄生虫",
        type: "line",
        data: [5, 8, 12, 18, 25, 30, 35, 32, 25, 18, 10, 6],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(102, 16, 242, 0.3)" },
            { offset: 1, color: "rgba(102, 16, 242, 0)" }
          ])
        },
        lineStyle: { width: 3, color: "#6610f2" }, 
        itemStyle: { color: "#6610f2" }
      }
    ]
  });
}
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-card:hover {
  box-shadow: 0 8px 30px rgba(82, 196, 26, 0.15);
  transform: translateY(-4px);
}
.ai-result {
  padding: 20px 0;
}
.ai-analysis-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
