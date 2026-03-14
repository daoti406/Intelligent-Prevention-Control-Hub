<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <div class="welcome-banner">
          <div class="banner-content">
            <h2>🏡 智栏哨兵 - 畜禽健康智能防控中枢</h2>
            <p>实时监测 · 智能预警 · AI 驱动</p>
          </div>
          <div class="banner-status">
            <div class="status-item">
              <span class="status-label">系统状态</span>
              <span class="status-value online">
                <i class="fas fa-circle"></i> 正常运行
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">AI智能助手</span>
              <span class="status-value">
                <i class="fas fa-brain"></i> 实时就绪
              </span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="stats-card">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32; flex: 1; font-size: 16px; font-weight: 700">
                📈 关键指标概览
              </h3>
              <el-button type="primary" size="small" @click="handleRefresh" :loading="refreshSpinning">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshSpinning }"></i>
                {{ refreshSpinning ? "刷新中..." : "刷新" }}
              </el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(stat, index) in dataStats" :key="index">
              <div class="data-card" :class="'card-' + stat.type">
                <div class="data-card-title">{{ stat.label }}</div>
                <div class="data-card-value" :class="stat.type">
                  {{ stat.value }}
                </div>
                <div class="data-card-trend">
                  <i class="fas fa-arrow-up"></i> 环比上升 2.3%
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 健康趋势与预警分布 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i> 健康趋势分析
            </div>
          </template>
          <div class="chart-container" id="healthChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- AI 智能助手  -->
      <el-col :span="8">
        <AIChatAssistant />
      </el-col>
    </el-row>

    <!-- 预警分布与地区对比 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-exclamation-triangle"></i> 预警分布
            </div>
          </template>
          <div class="chart-container" id="warningChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-map-marker-alt"></i> 地区健康率对比
            </div>
          </template>
          <div class="chart-container" id="regionChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速导航 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <h3 style="margin: 0; color: #2e7d32; font-size: 16px; font-weight: 700">
              🚀 快速导航
            </h3>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(nav, index) in quickNavs" :key="index">
              <div class="nav-card" @click="handleNav(nav.route)">
                <div class="nav-icon">{{ nav.icon }}</div>
                <div class="nav-title">{{ nav.title }}</div>
                <div class="nav-desc">{{ nav.desc }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import { getDataStats } from "../services/dataService";
import { ElMessage } from "element-plus";
import AIChatAssistant from "../components/AIChatAssistant.vue";

const router = useRouter();
const dataStats = ref(getDataStats());
const refreshSpinning = ref(false);

const quickNavs = ref([
  {
    icon: "📹",
    title: "实时监控",
    desc: "查看摄像头监控",
    route: "monitor"
  },
  {
    icon: "📊",
    title: "数据分析",
    desc: "AI 智能分析",
    route: "data"
  },
  {
    icon: "🚨",
    title: "预警中心",
    desc: "预警信息管理",
    route: "warning"
  },
  {
    icon: "📚",
    title: "防疫知识",
    desc: "防疫知识库",
    route: "knowledge"
  }
]);

let healthChart = null;
let warningChart = null;
let regionChart = null;

const handleRefresh = () => {
  refreshSpinning.value = true;
  setTimeout(() => {
    refreshSpinning.value = false;
    ElMessage.success("数据已刷新");
  }, 1500);
};

const handleNav = (route) => {
  router.push(`/${route}`);
};

const initHealthChart = () => {
  const dom = document.getElementById("healthChart");
  if (!dom) return;

  if (healthChart) healthChart.dispose();

  healthChart = echarts.init(dom);
  healthChart.setOption({
    color: ["#4caf50", "#2196f3", "#ff9800"],
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
        lineStyle: { width: 3 },
      },
      {
        name: "异常率",
        type: "line",
        smooth: true,
        data: [7.0, 5.3, 3.0, 4.0, 1.4, 0.8, 0.5],
        lineStyle: { width: 3 },
      },
      {
        name: "预警率",
        type: "line",
        smooth: true,
        data: [1.5, 1.5, 1.2, 1.2, 1.0, 1.0, 1.0],
        lineStyle: { width: 3 },
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

const initRegionChart = () => {
  const dom = document.getElementById("regionChart");
  if (!dom) return;

  if (regionChart) regionChart.dispose();

  regionChart = echarts.init(dom);
  regionChart.setOption({
    color: ["#4caf50", "#2196f3", "#ff9800"],
    tooltip: { trigger: "axis" },
    legend: { data: ["A区", "B区", "C区"] },
    xAxis: {
      type: "category",
      data: ["猪舍", "鸡舍", "牛舍"],
    },
    yAxis: { type: "value", min: 80, max: 100 },
    series: [
      {
        name: "A区",
        type: "bar",
        data: [95, 99, 90],
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
      {
        name: "B区",
        type: "bar",
        data: [92, 96, 88],
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
      {
        name: "C区",
        type: "bar",
        data: [85, 83, 84],
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  });
};

onMounted(() => {
  setTimeout(() => {
    initHealthChart();
    initWarningChart();
    initRegionChart();
  }, 300);
});

onUnmounted(() => {
  healthChart?.dispose();
  warningChart?.dispose();
  regionChart?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.welcome-banner {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  border-radius: 12px;
  padding: 30px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 77, 64, 0.2);
}

.banner-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.banner-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.banner-status {
  display: flex;
  gap: 30px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-value.online {
  color: #4caf50;
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

.data-card.card-success {
  border-left-color: #4caf50;
}

.data-card.card-warning {
  border-left-color: #ff9800;
}

.data-card.card-error {
  border-left-color: #f44336;
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

.data-card-trend {
  font-size: 12px;
  color: #4caf50;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2e7d32;
  font-size: 16px;
}

.chart-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.nav-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.nav-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #2e7d32;
}

.nav-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.nav-desc {
  font-size: 12px;
  color: #999;
}

.chart-container {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;
  }

  .banner-status {
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 20px;
  }

  .banner-content h2 {
    font-size: 18px;
  }

  .data-card-value {
    font-size: 24px;
  }
}
</style>
