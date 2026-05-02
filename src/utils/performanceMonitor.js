/**
 * 系统性能与成本效益监控模块
 * 实时统计mmcow视觉AI系统的经济效益和技术性能
 */

export class PerformanceMonitor {
  constructor() {
    // 成本统计
    this.costMetrics = {
      traditionalEquipment: 15000, // 传统传感器设备成本
      aiEquipment: 5000,           // AI设备成本
      installationTraditional: 3000, // 传统方案安装成本
      installationAI: 1000,         // AI方案安装成本
      monthlyMaintenanceTraditional: 500, // 传统维护成本
      monthlyMaintenanceAI: 150            // AI维护成本
    };

    // 性能指标
    this.performanceMetrics = {
      detectionAccuracy: 0,
      responseTimeMs: 0,
      systemUptime: 0,
      modelAccuracy: {},
      falsePositiveRate: 0,
      falseNegativeRate: 0
    };

    // 使用统计
    this.usageStats = {
      totalAnimalsMonitored: 0,
      diseasesDetected: 0,
      alertsGenerated: 0,
      energySavedKWh: 0,
      laborSavedHours: 0
    };

    // 历史数据存储
    this.history = {
      dailyStats: [],
      weeklyReports: [],
      monthlySummary: {}
    };

    this.startTime = new Date();
  }

  /**
   * 计算成本节省指标
   */
  calculateCostSavings(usageDays = 30) {
    const dailySavings = {
      equipment: (this.costMetrics.traditionalEquipment - this.costMetrics.aiEquipment) / 365,
      installation: (this.costMetrics.installationTraditional - this.costMetrics.installationAI) / 365,
      maintenance: this.costMetrics.monthlyMaintenanceTraditional - this.costMetrics.monthlyMaintenanceAI
    };

    const totalDailySavings = Object.values(dailySavings).reduce((sum, val) => sum + val, 0);
    
    return {
      dailySavings,
      monthlySavings: totalDailySavings * 30,
      yearlySavings: totalDailySavings * 365,
      roiMonths: Math.ceil((this.costMetrics.aiEquipment + this.costMetrics.installationAI) / totalDailySavings / 30),
      costReductionRate: ((this.costMetrics.traditionalEquipment + this.costMetrics.installationTraditional) - 
                         (this.costMetrics.aiEquipment + this.costMetrics.installationAI)) / 
                         (this.costMetrics.traditionalEquipment + this.costMetrics.installationTraditional)
    };
  }

  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(metrics) {
    Object.assign(this.performanceMetrics, metrics);
    
    // 计算加权准确率
    if (Object.keys(this.performanceMetrics.modelAccuracy).length > 0) {
      const accuracies = Object.values(this.performanceMetrics.modelAccuracy);
      this.performanceMetrics.detectionAccuracy = 
        accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    }

    this.recordDailyStats();
  }

  /**
   * 更新使用统计
   */
  updateUsageStats(stats) {
    Object.keys(stats).forEach(key => {
      if (this.usageStats.hasOwnProperty(key)) {
        this.usageStats[key] += stats[key];
      }
    });
  }

  /**
   * 记录每日统计数据
   */
  recordDailyStats() {
    const today = new Date().toDateString();
    
    // 检查是否已有今日记录
    const existingIndex = this.history.dailyStats.findIndex(stat => stat.date === today);
    
    const dailyStat = {
      date: today,
      performance: { ...this.performanceMetrics },
      usage: { ...this.usageStats },
      costSavings: this.calculateCostSavings(),
      uptime: this.calculateUptime()
    };

    if (existingIndex >= 0) {
      this.history.dailyStats[existingIndex] = dailyStat;
    } else {
      this.history.dailyStats.push(dailyStat);
    }

    // 限制历史记录数量（保留最近30天）
    if (this.history.dailyStats.length > 30) {
      this.history.dailyStats = this.history.dailyStats.slice(-30);
    }

    // 检查是否需要生成周报
    if (this.shouldGenerateWeeklyReport()) {
      this.generateWeeklyReport();
    }
  }

  /**
   * 计算系统运行时间
   */
  calculateUptime() {
    const now = new Date();
    const uptimeMs = now - this.startTime;
    const uptimeDays = uptimeMs / (1000 * 60 * 60 * 24);
    
    return {
      totalDays: Math.floor(uptimeDays),
      totalHours: Math.floor(uptimeMs / (1000 * 60 * 60)),
      uptimePercentage: 99.5, // 模拟稳定性指标
      lastRestart: this.startTime
    };
  }

  /**
   * 检查是否需要生成周报
   */
  shouldGenerateWeeklyReport() {
    if (this.history.dailyStats.length < 7) return false;
    
    const lastReport = this.history.weeklyReports[this.history.weeklyReports.length - 1];
    if (!lastReport) return true;
    
    const lastReportDate = new Date(lastReport.weekEnding);
    const daysSinceReport = (new Date() - lastReportDate) / (1000 * 60 * 60 * 24);
    
    return daysSinceReport >= 7;
  }

  /**
   * 生成周报
   */
  generateWeeklyReport() {
    const last7Days = this.history.dailyStats.slice(-7);
    
    if (last7Days.length < 7) return;

    const weeklyReport = {
      weekEnding: new Date().toISOString().split('T')[0],
      avgAccuracy: this.calculateWeeklyAverage(last7Days, 'performance.detectionAccuracy'),
      avgResponseTime: this.calculateWeeklyAverage(last7Days, 'performance.responseTimeMs'),
      totalAlerts: last7Days.reduce((sum, day) => sum + day.usage.alertsGenerated, 0),
      totalSavings: last7Days.reduce((sum, day) => sum + day.costSavings.dailySavings.equipment, 0),
      performanceTrend: this.calculatePerformanceTrend(last7Days),
      recommendations: this.generateRecommendations(last7Days)
    };

    this.history.weeklyReports.push(weeklyReport);
  }

  /**
   * 计算周平均指标
   */
  calculateWeeklyAverage(dailyStats, metricPath) {
    const values = dailyStats.map(day => {
      const keys = metricPath.split('.');
      let value = day;
      keys.forEach(key => value = value[key]);
      return value;
    }).filter(val => val !== undefined);
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * 计算性能趋势
   */
  calculatePerformanceTrend(dailyStats) {
    if (dailyStats.length < 2) return 'stable';
    
    const firstAccuracy = dailyStats[0].performance.detectionAccuracy;
    const lastAccuracy = dailyStats[dailyStats.length - 1].performance.detectionAccuracy;
    
    const change = lastAccuracy - firstAccuracy;
    
    if (change > 0.02) return 'improving';
    if (change < -0.02) return 'declining';
    return 'stable';
  }

  /**
   * 生成优化建议
   */
  generateRecommendations(dailyStats) {
    const recommendations = [];
    const avgAccuracy = this.calculateWeeklyAverage(dailyStats, 'performance.detectionAccuracy');
    
    if (avgAccuracy < 0.85) {
      recommendations.push({
        type: 'accuracy',
        priority: 'high',
        message: '检测准确率偏低，建议增加训练样本数量',
        action: 'upload_more_samples'
      });
    }

    const avgResponseTime = this.calculateWeeklyAverage(dailyStats, 'performance.responseTimeMs');
    if (avgResponseTime > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: '系统响应时间较长，建议优化模型配置',
        action: 'optimize_model'
      });
    }

    const totalAlerts = dailyStats.reduce((sum, day) => sum + day.usage.alertsGenerated, 0);
    if (totalAlerts === 0) {
      recommendations.push({
        type: 'usage',
        priority: 'low',
        message: '本周无预警产生，建议检查监控设备状态',
        action: 'check_equipment'
      });
    }

    return recommendations;
  }

  /**
   * 获取综合统计报告
   */
  getComprehensiveReport() {
    const costSavings = this.calculateCostSavings();
    const uptime = this.calculateUptime();
    
    return {
      summary: {
        systemUptime: uptime,
        totalCostSavings: costSavings,
        overallPerformance: this.performanceMetrics.detectionAccuracy,
        totalAnimalsMonitored: this.usageStats.totalAnimalsMonitored
      },
      detailedMetrics: {
        cost: costSavings,
        performance: this.performanceMetrics,
        usage: this.usageStats
      },
      trends: {
        performanceTrend: this.calculatePerformanceTrend(this.history.dailyStats.slice(-7)),
        weeklyComparison: this.getWeeklyComparison(),
        improvementAreas: this.generateRecommendations(this.history.dailyStats.slice(-7))
      },
      recommendations: this.generateOptimizationPlan()
    };
  }

  /**
   * 获取周对比数据
   */
  getWeeklyComparison() {
    if (this.history.dailyStats.length < 14) return null;
    
    const currentWeek = this.history.dailyStats.slice(-7);
    const previousWeek = this.history.dailyStats.slice(-14, -7);
    
    return {
      accuracyChange: this.calculateWeeklyAverage(currentWeek, 'performance.detectionAccuracy') - 
                     this.calculateWeeklyAverage(previousWeek, 'performance.detectionAccuracy'),
      alertsChange: currentWeek.reduce((sum, day) => sum + day.usage.alertsGenerated, 0) - 
                   previousWeek.reduce((sum, day) => sum + day.usage.alertsGenerated, 0),
      savingsChange: currentWeek.reduce((sum, day) => sum + day.costSavings.dailySavings.equipment, 0) - 
                    previousWeek.reduce((sum, day) => sum + day.costSavings.dailySavings.equipment, 0)
    };
  }

  /**
   * 生成优化计划
   */
  generateOptimizationPlan() {
    const plan = [
      {
        timeframe: 'immediate',
        actions: ['验证传感器校准', '检查网络连接稳定性']
      },
      {
        timeframe: 'short_term',
        actions: ['增加训练样本多样性', '优化模型参数']
      },
      {
        timeframe: 'long_term',
        actions: ['考虑硬件升级', '扩展监测范围']
      }
    ];

    // 根据实际性能调整计划
    if (this.performanceMetrics.detectionAccuracy < 0.8) {
      plan[0].actions.push('紧急增加训练数据');
    }

    return plan;
  }

  /**
   * 导出统计数据
   */
  exportData(format = 'json') {
    const data = {
      systemInfo: {
        version: '1.0.0',
        monitoringSince: this.startTime,
        lastUpdate: new Date()
      },
      metrics: this.getComprehensiveReport(),
      rawData: {
        dailyStats: this.history.dailyStats,
        weeklyReports: this.history.weeklyReports
      }
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  /**
   * 转换为CSV格式
   */
  convertToCSV(data) {
    // 简化的CSV转换实现
    let csv = 'Date,Accuracy,ResponseTime,Alerts,CostSavings\n';
    
    data.rawData.dailyStats.forEach(stat => {
      csv += `${stat.date},${stat.performance.detectionAccuracy},${stat.performance.responseTimeMs},${stat.usage.alertsGenerated},${stat.costSavings.dailySavings.equipment}\n`;
    });

    return csv;
  }

  /**
   * 重置统计（可选功能）
   */
  resetStats() {
    this.usageStats = {
      totalAnimalsMonitored: 0,
      diseasesDetected: 0,
      alertsGenerated: 0,
      energySavedKWh: 0,
      laborSavedHours: 0
    };
    
    this.history.dailyStats = [];
    this.history.weeklyReports = [];
    this.startTime = new Date();
  }
}