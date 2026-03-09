<template>
  <div class="data-container">
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="stats-card">
          <template #header>
            <div class="header flex justify-between items-center">
              <h3 style="margin: 0; color: #004d40; flex: 1; font-size: 18px; font-weight: 700">
                📊 数据分析中心
              </h3>
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
                <div class="data-card">
                  <div class="data-card-title">{{ stat.label }}</div>
                  <div class="data-card-value" :class="stat.type">
                    {{ stat.value }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="mt-4">
              <el-col :span="24">
                <el-card>
                  <template #header>
                    <div class="chart-header">
                      <i class="fas fa-chart-area"></i>
                      2025年畜禽疫病趋势分析(季度)
                    </div>
                  </template>
                  <div class="chart-container" id="diseaseChart" style="height: 320px;"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 实时分析模块 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="ai-analysis-card">
          <template #header>
            <div class="ai-header">
              <div class="ai-title-section">
                <i class="fas fa-brain ai-icon"></i>
                <span class="ai-title">AI 大模型实时分析</span>
                <div class="ai-status-indicator" v-if="aiLoading">
                  <div class="ai-status-dot active"></div>
                  <span>AI 正在思考中...</span>
                </div>
                <div class="ai-status-indicator" v-else-if="aiAnalysisResult">
                  <div class="ai-status-dot"></div>
                  <span>分析完成</span>
                </div>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="fetchAIAnalysis"
                :loading="aiLoading"
              >
                <i class="fas fa-sync-alt"></i> {{ aiLoading ? "分析中..." : "重新分析" }}
              </el-button>
            </div>
          </template>

          <!-- AI 分析内容区 -->
          <div class="ai-content-wrapper">
            <div v-if="aiLoading" class="ai-loading">
              <div class="ai-loader">
                <div class="loader-circle"></div>
                <div class="loader-circle"></div>
                <div class="loader-circle"></div>
              </div>
              <p>AI 正在分析您的数据，请稍候...</p>
            </div>

            <div v-else-if="aiAnalysisResult" class="ai-result">
              <div class="ai-result-content">
                <div class="ai-typewriter" v-html="aiAnalysisResult"></div>
              </div>
              <div class="ai-insights">
                <div class="insight-item" v-for="(insight, index) in aiInsights" :key="index">
                  <span class="insight-icon">💡</span>
                  <span class="insight-text">{{ insight }}</span>
                </div>
              </div>
            </div>

            <div v-else class="ai-placeholder">
              <div class="placeholder-icon">
                <i class="fas fa-sparkles"></i>
              </div>
              <h4>准备好获取 AI 洞察了吗？</h4>
              <p>点击"重新分析"按钮，让我们的 AI 大模型基于实时数据为您生成智能分析报告。</p>
              <el-button type="primary" @click="fetchAIAnalysis" size="large">
                <i class="fas fa-magic"></i> 开始 AI 分析
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据对比分析 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-bar"></i>
              疫病类型分布
            </div>
          </template>
          <div class="chart-container" id="diseaseTypeChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-pie"></i>
              地区健康率对比
            </div>
          </template>
          <div class="chart-container" id="healthRateChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { getDataStats, fetchAIAnalysis as fetchAI } from "../services/dataService";
import { ElMessage } from "element-plus";

const dataStats = ref(getDataStats());
const dateRange = ref([]);
const aiAnalysisResult = ref("");
const aiLoading = ref(false);
const aiInsights = ref([
  "当前平均健康率达到 97.8%，整体疫病防控效果显著",
  "呼吸道疾病相比上月下降 12%，防疫措施见效",
  "建议加强 C 区牛舍的温度管理，当前健康率最低",
  "预计下周气温下降，需提前做好保温工作"
]);

let diseaseChart = null;
let diseaseTypeChart = null;
let healthRateChart = null;

const exportData = () => {
  ElMessage.info("导出功能开发中");
};

const fetchAIAnalysis = async () => {
  aiLoading.value = true;
  try {
    // 模拟流式输出效果
    const result = await fetchAI();
    
    // 模拟逐字显示效果
    let displayText = "";
    const fullText = result.content;
    let index = 0;
    
    const typewriterInterval = setInterval(() => {
      if (index < fullText.length) {
        displayText += fullText[index];
        aiAnalysisResult.value = displayText;
        index++;
      } else {
        clearInterval(typewriterInterval);
      }
    }, 20);
  } catch (error) {
    ElMessage.error("AI分析失败，请重试");
  } finally {
    aiLoading.value = false;
  }
};

const initDiseaseChart = () => {
  const dom = document.getElementById("diseaseChart");
  if (!dom) return;

  if (diseaseChart) diseaseChart.dispose();

  diseaseChart = echarts.init(dom);
  diseaseChart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["呼吸道感染", "消化道疾病", "皮肤寄生虫"],
      top: 10,
    },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: [
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月",
      ],
    },
    yAxis: {
      type: "value",
      name: "病例数",
      nameTextStyle: { color: "#666" },
    },
    series: [
      {
        name: "呼吸道感染",
        type: "line",
        data: [28, 35, 42, 25, 18, 12, 10, 15, 22, 30, 38, 32],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255, 77, 79, 0.3)" },
            { offset: 1, color: "rgba(255, 77, 79, 0)" },
          ]),
        },
        lineStyle: { width: 3, color: "#ff4d4f" },
        itemStyle: { color: "#ff4d4f" },
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
            { offset: 1, color: "rgba(64, 169, 255, 0)" },
          ]),
        },
        lineStyle: { width: 3, color: "#40a9ff" },
        itemStyle: { color: "#40a9ff" },
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
            { offset: 1, color: "rgba(102, 16, 242, 0)" },
          ]),
        },
        lineStyle: { width: 3, color: "#6610f2" },
        itemStyle: { color: "#6610f2" },
      },
    ],
  });
};

const initDiseaseTypeChart = () => {
  const dom = document.getElementById("diseaseTypeChart");
  if (!dom) return;

  if (diseaseTypeChart) diseaseTypeChart.dispose();

  diseaseTypeChart = echarts.init(dom);
  diseaseTypeChart.setOption({
    color: ["#ff4d4f", "#40a9ff", "#6610f2", "#faad14"],
    tooltip: { trigger: "item" },
    series: [
      {
        name: "疫病类型",
        type: "bar",
        data: [
          { value: 320, name: "呼吸道感染" },
          { value: 240, name: "消化道疾病" },
          { value: 180, name: "皮肤寄生虫" },
          { value: 90, name: "其他" },
        ],
      },
    ],
    xAxis: {
      type: "category",
      data: ["呼吸道感染", "消化道疾病", "皮肤寄生虫", "其他"],
    },
    yAxis: { type: "value" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  });
};

const initHealthRateChart = () => {
  const dom = document.getElementById("healthRateChart");
  if (!dom) return;

  if (healthRateChart) healthRateChart.dispose();

  healthRateChart = echarts.init(dom);
  healthRateChart.setOption({
    color: ["#4caf50", "#2196f3", "#ff9800"],
    tooltip: { trigger: "axis" },
    legend: { data: ["A区", "B区", "C区"] },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: { type: "value", min: 80, max: 100 },
    series: [
      {
        name: "A区",
        type: "line",
        data: [95, 96, 97, 96, 98, 99, 99],
        smooth: true,
        lineStyle: { width: 3 },
      },
      {
        name: "B区",
        type: "line",
        data: [92, 93, 94, 93, 95, 96, 97],
        smooth: true,
        lineStyle: { width: 3 },
      },
      {
        name: "C区",
        type: "line",
        data: [85, 86, 87, 86, 88, 89, 90],
        smooth: true,
        lineStyle: { width: 3 },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  });
};

onMounted(() => {
  setTimeout(() => {
    initDiseaseChart();
    initDiseaseTypeChart();
    initHealthRateChart();
  }, 300);
});

onUnmounted(() => {
  diseaseChart?.dispose();
  diseaseTypeChart?.dispose();
  healthRateChart?.dispose();
});
</script>

<style scoped>
.data-container {
  width: 100%;
}

.stats-card :deep(.el-card__header) {
  background: linear-gradient(135deg, rgba(0, 77, 64, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%);
}

.data-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #004d40;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.data-card-title {
  font-size: 12px;
  font-weight: 600;
  color: #78909c;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.data-card-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.data-card-value.success {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.data-card-value.warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.data-card-value.error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #004d40;
}

.chart-header i {
  font-size: 16px;
}

/* AI 分析模块样式 */
.ai-analysis-card :deep(.el-card__header) {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.08) 0%, rgba(25, 118, 210, 0.08) 100%);
  border-bottom: 2px solid rgba(0, 188, 212, 0.2);
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ai-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.ai-icon {
  font-size: 24px;
  color: #00bcd4;
  animation: pulse 2s ease-in-out infinite;
}

.ai-title {
  font-size: 18px;
  font-weight: 700;
  color: #004d40;
  letter-spacing: 0.5px;
}

.ai-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: rgba(0, 188, 212, 0.1);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #00bcd4;
  letter-spacing: 0.5px;
  margin-left: 12px;
}

.ai-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00bcd4;
  animation: pulse 1.5s ease-in-out infinite;
}

.ai-status-dot.active {
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 188, 212, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 188, 212, 0.6);
  }
}

.ai-content-wrapper {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.ai-loader {
  display: flex;
  gap: 12px;
}

.loader-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #00bcd4;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loader-circle:nth-child(1) {
  animation-delay: -0.32s;
}

.loader-circle:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-result {
  width: 100%;
  padding: 20px;
}

.ai-result-content {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%);
  border-left: 4px solid #00bcd4;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  line-height: 1.8;
  color: #263238;
}

.ai-typewriter {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.ai-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: rgba(76, 175, 80, 0.05);
  border-radius: 8px;
  border-left: 3px solid #4caf50;
}

.insight-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.insight-text {
  font-size: 13px;
  color: #263238;
  line-height: 1.6;
}

.ai-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  color: #00bcd4;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.ai-placeholder h4 {
  margin: 0;
  font-size: 18px;
  color: #004d40;
  font-weight: 700;
}

.ai-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #78909c;
  max-width: 400px;
}
</style>
