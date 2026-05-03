export class PerformanceMonitor {
  constructor() {
    this.costMetrics = {
      traditionalEquipment: 15000,
      aiEquipment: 5000,
      installationTraditional: 3000,
      installationAI: 1000,
      monthlyMaintenanceTraditional: 500,
      monthlyMaintenanceAI: 150,
    };

    this.performanceMetrics = {
      detectionAccuracy: 0.88,
      responseTimeMs: 260,
      systemUptime: 0,
      modelAccuracy: {},
      falsePositiveRate: 0,
      falseNegativeRate: 0,
    };

    this.usageStats = {
      totalAnimalsMonitored: 1200,
      diseasesDetected: 0,
      alertsGenerated: 18,
      energySavedKWh: 0,
      laborSavedHours: 0,
    };

    this.history = {
      dailyStats: [],
      weeklyReports: [],
      monthlySummary: {},
    };

    this.startTime = new Date();
    this.seedHistory(14);
    this.recordDailyStats();
  }

  calculateCostSavings() {
    const dailySavings = {
      equipment:
        (this.costMetrics.traditionalEquipment - this.costMetrics.aiEquipment) / 365,
      installation:
        (this.costMetrics.installationTraditional - this.costMetrics.installationAI) / 365,
      maintenance:
        this.costMetrics.monthlyMaintenanceTraditional -
        this.costMetrics.monthlyMaintenanceAI,
    };

    const totalDailySavings = Object.values(dailySavings).reduce(
      (sum, val) => sum + val,
      0,
    );

    return {
      dailySavings,
      monthlySavings: totalDailySavings * 30,
      yearlySavings: totalDailySavings * 365,
      roiMonths: Math.ceil(
        (this.costMetrics.aiEquipment + this.costMetrics.installationAI) /
          totalDailySavings /
          30,
      ),
      costReductionRate:
        ((this.costMetrics.traditionalEquipment +
          this.costMetrics.installationTraditional -
          this.costMetrics.aiEquipment -
          this.costMetrics.installationAI) /
          (this.costMetrics.traditionalEquipment +
            this.costMetrics.installationTraditional)),
    };
  }

  updatePerformanceMetrics(metrics) {
    Object.assign(this.performanceMetrics, metrics);

    if (Object.keys(this.performanceMetrics.modelAccuracy).length > 0) {
      const accuracies = Object.values(this.performanceMetrics.modelAccuracy);
      this.performanceMetrics.detectionAccuracy =
        accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    }

    this.recordDailyStats();
  }

  updateUsageStats(stats) {
    Object.keys(stats).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(this.usageStats, key)) {
        this.usageStats[key] += stats[key];
      }
    });

    this.recordDailyStats();
  }

  recordDailyStats(dateOverride) {
    const statDate = dateOverride || this.formatDate(new Date());

    const existingIndex = this.history.dailyStats.findIndex(
      (stat) => stat.date === statDate,
    );

    const dailyStat = {
      date: statDate,
      performance: { ...this.performanceMetrics },
      usage: { ...this.usageStats },
      costSavings: this.calculateCostSavings(),
      uptime: this.calculateUptime(),
    };

    if (existingIndex >= 0) {
      this.history.dailyStats[existingIndex] = dailyStat;
    } else {
      this.history.dailyStats.push(dailyStat);
    }

    if (this.history.dailyStats.length > 30) {
      this.history.dailyStats = this.history.dailyStats.slice(-30);
    }

    if (this.shouldGenerateWeeklyReport()) {
      this.generateWeeklyReport();
    }
  }

  calculateUptime() {
    const now = new Date();
    const uptimeMs = now - this.startTime;
    const uptimeDays = uptimeMs / (1000 * 60 * 60 * 24);

    return {
      totalDays: Math.max(1, Math.floor(uptimeDays)),
      totalHours: Math.floor(uptimeMs / (1000 * 60 * 60)),
      uptimePercentage: 99.5,
      lastRestart: this.startTime,
    };
  }

  shouldGenerateWeeklyReport() {
    if (this.history.dailyStats.length < 7) return false;

    const lastReport =
      this.history.weeklyReports[this.history.weeklyReports.length - 1];
    if (!lastReport) return true;

    const lastReportDate = new Date(lastReport.weekEnding);
    const daysSinceReport = (new Date() - lastReportDate) / (1000 * 60 * 60 * 24);

    return daysSinceReport >= 7;
  }

  generateWeeklyReport() {
    const last7Days = this.history.dailyStats.slice(-7);
    if (last7Days.length < 7) return;

    const weeklyReport = {
      weekEnding: this.formatDate(new Date()),
      avgAccuracy: this.calculateWeeklyAverage(
        last7Days,
        "performance.detectionAccuracy",
      ),
      avgResponseTime: this.calculateWeeklyAverage(
        last7Days,
        "performance.responseTimeMs",
      ),
      totalAlerts: last7Days.reduce((sum, day) => sum + day.usage.alertsGenerated, 0),
      totalSavings: last7Days.reduce(
        (sum, day) => sum + day.costSavings.dailySavings.equipment,
        0,
      ),
      performanceTrend: this.calculatePerformanceTrend(last7Days),
      recommendations: this.generateRecommendations(last7Days),
    };

    this.history.weeklyReports.push(weeklyReport);
  }

  calculateWeeklyAverage(dailyStats, metricPath) {
    const values = dailyStats
      .map((day) => {
        const keys = metricPath.split(".");
        let value = day;
        keys.forEach((key) => {
          value = value?.[key];
        });
        return value;
      })
      .filter((val) => typeof val === "number" && !Number.isNaN(val));

    if (!values.length) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculatePerformanceTrend(dailyStats) {
    if (dailyStats.length < 2) return "stable";

    const firstAccuracy = dailyStats[0].performance.detectionAccuracy;
    const lastAccuracy = dailyStats[dailyStats.length - 1].performance.detectionAccuracy;
    const change = lastAccuracy - firstAccuracy;

    if (change > 0.02) return "improving";
    if (change < -0.02) return "declining";
    return "stable";
  }

  generateRecommendations(dailyStats) {
    if (!dailyStats.length) {
      return [
        {
          type: "usage",
          priority: "low",
          message: "暂无足够数据，建议继续采集监测信息",
          action: "collect_more_data",
        },
      ];
    }

    const recommendations = [];
    const avgAccuracy = this.calculateWeeklyAverage(
      dailyStats,
      "performance.detectionAccuracy",
    );

    if (avgAccuracy < 0.85) {
      recommendations.push({
        type: "accuracy",
        priority: "high",
        message: "检测准确率偏低，建议增加训练样本数量",
        action: "upload_more_samples",
      });
    }

    const avgResponseTime = this.calculateWeeklyAverage(
      dailyStats,
      "performance.responseTimeMs",
    );
    if (avgResponseTime > 2000) {
      recommendations.push({
        type: "performance",
        priority: "medium",
        message: "系统响应时间较长，建议优化模型配置",
        action: "optimize_model",
      });
    }

    const totalAlerts = dailyStats.reduce(
      (sum, day) => sum + day.usage.alertsGenerated,
      0,
    );
    if (totalAlerts === 0) {
      recommendations.push({
        type: "usage",
        priority: "low",
        message: "本周无预警产生，建议检查监控设备状态",
        action: "check_equipment",
      });
    }

    if (!recommendations.length) {
      recommendations.push({
        type: "health",
        priority: "low",
        message: "系统整体运行稳定，建议保持当前策略",
        action: "keep_current_strategy",
      });
    }

    return recommendations;
  }

  getComprehensiveReport() {
    const costSavings = this.calculateCostSavings();
    const uptime = this.calculateUptime();
    const trendWindow = this.history.dailyStats.slice(-7);

    return {
      summary: {
        systemUptime: uptime,
        totalCostSavings: costSavings,
        overallPerformance: this.performanceMetrics.detectionAccuracy,
        totalAnimalsMonitored: this.usageStats.totalAnimalsMonitored,
      },
      detailedMetrics: {
        cost: costSavings,
        performance: this.performanceMetrics,
        usage: this.usageStats,
      },
      trends: {
        performanceTrend: this.calculatePerformanceTrend(trendWindow),
        weeklyComparison: this.getWeeklyComparison(),
        improvementAreas: this.generateRecommendations(trendWindow),
      },
      recommendations: this.generateOptimizationPlan(),
    };
  }

  getWeeklyComparison() {
    if (this.history.dailyStats.length < 14) {
      return {
        accuracyChange: 0,
        alertsChange: 0,
        savingsChange: 0,
      };
    }

    const currentWeek = this.history.dailyStats.slice(-7);
    const previousWeek = this.history.dailyStats.slice(-14, -7);

    return {
      accuracyChange:
        this.calculateWeeklyAverage(currentWeek, "performance.detectionAccuracy") -
        this.calculateWeeklyAverage(previousWeek, "performance.detectionAccuracy"),
      alertsChange:
        currentWeek.reduce((sum, day) => sum + day.usage.alertsGenerated, 0) -
        previousWeek.reduce((sum, day) => sum + day.usage.alertsGenerated, 0),
      savingsChange:
        currentWeek.reduce((sum, day) => sum + day.costSavings.dailySavings.equipment, 0) -
        previousWeek.reduce((sum, day) => sum + day.costSavings.dailySavings.equipment, 0),
    };
  }

  generateOptimizationPlan() {
    const plan = [
      {
        timeframe: "immediate",
        actions: ["验证传感器校准", "检查网络连接稳定性"],
      },
      {
        timeframe: "short_term",
        actions: ["增加训练样本多样性", "优化模型参数"],
      },
      {
        timeframe: "long_term",
        actions: ["考虑硬件升级", "扩展监测范围"],
      },
    ];

    if (this.performanceMetrics.detectionAccuracy < 0.8) {
      plan[0].actions.push("紧急增加训练数据");
    }

    return plan;
  }

  exportData(format = "json") {
    const data = {
      systemInfo: {
        version: "1.0.0",
        monitoringSince: this.startTime,
        lastUpdate: new Date(),
      },
      metrics: this.getComprehensiveReport(),
      rawData: {
        dailyStats: this.history.dailyStats,
        weeklyReports: this.history.weeklyReports,
      },
    };

    if (format === "csv") {
      return this.convertToCSV(data);
    }

    return data;
  }

  convertToCSV(data) {
    let csv = "Date,Accuracy,ResponseTime,Alerts,CostSavings\n";

    data.rawData.dailyStats.forEach((stat) => {
      csv += `${stat.date},${stat.performance.detectionAccuracy},${stat.performance.responseTimeMs},${stat.usage.alertsGenerated},${stat.costSavings.dailySavings.equipment}\n`;
    });

    return csv;
  }

  resetStats() {
    this.performanceMetrics = {
      detectionAccuracy: 0.88,
      responseTimeMs: 260,
      systemUptime: 0,
      modelAccuracy: {},
      falsePositiveRate: 0,
      falseNegativeRate: 0,
    };

    this.usageStats = {
      totalAnimalsMonitored: 1200,
      diseasesDetected: 0,
      alertsGenerated: 18,
      energySavedKWh: 0,
      laborSavedHours: 0,
    };

    this.history.dailyStats = [];
    this.history.weeklyReports = [];
    this.startTime = new Date();
    this.seedHistory(14);
    this.recordDailyStats();
  }

  getMetrics() {
    return {
      performance: this.performanceMetrics,
      usage: this.usageStats,
      cost: this.calculateCostSavings(),
    };
  }

  seedHistory(days) {
    const today = new Date();
    for (let i = days; i > 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const baseAccuracy = 0.86 + Math.random() * 0.08;
      const baseResponse = 220 + Math.random() * 80;
      const baseAlerts = 1 + Math.floor(Math.random() * 4);

      this.performanceMetrics.detectionAccuracy = Number(baseAccuracy.toFixed(4));
      this.performanceMetrics.responseTimeMs = Math.round(baseResponse);
      this.usageStats.alertsGenerated += baseAlerts;
      this.usageStats.totalAnimalsMonitored += Math.floor(Math.random() * 8);

      this.recordDailyStats(this.formatDate(date));
    }
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }
}

export default PerformanceMonitor;
