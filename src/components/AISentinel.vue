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
              <div class="analysis-actions">
                <el-button
                  type="success"
                  link
                  :disabled="!analysisSpeechText"
                  @click="toggleAnalysisSpeech"
                >
                  {{ isSpeaking ? "停止播放" : "语音播放" }}
                </el-button>
                <el-button type="primary" link @click="fetchAIAnalysis" :loading="aiLoading">
                  生成最新研判
                </el-button>
              </div>
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
          <span>智栏卫士工作台</span>
        </div>
      </template>
      <div class="ai-assistant-container">
        <el-tabs v-model="activeTab" class="ai-tabs">
          <el-tab-pane label="AI对话" name="suggestions">
            <div class="chat-panel">
              <div class="panel-header">
                <h3><i class="fas fa-comments"></i> 智栏卫士 AI 对话</h3>
                <div class="chat-header-actions">
                  <el-switch
                    v-model="voiceReplyEnabled"
                    inline-prompt
                    active-text="语音回复"
                    inactive-text="静音"
                  />
                  <el-button size="small" @click="resetChatMessages">清空对话</el-button>
                </div>
              </div>

              <div class="chat-quick-prompts">
                <el-button
                  v-for="prompt in quickPrompts"
                  :key="prompt"
                  size="small"
                  plain
                  @click="sendChatMessage(prompt)"
                >
                  {{ prompt }}
                </el-button>
              </div>

              <div ref="chatScrollRef" class="chat-messages">
                <div
                  v-for="message in chatMessages"
                  :key="message.id"
                  class="chat-message"
                  :class="message.role"
                >
                  <div class="chat-avatar">
                    <i :class="message.role === 'assistant' ? 'fas fa-shield-halved' : 'fas fa-user'"></i>
                  </div>
                  <div class="chat-bubble">
                    <div class="chat-meta">
                      <span>{{ message.role === "assistant" ? "智栏卫士" : "你" }}</span>
                      <span>{{ message.time }}</span>
                    </div>
                    <div class="chat-text">{{ message.content }}</div>
                  </div>
                </div>

                <div v-if="chatLoading" class="chat-message assistant">
                  <div class="chat-avatar">
                    <i class="fas fa-shield-halved"></i>
                  </div>
                  <div class="chat-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>

              <div class="chat-toolbar">
                <el-input
                  v-model="chatInput"
                  type="textarea"
                  :rows="3"
                  resize="none"
                  placeholder="可以直接询问：哪里风险最高、某个区域为什么异常、该如何处理等"
                  @keydown.enter.exact.prevent="submitChatInput"
                />
                <div class="chat-actions">
                  <div class="chat-hint">
                    <span v-if="isListening" class="listening-indicator">正在语音识别...</span>
                    <span v-else-if="!speechRecognitionSupported" class="chat-muted">当前浏览器不支持语音输入</span>
                    <span v-else class="chat-muted">支持文字对话、普通话和方言语音输入</span>
                  </div>
                  <div class="chat-action-buttons">
                    <el-select
                      v-model="voiceInputMode"
                      size="small"
                      class="voice-mode-select"
                      :disabled="isListening || !speechRecognitionSupported"
                    >
                      <el-option
                        v-for="option in voiceInputModes"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                    <el-button
                      :type="isListening ? 'danger' : 'success'"
                      plain
                      class="voice-input-button"
                      @click="toggleVoiceInput"
                      :disabled="!speechRecognitionSupported"
                    >
                      {{ isListening ? "停止收音" : "语音输入" }}
                    </el-button>
                    <el-button class="voice-input-button" :loading="chatLoading" @click="submitChatInput">
                      发送给 AI
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="指数调整" name="adjustment">
            <div class="adjustment-panel">
              <div class="panel-header">
                <h3><i class="fas fa-sliders-h"></i> 分区域环境指数调整</h3>
                <el-button type="primary" size="small" @click="applyAllAdjustments">应用所有调整</el-button>
              </div>

              <div class="zone-toolbar">
                <div class="zone-toolbar-copy">
                  <div class="zone-toolbar-title">选择调整区域</div>
                  <div class="zone-toolbar-desc">可分别调节各棚舍的温度、湿度、通风和光照指数。</div>
                </div>
                <el-radio-group v-model="selectedAdjustmentZone" size="small" class="zone-switcher">
                  <el-radio-button
                    v-for="zone in adjustmentZones"
                    :key="zone.key"
                    :label="zone.key"
                  >
                    {{ zone.label }}
                  </el-radio-button>
                </el-radio-group>
              </div>

              <div class="zone-overview">
                <div class="zone-badge">{{ selectedAdjustmentZone }}</div>
                <div class="zone-meta">{{ currentZoneMeta }}</div>
              </div>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-thermometer-half"></i><span>温度</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.temperature }}°C</span></div>
                      <el-slider v-model="environmentParams.temperature" :min="15" :max="35" :step="0.5" :marks="temperatureMarks" />
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-droplet"></i><span>湿度</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.humidity }}%</span></div>
                      <el-slider v-model="environmentParams.humidity" :min="30" :max="80" :step="1" :marks="humidityMarks" />
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-fan"></i><span>通风</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.ventilation }}%</span></div>
                      <el-slider v-model="environmentParams.ventilation" :min="0" :max="100" :step="5" :marks="ventilationMarks" />
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-card class="adjustment-card">
                    <template #header><div class="card-header"><i class="fas fa-lightbulb"></i><span>光照</span></div></template>
                    <div class="adjustment-content">
                      <div class="current-value"><span class="label">当前值</span><span class="value">{{ environmentParams.lighting }} Lux</span></div>
                      <el-slider v-model="environmentParams.lighting" :min="0" :max="500" :step="10" :marks="lightingMarks" />
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <div class="adjustment-history mt-4">
                <h4><i class="fas fa-history"></i> 最近调整记录</h4>
                <el-table :data="adjustmentHistory" stripe>
                  <el-table-column prop="timestamp" label="调整时间" width="180" />
                  <el-table-column prop="zone" label="调整区域" width="140" />
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

const dataTableTab = ref("pig");
const chatScrollRef = ref(null);
const chatInput = ref("");
const chatLoading = ref(false);
const voiceReplyEnabled = ref(true);
const isListening = ref(false);
const speechRecognitionSupported = ref(false);
const voiceInputMode = ref("mandarin");
const detailsDialogVisible = ref(false);
const selectedDetail = ref(null);
const lightWarningDialogVisible = ref(false);
const severeWarningDialogVisible = ref(false);
const currentWarning = ref(null);
const selectedVetId = ref("");
const vetNote = ref("");
const isSpeaking = ref(false);
let analysisUtterance = null;
let chatRecognition = null;
let messageId = 3;

const voiceInputModes = [
  { value: "mandarin", label: "普通话" },
  { value: "dialect", label: "方言模式" },
];

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

const quickPrompts = [
  "今天哪个区域风险最高？",
  "A区猪舍为什么会报警？",
  "给我一份当前巡检建议",
  "如果湿度过高应该怎么处理？",
];

const chatMessages = ref([
  {
    id: 1,
    role: "assistant",
    content:
      "你好，我是智栏卫士。你可以直接问我养殖风险、环境调节、预警原因、巡检建议，后续也可以接入外部大模型 API。",
    time: "刚刚",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "当前我已经接入了页面里的监测统计、预警记录和分区指数数据，可以先基于这些内容给你即时建议。",
    time: "刚刚",
  },
]);

const temperatureMarks = { 15: "15°C", 25: "25°C", 35: "35°C" };
const humidityMarks = { 30: "30%", 55: "55%", 80: "80%" };
const ventilationMarks = { 0: "0%", 50: "50%", 100: "100%" };
const lightingMarks = { 0: "0", 250: "250", 500: "500" };

const adjustmentZones = [
  { key: "A区猪舍", label: "A区猪舍", meta: "保育猪重点区，夜间保温优先" },
  { key: "B区鸡舍", label: "B区鸡舍", meta: "产蛋鸡舍，湿度与光照联动" },
  { key: "C区牛舍", label: "C区牛舍", meta: "泌乳牛舍，通风与采食节律优先" },
];

const selectedAdjustmentZone = ref("A区猪舍");

const environmentZones = ref({
  A区猪舍: { temperature: 25.6, humidity: 65, ventilation: 60, lighting: 250 },
  B区鸡舍: { temperature: 24.2, humidity: 58, ventilation: 50, lighting: 320 },
  C区牛舍: { temperature: 22.8, humidity: 54, ventilation: 68, lighting: 220 },
});

const environmentParams = computed(
  () => environmentZones.value[selectedAdjustmentZone.value],
);

const currentZoneMeta = computed(
  () =>
    adjustmentZones.find((zone) => zone.key === selectedAdjustmentZone.value)?.meta ||
    "当前区域指数可单独微调",
);

const analysisSpeechText = computed(() => {
  if (!aiAnalysisResult?.value) return "";
  const temp = document.createElement("div");
  temp.innerHTML = aiAnalysisResult.value;
  return (temp.textContent || temp.innerText || "").replace(/\s+/g, " ").trim();
});

const adjustmentHistory = ref([
  { timestamp: "2025-01-11 14:30", zone: "A区猪舍", parameter: "温度", oldValue: "24.5°C", newValue: "25.6°C", effect: "✓ 有效" },
  { timestamp: "2025-01-11 12:15", zone: "B区鸡舍", parameter: "湿度", oldValue: "62%", newValue: "58%", effect: "✓ 有效" },
  { timestamp: "2025-01-11 10:00", zone: "C区牛舍", parameter: "通风", oldValue: "55%", newValue: "68%", effect: "✓ 有效" },
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

const appendChatMessage = (role, content) => {
  chatMessages.value.push({
    id: messageId++,
    role,
    content,
    time: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
};

const scrollChatToBottom = () => {
  nextTick(() => {
    const el = chatScrollRef.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });
};

const buildMockAIReply = (question) => {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("风险") || lowerQuestion.includes("报警")) {
    return "当前风险最高的是 B区鸡舍，主要因为行为异常与采食下降同时出现。建议优先复核摄像监测、检查通风与密度，并安排现场巡检。";
  }

  if (lowerQuestion.includes("湿度")) {
    return "如果湿度过高，建议先提高对应区域通风强度，再检查饮水线和地面潮湿源。A区猪舍当前湿度偏高，优先建议短时增强通风并复测氨气浓度。";
  }

  if (lowerQuestion.includes("巡检")) {
    return "当前建议巡检顺序为：B区鸡舍、A区猪舍、C区牛舍。重点关注鸡舍聚堆行为、猪舍湿度和牛舍采食节律。";
  }

  if (lowerQuestion.includes("A区")) {
    return "A区猪舍当前主要问题是湿度与温度波动叠加，建议保持温度稳定在 25 至 26 度，并将通风逐步提升到 60% 左右观察 15 分钟。";
  }

  return "我已经收到你的问题。当前前端版本会先基于页面已有监测数据给出即时回答，后续接入大模型 API 后，这里可以直接替换成真实的智能问答结果。";
};

const speakReply = (text) => {
  if (!voiceReplyEnabled.value || !("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

const sendChatMessage = async (presetMessage) => {
  const content = (presetMessage ?? chatInput.value).trim();
  if (!content || chatLoading.value) return;

  appendChatMessage("user", content);
  chatInput.value = "";
  chatLoading.value = true;
  scrollChatToBottom();

  try {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const reply = buildMockAIReply(content);
    appendChatMessage("assistant", reply);
    scrollChatToBottom();
    speakReply(reply);
  } finally {
    chatLoading.value = false;
  }
};

const submitChatInput = () => {
  sendChatMessage();
};

const resetChatMessages = () => {
  chatMessages.value = [
    {
      id: 1,
      role: "assistant",
      content:
        "你好，我是智栏卫士。你可以直接问我养殖风险、环境调节、预警原因、巡检建议，后续也可以接入外部大模型 API。",
      time: "刚刚",
    },
  ];
  chatInput.value = "";
};

const toggleVoiceInput = () => {
  if (!speechRecognitionSupported.value || !chatRecognition) {
    ElMessage.warning("当前浏览器不支持语音输入");
    return;
  }

  if (isListening.value) {
    chatRecognition.stop();
    return;
  }

  chatRecognition.lang =
    voiceInputMode.value === "dialect" ? "zh-HK" : "zh-CN";
  chatRecognition.start();
};

const stopAnalysisSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking.value = false;
  analysisUtterance = null;
};

const toggleAnalysisSpeech = () => {
  if (!analysisSpeechText.value) {
    ElMessage.warning("当前没有可播报的 AI 结论摘要");
    return;
  }

  if (!("speechSynthesis" in window)) {
    ElMessage.warning("当前浏览器不支持语音播放");
    return;
  }

  if (isSpeaking.value) {
    stopAnalysisSpeech();
    return;
  }

  stopAnalysisSpeech();
  analysisUtterance = new SpeechSynthesisUtterance(analysisSpeechText.value);
  analysisUtterance.lang = "zh-CN";
  analysisUtterance.rate = 1;
  analysisUtterance.pitch = 1;
  analysisUtterance.onend = () => {
    isSpeaking.value = false;
    analysisUtterance = null;
  };
  analysisUtterance.onerror = () => {
    isSpeaking.value = false;
    analysisUtterance = null;
    ElMessage.warning("语音播放失败，请重试");
  };

  isSpeaking.value = true;
  window.speechSynthesis.speak(analysisUtterance);
};

const resolveZoneByLocation = (location = "") => {
  if (location.includes("A区")) return "A区猪舍";
  if (location.includes("B区")) return "B区鸡舍";
  if (location.includes("C区")) return "C区牛舍";
  return selectedAdjustmentZone.value;
};

const applyAllAdjustments = () => {
  ElMessage.success(`${selectedAdjustmentZone.value} 的环境指数已应用`);
  adjustmentHistory.value.unshift({
    timestamp: new Date().toLocaleString(),
    zone: selectedAdjustmentZone.value,
    parameter: "批量调整",
    oldValue: "多项",
    newValue: "区域目标已更新",
    effect: "✓ 有效",
  });
};

const analyzeAllData = () => {
  ElMessage.info("正在全面分析数据...");
  setTimeout(() => {
    ElMessage.success("分析完成");
  }, 1500);
};

const refreshWarnings = () => {
  ElMessage.info("正在获取最新预警...");
};

const handleLightWarning = (item) => {
  currentWarning.value = item;
  selectedAdjustmentZone.value = resolveZoneByLocation(item.location);
  lightWarningDialogVisible.value = true;
};

const handleSevereWarning = (item) => {
  currentWarning.value = item;
  selectedAdjustmentZone.value = resolveZoneByLocation(item.location);
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
  scrollChatToBottom();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechRecognitionSupported.value = true;
    chatRecognition = new SpeechRecognition();
    chatRecognition.lang = "zh-CN";
    chatRecognition.interimResults = false;
    chatRecognition.continuous = false;
    chatRecognition.onstart = () => {
      isListening.value = true;
    };
    chatRecognition.onend = () => {
      isListening.value = false;
    };
    chatRecognition.onerror = () => {
      isListening.value = false;
      ElMessage.warning("语音识别失败，请重试");
    };
    chatRecognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!text) return;
      chatInput.value = text;
      sendChatMessage(text);
    };
  }
});

onBeforeUnmount(() => {
  stopAnalysisSpeech();
  if (chatRecognition) {
    chatRecognition.stop();
    chatRecognition = null;
  }
});

watch(
  () => activeIndex.value,
  (value) => {
    if (value === "ai-sentinel") return;
    stopAnalysisSpeech();
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

.analysis-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
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

.chat-panel,
.adjustment-panel,
.data-insights-panel {
  padding: 10px 0;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-quick-prompts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.chat-messages {
  height: 420px;
  overflow-y: auto;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f7fbf7 0%, #eef6ef 100%);
  border: 1px solid #d8e6d9;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.chat-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dfeee0;
  color: #2e7d32;
  flex-shrink: 0;
}

.chat-message.user .chat-avatar {
  background: #2e7d32;
  color: #fff;
}

.chat-bubble {
  max-width: min(78%, 760px);
  padding: 14px 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(31, 61, 40, 0.06);
}

.chat-message.user .chat-bubble {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  color: #fff;
}

.chat-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #7b8d7e;
}

.chat-message.user .chat-meta {
  color: rgba(255, 255, 255, 0.82);
}

.chat-text {
  line-height: 1.75;
  font-size: 14px;
  white-space: pre-wrap;
}

.chat-bubble.typing {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 52px;
}

.chat-bubble.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8fb892;
  animation: typing-bounce 1.2s infinite ease-in-out;
}

.chat-bubble.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.chat-bubble.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

.chat-toolbar {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fbf8;
  border: 1px solid #e0ebe1;
}

.chat-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.chat-action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.voice-mode-select {
  width: 110px;
}

.voice-mode-select :deep(.el-input__wrapper) {
  background: #f4fbf5;
  box-shadow: 0 0 0 1px #7ecf93 inset !important;
}

.voice-mode-select :deep(.el-input__inner) {
  color: #2e7d32;
  font-weight: 600;
}

.voice-input-button {
  color: #2e7d32 !important;
  border-color: #7ecf93 !important;
  background: #f4fbf5 !important;
}

.voice-input-button:hover,
.voice-input-button:focus {
  color: #1f6a2a !important;
  border-color: #52c41a !important;
  background: #eaf7ec !important;
}

.chat-hint {
  font-size: 12px;
}

.chat-muted {
  color: #7f8d83;
}

.listening-indicator {
  color: #d93025;
  font-weight: 600;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.adjustment-card {
  height: 100%;
  border-top: 3px solid #2e7d32;
  overflow: hidden;
}

.adjustment-card :deep(.el-card__body) {
  overflow: hidden;
}

.zone-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 16px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(233, 246, 234, 0.92), rgba(244, 250, 245, 0.98));
  border: 1px solid #d7e7d9;
}

.zone-toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d3b27;
  margin-bottom: 4px;
}

.zone-toolbar-desc {
  font-size: 12px;
  color: #6d7d73;
}

.zone-switcher {
  flex-wrap: wrap;
}

.zone-overview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.zone-badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: #2e7d32;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.zone-meta {
  font-size: 13px;
  color: #5f6f65;
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
  padding: 10px 0 4px;
}

.current-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.current-value {
  margin-bottom: 18px;
}

.current-value .label {
  color: #909399;
  flex-shrink: 0;
}

.current-value .value {
  color: #303133;
  font-weight: bold;
  font-size: 16px;
  text-align: right;
  white-space: nowrap;
}

.adjustment-content :deep(.el-slider) {
  margin: 24px 4px 0;
}

.adjustment-content :deep(.el-slider__marks-text) {
  margin-top: 10px;
  font-size: 11px;
  white-space: nowrap;
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
