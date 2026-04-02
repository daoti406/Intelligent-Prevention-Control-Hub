<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="welcome-banner">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1 style="font-size: 32px; margin: 0 0 10px 0; background: linear-gradient(135deg, #2e7d32 0%, #52c41a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">欢迎使用智栏哨兵系统</h1>
              <h2 style="font-size: 18px; color: #606266; margin: 0 0 20px 0; font-weight: 400;">实时监测畜禽健康，智能预警疫病风险</h2>
              <div class="stats-overview">
                <div class="stat-item">
                  <span class="stat-value jumping-data" style="color: #fff;">{{ bannerStats.totalMonitoring }}</span>
                  <span class="stat-label">在线监测设备</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value jumping-data" style="color: #67c23a;">{{ bannerStats.healthRate }}</span>
                  <span class="stat-label">平均健康率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value jumping-data" style="color: #f56c6c;">{{ bannerStats.warningCount }}</span>
                  <span class="stat-label">当前预警</span>
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
                  环境自动监控到健康智能分析，再到疫病提前预警与科学决策支持，
                  帮助养殖户降本增效，保障畜禽健康。
                </p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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

    <!-- 普惠AI创新功能展示区 -->
    <el-row :gutter="20" class="ai-features-row">
      <el-col :span="24">
        <el-card class="ai-features-card">
          <template #header>
            <div class="ai-features-header">
              <i class="el-icon-star" style="color: #2e7d32;"></i>
              <span style="color: #2e7d32; font-weight: bold;">普惠AI创新功能</span>
              <span style="font-size: 14px; color: #666; margin-left: 10px;">· 专为中小养殖场设计的智能技术革命</span>
            </div>
          </template>
          <div class="ai-features-content">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="8" :lg="6">
                <div class="ai-feature-item">
                  <div class="feature-icon cost-saving">
                    <i class="el-icon-money"></i>
                  </div>
                  <div class="feature-content">
                    <h4>成本降低70%</h4>
                    <p>AI视觉替代传统传感器，硬件投资从¥15,000降至¥5,000</p>
                    <div class="feature-stats">
                      <span class="stat-value">¥10,000+</span>
                      <span class="stat-label">年节省</span>
                    </div>
                  </div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="8" :lg="6">
                <div class="ai-feature-item">
                  <div class="feature-icon intelligence">
                    <i class="el-icon-cpu"></i>
                  </div>
                  <div class="feature-content">
                    <h4>小样本学习</h4>
                    <p>每疾病类别仅需3-5个样本，训练个性化识别模型</p>
                    <div class="feature-stats">
                      <span class="stat-value">85%+</span>
                      <span class="stat-label">准确率</span>
                    </div>
                  </div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="8" :lg="6">
                <div class="ai-feature-item">
                  <div class="feature-icon easy-use">
                    <i class="el-icon-user"></i>
                  </div>
                  <div class="feature-content">
                    <h4>零技术门槛</h4>
                    <p>三步向导快速部署，农民亦可轻松使用AI技术</p>
                    <div class="feature-stats">
                      <span class="stat-value">3步</span>
                      <span class="stat-label">快速开始</span>
                    </div>
                  </div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="8" :lg="6">
                <div class="ai-feature-item">
                  <div class="feature-icon performance">
                    <i class="el-icon-trophy"></i>
                  </div>
                  <div class="feature-content">
                    <h4>实时监控</h4>
                    <p>视觉分析速度&lt;1秒，确保及时预警疫病风险</p>
                    <div class="feature-stats">
                      <span class="stat-value">&lt;1秒</span>
                      <span class="stat-label">响应时间</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <div class="ai-actions">
              <el-button type="primary" @click="goToAIFeatures" size="large">
                <i class="el-icon-magic-stick"></i>
                体验普惠AI功能
              </el-button>
              <el-button type="success" @click="viewCostBenefits" size="large">
                <i class="el-icon-pie-chart"></i>
                查看成本效益分析
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能监控仪表板 -->
    <el-row :gutter="20" class="performance-row">
      <el-col :span="24">
        <PerformanceDashboard ref="performanceDashboard" />
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
import { computed, inject } from "vue";
import { useRouter } from 'vue-router';
import PerformanceDashboard from './PerformanceDashboard.vue';

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

const goToAIFeatures = () => {
  router.push('/ai-panel');
};

const viewCostBenefits = () => {
  router.push('/performance');
};
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

@media (max-width: 768px) {
}

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

/* 普惠AI功能样式 */
.ai-features-card {
  border: 1px solid #66bb6a;
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
}

.ai-features-header {
  display: flex;
  align-items: center;
}

.ai-features-content {
  padding: 20px 0;
}

.ai-feature-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  height: 100%;
}

.ai-feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.feature-icon.cost-saving { color: #f56c6c; }
.feature-icon.intelligence { color: #67c23a; }
.feature-icon.easy-use { color: #409eff; }
.feature-icon.performance { color: #e6a23c; }

.feature-content h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.feature-content p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.feature-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-stats .stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
}

.feature-stats .stat-label {
  font-size: 12px;
  color: #999;
}

.ai-actions {
  margin-top: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.performance-row {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .ai-feature-item {
    margin-bottom: 15px;
  }
  
  .ai-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .ai-actions .el-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
