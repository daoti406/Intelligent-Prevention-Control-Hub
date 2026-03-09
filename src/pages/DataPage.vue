<template>
  <div class="data-container">
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="stats-card">
          <template #header>
            <div class="header flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32; flex: 1; font-size: 18px; font-weight: 700">
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
                <span class="ai-title">AI 大模型深度分析报告</span>
                <div class="ai-status-indicator" v-if="aiLoading">
                  <div class="ai-status-dot active"></div>
                  <span>AI 正在分析中...</span>
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
              <p>AI 正在深度分析您的数据，请稍候...</p>
            </div>

            <div v-else-if="aiAnalysisResult" class="ai-result">
              <div class="ai-result-content">
                <!-- 执行摘要 -->
                <div class="analysis-section">
                  <h4 class="section-title">📋 执行摘要</h4>
                  <div class="section-content">
                    <p>当前养殖场整体健康状况良好，平均健康率达到 <strong>97.8%</strong>，环比上升 <strong>2.3%</strong>。系统监测到 <strong>12</strong> 条预警信息，其中 <strong>8</strong> 条已处理，处理率达 <strong>66.7%</strong>。预计本周疫病发生率将保持在低位。</p>
                  </div>
                </div>

                <!-- 环境风险评估 -->
                <div class="analysis-section">
                  <h4 class="section-title">🌡️ 环境风险评估</h4>
                  <div class="section-content">
                    <div class="risk-item">
                      <span class="risk-label">温度管理</span>
                      <el-progress :percentage="92" color="#4caf50" />
                      <p>A 区温度控制良好（22-24°C），B 区存在 <strong>3°C 偏高</strong>现象，已启动自动降温。建议加强通风，预防热应激。</p>
                    </div>
                    <div class="risk-item">
                      <span class="risk-label">湿度管理</span>
                      <el-progress :percentage="85" color="#ff9800" />
                      <p>整体湿度在 <strong>60-70%</strong> 范围内，D 区湿度偏高（75%），易导致呼吸道疾病。建议增加通风次数，每天 3-4 次。</p>
                    </div>
                    <div class="risk-item">
                      <span class="risk-label">空气质量</span>
                      <el-progress :percentage="88" color="#2196f3" />
                      <p>氨气浓度 <strong>12 ppm</strong>（安全值 <20 ppm），二氧化碳 <strong>1200 ppm</strong>（安全值 <1500 ppm），整体空气质量良好。</p>
                    </div>
                  </div>
                </div>

                <!-- 疫病预警建模 -->
                <div class="analysis-section">
                  <h4 class="section-title">🔬 疫病预警建模</h4>
                  <div class="section-content">
                    <div class="disease-item">
                      <span class="disease-name">呼吸道疾病</span>
                      <span class="disease-risk high">高风险</span>
                      <p>B 区和 D 区湿度偏高，温度波动大，易引发呼吸道感染。<strong>建议：</strong>加强通风，补充维生素 A，监测咳嗽症状。</p>
                    </div>
                    <div class="disease-item">
                      <span class="disease-name">消化道疾病</span>
                      <span class="disease-risk low">低风险</span>
                      <p>饲料质量稳定，动物采食量正常，消化道疾病风险低。<strong>建议：</strong>继续保持当前饲料配方和喂养计划。</p>
                    </div>
                    <div class="disease-item">
                      <span class="disease-name">寄生虫病</span>
                      <span class="disease-risk medium">中风险</span>
                      <p>C 区最后一次驱虫已 <strong>45 天</strong>，建议本周进行第二次驱虫。<strong>建议：</strong>使用阿维菌素类驱虫药，剂量按体重计算。</p>
                    </div>
                  </div>
                </div>

                <!-- 饲料转化率分析 -->
                <div class="analysis-section">
                  <h4 class="section-title">🍖 饲料转化率分析</h4>
                  <div class="section-content">
                    <p><strong>平均饲料转化率：</strong> 2.8:1（行业平均 3.2:1）</p>
                    <p><strong>分析：</strong> 您的饲料转化率优于行业平均水平 <strong>12.5%</strong>，说明饲料配方科学，动物采食效率高。</p>
                    <ul style="margin: 12px 0; padding-left: 20px;">
                      <li>A 区（猪舍）：2.6:1 - 优秀，建议保持当前配方</li>
                      <li>B 区（鸡舍）：2.9:1 - 良好，可考虑增加蛋白质含量</li>
                      <li>C 区（牛舍）：3.1:1 - 正常，需优化粗纤维配比</li>
                      <li>D 区（隔离舍）：3.2:1 - 正常，建议加强营养支持</li>
                    </ul>
                  </div>
                </div>

                <!-- 防疫建议 -->
                <div class="analysis-section">
                  <h4 class="section-title">💊 针对性防疫建议</h4>
                  <div class="section-content">
                    <div class="recommendation">
                      <span class="rec-priority">🔴 紧急</span>
                      <p><strong>B 区温度异常处理：</strong> 立即启动应急降温方案，目标温度 20-22°C，预计 2 小时内恢复正常。</p>
                    </div>
                    <div class="recommendation">
                      <span class="rec-priority">🟠 重要</span>
                      <p><strong>D 区湿度管理：</strong> 增加通风频次至每天 4 次，每次 30 分钟，同时检查排水系统是否堵塞。</p>
                    </div>
                    <div class="recommendation">
                      <span class="rec-priority">🟡 建议</span>
                      <p><strong>全场驱虫计划：</strong> 本周对 C 区进行第二次驱虫，下周对 A、B 区进行预防性驱虫。</p>
                    </div>
                    <div class="recommendation">
                      <span class="rec-priority">🟢 信息</span>
                      <p><strong>疫苗接种提醒：</strong> A 区 45 日龄动物应进行第二次免疫，建议本周五执行。</p>
                    </div>
                  </div>
                </div>

                <!-- 数据趋势预测 -->
                <div class="analysis-section">
                  <h4 class="section-title">📈 数据趋势预测</h4>
                  <div class="section-content">
                    <p><strong>未来 7 天预测：</strong></p>
                    <ul style="margin: 12px 0; padding-left: 20px;">
                      <li>健康率预计保持在 <strong>96-98%</strong> 范围内</li>
                      <li>预警数预计下降至 <strong>8-10 条</strong>（基于当前处理速度）</li>
                      <li>疫病发生率预计保持低位，无明显上升趋势</li>
                      <li>气温下降 <strong>3-5°C</strong>，建议提前做好保温工作</li>
                    </ul>
                  </div>
                </div>

                <!-- 成本效益分析 -->
                <div class="analysis-section">
                  <h4 class="section-title">💰 成本效益分析</h4>
                  <div class="section-content">
                    <p><strong>本月防疫投入：</strong> ¥12,500（疫苗、驱虫药、消毒剂）</p>
                    <p><strong>预期收益：</strong> 通过预防性防疫，预计减少疫病损失 ¥45,000-60,000</p>
                    <p><strong>投入产出比：</strong> 1:3.6 - 4.8（优秀水平）</p>
                    <p><strong>建议：</strong> 继续加大防疫投入，ROI 显著，长期收益可观。</p>
                  </div>
                </div>

                <!-- AI 洞察 -->
                <div class="ai-insights">
                  <h4 style="margin-top: 20px; margin-bottom: 12px; font-weight: 600;">💡 AI 关键洞察</h4>
                  <div class="insight-item" v-for="(insight, index) in aiInsights" :key="index">
                    <span class="insight-icon">✨</span>
                    <span class="insight-text">{{ insight }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="ai-placeholder">
              <div class="placeholder-icon">
                <i class="fas fa-sparkles"></i>
              </div>
              <h4>准备好获取 AI 深度分析了吗？</h4>
              <p>点击"重新分析"按钮，让我们的 AI 大模型基于实时数据为您生成专业的深度分析报告。</p>
              <p style="font-size: 12px; color: #999; margin-top: 8px;">包含环境风险评估、疫病预警建模、饲料转化率分析、防疫建议等多维度内容。</p>
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
  "当前平均健康率达到 97.8%，整体疫病防控效果显著，环比上升 2.3%",
  "呼吸道疾病相比上月下降 12%，防疫措施见效，但 B 区和 D 区需加强通风",
  "建议加强 C 区牛舍的温度管理，当前健康率最低（95%），需重点关注",
  "预计下周气温下降 3-5°C，需提前做好保温工作，预防冷应激",
  "饲料转化率 2.8:1，优于行业平均水平 12.5%，说明饲料配方科学有效",
  "本月防疫投入产出比 1:3.6-4.8，继续加大防疫投入，长期收益可观"
]);

let diseaseChart = null;
let diseaseTypeChart = null;
let healthRateChart = null;

const exportData = () => {
  ElMessage.info("导出功能开发中");
};

const fetchAIAnalysis = async () => {
  aiLoading.value = true;
  aiAnalysisResult.value = "";
  try {
    // 模拟流式输出效果
    const result = await fetchAI();
    
    // 直接显示完整的分析报告
    aiAnalysisResult.value = result.content;
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
        data: [15, 18, 22, 16, 12, 8, 6, 10, 14, 18, 22, 18],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255, 193, 7, 0.3)" },
            { offset: 1, color: "rgba(255, 193, 7, 0)" },
          ]),
        },
        lineStyle: { width: 3, color: "#ffc107" },
        itemStyle: { color: "#ffc107" },
      },
      {
        name: "皮肤寄生虫",
        type: "line",
        data: [8, 10, 12, 9, 7, 5, 4, 6, 8, 10, 12, 10],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(76, 175, 80, 0.3)" },
            { offset: 1, color: "rgba(76, 175, 80, 0)" },
          ]),
        },
        lineStyle: { width: 3, color: "#4caf50" },
        itemStyle: { color: "#4caf50" },
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
    color: ["#ff4d4f", "#ffc107", "#4caf50", "#2196f3"],
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
          { value: 20, name: "其他疾病" },
        ],
      },
    ],
  });
};

const initHealthRateChart = () => {
  const dom = document.getElementById("healthRateChart");
  if (!dom) return;

  if (healthRateChart) healthRateChart.dispose();

  healthRateChart = echarts.init(dom);
  healthRateChart.setOption({
    color: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
    tooltip: { trigger: "axis" },
    legend: { data: ["A区", "B区", "C区", "D区"] },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: { type: "value", min: 80, max: 100 },
    series: [
      {
        name: "A区",
        type: "line",
        data: [96, 96, 96, 96, 96, 96, 96],
        smooth: true,
      },
      {
        name: "B区",
        type: "line",
        data: [92, 91, 92, 92, 93, 93, 92],
        smooth: true,
      },
      {
        name: "C区",
        type: "line",
        data: [95, 94, 95, 95, 95, 95, 95],
        smooth: true,
      },
      {
        name: "D区",
        type: "line",
        data: [88, 87, 88, 89, 89, 88, 88],
        smooth: true,
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
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%);
}

.data-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #2e7d32;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
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
  color: #2e7d32;
  font-size: 16px;
}

.ai-analysis-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  font-size: 20px;
  color: #9c27b0;
}

.ai-title {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.ai-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
  margin-left: 12px;
}

.ai-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
}

.ai-status-dot.active {
  background: #4caf50;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ai-content-wrapper {
  min-height: 200px;
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.ai-loader {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.loader-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9c27b0;
  animation: bounce 1.4s ease-in-out infinite;
}

.loader-circle:nth-child(1) { animation-delay: -0.32s; }
.loader-circle:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.ai-result {
  padding: 20px 0;
}

.ai-result-content {
  line-height: 1.8;
}

.analysis-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #2e7d32;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.section-content {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.section-content p {
  margin: 8px 0;
}

.section-content ul {
  margin: 12px 0;
  padding-left: 20px;
}

.section-content li {
  margin: 6px 0;
}

.risk-item {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.risk-label {
  display: inline-block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 13px;
}

.risk-item p {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.disease-item {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #ff9800;
}

.disease-name {
  font-weight: 600;
  color: #333;
  margin-right: 12px;
  font-size: 13px;
}

.disease-risk {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.disease-risk.high {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.disease-risk.medium {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.disease-risk.low {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.disease-item p {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.recommendation {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #2196f3;
}

.rec-priority {
  display: inline-block;
  font-weight: 600;
  margin-right: 8px;
  font-size: 12px;
}

.recommendation p {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.ai-insights {
  margin-top: 20px;
  padding: 16px;
  background: rgba(156, 39, 176, 0.05);
  border-radius: 8px;
  border-left: 3px solid #9c27b0;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.insight-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.ai-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #9c27b0;
}

.placeholder-icon i {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.ai-placeholder h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.ai-placeholder p {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.chart-container {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .analysis-section {
    padding: 12px;
  }

  .section-title {
    font-size: 13px;
  }

  .section-content {
    font-size: 12px;
  }
}
</style>
