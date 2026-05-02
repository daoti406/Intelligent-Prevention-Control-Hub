/**
 * 边缘智能预测性健康预警系统
 * 实现分布式边缘计算+云端智能分析的混合架构
 * 在本地实现实时健康监测，云端进行中长期趋势预测
 */

class PredictiveHealthAlert {
  constructor() {
    // 边缘端配置
    this.edgeConfig = {
      predictionHorizon: 3, // 预测时间范围(小时)
      anomalyThreshold: 0.85, // 异常阈值
      minDataPoints: 10, // 最小数据点要求
      localStorageKey: 'edge-health-cache'
    };
    
    // 云端配置
    this.cloudConfig = {
      predictionRangeDays: 7, // 云端预测天数
      modelUpdateInterval: 3600000, // 模型更新间隔(1小时)
      maxRetries: 3
    };
    
    // 状态管理
    this.status = {
      edgeReady: false,
      cloudReady: false,
      lastSync: null,
      predictions: {},
      localCache: new Map()
    };
    
    // 预警历史
    this.alertHistory = [];
    
    this.initializeSystem();
  }

  /**
   * 初始化边缘智能系统
   */
  async initializeSystem() {
    try {
      // 加载边缘模型
      await this.loadEdgeModels();
      
      // 初始化本地缓存
      this.loadLocalCache();
      
      // 尝试连接云端
      await this.connectToCloud();
      
      // 启动定时任务
      this.scheduleTasks();
      
      this.status.edgeReady = true;
      console.log('边缘智能预警系统初始化完成');
      
    } catch (error) {
      console.error('系统初始化失败:', error);
      // 降级到纯边缘模式
      this.fallbackToEdgeOnly();
    }
  }

  /**
   * 边缘端：实时异常检测
   */
  async edgeRealTimeCheck(animalData) {
    if (!this.status.edgeReady) {
      throw new Error('边缘系统未就绪');
    }

    const alerts = [];
    
    // 体温异常检测
    if (animalData.temperature) {
      const tempAlert = this.checkTemperature(animalData.temperature);
      if (tempAlert) alerts.push(tempAlert);
    }
    
    // 行为异常检测
    if (animalData.behavior) {
      const behaviorAlert = this.checkBehavior(animalData.behavior);
      if (behaviorAlert) alerts.push(behaviorAlert);
    }
    
    // 健康状态评估
    const healthAlert = this.assessHealthStatus(animalData);
    if (healthAlert) alerts.push(healthAlert);
    
    // 数据缓存
    this.cacheDataPoint(animalData);
    
    return alerts;
  }

  /**
   * 体温异常检测算法
   */
  checkTemperature(temperatureData) {
    const { value, timestamp } = temperatureData;
    
    // 正常体温范围：38.5-40.0°C
    const normalRange = { min: 38.5, max: 40.0 };
    
    if (value < normalRange.min) {
      return {
        type: 'temperature_low',
        severity: value < 37.5 ? 'high' : 'medium',
        message: `体温过低: ${value}°C (正常范围: ${normalRange.min}-${normalRange.max}°C)`,
        timestamp,
        value
      }; 
    }
    
    if (value > normalRange.max) {
      return {
        type: 'temperature_high', 
        severity: value > 41.0 ? 'high' : 'medium',
        message: `体温过高: ${value}°C (正常范围: ${normalRange.min}-${normalRange.max}°C)`,
        timestamp,
        value
      };
    }
    
    return null;
  }

  /**
   * 行为异常检测算法
   */
  checkBehavior(behaviorData) {
    const { activityLevel, stressLevel, feedingHabits } = behaviorData;
    
    const alerts = [];
    
    // 活动量异常检测
    if (activityLevel < 30) {
      alerts.push({
        type: 'activity_low',
        severity: 'medium',
        message: '活动量显著偏低，建议检查环境舒适度',
        value: activityLevel
      });
    }
    
    // 压力水平检测
    if (stressLevel > 7) {
      alerts.push({
        type: 'stress_high',
        severity: 'high',
        message: '压力水平过高，可能存在环境应激因素',
        value: stressLevel
      });
    }
    
    // 采食异常检测  
    if (feedingHabits?.abnormal) {
      alerts.push({
        type: 'feeding_abnormal',
        severity: feedingHabits.severity,
        message: '采食行为异常，建议检查饲料质量或健康状况',
        details: feedingHabits
      });
    }
    
    return alerts.length > 0 ? alerts : null;
  }

  /**
   * 健康状态综合评估
   */
  assessHealthStatus(data) {
    const healthScore = this.calculateHealthScore(data);
    
    if (healthScore < 70) {
      return {
        type: 'health_poor',
        severity: healthScore < 50 ? 'critical' : 'high',
        message: `健康状态不佳，评分: ${healthScore}`,
        score: healthScore,
        recommendations: this.generateHealthRecommendations(data)
      };
    }
    
    return null;
  }

  /**
   * 云端：预测性分析
   */
  async cloudPredictiveAnalysis(historicalData) {
    if (!this.status.cloudReady) {
      // 降级到本地预测
      return this.localPredictiveAnalysis(historicalData);
    }

    try {
      const predictions = {
        // 疾病传播预测
        diseaseSpread: await this.predictDiseaseSpread(historicalData),
        
        // 生长趋势分析
        growthTrend: await this.predictGrowthTrend(historicalData),
        
        // 环境适应性预测
        environmentAdaptation: await this.predictEnvironmentAdaptation(historicalData),
        
        // 饲料需求预测
        feedRequirement: await this.predictFeedRequirement(historicalData)
      };
      
      // 缓存预测结果
      this.cachePredictions(predictions);
      
      return predictions;
      
    } catch (error) {
      console.error('云端预测失败，使用本地预测:', error);
      return this.localPredictiveAnalysis(historicalData);
    }
  }

  /**
   * 本地预测分析（降级方案）
   */
  async localPredictiveAnalysis(historicalData) {
    const trends = this.analyzeHistoricalTrends(historicalData);
    
    return {
      diseaseSpread: {
        risk: this.calculateDiseaseRisk(trends),
        hotspots: this.identifyRiskHotspots(trends),
        confidence: 0.75
      },
      growthTrend: {
        predictedWeight: this.predictWeightTrend(trends),
        growthRate: trends.averageGrowthRate || 0.8,
        confidence: 0.7
      },
      environmentAdaptation: {
        comfortLevel: this.predictComfortLevel(trends),
        stressFactors: this.identifyStressors(trends),
        confidence: 0.65
      },
      feedRequirement: {
        dailyRequirement: this.calculateFeedRequirement(trends),
        efficiency: trends.feedEfficiency || 0.6,
        confidence: 0.8
      }
    };
  }

  /**
   * 疾病传播预测算法
   */
  async predictDiseaseSpread(historicalData) {
    // 模拟机器学习模型预测
    const baseRisk = 0.15; // 基础风险率
    const riskFactors = {
      temperatureVariation: this.calculateVariation(historicalData.temperatures),
      density: historicalData.density || 0,
      stressLevels: historicalData.averageStress || 0
    };
    
    return {
      risk: Math.min(baseRisk + riskFactors.temperatureVariation * 0.1 + 
                     riskFactors.density * 0.05 + riskFactors.stressLevels * 0.02, 0.95),
      hotspots: this.identifyHighRiskAreas(riskFactors),
      prevention: ['加强通风', '控制密度', '营养补充'].slice(0, Math.floor(Math.random() * 2) + 1),
      confidence: 0.85
    };
  }

  /**
   * 生长趋势预测算法
   */ 