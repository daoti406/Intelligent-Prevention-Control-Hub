<template>
  <div class="warning-container">
    <!-- 边缘智能预警控制面板 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :span="24">
        <el-card class="edge-alert-control-panel">
          <template #header>
            <div class="header-bar">
              <h3 class="page-title">
                <i class="fas fa-brain"></i> 边缘智能预警系统
              </h3>
              <div class="edge-status-info">
                <el-tag 
                  :type="edgeStatus.type" 
                  size="small"
                  class="mr-2"
                >
                  {{ edgeStatus.message }}
                </el-tag>
                <el-button
                  type="primary"
                  size="small"
                  @click="toggleEdgeSystem"
                  :loading="edgeLoading"
                >
                  <i class="fas fa-satellite-dish"></i>
                  {{ edgeStatus.running ? '停止边缘预警' : '启动边缘预警' }}
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- 边缘预警统计 -->
          <div class="edge-stats-grid">
            <div class="edge-stat-item">
              <div class="stat-icon">
                <i class="fas fa-bolt" style="color: #e6a23c;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ edgeStats.responseTime }}ms</div>
                <div class="stat-label">边缘响应时间</div>
              </div>
            </div>
            <div class="edge-stat-item">
              <div class="stat-icon">
                <i class="fas fa-shield-alt" style="color: #67c23a;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ edgeStats.accuracy }}%</div>
                <div class="stat-label">预警准确率</div>
              </div>
            </div>
            <div class="edge-stat-item">
              <div class="stat-icon">
                <i class="fas fa-cloud-upload-alt" style="color: #409eff;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ edgeStats.predictions }}个</div>
                <div class="stat-label">预测性预警</div>
              </div>
            </div>
            <div class="edge-stat-item">
              <div class="stat-icon">
                <i class="fas fa-clock" style="color: #909399;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ edgeStats.predictionDays }}天</div>
                <div class="stat-label">预测周期</div>
              </div>
            </div>
            <div class="edge-stat-item">
              <div class="stat-icon">
                <i class="fas fa-microchip" style="color: #e6a23c;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ povertyAIStats.suitableWarnings }}个</div>
                <div class="stat-label">mmcow视觉AI可处理</div>
              </div>
            </div>
            <div class="edge-stat-item">
              <div class="stat-icon">
                <i class="fas fa-chart-line" style="color: #409eff;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ povertyAIStats.accuracy }}%</div>
                <div class="stat-label">AI准确率</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警中心主内容 -->
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card class="warning-card">
          <template #header>
            <div class="header-bar">
              <h3 class="page-title">预警中心</h3>
              <div class="header-actions">
                <el-button type="danger" size="small" @click="handleAllWarnings">
                  <i class="fas fa-exclamation-circle"></i>
                  全部预警 ({{ totalWarnings }})
                </el-button>
                <el-button type="primary" size="small">
                  <i class="fas fa-cog"></i>
                  预警设置
                </el-button>
              </div>
            </div>
          </template>

          <div class="filter-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索预警类型、位置或描述"
              clearable
              size="small"
              class="filter-input"
            />
            <el-select
              v-model="selectedStatus"
              placeholder="按状态筛选"
              clearable
              size="small"
              class="filter-select"
            >
              <el-option
                v-for="status in statusOptions"
                :key="status"
                :label="status"
                :value="status"
              />
            </el-select>
            <div class="filter-summary">
              当前显示 {{ filteredWarnings.length }} / {{ warningList.length }} 条
            </div>
          </div>

          <!-- AI预测性预警显示区域 -->
          <div class="ai-prediction-section" v-if="edgeStatus.running">
            <div class="section-header">
              <h4><i class="fas fa-microchip"></i> 边缘智能预测分析</h4>
              <div class="prediction-stats">
                <span class="prediction-count">
                  <i class="fas fa-bell"></i> 预测预警: {{ aiPredictions.length }} 个
                </span>
                <el-button 
                  type="info" 
                  size="small" 
                  @click="refreshPredictions"
                  :loading="predictionLoading"
                >
                  <i class="fas fa-sync-alt"></i> 更新分析
                </el-button>
              </div>
            </div>

            <div class="prediction-grid">
              <div 
                v-for="prediction in aiPredictions" 
                :key="prediction.id" 
                class="prediction-card" 
                :class="prediction.level"
              >
                <div class="prediction-header">
                  <div class="prediction-level-badge">
                    <i :class="prediction.icon"></i>
                    <span>{{ prediction.levelText }}</span>
                  </div>
                  <div class="prediction-score" :style="{ color: prediction.color }">
                    {{ prediction.probability }}%
                  </div>
                </div>
                <div class="prediction-body">
                  <div class="prediction-title">{{ prediction.title }}</div>
                  <div class="prediction-desc">{{ prediction.description }}</div>
                  <div class="prediction-meta">
                    <span class="prediction-time">
                      <i class="fas fa-calendar"></i> 预计: {{ prediction.expectedTime }}
                    </span>
                    <span class="prediction-location">
                      <i class="fas fa-map-marker-alt"></i> 📍{{ prediction.location }}
                    </span>
                  </div>
                </div>
                <div class="prediction-actions">
                  <el-button size="mini" @click="viewPredictionDetail(prediction)">
                    <i class="fas fa-eye"></i> 详情
                  </el-button>
                  <el-button 
                    size="mini" 
                    type="primary" 
                    @click="acknowledgePrediction(prediction)"
                  >
                    <i class="fas fa-check"></i> 确认
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="warning-table-wrap">
            <el-table
              ref="warningTableRef"
              :data="filteredWarnings"
              size="small"
              class="warning-table"
              @expand-change="handleExpandChange"
            >
              <el-table-column type="expand" width="48">
                <template #default="scope">
                  <div class="description-panel">
                    <div class="description-title">预警描述</div>
                    <div class="description-content">
                      {{ scope.row.description }}
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="time" label="时间" width="150">
                <template #default="scope">
                  <i class="fas fa-clock"></i>
                  {{ scope.row.time }}
                </template>
              </el-table-column>

              <el-table-column prop="location" label="位置" width="126">
                <template #default="scope">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ scope.row.location }}
                </template>
              </el-table-column>

              <el-table-column prop="type" label="预警类型" min-width="150">
                <template #default="scope">
                  <el-tag
                    size="small"
                    effect="light"
                    :class="['warning-type-tag', getWarningTypeClass(scope.row.type)]"
                  >
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="描述" width="98" align="center">
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    @click="toggleDescription(scope.row)"
                  >
                    {{ isRowExpanded(scope.row.id) ? "收起" : "查看" }}
                  </el-button>
                </template>
              </el-table-column>

              <el-table-column prop="level" label="等级" width="84" align="center">
                <template #default="scope">
                  <span :class="'status-' + scope.row.level" class="status-tag">
                    {{
                      scope.row.level === "high"
                        ? "高危"
                        : scope.row.level === "medium"
                          ? "中危"
                          : "低危"
                    }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column prop="status" label="状态" width="106" align="center">
                <template #default="scope">
                  <el-tag :type="getWarningStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                  <br>
                  <span class="duration-info">
                    <i class="fas fa-clock" style="font-size: 10px;"></i>
                    {{ getWarningDuration(scope.row) }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="140" align="center">
                <template #default="scope">
                  <div class="action-group">
                    <el-button
                      size="small"
                      link
                      type="primary"
                      @click="handleWarningDetail(scope.row)"
                    >
                      <i class="fas fa-eye"></i>
                    </el-button>
                    <el-button
                      size="small"
                      link
                      type="success"
                      :disabled="scope.row.status === '已处理'"
                      @click="handleWarningConfirm(scope.row)"
                    >
                      <i class="fas fa-check"></i>
                    </el-button>
                    <el-button
                      size="small"
                      link
                      type="warning"
                      :disabled="scope.row.status === '已处理'"
                      @click="handlePovertyAIAnalysis(scope.row)"
                      v-if="isSuitableForPovertyAI(scope.row)"
                    >
                      <i class="fas fa-microchip"></i>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty
            v-if="!filteredWarnings.length"
            description="暂无符合筛选条件的预警"
            class="warning-empty"
          />

          <el-row :gutter="16" class="mt-4">
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <i class="fas fa-chart-pie"></i>
                    预警类型分布
                  </div>
                </template>
                <div id="warningTypeChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <i class="fas fa-chart-line"></i>
                    预警趋势
                  </div>
                </template>
                <div id="warningTrendChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { EdgePredictiveAlert } from "../utils/edgePredictiveAlert.js";

const warningList = inject("warningList");
const totalWarnings = inject("totalWarnings");
const handleAllWarnings = inject("handleAllWarnings");
const handleWarningDetail = inject("handleWarningDetail");
const handleWarningConfirm = inject("handleWarningConfirm");
const activeIndex = inject("activeIndex");

const searchKeyword = ref("");
const selectedStatus = ref("");
const statusOptions = ["待处理", "处理中", "已处理"];
const warningTableRef = ref(null);
const expandedRowIds = ref([]);

// 边缘智能预警系统状态
const edgeAlertSystem = ref(null);
const edgeStatus = ref({
  running: false,
  message: '边缘预警系统未启动',
  type: 'info'
});
const edgeLoading = ref(false);
const edgeStats = ref({
  responseTime: 0,
  accuracy: 0,
  predictions: 0,
  predictionDays: 7
});

// AI预测性预警数据
const aiPredictions = ref([]);
const predictionLoading = ref(false);

const filteredWarnings = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return warningList.value.filter((warning) => {
    const matchesStatus =
      !selectedStatus.value || warning.status === selectedStatus.value;
    const matchesKeyword =
      !keyword ||
      [warning.type, warning.location, warning.description, warning.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));

    return matchesStatus && matchesKeyword;
  });
});

const getWarningStatusType = (status) => {
  if (status === "已处理") return "success";
  if (status === "处理中") return "warning";
  return "danger";
};

const getWarningTypeClass = (type) => {
  if (type.includes("温度")) return "warning-type-tag--temperature";
  if (type.includes("湿度")) return "warning-type-tag--humidity";
  if (type.includes("行为")) return "warning-type-tag--behavior";
  if (type.includes("进食")) return "warning-type-tag--feeding";
  if (type.includes("空气")) return "warning-type-tag--air";
  return "warning-type-tag--default";
};

const isRowExpanded = (id) => expandedRowIds.value.includes(id);

const toggleDescription = (row) => {
  warningTableRef.value?.toggleRowExpansion(row, !isRowExpanded(row.id));
};

const handleExpandChange = (_row, expandedRows) => {
  expandedRowIds.value = expandedRows.map((item) => item.id);
};

// 边缘智能预警系统控制函数
const toggleEdgeSystem = async () => {
  edgeLoading.value = true;
  try {
    if (!edgeStatus.value.running) {
      // 启动边缘预警系统
      edgeAlertSystem.value = new EdgePredictiveAlert();
      await edgeAlertSystem.value.initialize();
      
      edgeStatus.value = {
        running: true,
        message: '边缘预警系统运行中',
        type: 'success'
      };
      
      // 开始接收预测数据
      startReceivingPredictions();
    } else {
      // 停止边缘预警系统
      if (edgeAlertSystem.value) {
        await edgeAlertSystem.value.stop();
        edgeAlertSystem.value = null;
      }
      
      edgeStatus.value = {
        running: false,
        message: '边缘预警系统已停止',
        type: 'info'
      };
      
      aiPredictions.value = [];
    }
  } catch (error) {
    console.error('边缘预警系统控制失败:', error);
    edgeStatus.value = {
      running: false,
      message: '系统异常',
      type: 'danger'
    };
  } finally {
    edgeLoading.value = false;
  }
};

// 接收预测数据
const startReceivingPredictions = () => {
  if (!edgeAlertSystem.value) return;
  
  // 模拟实时接收预测数据
  const interval = setInterval(async () => {
    if (!edgeStatus.value.running) {
      clearInterval(interval);
      return;
    }
    
    try {
      const predictions = await edgeAlertSystem.value.getPredictions();
      aiPredictions.value = predictions.map(pred => ({
        ...pred,
        levelText: pred.level === 'high' ? '高风险' : pred.level === 'medium' ? '中风险' : '低风险',
        color: pred.level === 'high' ? '#f56c6c' : pred.level === 'medium' ? '#e6a23c' : '#67c23a',
        icon: pred.level === 'high' ? 'fas fa-exclamation-triangle' : 
              pred.level === 'medium' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'
      }));
      
      // 更新统计数据
      edgeStats.value.predictions = predictions.length;
      edgeStats.value.responseTime = Math.floor(Math.random() * 100 + 50); // 模拟响应时间
      edgeStats.value.accuracy = Math.floor(Math.random() * 20 + 80); // 模拟准确率
    } catch (error) {
      console.error('获取预测数据失败:', error);
    }
  }, 5000); // 每5秒更新一次
};

// 刷新预测数据
const refreshPredictions = async () => {
  if (!edgeStatus.value.running) return;
  
  predictionLoading.value = true;
  try {
    await startReceivingPredictions();
  } finally {
    predictionLoading.value = false;
  }
};

// 查看预测详情
const viewPredictionDetail = (prediction) => {
  console.log('查看预测详情:', prediction);
  // 这里可以打开模态框显示详细预测信息
};

// 确认预测预警
const acknowledgePrediction = (prediction) => {
  console.log('确认预测预警:', prediction);
  // 这里可以标记预测预警为已确认
  const index = aiPredictions.value.findIndex(p => p.id === prediction.id);
  if (index !== -1) {
    aiPredictions.value.splice(index, 1);
  }
};

let warningTypeChart = null;
let warningTrendChart = null;

onMounted(() => {
  setTimeout(() => {
    initWarningTypeChart();
    initWarningTrendChart();
  }, 300);
});

onUnmounted(() => {
  warningTypeChart?.dispose();
  warningTrendChart?.dispose();
});

watch(
  () => activeIndex.value,
  (newIndex) => {
    if (newIndex === "warning") {
      setTimeout(() => {
        initWarningTypeChart();
        initWarningTrendChart();
      }, 100);
    }
  },
);

function initWarningTypeChart() {
  const dom = document.getElementById("warningTypeChart");
  if (!dom) return;

  warningTypeChart?.dispose();
  warningTypeChart = echarts.init(dom);
  warningTypeChart.setOption({
    color: ["#2e7d32", "#4caf50", "#66bb6a", "#a5d6a7"],
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, left: "center" },
    series: [
      {
        name: "预警类型",
        type: "pie",
        radius: ["52%", "72%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: "高温预警", value: 12 },
          { name: "湿度异常", value: 25 },
          { name: "空气质量异常", value: 8 },
          { name: "行为异常", value: 14 },
        ],
      },
    ],
  });
}

function initWarningTrendChart() {
  const dom = document.getElementById("warningTrendChart");
  if (!dom) return;

  warningTrendChart?.dispose();
  warningTrendChart = echarts.init(dom);
  warningTrendChart.setOption({
    tooltip: { trigger: "axis" },
    grid: { left: "4%", right: "4%", bottom: "4%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["0点", "4点", "8点", "12点", "16点", "20点", "24点"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "预警数量",
        type: "line",
        smooth: true,
        lineStyle: { width: 3, color: "#2e7d32" },
        showSymbol: false,
        areaStyle: {
          opacity: 0.25,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(46, 125, 50, 0.35)" },
            { offset: 1, color: "rgba(46, 125, 50, 0)" },
          ]),
        },
        data: [2, 5, 3, 9, 6, 14, 7],
      },
    ],
  });
}

// mmcow视觉AI相关功能
const getWarningDuration = (warning) => {
  const now = new Date();
  const warningTime = new Date(warning.time);
  const diffMs = now - warningTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}天`;
  } else if (diffHours > 0) {
    return `${diffHours}小时`;
  } else {
    return '1小时内';
  }
};

const isSuitableForPovertyAI = (warning) => {
  // 判断该预警是否适合mmcow视觉AI分析
  // 条件：环境监测类、非紧急类预警适合mmcow视觉AI分析
  const suitableTypes = ['温度异常', '湿度异常', '空气质量异常', '进食异常'];
  const unsuitableLevels = ['high', '高危'];
  
  return suitableTypes.includes(warning.type) && !unsuitableLevels.includes(warning.level);
};

const handlePovertyAIAnalysis = async (warning) => {
  try {
    // 模拟mmcow视觉AI分析过程
    const analysisResult = await generatePovertyAIAnalysis(warning);
    
    // 显示分析结果
    ElMessage.success({
      message: analysisResult.message,
      duration: 6000,
      showClose: true
    });
    
    // 如果是mmcow视觉AI适合处理的预警，自动处理
    if (analysisResult.recommendation === 'auto-handle') {
      handleWarningConfirm(warning);
    }
  } catch (error) {
    console.error('mmcow视觉AI分析失败:', error);
    ElMessage.error('mmcow视觉AI分析失败，请稍后重试');
  }
};

const generatePovertyAIAnalysis = (warning) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟AI分析过程
      const analysisConfig = {
        risk: Math.random() * 0.5 + 0.2, // 风险系数 0.2-0.7
        costReduction: Math.random() * 40 + 10, // 成本降低 10%-50%
        accuracy: Math.random() * 10 + 85, // 准确率 85%-95%
      };
      
      const messages = [
        `基于mmcow视觉AI分析，本次预警可节省传感器成本约${analysisConfig.costReduction.toFixed(0)}%`,
        `AI分析准确率：${analysisConfig.accuracy.toFixed(1)}%`,
        `智能处理建议：采用边缘计算优化方案`
      ];
      
      resolve({
        message: messages.join('，'),
        recommendation: analysisConfig.risk < 0.4 ? 'auto-handle' : 'manual-review',
        analysis: analysisConfig
      });
    }, 1000);
  });
};

// 添加mmcow视觉AI统计信息
const povertyAIStats = ref({
  suitableWarnings: 0,
  processedByAI: 0,
  accuracy: 92.5,
  costReduction: 45.3
});

// 计算适合AI处理的预警数量
watch(warningList, (newList) => {
  povertyAIStats.value.suitableWarnings = newList.filter(isSuitableForPovertyAI).length;
}, { immediate: true });
</script>

<style scoped>
.warning-container {
  width: 100%;
  min-width: 0;
  padding-right: 8px;
  box-sizing: border-box;
}

.warning-card {
  width: 100%;
  max-width: 100%;
}

:deep(.warning-card .el-card__body) {
  overflow: hidden;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  color: #2e7d32;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 150px;
}

.filter-summary {
  color: #606266;
  font-size: 13px;
}

.warning-table-wrap {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
}

.warning-table {
  min-width: 900px;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.warning-empty {
  padding-top: 12px;
}

.description-panel {
  padding: 8px 16px;
  background: #f8fbf8;
  border-left: 3px solid #67c23a;
  border-radius: 8px;
}

.description-title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
}

.description-content {
  color: #606266;
  line-height: 1.7;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  height: 280px;
}

.warning-type-tag {
  display: inline-flex;
  align-items: center;
  border-width: 1px;
  border-style: solid;
  font-weight: 600;
  white-space: nowrap;
  font-size: 12px;
}

.warning-type-tag--temperature {
  color: #1f7a45;
  background: linear-gradient(135deg, #eef9f0 0%, #d7f1dd 100%);
  border-color: #88c999;
}

.warning-type-tag--humidity {
  color: #1d6f5f;
  background: linear-gradient(135deg, #edf9f6 0%, #d4f0e9 100%);
  border-color: #7ecab9;
}

.warning-type-tag--behavior {
  color: #3e7f2f;
  background: linear-gradient(135deg, #f4faeb 0%, #e3f3cc 100%);
  border-color: #a8cf75;
}

.warning-type-tag--feeding {
  color: #4b7a2a;
  background: linear-gradient(135deg, #f7fbe9 0%, #e7f2c7 100%);
  border-color: #b8d36f;
}

.warning-type-tag--air {
  color: #216c52;
  background: linear-gradient(135deg, #eefaf4 0%, #d5efdf 100%);
  border-color: #84c6a0;
}

.warning-type-tag--default {
  color: #2e7d32;
  background: linear-gradient(135deg, #f1faef 0%, #def2dc 100%);
  border-color: #9acd9e;
}

/* AI预测性预警样式 */
.ai-prediction-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f7ff;
}

/* mmcow视觉AI相关样式 */
.duration-info {
  font-size: 10px;
  color: #909399;
  margin-top: 2px;
  display: inline-block;
}

.status-high {
  color: #f56c6c;
  font-weight: 600;
}

.status-medium {
  color: #e6a23c;
  font-weight: 600;
}

.status-low {
  color: #67c23a;
  font-weight: 600;
}

/* mmcow视觉AI操作按钮样式 */
.action-group .el-button {
  padding: 4px 6px;
  font-size: 11px;
  min-width: 20px;
}

.action-group .el-button[type="warning"] {
  background: linear-gradient(135deg, #fdf6ec 0%, #f2e8ce 100%);
  border-color: #e6a23c;
  color: #e6a23c;
}

.action-group .el-button[type="warning"]:hover {
  background: linear-gradient(135deg, #fcecd3 0%, #f0d3a7 100%);
  border-color: #d48812;
  color: #d48812;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  color: #409eff;
  font-weight: 600;
}

.prediction-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.prediction-count {
  font-size: 14px;
  color: #606266;
}

.prediction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.prediction-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

.prediction-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.prediction-card.high {
  border-left: 4px solid #f56c6c;
}

.prediction-card.medium {
  border-left: 4px solid #e6a23c;
}

.prediction-card.low {
  border-left: 4px solid #67c23a;
}

.prediction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.prediction-level-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.prediction-level-badge .high { color: #f56c6c; }
.prediction-level-badge .medium { color: #e6a23c; }
.prediction-level-badge .low { color: #67c23a; }

.prediction-score {
  font-size: 18px;
  font-weight: bold;
}

.prediction-body {
  margin-bottom: 12px;
}

.prediction-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.prediction-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
}

.prediction-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.prediction-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 边缘预警控制面板样式 */
.edge-alert-control-panel {
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
  border: 1px solid #e1f5ff;
}

.edge-status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edge-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  padding: 16px 0;
}

.edge-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .edge-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .prediction-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .prediction-meta {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 1200px) {
  .warning-table {
    min-width: 840px;
  }
}

@media (max-width: 768px) {
  .warning-container {
    padding-right: 0;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .warning-table {
    min-width: 760px;
  }

  .action-group {
    gap: 4px;
  }
}
</style>
