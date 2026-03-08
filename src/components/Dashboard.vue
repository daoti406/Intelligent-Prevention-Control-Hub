<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <el-row :gutter="20" class="welcome-banner">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1>欢迎使用智栏哨兵系统</h1>
              <h2>实时监测畜禽健康，智能预警疫病风险</h2>
              <div class="stats-overview">
                <div class="stat-item">
                  <span class="stat-value">24</span>
                  <span class="stat-label">在线监测设备</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">97.8%</span>
                  <span class="stat-label">健康率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">4</span>
                  <span class="stat-label">今日预警</span>
                </div>
              </div>
            </div>
            <div class="weather-info">
              <el-card class="weather-card">
                <template #header>
                  <div class="weather-header">
                    <i class="fas fa-sun"></i>
                    <span>环境监测</span>
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

    <!-- 快速操作和通知 -->
    <el-row :gutter="20" class="quick-actions-row">
      <el-col :span="16">
        <el-card class="quick-actions-card">
          <template #header>
            <div class="actions-header">
              <i class="fas fa-cogs"></i>
              <span>快速操作</span>
            </div>
          </template>
          <div class="actions-grid">
            <el-button type="primary" class="action-btn" @click="goToMonitor">
              <i class="fas fa-video" style="font-size: 32px"></i>视频智能监控
            </el-button>
            <el-button
              type="success"
              class="action-btn"
              @click="goToEnvControl"
            >
              <i class="fas fa-thermometer-half" style="font-size: 32px"></i
              >环境监测调控
            </el-button>
            <el-button
              type="warning"
              class="action-btn"
              @click="goToHealthAnalysis"
            >
              <i class="fas fa-heartbeat" style="font-size: 32px"></i
              >健康分析引擎
            </el-button>
            <el-button type="danger" class="action-btn" @click="goToWarning">
              <i class="fas fa-bell" style="font-size: 32px"></i>预警响应中心
            </el-button>
            <el-button
              type="info"
              class="action-btn"
              @click="goToKnowledgeBase"
            >
              <i class="fas fa-book-medical" style="font-size: 32px"></i
              >防疫知识库
            </el-button>
            <el-button type="primary" class="action-btn" @click="goToReport">
              <i class="fas fa-file-alt" style="font-size: 32px"></i
              >智能报告系统
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="notifications-card">
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
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject } from "vue";

const notifications = inject("notifications");
const goToMonitor = inject("goToMonitor");
const goToEnvControl = inject("goToEnvControl");
const goToHealthAnalysis = inject("goToHealthAnalysis");
const goToWarning = inject("goToWarning");
const goToKnowledgeBase = inject("goToKnowledgeBase");
const goToReport = inject("goToReport");
</script>

<style scoped>
/* 组件特有样式 */
</style>
