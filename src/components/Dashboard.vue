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

    <el-row id="notifications-section" :gutter="20" class="quick-actions-row">
      <el-col :span="24">
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
              <div class="notification-actions">
                <el-tag :type="item.type" size="small">{{ item.status }}</el-tag>
                <el-button
                  v-if="!item.read"
                  link
                  type="primary"
                  size="small"
                  @click="markNotificationAsRead(item)"
                >
                  标记已读
                </el-button>
                <span v-else class="notification-read-state">已读</span>
              </div>
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
import { inject } from "vue";

const notifications = inject("notifications");
const markNotificationAsRead = inject("markNotificationAsRead");
const goToMonitor = inject("goToMonitor");
const goToEnvControl = inject("goToEnvControl");
const goToHealthAnalysis = inject("goToHealthAnalysis");
const goToWarning = inject("goToWarning");
const goToKnowledgeBase = inject("goToKnowledgeBase");
const goToReport = inject("goToReport");
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
}

/* 组件特有样式 */
.notification-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.notification-read-state {
  font-size: 12px;
  color: #909399;
}
</style>
