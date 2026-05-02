<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <el-row :gutter="20" class="welcome-banner">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1 class="welcome-title">慧牧云眸 — 基于AI的畜禽健康智能预警系统</h1>
              <p class="welcome-sub">AI大模型驱动 · mmcow多模态视觉分析 · 实时健康监测 · 智能预警预防</p>
              <div class="stats-overview">
                <div class="stat-item">
                  <span class="stat-value" style="color: #fff">{{ bannerStats.totalMonitoring }}</span>
                  <span class="stat-label">在线监测设备</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value" style="color: #a5d6a7">{{ bannerStats.healthRate }}</span>
                  <span class="stat-label">平均健康率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value" style="color: #ffcc80">{{ bannerStats.warningCount }}</span>
                  <span class="stat-label">当前预警</span>
                </div>
              </div>
            </div>
            <div class="banner-actions">
              <el-button type="success" size="large" @click="goToAISentinel">
                <i class="fas fa-robot"></i>&nbsp;慧牧AI助手对话
              </el-button>
              <el-button type="warning" size="large" @click="goToWarning">
                <i class="fas fa-bell"></i>&nbsp;查看预警中心
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 核心数据指标 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="(stat, index) in dataStats" :key="index">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-card-inner">
            <div class="stat-icon" :class="'icon-' + stat.type">
              <i :class="statIcons[index]"></i>
            </div>
            <div class="stat-info">
              <div class="stat-card-value">{{ stat.value }}</div>
              <div class="stat-card-label">{{ stat.label }}</div>
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
              <span>健康趋势（近7天）</span>
            </div>
          </template>
          <div class="chart-container" id="healthChart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-exclamation-triangle"></i>
              <span>预警类型分布</span>
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
              <span>各区存栏数量</span>
            </div>
          </template>
          <div class="chart-container" id="scaleChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI功能入口 + 最新通知 -->
    <el-row :gutter="20" class="bottom-row">
      <!-- AI功能快捷入口 -->
      <el-col :xs="24" :md="12">
        <el-card class="ai-entry-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-brain" style="color: #2e7d32"></i>
              <span>AI 核心功能</span>
            </div>
          </template>
          <div class="ai-entry-grid">
            <div class="ai-entry-item" @click="goToAISentinel">
              <div class="entry-icon" style="background: linear-gradient(135deg, #43a047, #66bb6a)">
                <i class="fas fa-comments"></i>
              </div>
              <div class="entry-label">慧牧AI助手</div>
              <div class="entry-desc">AI实时问答 · 健康预警建议</div>
            </div>
            <div class="ai-entry-item" @click="goToMonitor">
              <div class="entry-icon" style="background: linear-gradient(135deg, #1976d2, #42a5f5)">
                <i class="fas fa-video"></i>
              </div>
              <div class="entry-label">实时监控</div>
              <div class="entry-desc">AI视觉分析 · 行为识别</div>
            </div>
            <div class="ai-entry-item" @click="goToWarning">
              <div class="entry-icon" style="background: linear-gradient(135deg, #e65100, #ff8a65)">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="entry-label">智能预警</div>
              <div class="entry-desc">疫病预测 · 风险评估</div>
            </div>
            <div class="ai-entry-item" @click="goToKnowledge">
              <div class="entry-icon" style="background: linear-gradient(135deg, #6a1b9a, #ab47bc)">
                <i class="fas fa-book-open"></i>
              </div>
              <div class="entry-label">防疫知识库</div>
              <div class="entry-desc">疾病防控 · 养殖技术</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最新通知 -->
      <el-col :xs="24" :md="12">
        <el-card id="notifications-section" class="notifications-card">
          <template #header>
            <div class="chart-header">
              <i class="fas fa-bell"></i>
              <span>最新通知</span>
              <el-badge :value="unreadCount" :max="9" class="ml-auto" v-if="unreadCount > 0" />
            </div>
          </template>
          <div class="notifications-list">
            <div
              v-for="(item, index) in notifications"
              :key="index"
              class="notification-item"
              :class="{ unread: !item.read }"
            >
              <div class="notification-dot" :class="item.type"></div>
              <div class="notification-content">
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-time">{{ item.time }}</div>
              </div>
              <div class="notification-actions">
                <el-tag :type="item.type" size="small">{{ item.status }}</el-tag>
                <el-button
                  v-if="!item.read"
                  link
                  type="primary"
                  size="small"
                  @click="markNotificationAsRead(item)"
                >已读</el-button>
              </div>
            </div>
          </div>
          <div class="text-center mt-3">
            <el-button type="primary" link @click="goToWarning">查看全部预警 →</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const notifications = inject("notifications");
const markNotificationAsRead = inject("markNotificationAsRead");
const dataStats = inject("dataStats");
const goToWarning = inject("goToWarning");

const bannerStats = computed(() => ({
  totalMonitoring: dataStats?.value?.[0]?.value || "24",
  healthRate: dataStats?.value?.[3]?.value || "97.8%",
  warningCount: dataStats?.value?.[2]?.value || "4",
}));

const unreadCount = computed(() =>
  notifications?.value?.filter(n => !n.read).length || 0
);

const statIcons = [
  "fas fa-satellite-dish",
  "fas fa-exclamation-circle",
  "fas fa-bell",
  "fas fa-heartbeat",
];

const goToAISentinel = () => router.push("/ai-sentinel");
const goToMonitor = () => router.push("/monitor");
const goToKnowledge = () => router.push("/knowledge");
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

/* 欢迎横幅 */
.welcome-card {
  background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%);
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.welcome-card :deep(.el-card__body) {
  padding: 32px 40px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.welcome-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 24px 0;
  letter-spacing: 2px;
}

.stats-overview {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.banner-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 统计卡片 */
.stats-row {
  margin-top: 20px;
}

.stat-card {
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-icon.icon-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.stat-icon.icon-warning {
  background: #fff8e1;
  color: #f57c00;
}

.stat-icon.icon-error {
  background: #ffebee;
  color: #c62828;
}

.stat-card-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-card-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* 图表 */
.charts-row {
  margin-top: 20px;
}

.chart-card {
  border-radius: 10px;
  height: 100%;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 220px;
}

/* 底部区域 */
.bottom-row {
  margin-top: 20px;
}

/* AI功能入口 */
.ai-entry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ai-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.ai-entry-item:hover {
  border-color: #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.15);
  transform: translateY(-2px);
}

.entry-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  margin-bottom: 10px;
}

.entry-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.entry-desc {
  font-size: 12px;
  color: #909399;
}

/* 通知 */
.notifications-card {
  border-radius: 10px;
  height: 100%;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.notification-item.unread {
  background: #f0f7ff;
  border-color: #d0e8ff;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-dot.warning { background: #faad14; }
.notification-dot.success { background: #52c41a; }
.notification-dot.info { background: #1890ff; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ml-auto {
  margin-left: auto;
}

.mt-3 {
  margin-top: 12px;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .welcome-card :deep(.el-card__body) {
    padding: 20px;
  }
  .welcome-title {
    font-size: 20px;
  }
  .welcome-content {
    flex-direction: column;
  }
  .banner-actions {
    width: 100%;
  }
  .ai-entry-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
