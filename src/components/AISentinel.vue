<template>
  <div class="ai-sentinel-page">
    <el-row :gutter="18" class="overview-row">
      <el-col v-for="(stat, index) in sentinelStats" :key="index" :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-icon" :class="stat.type">
            <i :class="stat.icon"></i>
          </div>
          <div class="overview-body">
            <div class="overview-label">{{ stat.label }}</div>
            <div class="overview-value">{{ stat.value }}</div>
            <div class="overview-trend">{{ stat.trend }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="analysis-grid">
      <el-col :xs="24">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-title">
              <span>AI 结论摘要</span>
              <el-button type="primary" link @click="fetchAIAnalysis" :loading="aiLoading">
                生成最新研判
              </el-button>
            </div>
          </template>
          <div v-if="aiAnalysisResult" class="analysis-result" v-html="aiAnalysisResult"></div>
          <div v-else class="analysis-empty">
            <i class="fas fa-robot"></i>
            <p>点击“生成最新研判”后，AI 会结合监测数据生成综合分析摘要。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="workspace-card">
      <template #header>
        <div class="panel-title">
          <span>AI 哨兵工作台</span>
          <span class="workspace-note">已整合原首页 AI 助手与数据分析能力</span>
        </div>
      </template>
      <div class="ai-assistant-container">
        <el-tabs v-model="activeTab" class="ai-tabs">
          <el-tab-pane label="智能建议" name="suggestions">
            <div class="suggestions-panel">
              <div class="panel-header">
                <h3><i class="fas fa-lightbulb"></i> AI 智能建议</h3>
                <el-button type="primary" size="small" @click="generateNewSuggestions" :loading="suggestionsLoading">
                  <i class="fas fa-sync"></i> 重新分析
                </el-button>
              </div>

              <el-timeline v-if="suggestions.length > 0">
                <el-timeline-item
                  v-for="(suggestion, index) in suggestions"
                  :key="index"
                  :timestamp="suggestion.timestamp"
                  :type="suggestion.type"
                >
                  <el-card class="suggestion-card">
                    <div class="suggestion-header">
                      <h4>{{ suggestion.title }}</h4>
                      <el-tag :type="getSuggestionTagType(suggestion.priority)">{{ suggestion.priority }}</el-tag>
                    </div>
                    <p class="suggestion-content">{{ suggestion.content }}</p>
                    <div class="suggestion-footer">
                      <span class="location"><i class="fas fa-map-marker-alt"></i> {{ suggestion.location }}</span>
                      <el-button link size="small" @click="handleSuggestionAction(suggestion)">查看详情 →</el-button>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无建议"></el-empty>
            </div>
          </el-tab-pane>

          <el-tab-pane label="指数调整" name="adjustment">
            <div class="adjustment-panel">
              <div class="panel-header">
                <h3><i class="fas fa-sliders-h"></i> 环境指数调整</h3>
                <el-button type="primary" size="small" @click="applyAllAdjustments">应用所有调整</el-button>
              </div>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-thermometer-half"></i><span>温度</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.temperature }}°C</span></div>
                      <el-slider v-model="environmentParams.temperature" :min="15" :max="35" :step="0.5" :marks="temperatureMarks" />
                      <div class="target-value"><span class="label">目标值</span><span class="value">{{ environmentParams.temperature }}°C</span></div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-droplet"></i><span>湿度</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.humidity }}%</span></div>
                      <el-slider v-model="environmentParams.humidity" :min="30" :max="80" :step="1" :marks="humidityMarks" />
                      <div class="target-value"><span class="label">目标值</span><span class="value">{{ environmentParams.humidity }}%</span></div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-fan"></i><span>通风</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.ventilation }}%</span></div>
                      <el-slider v-model="environmentParams.ventilation" :min="0" :max="100" :step="5" :marks="ventilationMarks" />
                      <div class="target-value"><span class="label">目标值</span><span class="value">{{ environmentParams.ventilation }}%</span></div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-lightbulb"></i><span>光照</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.lighting }} Lux</span></div>
                      <el-slider v-model="environmentParams.lighting" :min="0" :max="500" :step="10" :marks="lightingMarks" />
                      <div class="target-value"><span class="label">目标值</span><span class="value">{{ environmentParams.lighting }} Lux</span></div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <div class="adjustment-history mt-4">
                <h4><i class="fas fa-history"></i> 最近调整记录</h4>
                <el-table :data="adjustmentHistory" stripe>
                  <el-table-column prop="timestamp" label="调整时间" width="180" />
                  <el-table-column prop="parameter" label="参数" />
                  <el-table-column prop="oldValue" label="原值" />
                  <el-table-column prop="newValue" label="新值" />
                  <el-table-column prop="effect" label="效果" width="100" />
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="数据洞察" name="data-insights">
            <div class="data-insights-panel">
              <div class="panel-header">
                <h3><i class="fas fa-chart-bar"></i> 数据洞察与分析</h3>
                <el-button-group>
                  <el-button type="primary" size="small" @click="analyzeAllData"><i class="fas fa-chart-line"></i> 全面分析</el-button>
                  <el-button type="primary" size="small" @click="generateAnalysisReport" :loading="analysisLoading"><i class="fas fa-sync"></i> 生成报告</el-button>
                  <el-button type="primary" size="small" @click="exportData"><i class="fas fa-download"></i> 导出数据</el-button>
                </el-button-group>
              </div>

              <el-row :gutter="20" class="data-stats-row">
                <el-col :xs="24" :sm="12" :lg="6"><div class="stat-card success"><div class="stat-icon"><i class="fas fa-heart-pulse"></i></div><div class="stat-content"><div class="stat-label">平均健康率</div><div class="stat-value">{{ livestockStats.healthRate }}%</div><div class="stat-trend">↑ 2.3% 较上周</div></div></div></el-col>
                <el-col :xs="24" :sm="12" :lg="6"><div class="stat-card warning"><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-content"><div class="stat-label">异常数量</div><div class="stat-value">{{ livestockStats.abnormalCount }}</div><div class="stat-trend">↓ 5 较上周</div></div></div></el-col>
                <el-col :xs="24" :sm="12" :lg="6"><div class="stat-card info"><div class="stat-icon"><i class="fas fa-chart-bar"></i></div><div class="stat-content"><div class="stat-label">总存栏数</div><div class="stat-value">{{ livestockStats.totalCount }}</div><div class="stat-trend">→ 无变化</div></div></div></el-col>
                <el-col :xs="24" :sm="12" :lg="6"><div class="stat-card primary"><div class="stat-icon"><i class="fas fa-weight-scale"></i></div><div class="stat-content"><div class="stat-label">平均日增重</div><div class="stat-value">{{ livestockStats.dailyGain }}g</div><div class="stat-trend">↑ 1.2% 较上周</div></div></div></el-col>
              </el-row>

              <div class="data-table-container mt-4">
                <el-tabs v-model="dataTableTab">
                  <el-tab-pane label="猪只数据" name="pig">
                    <el-table :data="pigData" stripe><el-table-column prop="location" label="位置" width="120" /><el-table-column prop="count" label="数量" /><el-table-column prop="healthRate" label="健康率" /><el-table-column prop="avgWeight" label="平均体重" /><el-table-column prop="feedIntake" label="采食量" /><el-table-column prop="status" label="状态"><template #default="{ row }"><el-tag :type="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</el-tag></template></el-table-column><el-table-column label="操作" width="100"><template #default="{ row }"><el-button link size="small" @click="viewDetails(row)">详情</el-button></template></el-table-column></el-table>
                  </el-tab-pane>
                  <el-tab-pane label="鸡只数据" name="chicken">
                    <el-table :data="chickenData" stripe><el-table-column prop="location" label="位置" width="120" /><el-table-column prop="count" label="数量" /><el-table-column prop="healthRate" label="健康率" /><el-table-column prop="eggProduction" label="产蛋率" /><el-table-column prop="feedIntake" label="采食量" /><el-table-column prop="status" label="状态"><template #default="{ row }"><el-tag :type="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</el-tag></template></el-table-column><el-table-column label="操作" width="100"><template #default="{ row }"><el-button link size="small" @click="viewDetails(row)">详情</el-button></template></el-table-column></el-table>
                  </el-tab-pane>
                  <el-tab-pane label="牛只数据" name="cattle">
                    <el-table :data="cattleData" stripe><el-table-column prop="location" label="位置" width="120" /><el-table-column prop="count" label="数量" /><el-table-column prop="healthRate" label="健康率" /><el-table-column prop="milkProduction" label="产奶量" /><el-table-column prop="feedIntake" label="采食量" /><el-table-column prop="status" label="状态"><template #default="{ row }"><el-tag :type="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</el-tag></template></el-table-column><el-table-column label="操作" width="100"><template #default="{ row }"><el-button link size="small" @click="viewDetails(row)">详情</el-button></template></el-table-column></el-table>
                  </el-tab-pane>
                </el-tabs>
              </div>

              <div class="analysis-report-section mt-4">
                <div class="report-header"><h4><i class="fas fa-microchip"></i> AI 深度分析报告</h4></div>
                <div v-if="analysisReport" class="analysis-report" v-html="analysisReport"></div>
                <el-empty v-else description="点击“生成报告”按钮生成 AI 分析"></el-empty>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="预警处理" name="warning">
            <div class="warning-handling-panel">
              <div class="panel-header">
                <h3><i class="fas fa-bell"></i> 预警处理中心</h3>
                <el-button type="primary" size="small" @click="refreshWarnings"><i class="fas fa-sync"></i> 刷新</el-button>
              </div>

              <div class="warning-list">
                <el-row :gutter="16">
                  <el-col :span="24" v-for="item in warningsList" :key="item.id" class="mb-3">
                    <el-card shadow="hover" class="warning-item-card">
                      <div class="warning-item-content">
                        <div class="warning-info">
                          <div class="warning-title-row">
                            <el-tag :type="item.severity === 'high' ? 'danger' : 'warning'" effect="dark" size="small">{{ item.severity === 'high' ? '重度' : '轻度' }}</el-tag>
                            <span class="warning-title">{{ item.type }}</span>
                          </div>
                          <div class="warning-desc">{{ item.description }}</div>
                          <div class="warning-meta"><span><i class="fas fa-map-marker-alt"></i> {{ item.location }}</span><span class="ml-3"><i class="far fa-clock"></i> {{ item.timestamp }}</span></div>
                        </div>
                        <div class="warning-actions">
                          <el-button v-if="item.severity === 'low'" type="primary" size="small" @click="handleLightWarning(item)">调整参数</el-button>
                          <el-button v-else type="danger" size="small" @click="handleSevereWarning(item)">联系兽医</el-button>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                <el-empty v-if="warningsList.length === 0" description="暂无待处理预警"></el-empty>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-row :gutter="18" class="analysis-grid secondary-grid">
      <el-col :xs="24">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-title">
              <span>AI 预测清单</span>
              <el-tag type="info" effect="plain">行动优先级</el-tag>
            </div>
          </template>
          <el-table :data="predictionTable" stripe>
            <el-table-column prop="region" label="区域" width="140" />
            <el-table-column prop="focus" label="预测重点" />
            <el-table-column prop="time" label="预计时间" width="120" />
            <el-table-column label="等级" width="100">
              <template #default="{ row }">
                <el-tag :type="row.level === '高' ? 'danger' : row.level === '中' ? 'warning' : 'success'">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="analysis-grid">
      <el-col :xs="24">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-title">
              <span>健康趋势图</span>
              <el-tag type="success" effect="plain">实时分析</el-tag>
            </div>
          </template>
          <div id="diseaseChart" class="chart-block"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="lightWarningDialogVisible" title="环境参数快速调整" width="400px" append-to-body>
      <div v-if="currentWarning" class="adjustment-quick-form">
        <div class="quick-info mb-4"><el-tag size="small" type="warning">{{ currentWarning.location }}</el-tag><span class="ml-2">{{ currentWarning.type }}</span></div>
        <div class="quick-slider-item"><div class="slider-label">温度调节</div><el-slider v-model="environmentParams.temperature" :min="15" :max="35" :step="0.1" /></div>
        <div class="quick-slider-item"><div class="slider-label">湿度调节</div><el-slider v-model="environmentParams.humidity" :min="30" :max="80" /></div>
        <div class="quick-slider-item"><div class="slider-label">通风强度</div><el-slider v-model="environmentParams.ventilation" :min="0" :max="100" /></div>
      </div>
      <template #footer><el-button @click="lightWarningDialogVisible = false">取消</el-button><el-button type="primary" @click="applyQuickAdjustment">确认应用</el-button></template>
    </el-dialog>

    <el-dialog v-model="severeWarningDialogVisible" title="兽医专家服务" width="550px" append-to-body>
      <div v-if="currentWarning" class="vet-service-container">
        <el-alert title="检测到重度行为异常，建议立即咨询专业兽医" type="error" :closable="false" show-icon class="mb-4" />
        <el-tabs type="border-card">
          <el-tab-pane label="线上咨询">
            <el-form label-position="top">
              <el-form-item label="选择在线兽医">
                <el-select v-model="selectedVetId" placeholder="请选择在线兽医" style="width: 100%">
                  <el-option label="李医生 (畜牧学博士 - 在线)" value="1" />
                  <el-option label="王医生 (资深防疫专家 - 在线)" value="2" />
                  <el-option label="张医生 (行为分析专家 - 忙碌)" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="补充说明 (可选)"><el-input v-model="vetNote" type="textarea" placeholder="描述更多现场细节..." /></el-form-item>
              <el-button type="primary" class="w-full" @click="sendToOnlineVet">发送数据并开始咨询</el-button>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="线下联系">
            <div class="offline-contacts">
              <div v-for="vet in offlineVets" :key="vet.id" class="contact-card">
                <div class="contact-info">
                  <div class="contact-name">{{ vet.name }}</div>
                  <div class="contact-detail"><i class="fas fa-phone"></i> {{ vet.phone }}</div>
                  <div class="contact-detail"><i class="fas fa-map-marker-alt"></i> {{ vet.address }}</div>
                </div>
                <el-button type="primary" plain size="small" @click="copyPhone(vet.phone)">复制号码</el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <el-dialog v-model="detailsDialogVisible" title="数据详情" width="50%">
      <div v-if="selectedDetail" class="details-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="位置">{{ selectedDetail.location }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedDetail.count }}</el-descriptions-item>
          <el-descriptions-item label="健康率">{{ selectedDetail.healthRate }}</el-descriptions-item>
          <el-descriptions-item label="采食量">{{ selectedDetail.feedIntake }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag :type="selectedDetail.status === '正常' ? 'success' : 'warning'">{{ selectedDetail.status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ selectedDetail.lastUpdate }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

const dataStats = inject("dataStats");
const exportData = inject("exportData");
const aiAnalysisResult = inject("aiAnalysisResult");
const aiLoading = inject("aiLoading");
const fetchAIAnalysis = inject("fetchAIAnalysis");
const activeIndex = inject("activeIndex");
const activeAITab = inject("activeAITab");
const activeTab = computed({
  get: () => activeAITab.value,
  set: (val) => (activeAITab.value = val),
});

const diseaseChart = ref(null);
const dataTableTab = ref("pig");
const suggestionsLoading = ref(false);
const analysisLoading = ref(false);
const analysisReport = ref(null);
const detailsDialogVisible = ref(false);
const selectedDetail = ref(null);
const lightWarningDialogVisible = ref(false);
const severeWarningDialogVisible = ref(false);
const currentWarning = ref(null);
const selectedVetId = ref("");
const vetNote = ref("");

const sentinelStats = computed(() => [
  {
    label: dataStats?.value?.[0]?.label || "总监测数量",
    value: dataStats?.value?.[0]?.value || "0",
    trend: "AI 识别链路稳定运行",
    type: "success",
    icon: "fas fa-satellite-dish",
  },
  {
    label: "重点预警场景",
    value: "3 个区域",
    trend: "B 区鸡舍需优先巡检",
    type: "warning",
    icon: "fas fa-triangle-exclamation",
  },
  {
    label: dataStats?.value?.[3]?.label || "平均健康率",
    value: dataStats?.value?.[3]?.value || "0%",
    trend: "较昨日预测上升 1.4%",
    type: "primary",
    icon: "fas fa-heart-pulse",
  },
  {
    label: "AI 预测准确度",
    value: "92.6%",
    trend: "近 30 天滚动校验",
    type: "info",
    icon: "fas fa-brain",
  },
]);

const predictionTable = ref([
  { region: "A 区猪舍", focus: "呼吸道疾病风险抬升，需加强夜间保温", time: "24-48小时", level: "高" },
  { region: "B 区鸡舍", focus: "产蛋率波动与湿度异常联动", time: "48小时", level: "中" },
  { region: "C 区牛舍", focus: "采食节律降低，建议提前干预", time: "72小时", level: "中" },
  { region: "全场", focus: "未来一周预警总量保持可控", time: "7天", level: "低" },
]);

const suggestions = ref([
  {
    title: "环境优化建议",
    content: "当前 A 区猪舍湿度偏高（72%），建议开启通风系统 15 分钟，以降低氨气浓度，预防呼吸道疾病。",
    timestamp: "实时分析",
    type: "primary",
    location: "A 区猪舍 1 号",
    priority: "高",
  },
  {
    title: "防疫计划提醒",
    content: "B 区鸡舍 2 号棚即将进入下一阶段疫苗接种期（预计 2 天后），请提前准备相关防疫物资。",
    timestamp: "策略提醒",
    type: "warning",
    location: "B 区鸡舍 2 号",
    priority: "中",
  },
  {
    title: "饲喂效率分析",
    content: "通过近 7 天数据分析，C 区牛舍的进食效率提升了 5%，建议维持当前的饲料配比方案。",
    timestamp: "生产分析",
    type: "success",
    location: "C 区牛舍 1 号",
    priority: "低",
  },
]);

const temperatureMarks = { 15: "15°C", 25: "25°C", 35: "35°C" };
const humidityMarks = { 30: "30%", 55: "55%", 80: "80%" };
const ventilationMarks = { 0: "0%", 50: "50%", 100: "100%" };
const lightingMarks = { 0: "0", 250: "250", 500: "500" };

const environmentParams = ref({
  temperature: 25.6,
  humidity: 65,
  ventilation: 60,
  lighting: 250,
});

const adjustmentHistory = ref([
  { timestamp: "2025-01-11 14:30", parameter: "温度", oldValue: "24.5°C", newValue: "25.6°C", effect: "✓ 有效" },
  { timestamp: "2025-01-11 12:15", parameter: "湿度", oldValue: "72%", newValue: "65%", effect: "✓ 有效" },
  { timestamp: "2025-01-11 10:00", parameter: "通风", oldValue: "50%", newValue: "60%", effect: "✓ 有效" },
]);

const livestockStats = ref({
  healthRate: 97.8,
  abnormalCount: 12,
  totalCount: 1580,
  dailyGain: 850,
});

const pigData = ref([
  { location: "A 区 1 号棚", count: 240, healthRate: "90%", avgWeight: "120kg", feedIntake: "2.8kg/天", status: "正常", lastUpdate: "2025-01-11 15:30" },
  { location: "A 区 2 号棚", count: 180, healthRate: "100%", avgWeight: "115kg", feedIntake: "2.7kg/天", status: "正常", lastUpdate: "2025-01-11 15:30" },
]);

const chickenData = ref([
  { location: "B 区 1 号棚", count: 500, healthRate: "99%", eggProduction: "95%", feedIntake: "120g/天", status: "正常", lastUpdate: "2025-01-11 15:30" },
  { location: "B 区 2 号棚", count: 450, healthRate: "96%", eggProduction: "92%", feedIntake: "118g/天", status: "异常", lastUpdate: "2025-01-11 15:30" },
]);

const cattleData = ref([
  { location: "C 区 1 号棚", count: 80, healthRate: "85%", milkProduction: "28L/天", feedIntake: "18kg/天", status: "正常", lastUpdate: "2025-01-11 15:30" },
  { location: "C 区 2 号棚", count: 65, healthRate: "83.3%", milkProduction: "26L/天", feedIntake: "17.5kg/天", status: "异常", lastUpdate: "2025-01-11 15:30" },
]);

const warningsList = ref([
  { id: 1, location: "A 区猪舍 1 号", type: "环境异常 - 湿度", description: "当前湿度 72% 已超过设定阈值，建议开启通风系统。", severity: "low", timestamp: "10分钟前" },
  { id: 2, location: "B 区鸡舍 2 号", type: "行为异常 - 聚堆", description: "检测到异常聚堆行为，伴随采食量下降，疑似群体健康风险。", severity: "high", timestamp: "15分钟前" },
]);

const offlineVets = ref([
  { id: 1, name: "镇畜牧防疫站", phone: "0571-88889999", address: "西湖区翠苑街道 12 号" },
  { id: 2, name: "王兽医 (私人执业)", phone: "138-xxxx-xxxx", address: "上城区南星街道" },
]);

const initDiseaseChart = () => {
  const dom = document.getElementById("diseaseChart");
  if (!dom) return;

  diseaseChart.value?.dispose();
  diseaseChart.value = echarts.init(dom);
  diseaseChart.value.setOption({
    color: ["#2e7d32", "#f59e0b", "#ef4444"],
    tooltip: { trigger: "axis" },
    legend: { top: 0, data: ["健康指数", "异常事件", "AI 预警热度"] },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      axisLine: { lineStyle: { color: "#d9e2d0" } },
    },
    yAxis: [
      {
        type: "value",
        name: "指数",
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: "#edf3eb" } },
      },
      {
        type: "value",
        name: "事件数",
        min: 0,
        max: 40,
      },
    ],
    series: [
      {
        name: "健康指数",
        type: "line",
        smooth: true,
        data: [92, 93, 95, 94, 96, 97, 96],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(46,125,50,0.28)" },
            { offset: 1, color: "rgba(46,125,50,0.02)" },
          ]),
        },
      },
      {
        name: "异常事件",
        type: "bar",
        yAxisIndex: 1,
        barWidth: 18,
        data: [18, 15, 12, 16, 10, 8, 9],
      },
      {
        name: "AI 预警热度",
        type: "line",
        smooth: true,
        data: [48, 52, 57, 62, 58, 54, 50],
      },
    ],
  });
};

const initCharts = () => {
  nextTick(() => {
    initDiseaseChart();
  });
};

const resizeCharts = () => {
  diseaseChart.value?.resize();
};

const getSuggestionTagType = (priority) => {
  const map = { 高: "danger", 中: "warning", 低: "info" };
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
        priority: "高",
      },
      ...suggestions.value.slice(0, 2),
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
    effect: "✓ 有效",
  });
};

const analyzeAllData = () => {
  ElMessage.info("正在全面分析数据...");
  setTimeout(() => {
    ElMessage.success("分析完成");
  }, 1500);
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
        <div class="ai-report-section">
          <h5 style="color: #e6a23c;">核心发现</h5>
          <p>本周整体健康率达到 <strong>97.8%</strong>，较上周提升 <strong>2.3%</strong>，其中 A 区猪舍表现最佳。</p>
        </div>
        <div class="ai-report-section">
          <h5 style="color: #409eff;">关键指标分析</h5>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li><strong>日增重：</strong>平均 850g/天，同比增长 1.2%</li>
            <li><strong>采食量：</strong>整体保持稳定，无异常波动</li>
            <li><strong>环境参数：</strong>温度、湿度、通风均在最优范围内</li>
          </ul>
        </div>
        <div class="ai-report-section">
          <h5 style="color: #67c23a;">优化建议</h5>
          <p>建议继续维持当前饲养管理方案，同时重点关注 B 区与 C 区的异常趋势。</p>
        </div>
      </div>
    `;
    analysisLoading.value = false;
    ElMessage.success("报告已生成");
  }, 1500);
};

const refreshWarnings = () => {
  ElMessage.info("正在获取最新预警...");
};

const handleLightWarning = (item) => {
  currentWarning.value = item;
  lightWarningDialogVisible.value = true;
};

const handleSevereWarning = (item) => {
  currentWarning.value = item;
  severeWarningDialogVisible.value = true;
};

const applyQuickAdjustment = () => {
  ElMessage.success("环境参数已应用至现场设备");
  lightWarningDialogVisible.value = false;
};

const sendToOnlineVet = () => {
  if (!selectedVetId.value) {
    ElMessage.warning("请选择兽医");
    return;
  }
  ElMessage.success("预警数据已加密发送至云端，请保持通话通畅");
  severeWarningDialogVisible.value = false;
};

const copyPhone = async (phone) => {
  await navigator.clipboard.writeText(phone);
  ElMessage.success("号码已复制到剪贴板");
};

const viewDetails = (row) => {
  selectedDetail.value = row;
  detailsDialogVisible.value = true;
};

onMounted(() => {
  activeAITab.value = activeAITab.value || "suggestions";
  initCharts();
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  diseaseChart.value?.dispose();
});

watch(
  () => activeIndex.value,
  (value) => {
    if (value === "ai-sentinel") {
      initCharts();
    }
  },
);
</script>

<style scoped>
.ai-sentinel-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.overview-row,
.analysis-grid {
  margin-top: 0;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 82px;
  padding: 2px 4px;
  border: none;
}

.overview-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 15px;
}

.overview-icon.success { background: linear-gradient(135deg, #3fb950, #1f8f4d); }
.overview-icon.warning { background: linear-gradient(135deg, #f59e0b, #ea580c); }
.overview-icon.primary { background: linear-gradient(135deg, #2e7d32, #4caf50); }
.overview-icon.info { background: linear-gradient(135deg, #2563eb, #38bdf8); }

.overview-body {
  flex: 1;
}

.overview-label {
  color: #7b8794;
  font-size: 11px;
  margin-bottom: 4px;
}

.overview-value {
  font-size: 18px;
  font-weight: 700;
  color: #163020;
  margin-bottom: 2px;
}

.overview-trend {
  font-size: 10px;
  color: #5d6b66;
  line-height: 1.35;
}

.panel-card {
  border-radius: 20px;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
  color: #1d3b27;
}

.workspace-note {
  font-size: 12px;
  color: #7a8a80;
  font-weight: 400;
}

.chart-block {
  height: 340px;
}

.secondary-grid :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

.analysis-result {
  padding: 4px 0;
}

.analysis-empty {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #7d8a82;
  text-align: center;
}

.analysis-empty i {
  font-size: 44px;
  color: #4caf50;
  margin-bottom: 14px;
}

.workspace-card :deep(.ai-assistant-container) {
  padding: 0;
}

.ai-assistant-container {
  padding: 8px 0 0;
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

.suggestions-panel,
.adjustment-panel,
.data-insights-panel {
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

.warning-item-card {
  border-left: 5px solid transparent;
  transition: all 0.2s;
}

.warning-item-card:hover {
  transform: translateX(5px);
}

.warning-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.warning-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.warning-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.warning-meta {
  font-size: 12px;
  color: #909399;
}

.contact-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.contact-card:last-child {
  border-bottom: none;
}

.contact-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.contact-detail {
  font-size: 13px;
  color: #666;
}

.quick-slider-item {
  margin-bottom: 20px;
}

.slider-label {
  font-size: 13px;
  margin-bottom: 5px;
  color: #666;
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

.details-content {
  padding: 20px 0;
}

.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.mt-4 { margin-top: 16px; }
.w-full { width: 100%; }
.text-sm { font-size: 12px; }
.text-gray { color: #909399; }

@media (max-width: 1200px) {}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .chart-block {
    height: 260px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .warning-item-content,
  .suggestion-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
