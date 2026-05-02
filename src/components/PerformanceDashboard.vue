<template>
  <div class="performance-dashboard">
    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card accuracy">
            <div class="stat-icon">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatPercent(performanceData.detectionAccuracy) }}</div>
              <div class="stat-label">检测准确率</div>
              <div class="stat-trend" :class="getTrendClass(performanceTrends.accuracyChange)">
                {{ formatTrend(performanceTrends.accuracyChange) }}
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card cost">
            <div class="stat-icon">
              <i class="el-icon-money"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatNumber(costSavings.monthlySavings) }}</div>
              <div class="stat-label">月节省成本</div>
              <div class="stat-trend" :class="getTrendClass(performanceTrends.savingsChange)">
                {{ formatTrend(performanceTrends.savingsChange, true) }}
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card animals">
            <div class="stat-icon">
              <i class="el-icon-c-scale-to-original"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(usageStats.totalAnimalsMonitored) }}</div>
              <div class="stat-label">监控动物总数</div>
              <div class="stat-trend positive">
                <i class="el-icon-top"></i> 持续增长
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card uptime">
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatPercent(systemUptime.uptimePercentage / 100) }}</div>
              <div class="stat-label">系统稳定性</div>
              <div class="stat-subtitle">{{ systemUptime.totalDays }}天运行</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 成本效益分析图表 -->
    <div class="chart-section">
      <h3>成本效益分析</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <div ref="costComparisonChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <div ref="roiChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 性能趋势图表 -->
    <div class="chart-section">
      <h3>性能趋势分析</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <div ref="accuracyTrendChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <div ref="responseTimeChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细统计表格 -->
    <div class="detailed-stats">
      <h3>详细统计信息</h3>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120"></el-table-column>
        <el-table-column prop="accuracy" label="准确率" width="100">
          <template #default="{ row }">
            {{ formatPercent(row.accuracy) }}
          </template>
        </el-table-column>
        <el-table-column prop="responseTime" label="响应时间(ms)" width="120"></el-table-column>
        <el-table-column prop="alerts" label="预警数量" width="100"></el-table-column>
        <el-table-column prop="costSavings" label="日节省成本">
          <template #default="{ row }">
            ¥{{ formatNumber(row.costSavings) }}
          </template>
        </el-table-column>
        <el-table-column prop="animalsMonitored" label="监控动物数" width="120"></el-table-column>
      </el-table>
    </div>

    <!-- 优化建议 -->
    <div class="recommendations">
      <h3>优化建议</h3>
      <el-alert
        v-for="rec in recommendations"
        :key="rec.action"
        :title="rec.message"
        :type="rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'"
        :closable="false"
        style="margin-bottom: 10px"
      >
        <template #default>
          <div class="recommendation-action">
            <el-button 
              v-if="rec.action === 'upload_more_samples'" 
              type="primary" 
              size="small"
              @click="$emit('upload-samples')"
            >
              上传样本
            </el-button>
            <el-button 
              v-else-if="rec.action === 'optimize_model'" 
              type="warning" 
              size="small"
              @click="$emit('optimize-model')"
            >
              优化模型
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 导出功能 -->
    <div class="export-section">
      <el-button-group>
        <el-button @click="exportData('json')" type="primary">
          <i class="el-icon-download"></i> 导出JSON
        </el-button>
        <el-button @click="exportData('csv')" type="success">
          <i class="el-icon-document"></i> 导出CSV
        </el-button>
        <el-button @click="resetStats" type="warning" v-if="showReset">
          <i class="el-icon-refresh"></i> 重置统计
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { PerformanceMonitor } from '@/utils/performanceMonitor.js'

export default {
  name: 'PerformanceDashboard',
  props: {
    showReset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      performanceMonitor: new PerformanceMonitor(),
      performanceData: {},
      usageStats: {},
      costSavings: {},
      systemUptime: {},
      performanceTrends: {},
      recommendations: [],
      tableData: []
    }
  },
  mounted() {
    this.loadPerformanceData()
    this.setupCharts()
    
    // 模拟数据更新
    setInterval(() => {
      this.updateMockData()
    }, 5000)
  },
  methods: {
    loadPerformanceData() {
      const report = this.performanceMonitor.getComprehensiveReport()
      
      this.performanceData = report.detailedMetrics.performance
      this.usageStats = report.detailedMetrics.usage
      this.costSavings = report.detailedMetrics.cost
      this.systemUptime = report.summary.systemUptime
      this.performanceTrends = report.trends.weeklyComparison || {}
      this.recommendations = report.trends.improvementAreas
      
      // 准备表格数据
      this.tableData = this.performanceMonitor.history.dailyStats.map(stat => ({
        date: stat.date,
        accuracy: stat.performance.detectionAccuracy,
        responseTime: stat.performance.responseTimeMs,
        alerts: stat.usage.alertsGenerated,
        costSavings: stat.costSavings.dailySavings.equipment,
        animalsMonitored: stat.usage.totalAnimalsMonitored
      })).slice(-10) // 显示最近10天数据
    },

    setupCharts() {
      // 初始化图表（简化版，实际项目中使用ECharts或Chart.js）
      this.renderCostComparisonChart()
      this.renderROIChart()
      this.renderAccuracyTrendChart()
      this.renderResponseTimeChart()
    },

    renderCostComparisonChart() {
      // 简化的图表渲染逻辑
      const chartElement = this.$refs.costComparisonChart
      if (chartElement) {
        chartElement.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h4>成本对比分析</h4>
            <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
              <div>
                <div style="background: #ff6b6b; color: white; padding: 10px; border-radius: 5px;">
                  <div>传统方案</div>
                  <div>¥15,000</div>
                </div>
              </div>
              <div>
                <div style="background: #4ecdc4; color: white; padding: 10px; border-radius: 5px;">
                  <div>AI方案</div>
                  <div>¥5,000</div>
                </div>
              </div>
            </div>
            <div style="color: #4caf50; font-weight: bold;">
              节省率: ${(this.costSavings.costReductionRate * 100).toFixed(1)}%
            </div>
          </div>
        `
      }
    },

    renderROIChart() {
      const chartElement = this.$refs.roiChart
      if (chartElement) {
        chartElement.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h4>投资回报分析</h4>
            <div style="margin: 20px 0;">
              <div style="font-size: 24px; color: #2196f3; font-weight: bold;">
                ${this.costSavings.roiMonths}个月
              </div>
              <div>投资回收周期</div>
            </div>
            <div style="color: #666;">
              预计年回报: ¥${this.formatNumber(this.costSavings.yearlySavings)}
            </div>
          </div>
        `
      }
    },

    renderAccuracyTrendChart() {
      const chartElement = this.$refs.accuracyTrendChart
      if (chartElement) {
        const data = this.performanceMonitor.history.dailyStats.slice(-7)
        const labels = data.map(stat => stat.date.split('-').slice(1).join('/'))
        const values = data.map(stat => (stat.performance.detectionAccuracy * 100).toFixed(1))
        
        chartElement.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h4>准确率趋势</h4>
            <div style="height: 200px; display: flex; align-items: end; justify-content: center; gap: 10px; margin: 20px 0;">
              ${values.map((value, index) => `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="background: #667eea; width: 30px; height: ${value}px;"></div>
                  <div style="font-size: 12px; margin-top: 5px;">${labels[index]}</div>
                </div>
              `).join('')}
            </div>
            <div style="color: #666;">7天准确率变化趋势</div>
          </div>
        `
      }
    },

    renderResponseTimeChart() {
      const chartElement = this.$refs.responseTimeChart
      if (chartElement) {
        const data = this.performanceMonitor.history.dailyStats.slice(-7)
        const labels = data.map(stat => stat.date.split('-').slice(1).join('/'))
        const values = data.map(stat => stat.performance.responseTimeMs)
        
        chartElement.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h4>响应时间趋势</h4>
            <div style="height: 200px; display: flex; align-items: end; justify-content: center; gap: 10px; margin: 20px 0;">
              ${values.map((value, index) => `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="background: #ffa726; width: 30px; height: ${Math.min(value / 10, 200)}px;"></div>
                  <div style="font-size: 12px; margin-top: 5px;">${labels[index]}</div>
                </div>
              `).join('')}
            </div>
            <div style="color: #666;">响应时间(ms) - 目标: < 1000ms</div>
          </div>
        `
      }
    },

    updateMockData() {
      // 模拟实时数据更新
      const mockMetrics = {
        detectionAccuracy: Math.max(0.8, Math.min(0.95, this.performanceData.detectionAccuracy + (Math.random() - 0.5) * 0.02)),
        responseTimeMs: Math.max(100, Math.min(500, this.performanceData.responseTimeMs + (Math.random() - 0.5) * 20))
      }
      
      this.performanceMonitor.updatePerformanceMetrics(mockMetrics)
      this.performanceMonitor.updateUsageStats({
        totalAnimalsMonitored: this.usageStats.totalAnimalsMonitored + Math.floor(Math.random() * 3),
        alertsGenerated: this.usageStats.alertsGenerated + Math.floor(Math.random() * 2)
      })
      
      this.loadPerformanceData()
      this.setupCharts()
    },

    formatPercent(value) {
      return `${(value * 100).toFixed(1)}%`
    },

    formatNumber(value) {
      return Math.round(value).toLocaleString()
    },

    formatTrend(value, isCurrency = false) {
      if (value === 0 || value === undefined) return '持平'
      const prefix = value > 0 ? '+' : ''
      const formattedValue = isCurrency ? `¥${Math.abs(value).toFixed(0)}` : `${Math.abs(value * 100).toFixed(1)}%`
      return `${prefix}${formattedValue}`
    },

    getTrendClass(value) {
      if (value === 0 || value === undefined) return 'neutral'
      return value > 0 ? 'positive' : 'negative'
    },

    exportData(format) {
      const data = this.performanceMonitor.exportData(format)
      
      if (format === 'csv') {
        this.downloadCSV(data, 'performance_stats.csv')
      } else {
        this.downloadJSON(data, 'performance_stats.json')
      }
      
      this.$message.success(`数据已导出为${format.toUpperCase()}格式`)
    },

    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv' })
      this.downloadFile(blob, filename)
    },

    downloadJSON(content, filename) {
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
      this.downloadFile(blob, filename)
    },

    downloadFile(blob, filename) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    },

    resetStats() {
      this.$confirm('确定要重置所有统计数据吗？此操作不可撤销。', '重置确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.performanceMonitor.resetStats()
        this.loadPerformanceData()
        this.$message.success('统计数据已重置')
      })
    }
  }
}
</script>

<style scoped>
.performance-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.overview-cards {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.stat-icon {
  font-size: 40px;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-card.accuracy .stat-icon { color: #4caf50; }
.stat-card.cost .stat-icon { color: #ff9800; }
.stat-card.animals .stat-icon { color: #2196f3; }
.stat-card.uptime .stat-icon { color: #9c27b0; }

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-subtitle {
  font-size: 12px;
  color: #999;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.positive { color: #4caf50; }
.stat-trend.negative { color: #f44336; }
.stat-trend.neutral { color: #999; }

.chart-section {
  margin-bottom: 40px;
}

.chart-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-left: 4px solid #2196f3;
  padding-left: 10px;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 300px;
}

.chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detailed-stats {
  margin-bottom: 40px;
}

.detailed-stats h3 {
  margin-bottom: 20px;
  color: #333;
}

.recommendations h3 {
  margin-bottom: 20px;
  color: #333;
}

.recommendation-action {
  margin-top: 10px;
}

.export-section {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .performance-dashboard {
    padding: 10px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>