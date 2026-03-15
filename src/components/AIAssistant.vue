<template>
  <div class="ai-assistant-container">
    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" class="ai-tabs">
      <!-- 智能建议标签页 -->
      <el-tab-pane label="智能建议" name="suggestions">
        <div class="suggestions-panel">
          <div class="panel-header">
            <h3><i class="fas fa-lightbulb"></i> AI 智能建议</h3>
            <el-button 
              type="primary" 
              size="small" 
              @click="generateNewSuggestions"
              :loading="suggestionsLoading"
            >
              <i class="fas fa-sync"></i> 重新分析
            </el-button>
          </div>
          
          <el-timeline v-if="suggestions.length > 0">
            <el-timeline-item 
              v-for="(suggestion, index) in suggestions" 
              :key="index"
              :timestamp="suggestion.timestamp"
              :placement="index % 2 === 0 ? 'top' : 'top'"
              :type="suggestion.type"
            >
              <el-card class="suggestion-card">
                <div class="suggestion-header">
                  <h4>{{ suggestion.title }}</h4>
                  <el-tag :type="getSuggestionTagType(suggestion.priority)">
                    {{ suggestion.priority }}
                  </el-tag>
                </div>
                <p class="suggestion-content">{{ suggestion.content }}</p>
                <div class="suggestion-footer">
                  <span class="location"><i class="fas fa-map-marker-alt"></i> {{ suggestion.location }}</span>
                  <el-button type="text" size="small" @click="handleSuggestionAction(suggestion)">
                    查看详情 →
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          
          <el-empty v-else description="暂无建议"></el-empty>
        </div>
      </el-tab-pane>

      <!-- 指数调整标签页 -->
      <el-tab-pane label="指数调整" name="adjustment">
        <div class="adjustment-panel">
          <div class="panel-header">
            <h3><i class="fas fa-sliders-h"></i> 环境指数调整</h3>
            <el-button type="primary" size="small" @click="applyAllAdjustments">
              应用所有调整
            </el-button>
          </div>

          <el-row :gutter="20">
            <!-- 温度调整 -->
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card class="adjustment-card">
                <template #header>
                  <div class="card-header">
                    <i class="fas fa-thermometer-half"></i>
                    <span>温度</span>
                  </div>
                </template>
                <div class="adjustment-content">
                  <div class="current-value">
                    <span class="label">当前值</span>
                    <span class="value">{{ environmentParams.temperature }}°C</span>
                  </div>
                  <el-slider 
                    v-model="environmentParams.temperature"
                    :min="15"
                    :max="35"
                    :step="0.5"
                    :marks="temperatureMarks"
                  ></el-slider>
                  <div class="target-value">
                    <span class="label">目标值</span>
                    <span class="value">{{ environmentParams.temperature }}°C</span>
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 湿度调整 -->
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card class="adjustment-card">
                <template #header>
                  <div class="card-header">
                    <i class="fas fa-droplet"></i>
                    <span>湿度</span>
                  </div>
                </template>
                <div class="adjustment-content">
                  <div class="current-value">
                    <span class="label">当前值</span>
                    <span class="value">{{ environmentParams.humidity }}%</span>
                  </div>
                  <el-slider 
                    v-model="environmentParams.humidity"
                    :min="30"
                    :max="80"
                    :step="1"
                    :marks="humidityMarks"
                  ></el-slider>
                  <div class="target-value">
                    <span class="label">目标值</span>
                    <span class="value">{{ environmentParams.humidity }}%</span>
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 通风调整 -->
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card class="adjustment-card">
                <template #header>
                  <div class="card-header">
                    <i class="fas fa-fan"></i>
                    <span>通风</span>
                  </div>
                </template>
                <div class="adjustment-content">
                  <div class="current-value">
                    <span class="label">当前值</span>
                    <span class="value">{{ environmentParams.ventilation }}%</span>
                  </div>
                  <el-slider 
                    v-model="environmentParams.ventilation"
                    :min="0"
                    :max="100"
                    :step="5"
                    :marks="ventilationMarks"
                  ></el-slider>
                  <div class="target-value">
                    <span class="label">目标值</span>
                    <span class="value">{{ environmentParams.ventilation }}%</span>
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 光照调整 -->
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card class="adjustment-card">
                <template #header>
                  <div class="card-header">
                    <i class="fas fa-lightbulb"></i>
                    <span>光照</span>
                  </div>
                </template>
                <div class="adjustment-content">
                  <div class="current-value">
                    <span class="label">当前值</span>
                    <span class="value">{{ environmentParams.lighting }} Lux</span>
                  </div>
                  <el-slider 
                    v-model="environmentParams.lighting"
                    :min="0"
                    :max="500"
                    :step="10"
                    :marks="lightingMarks"
                  ></el-slider>
                  <div class="target-value">
                    <span class="label">目标值</span>
                    <span class="value">{{ environmentParams.lighting }} Lux</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 调整历史 -->
          <div class="adjustment-history mt-4">
            <h4><i class="fas fa-history"></i> 最近调整记录</h4>
            <el-table :data="adjustmentHistory" style="width: 100%" stripe>
              <el-table-column prop="timestamp" label="调整时间" width="180"></el-table-column>
              <el-table-column prop="parameter" label="参数"></el-table-column>
              <el-table-column prop="oldValue" label="原值"></el-table-column>
              <el-table-column prop="newValue" label="新值"></el-table-column>
              <el-table-column prop="effect" label="效果" width="100"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 畜牧数据处理标签页 -->
      <el-tab-pane label="数据处理" name="data-processing">
        <div class="data-processing-panel">
          <div class="panel-header">
            <h3><i class="fas fa-database"></i> 畜牧数据处理</h3>
            <el-button-group>
              <el-button type="primary" size="small" @click="analyzeAllData">
                <i class="fas fa-chart-line"></i> 全面分析
              </el-button>
              <el-button type="primary" size="small" @click="exportData">
                <i class="fas fa-download"></i> 导出数据
              </el-button>
            </el-button-group>
          </div>

          <!-- 数据统计卡片 -->
          <el-row :gutter="20" class="data-stats-row">
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-card success">
                <div class="stat-icon"><i class="fas fa-heart-pulse"></i></div>
                <div class="stat-content">
                  <div class="stat-label">平均健康率</div>
                  <div class="stat-value">{{ livestockStats.healthRate }}%</div>
                  <div class="stat-trend">↑ 2.3% 较上周</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-card warning">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-content">
                  <div class="stat-label">异常数量</div>
                  <div class="stat-value">{{ livestockStats.abnormalCount }}</div>
                  <div class="stat-trend">↓ 5 较上周</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-card info">
                <div class="stat-icon"><i class="fas fa-chart-bar"></i></div>
                <div class="stat-content">
                  <div class="stat-label">总存栏数</div>
                  <div class="stat-value">{{ livestockStats.totalCount }}</div>
                  <div class="stat-trend">→ 无变化</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-card primary">
                <div class="stat-icon"><i class="fas fa-weight-scale"></i></div>
                <div class="stat-content">
                  <div class="stat-label">平均日增重</div>
                  <div class="stat-value">{{ livestockStats.dailyGain }}g</div>
                  <div class="stat-trend">↑ 1.2% 较上周</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 数据表格 -->
          <div class="data-table-container mt-4">
            <el-tabs v-model="dataTableTab">
              <!-- 猪只数据 -->
              <el-tab-pane label="猪只数据" name="pig">
                <el-table :data="pigData" stripe style="width: 100%">
                  <el-table-column prop="location" label="位置" width="120"></el-table-column>
                  <el-table-column prop="count" label="数量"></el-table-column>
                  <el-table-column prop="healthRate" label="健康率"></el-table-column>
                  <el-table-column prop="avgWeight" label="平均体重"></el-table-column>
                  <el-table-column prop="feedIntake" label="采食量"></el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="row.status === '正常' ? 'success' : 'warning'">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="text" size="small" @click="viewDetails(row)">
                        详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 鸡只数据 -->
              <el-tab-pane label="鸡只数据" name="chicken">
                <el-table :data="chickenData" stripe style="width: 100%">
                  <el-table-column prop="location" label="位置" width="120"></el-table-column>
                  <el-table-column prop="count" label="数量"></el-table-column>
                  <el-table-column prop="healthRate" label="健康率"></el-table-column>
                  <el-table-column prop="eggProduction" label="产蛋率"></el-table-column>
                  <el-table-column prop="feedIntake" label="采食量"></el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="row.status === '正常' ? 'success' : 'warning'">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="text" size="small" @click="viewDetails(row)">
                        详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 牛只数据 -->
              <el-tab-pane label="牛只数据" name="cattle">
                <el-table :data="cattleData" stripe style="width: 100%">
                  <el-table-column prop="location" label="位置" width="120"></el-table-column>
                  <el-table-column prop="count" label="数量"></el-table-column>
                  <el-table-column prop="healthRate" label="健康率"></el-table-column>
                  <el-table-column prop="milkProduction" label="产奶量"></el-table-column>
                  <el-table-column prop="feedIntake" label="采食量"></el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="row.status === '正常' ? 'success' : 'warning'">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="text" size="small" @click="viewDetails(row)">
                        详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-tab-pane>

      <!-- 数据分析标签页 -->
      <el-tab-pane label="数据分析" name="analysis">
        <div class="analysis-panel">
          <div class="panel-header">
            <h3><i class="fas fa-chart-line"></i> AI 数据分析报告</h3>
            <el-button type="primary" size="small" @click="generateAnalysisReport" :loading="analysisLoading">
              <i class="fas fa-sync"></i> 生成报告
            </el-button>
          </div>

          <div v-if="analysisReport" class="analysis-report" v-html="analysisReport"></div>
          <el-empty v-else description="点击按钮生成分析报告"></el-empty>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailsDialogVisible" title="数据详情" width="50%">
      <div v-if="selectedDetail" class="details-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="位置">{{ selectedDetail.location }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedDetail.count }}</el-descriptions-item>
          <el-descriptions-item label="健康率">{{ selectedDetail.healthRate }}</el-descriptions-item>
          <el-descriptions-item label="采食量">{{ selectedDetail.feedIntake }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedDetail.status === '正常' ? 'success' : 'warning'">
              {{ selectedDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ selectedDetail.lastUpdate }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import { ElMessage } from "element-plus";

// 标签页控制
const activeTab = ref("suggestions");
const dataTableTab = ref("pig");

// 智能建议数据
const suggestionsLoading = ref(false);
const suggestions = ref([
  {
    title: "环境优化建议",
    content: "当前 A 区猪舍湿度偏高（72%），建议开启通风系统 15 分钟，以降低氨气浓度，预防呼吸道疾病。",
    timestamp: "实时分析",
    type: "primary",
    location: "A 区猪舍 1 号",
    priority: "高"
  },
  {
    title: "防疫计划提醒",
    content: "B 区鸡舍 2 号棚即将进入下一阶段疫苗接种期（预计 2 天后），请提前准备相关防疫物资。",
    timestamp: "策略提醒",
    type: "warning",
    location: "B 区鸡舍 2 号",
    priority: "中"
  },
  {
    title: "饲喂效率分析",
    content: "通过近 7 天数据分析，C 区牛舍的进食效率提升了 5%，建议维持当前的饲料配比方案。",
    timestamp: "生产分析",
    type: "success",
    location: "C 区牛舍 1 号",
    priority: "低"
  }
]);

// 环境参数调整
const temperatureMarks = { 15: "15°C", 25: "25°C", 35: "35°C" };
const humidityMarks = { 30: "30%", 55: "55%", 80: "80%" };
const ventilationMarks = { 0: "0%", 50: "50%", 100: "100%" };
const lightingMarks = { 0: "0", 250: "250", 500: "500" };

const environmentParams = ref({
  temperature: 25.6,
  humidity: 65,
  ventilation: 60,
  lighting: 250
});

const adjustmentHistory = ref([
  {
    timestamp: "2025-01-11 14:30",
    parameter: "温度",
    oldValue: "24.5°C",
    newValue: "25.6°C",
    effect: "✓ 有效"
  },
  {
    timestamp: "2025-01-11 12:15",
    parameter: "湿度",
    oldValue: "72%",
    newValue: "65%",
    effect: "✓ 有效"
  },
  {
    timestamp: "2025-01-11 10:00",
    parameter: "通风",
    oldValue: "50%",
    newValue: "60%",
    effect: "✓ 有效"
  }
]);

// 畜牧数据统计
const livestockStats = ref({
  healthRate: 97.8,
  abnormalCount: 12,
  totalCount: 1580,
  dailyGain: 850
});

// 猪只数据
const pigData = ref([
  {
    location: "A 区 1 号棚",
    count: 240,
    healthRate: "90%",
    avgWeight: "120kg",
    feedIntake: "2.8kg/天",
    status: "正常",
    lastUpdate: "2025-01-11 15:30"
  },
  {
    location: "A 区 2 号棚",
    count: 180,
    healthRate: "100%",
    avgWeight: "115kg",
    feedIntake: "2.7kg/天",
    status: "正常",
    lastUpdate: "2025-01-11 15:30"
  }
]);

// 鸡只数据
const chickenData = ref([
  {
    location: "B 区 1 号棚",
    count: 500,
    healthRate: "99%",
    eggProduction: "95%",
    feedIntake: "120g/天",
    status: "正常",
    lastUpdate: "2025-01-11 15:30"
  },
  {
    location: "B 区 2 号棚",
    count: 450,
    healthRate: "96%",
    eggProduction: "92%",
    feedIntake: "118g/天",
    status: "异常",
    lastUpdate: "2025-01-11 15:30"
  }
]);

// 牛只数据
const cattleData = ref([
  {
    location: "C 区 1 号棚",
    count: 80,
    healthRate: "85%",
    milkProduction: "28L/天",
    feedIntake: "18kg/天",
    status: "正常",
    lastUpdate: "2025-01-11 15:30"
  },
  {
    location: "C 区 2 号棚",
    count: 65,
    healthRate: "83.3%",
    milkProduction: "26L/天",
    feedIntake: "17.5kg/天",
    status: "异常",
    lastUpdate: "2025-01-11 15:30"
  }
]);

// 分析报告
const analysisLoading = ref(false);
const analysisReport = ref(null);

// 详情对话框
const detailsDialogVisible = ref(false);
const selectedDetail = ref(null);

// 方法
const getSuggestionTagType = (priority) => {
  const map = { "高": "danger", "中": "warning", "低": "info" };
  return map[priority] || "info";
};

const generateNewSuggestions = () => {
  suggestionsLoading.value = true;
  ElMessage.info("正在重新分析数据...");
  setTimeout(() => {
    suggestions.value = [
      {
        title: "新增建议：饲料配比优化",
        content: "根据最新采食数据，建议调整 A 区的蛋白质含量从 16% 提升至 18%，以提高日增重。",
        timestamp: "实时分析",
        type: "primary",
        location: "A 区猪舍",
        priority: "高"
      },
      ...suggestions.value.slice(0, 2)
    ];
    suggestionsLoading.value = false;
    ElMessage.success("建议已更新");
  }, 1500);
};

const handleSuggestionAction = (suggestion) => {
  ElMessage.info(`已记录建议：${suggestion.title}`);
};

const applyAllAdjustments = () => {
  ElMessage.success("所有调整已应用！");
  adjustmentHistory.value.unshift({
    timestamp: new Date().toLocaleString(),
    parameter: "批量调整",
    oldValue: "多项",
    newValue: "已更新",
    effect: "✓ 有效"
  });
};

const analyzeAllData = () => {
  ElMessage.info("正在全面分析数据...");
  setTimeout(() => {
    ElMessage.success("分析完成");
  }, 1500);
};

const exportData = () => {
  ElMessage.success("数据已导出为 CSV 文件");
};

const generateAnalysisReport = () => {
  analysisLoading.value = true;
  setTimeout(() => {
    analysisReport.value = `
      <div class="ai-report">
        <div class="ai-report-header">
          <h4 style="color: #2e7d32; margin-top: 0;"><i class="fas fa-microchip"></i> AI 智能分析报告</h4>
          <p style="font-size: 12px; color: #999;">分析时间：${new Date().toLocaleString()}</p>
        </div>
        <el-divider></el-divider>
        <div class="ai-report-section">
          <h5 style="color: #e6a23c;"><i class="fas fa-bullseye"></i> 核心发现</h5>
          <p>本周整体健康率达到 <strong>97.8%</strong>，较上周提升 <strong>2.3%</strong>。其中 A 区猪舍表现最佳，健康率达 <strong>100%</strong>。</p>
        </div>
        <div class="ai-report-section">
          <h5 style="color: #409eff;"><i class="fas fa-filter"></i> 关键指标分析</h5>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li><strong>日增重：</strong>平均 850g/天，同比增长 1.2%</li>
            <li><strong>采食量：</strong>保持稳定，无异常波动</li>
            <li><strong>环境参数：</strong>温度、湿度、通风均在最优范围内</li>
          </ul>
        </div>
        <div class="ai-report-section">
          <h5 style="color: #67c23a;"><i class="fas fa-lightbulb"></i> 优化建议</h5>
          <p>建议继续维持当前的饲养管理方案，同时关注 B 区和 C 区的异常情况，及时调整。</p>
        </div>
      </div>
    `;
    analysisLoading.value = false;
    ElMessage.success("报告已生成");
  }, 1500);
};

const viewDetails = (row) => {
  selectedDetail.value = row;
  detailsDialogVisible.value = true;
};
</script>

<style scoped>
.ai-assistant-container {
  padding: 20px;
}

.ai-tabs {
  --el-tabs-header-height: 40px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.panel-header i {
  margin-right: 8px;
  color: #2e7d32;
}

/* 智能建议样式 */
.suggestions-panel {
  padding: 10px 0;
}

.suggestion-card {
  margin-bottom: 10px;
  border-left: 4px solid #2e7d32;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
  transform: translateY(-2px);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.suggestion-header h4 {
  margin: 0;
  color: #303133;
  font-size: 15px;
}

.suggestion-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 10px 0;
}

.suggestion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #909399;
}

.location {
  display: flex;
  align-items: center;
}

.location i {
  margin-right: 5px;
}

/* 指数调整样式 */
.adjustment-panel {
  padding: 10px 0;
}

.adjustment-card {
  height: 100%;
  border-top: 3px solid #2e7d32;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #303133;
}

.card-header i {
  margin-right: 8px;
  color: #2e7d32;
}

.adjustment-content {
  padding: 10px 0;
}

.current-value,
.target-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
}

.current-value .label,
.target-value .label {
  color: #909399;
}

.current-value .value,
.target-value .value {
  color: #303133;
  font-weight: bold;
  font-size: 16px;
}

:deep(.el-slider) {
  margin: 15px 0;
}

.adjustment-history {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.adjustment-history h4 {
  margin-bottom: 15px;
  color: #303133;
}

.adjustment-history i {
  margin-right: 8px;
  color: #2e7d32;
}

/* 数据处理样式 */
.data-processing-panel {
  padding: 10px 0;
}

.data-stats-row {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  color: white;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-card.success {
  background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
}

.stat-card.warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc069 100%);
}

.stat-card.info {
  background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
}

.stat-card.primary {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
}

.stat-icon {
  font-size: 32px;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-trend {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.data-table-container {
  background: white;
  border-radius: 4px;
}

/* 分析报告样式 */
.analysis-panel {
  padding: 10px 0;
}

.analysis-report {
  background: #f8fafc;
  padding: 20px;
  border-radius: 4px;
  border-left: 4px solid #2e7d32;
}

.ai-report-header {
  margin-bottom: 15px;
}

.ai-report-header h4 {
  margin: 0 0 5px 0;
  color: #2e7d32;
}

.ai-report-section {
  margin-bottom: 20px;
}

.ai-report-section h5 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.ai-report-section p,
.ai-report-section ul {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}

/* 详情对话框 */
.details-content {
  padding: 20px 0;
}

/* 工具类 */
.mt-4 {
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-assistant-container {
    padding: 15px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
