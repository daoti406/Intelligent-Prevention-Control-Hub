<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <el-row :gutter="20" class="welcome-banner">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1 style="font-size: 32px; margin: 0 0 10px 0; background: linear-gradient(135deg, #2e7d32 0%, #52c41a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">欢迎使用智栏哨兵系统</h1>
              <h2 style="font-size: 18px; color: #606266; margin: 0 0 20px 0; font-weight: 400;">实时监测畜禽健康，智能预警疫病风险</h2>
              <div class="stats-overview">
                <div class="stat-item">
                  <span class="stat-value jumping-data" style="color: #fff;">24</span>
                  <span class="stat-label">在线监测设备</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value jumping-data" style="color: #67c23a;">97.8%</span>
                  <span class="stat-label">健康率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value jumping-data" style="color: #f56c6c;">4</span>
                  <span class="stat-label">今日预警</span>
                </div>
              </div>
            </div>
            <div class="weather-info">
              <el-card class="weather-card">
                <template #header>
                  <div class="weather-header">
                    <i class="fas fa-sun"></i>
                    <span style="color: #2fcf6d; font-weight: bold;">环境监测</span>
                    <br />
                  </div>
                </template>
                <div class="weather-content">
                  <div class="weather-item">
                    <span class="weather-label">温度</span>
                    <span class="weather-value">25.6°C</span>
                  </div>
                  <div class="weather-item">
                    <span class="weather-label">湿度</span>
                    <span class="weather-value">65%</span>
                  </div>
                  <div class="weather-item">
                    <span class="weather-label">空气质量</span>
                    <span class="weather-value">良好</span>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div class="system-intro">
            <div class="intro-content">
              <div class="intro-icon"></div>
              <div class="intro-text">
                <p>
                  采用AI+物联网技术，大数据科学分析，让养殖管理更智能，
                  环境自动监控→健康智能分析→疫病提前预警→科学决策支持，
                  帮助养殖户降本增效，保障畜禽健康，为畜牧增添一份安心。
                </p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i>
              <span>健康趋势</span>
            </div>
          </template>
          <div class="chart-container" id="healthChart"></div>
        </el-card>
      </el-col>
      <!--预警分布-->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-exclamation-triangle"></i>
              <span>预警分布</span>
            </div>
          </template>
          <div class="chart-container" id="warningChart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-bar"></i>
              <span>养殖规模</span>
            </div>
          </template>
          <div class="chart-container" id="scaleChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 小助手入口 -->
    <el-row :gutter="20" class="quick-actions-row">
      <el-col :span="16">
        <el-card class="ai-suggestions-card">
          <template #header>
            <div class="actions-header">
              <i class="fas fa-robot"></i>
              <span>AI 小助手</span>
            </div>
          </template>
          <div class="ai-content">
            <!-- 功能选项区域 -->
            <div class="ai-options-grid">
              <div class="ai-option-item" @click="openAIModule('suggestions')">
                <div class="option-icon"><i class="fas fa-lightbulb"></i></div>
                <div class="option-title">智能建议</div>
                <div class="option-desc">获取实时的环保、防疫、饲喂建议</div>
              </div>
              <div class="ai-option-item" @click="openAIModule('adjustment')">
                <div class="option-icon"><i class="fas fa-sliders-h"></i></div>
                <div class="option-title">指数调整</div>
                <div class="option-desc">快速调整温度、湿度等环境参数</div>
              </div>
              <div class="ai-option-item" @click="openAIModule('data-insights')">
                <div class="option-icon"><i class="fas fa-chart-bar"></i></div>
                <div class="option-title">数据洞察</div>
                <div class="option-desc">查看数据统计和 AI 分析报告</div>
              </div>
              <div class="ai-option-item" @click="openAIModule('warning')">
                <div class="option-icon"><i class="fas fa-bell"></i></div>
                <div class="option-title">预警处理</div>
                <div class="option-desc">处理环境和行为异常预警</div>
              </div>
            </div>

            <!-- 人机交互区域 -->
            <div class="ai-interaction-area">
              <div class="interaction-header">与 AI 小助手交互</div>
              <div class="input-container">
                <el-input
                  v-model="userInput"
                  placeholder="输入您的问题或需求..."
                  class="user-input"
                  @keyup.enter="sendMessage"
                ></el-input>
                <el-button-group class="input-actions">
                  <el-button type="primary" @click="sendMessage">
                    <i class="fas fa-paper-plane"></i> 发送
                  </el-button>
                  <el-button type="info" @click="startVoiceInput" :loading="voiceLoading">
                    <i class="fas fa-microphone"></i> {{ voiceLoading ? '录音中...' : '语音' }}
                  </el-button>
                </el-button-group>
              </div>
              <div class="interaction-hint">💡 提示：您可以直接输入需求，AI 小助手会自动识别并跳转到相应功能</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="notifications-card" style="height: 100%;">
          <template #header>
            <div class="notifications-header">
              <i class="fas fa-bell"></i>
              <span>最新通知</span>
            </div>
          </template>
          <div class="notifications-list">
            <div
              v-for="(item, index) in notifications"
              :key="index"
              class="notification-item"
              :class="{ unread: !item.read }"
            >
              <div class="notification-content">
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-time">{{ item.time }}</div>
              </div>
              <el-tag :type="item.type" size="small">{{ item.status }}</el-tag>
            </div>
          </div>
          <div class="mt-4 text-center">
            <el-button type="text" @click="goToWarning">查看全部预警 <i class="el-icon-arrow-right"></i></el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject, ref } from "vue";
import { ElMessage } from "element-plus";

const notifications = inject("notifications");
const goToMonitor = inject("goToMonitor");
const goToEnvControl = inject("goToEnvControl");
const goToHealthAnalysis = inject("goToHealthAnalysis");
const goToWarning = inject("goToWarning");
const goToKnowledgeBase = inject("goToKnowledgeBase");
const goToReport = inject("goToReport");
const openAIAssistant = inject("openAIAssistant");
const setActiveAITab = inject("setActiveAITab");

const userInput = ref("");
const voiceLoading = ref(false);

const openAIModule = (moduleName) => {
  // 设置 AI 小助手的活跃标签
  if (setActiveAITab) {
    setActiveAITab(moduleName);
  }
  // 打开 AI 小助手弹窗
  openAIAssistant();
};

const sendMessage = () => {
  if (!userInput.value.trim()) {
    ElMessage.warning("请输入您的问题");
    return;
  }
  
  // 根据用户输入智能判断要跳转的模块
  const input = userInput.value.toLowerCase();
  let targetModule = "suggestions";
  
  if (input.includes("调整") || input.includes("温度") || input.includes("湿度") || input.includes("通风")) {
    targetModule = "adjustment";
  } else if (input.includes("数据") || input.includes("统计") || input.includes("分析") || input.includes("报告")) {
    targetModule = "data-insights";
  } else if (input.includes("预警") || input.includes("异常") || input.includes("兽医")) {
    targetModule = "warning";
  }
  
  // 打开对应模块
  openAIModule(targetModule);
  userInput.value = "";
};

const startVoiceInput = () => {
  voiceLoading.value = true;
  ElMessage.info("语音输入功能开发中...");
  setTimeout(() => {
    voiceLoading.value = false;
  }, 2000);
};
</script>

<style scoped>
.ai-suggestions-card {
  height: 100%;
}
.suggestion-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
}
.suggestion-item p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}
.intro-text p {
  color: #fff;
  opacity: 0.9;
}
.weather-item {
  color: #fff;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}
.weather-label {
  color: rgba(255, 255, 255, 0.8);
}
.weather-value {
  color: #fff;
}

.jumping-data {
  display: inline-block;
  animation: jump 2s ease-in-out infinite;
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.stat-item:nth-child(2) .jumping-data {
  animation-delay: 0.3s;
}

.stat-item:nth-child(3) .jumping-data {
  animation-delay: 0.6s;
}

/* AI 选项网格 */
.ai-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 25px;
}

.ai-option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.ai-option-item:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #52c41a 100%);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);
  border-color: #2e7d32;
}

.option-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #2e7d32;
}

.ai-option-item:hover .option-icon {
  color: white;
  transform: scale(1.1);
}

.option-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #303133;
}

.ai-option-item:hover .option-title {
  color: white;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.ai-option-item:hover .option-desc {
  color: rgba(255, 255, 255, 0.9);
}

/* 人机交互区域 */
.ai-interaction-area {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #2e7d32;
}

.interaction-header {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.user-input {
  flex: 1;
}

.input-actions {
  display: flex;
  gap: 0;
}

.input-actions .el-button {
  min-width: 80px;
}

.interaction-hint {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  padding: 8px 0;
  border-top: 1px solid #e4e7eb;
  margin-top: 8px;
  padding-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-options-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .ai-option-item {
    padding: 12px 8px;
  }
  
  .option-icon {
    font-size: 24px;
  }
  
  .input-container {
    flex-direction: column;
  }
  
  .input-actions {
    flex-direction: row;
  }
}

/* 组件特有样式 */
</style>
