/**
 * 系统性能测试脚本
 * 测试AI系统的响应速度、准确性和稳定性
 */

import { SmartVisualSensor } from '../core/smartVisualSensor.js';
import { BehaviorRecognizer } from '../core/behaviorRecognizer.js';
import { AlertSystem } from '../core/alertSystem.js';

class PerformanceTest {
  constructor() {
    this.testResults = {
      startTime: new Date().toISOString(),
      endTime: null,
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      detailedResults: [],
      performanceMetrics: {},
      recommendations: []
    };

    this.initializeTestCases();
  }

  // 初始化测试用例
  initializeTestCases() {
    // 视觉传感器测试用例
    this.visualSensorTests = [
      {
        name: '图像识别响应时间测试',
        description: '测试图像识别处理的延迟时间',
        iterations: 50,
        timeout: 5000,
        testFunction: this.testImageRecognitionResponse.bind(this)
      },
      {
        name: '视频流处理性能测试',
        description: '测试实时视频流处理的帧率',
        iterations: 30,
        timeout: 10000,
        testFunction: this.testVideoStreamProcessing.bind(this)
      },
      {
        name: '对象检测准确性测试',
        description: '验证对象检测模型的准确性',
        iterations: 100,
        timeout: 8000,
        testFunction: this.testDetectionAccuracy.bind(this)
      }
    ];

    // 行为识别测试用例
    this.behaviorRecognizerTests = [
      {
        name: '行为识别响应时间测试',
        description: '测试行为识别算法的处理速度',
        iterations: 40,
        timeout: 6000,
        testFunction: this.testBehaviorRecognitionResponse.bind(this)
      },
      {
        name: '健康行为识别准确性测试',
        description: '验证健康行为识别的准确性',
        iterations: 80,
        timeout: 7000,
        testFunction: this.testHealthBehaviorAccuracy.bind(this)
      },
      {
        name: '异常行为检测性能测试',
        description: '测试异常行为检测的效率',
        iterations: 60,
        timeout: 9000,
        testFunction: this.testAnomalyDetectionPerformance.bind(this)
      }
    ];

    // 预警系统测试用例
    this.alertSystemTests = [
      {
        name: '预警响应时间测试',
        description: '测试预警消息生成和发送的延迟',
        iterations: 20,
        timeout: 3000,
        testFunction: this.testAlertResponseTime.bind(this)
      },
      {
        name: '并发预警处理测试',
        description: '测试系统处理多个并发预警的能力',
        iterations: 15,
        timeout: 5000,
        testFunction: this.testConcurrentAlertProcessing.bind(this)
      }
    ];
  }

  // 执行完整性能测试套件
  async runFullPerformanceTest() {
    console.log('🚀 开始执行系统性能测试...');
    
    try {
      // 1. 视觉传感器性能测试
      await this.runTestSuite('视觉传感器', this.visualSensorTests);
      
      // 2. 行为识别性能测试
      await this.runTestSuite('行为识别器', this.behaviorRecognizerTests);
      
      // 3. 预警系统性能测试
      await this.runTestSuite('预警系统', this.alertSystemTests);
      
      // 4. 系统集成性能测试
      await this.runIntegrationTests();
      
      // 5. 生成最终报告
      this.generateFinalReport();
      
      console.log('✅ 性能测试完成！');
      return this.testResults;
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error);
      this.testResults.error = error.message;
      return this.testResults;
    }
  }

  // 运行测试套件
  async runTestSuite(suiteName, testCases) {
    console.log(`\n📊 开始 ${suiteName} 性能测试套件...`);
    
    for (const testCase of testCases) {
      await this.runSingleTest(testCase, suiteName);
    }
  }

  // 运行单次测试
  async runSingleTest(testCase, suiteName) {
    const testId = `${suiteName}_${testCase.name.replace(/\s+/g, '_')}`;
    
    console.log(`\n🔧 执行测试: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`🔄 迭代次数: ${testCase.iterations}`);
    
    const testResult = {
      testId: testId,
      suite: suiteName,
      name: testCase.name,
      description: testCase.description,
      startTime: new Date().toISOString(),
      iterations: testCase.iterations,
      results: [],
      summary: {}
    };

    let successfulIterations = 0;
    const responseTimes = [];
    
    for (let i = 0; i < testCase.iterations; i++) {
      try {
        const startTime = performance.now();
        const result = await this.runWithTimeout(
          testCase.testFunction(),
          testCase.timeout
        );
        const endTime = performance.now();
        
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);
        
        testResult.results.push({
          iteration: i + 1,
          success: true,
          responseTime: responseTime,
          result: result
        });
        
        successfulIterations++;
        
        // 进度显示
        if ((i + 1) % 10 === 0) {
          console.log(`  进度: ${i + 1}/${testCase.iterations}`);
        }
        
      } catch (error) {
        testResult.results.push({
          iteration: i + 1,
          success: false,
          error: error.message,
          responseTime: null
        });
      }
    }
    
    // 计算测试摘要
    testResult.summary = this.calculateTestSummary(responseTimes, successfulIterations, testCase.iterations);
    testResult.endTime = new Date().toISOString();
    
    this.testResults.detailedResults.push(testResult);
    
    // 更新总测试统计
    this.testResults.totalTests++;
    if (testResult.summary.successRate === 100) {
      this.testResults.successfulTests++;
    } else {
      this.testResults.failedTests++;
    }
    
    console.log(`✅ ${testCase.name} 完成！`);
    console.log(`   成功率: ${testResult.summary.successRate.toFixed(1)}%`);
    console.log(`   平均响应时间: ${testResult.summary.averageResponseTime.toFixed(2)}ms`);
  }

  // 执行超时控制的测试
  async runWithTimeout(promise, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`测试超时 (${timeout}ms)`));
      }, timeout);
      
      promise.then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      }).catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  // 计算测试摘要
  calculateTestSummary(responseTimes, successfulIterations, totalIterations) {
    const validTimes = responseTimes.filter(time => time !== null);
    
    if (validTimes.length === 0) {
      return {
        successRate: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        standardDeviation: 0
      };
    }
    
    const sum = validTimes.reduce((a, b) => a + b, 0);
    const avg = sum / validTimes.length;
    const min = Math.min(...validTimes);
    const max = Math.max(...validTimes);
    
    // 计算标准差
    const squareDiffs = validTimes.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / validTimes.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      successRate: (successfulIterations / totalIterations) * 100,
      averageResponseTime: avg,
      minResponseTime: min,
      maxResponseTime: max,
      standardDeviation: stdDev
    };
  }

  // 图像识别响应时间测试
  async testImageRecognitionResponse() {
    // 模拟图像识别处理
    const visualSensor = new SmartVisualSensor();
    
    // 生成模拟图像数据
    const mockImageData = this.generateMockImageData();
    
    const result = await visualSensor.processImage(mockImageData);
    
    // 验证结果格式
    if (!result || typeof result !== 'object') {
      throw new Error('图像识别返回结果格式错误');
    }
    
    return result;
  }

  // 视频流处理性能测试
  async testVideoStreamProcessing() {
    // 模拟视频流处理
    const visualSensor = new SmartVisualSensor();
    
    // 处理模拟视频帧序列
    const frameCount = 100;
    const fpsResults = [];
    
    for (let i = 0; i < frameCount; i++) {
      const frameData = this.generateMockFrameData();
      const startTime = performance.now();
      await visualSensor.processFrame(frameData);
      const endTime = performance.now();
      
      fpsResults.push(1000 / (endTime - startTime)); // 计算FPS
    }
    
    const avgFPS = fpsResults.reduce((a, b) => a + b, 0) / fpsResults.length;
    
    return {
      frameCount: frameCount,
      averageFPS: avgFPS,
      minFPS: Math.min(...fpsResults),
      maxFPS: Math.max(...fpsResults)
    };
  }

  // 对象检测准确性测试
  async testDetectionAccuracy() {
    const visualSensor = new SmartVisualSensor();
    
    // 使用已知的测试样本进行准确性验证
    const testSamples = this.generateTestSamples();
    let correctDetections = 0;
    
    for (const sample of testSamples) {
      const result = await visualSensor.detectObjects(sample.imageData);
      
      if (this.verifyDetection(result, sample.expected)) {
        correctDetections++;
      }
    }
    
    const accuracy = (correctDetections / testSamples.length) * 100;
    
    return {
      testSamples: testSamples.length,
      correctDetections: correctDetections,
      accuracy: accuracy
    };
  }

  // 行为识别响应时间测试
  async testBehaviorRecognitionResponse() {
    const recognizer = new BehaviorRecognizer();
    
    const behaviorData = this.generateMockBehaviorData();
    const result = await recognizer.analyzeBehavior(behaviorData);
    
    if (!result || typeof result !== 'object') {
      throw new Error('行为识别返回结果格式错误');
    }
    
    return result;
  }

  // 健康行为识别准确性测试
  async testHealthBehaviorAccuracy() {
    const recognizer = new BehaviorRecognizer();
    
    const healthSamples = this.generateHealthBehaviorSamples();
    let correctClassifications = 0;
    
    for (const sample of healthSamples) {
      const result = await recognizer.classifyHealthBehavior(sample.data);
      
      if (result.healthStatus === sample.expectedStatus) {
        correctClassifications++;
      }
    }
    
    const accuracy = (correctClassifications / healthSamples.length) * 100;
    
    return {
      testSamples: healthSamples.length,
      correctClassifications: correctClassifications,
      accuracy: accuracy
    };
  }

  // 异常行为检测性能测试
  async testAnomalyDetectionPerformance() {
    const recognizer = new BehaviorRecognizer();
    
    const anomalySamples = this.generateAnomalySamples();
    let truePositives = 0;
    let falsePositives = 0;
    
    for (const sample of anomalySamples) {
      const result = await recognizer.detectAnomalies(sample.data);
      
      if (sample.isAnomaly && result.isAnomalyDetected) {
        truePositives++;
      } else if (!sample.isAnomaly && result.isAnomalyDetected) {
        falsePositives++;
      }
    }
    
    const precision = truePositives / (truePositives + falsePositives) || 0;
    
    return {
      samples: anomalySamples.length,
      truePositives: truePositives,
      falsePositives: falsePositives,
      precision: precision * 100
    };
  }

  // 预警响应时间测试
  async testAlertResponseTime() {
    const alertSystem = new AlertSystem();
    
    const alertData = {
      type: 'health_alert',
      severity: 'high',
      animalId: 'test_animal_001',
      message: '健康异常预警测试'
    };
    
    const result = await alertSystem.generateAlert(alertData);
    
    if (!result || !result.alertId) {
      throw new Error('预警生成失败');
    }
    
    return result;
  }

  // 并发预警处理测试
  async testConcurrentAlertProcessing() {
    const alertSystem = new AlertSystem();
    
    const concurrentAlerts = Array(10).fill().map((_, i) => ({
      type: 'concurrent_test',
      severity: 'medium',
      animalId: `test_animal_${i}`,
      message: `并发测试预警 ${i}`
    }));
    
    const results = await Promise.all(
      concurrentAlerts.map(alert => alertSystem.generateAlert(alert))
    );
    
    const successfulAlerts = results.filter(r => r && r.alertId);
    
    return {
      totalAlerts: concurrentAlerts.length,
      successfulAlerts: successfulAlerts.length,
      successRate: (successfulAlerts.length / concurrentAlerts.length) * 100
    };
  }

  // 系统集成性能测试
  async runIntegrationTests() {
    console.log('\n🔗 开始系统集成性能测试...');
    
    // 模拟完整工作流程
    const integrationResults = [];
    
    for (let i = 0; i < 20; i++) {
      const startTime = performance.now();
      
      try {
        // 1. 图像识别
        const visualSensor = new SmartVisualSensor();
        const imageResult = await visualSensor.processImage(this.generateMockImageData());
        
        // 2. 行为识别
        const recognizer = new BehaviorRecognizer();
        const behaviorResult = await recognizer.analyzeBehavior(this.generateMockBehaviorData());
        
        // 3. 预警生成（如果需要）
        if (behaviorResult.requiresAlert) {
          const alertSystem = new AlertSystem();
          const alertResult = await alertSystem.generateAlert({
            type: 'integration_test',
            severity: 'medium',
            animalId: 'integration_test_animal',
            message: '集成测试预警'
          });
        }
        
        const endTime = performance.now();
        
        integrationResults.push({
          iteration: i + 1,
          success: true,
          totalTime: endTime - startTime,
          components: ['visual_sensor', 'behavior_recognizer', 'alert_system']
        });
        
      } catch (error) {
        integrationResults.push({
          iteration: i + 1,
          success: false,
          error: error.message
        });
      }
    }
    
    this.testResults.integrationResults = integrationResults;
    
    console.log('✅ 系统集成性能测试完成！');
  }

  // 生成最终性能报告
  generateFinalReport() {
    this.testResults.endTime = new Date().toISOString();
    
    // 计算总体性能指标
    const allResponseTimes = [];
    let totalSuccessRate = 0;
    
    this.testResults.detailedResults.forEach(test => {
      if (test.summary.averageResponseTime > 0) {
        allResponseTimes.push(test.summary.averageResponseTime);
      }
      totalSuccessRate += test.summary.successRate;
    });
    
    const avgResponseTime = allResponseTimes.length > 0 ? 
      allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length : 0;
    
    const overallSuccessRate = totalSuccessRate / this.testResults.detailedResults.length;
    
    this.testResults.performanceMetrics = {
      overallSuccessRate: overallSuccessRate,
      averageResponseTime: avgResponseTime,
      testDuration: new Date(this.testResults.endTime) - new Date(this.testResults.startTime),
      testsExecuted: this.testResults.detailedResults.length
    };
    
    // 生成优化建议
    this.generateRecommendations();
    
    console.log('\n📋 性能测试报告生成完成！');
    console.log(`   总体成功率: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`   平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   测试执行时间: ${this.testResults.performanceMetrics.testDuration}ms`);
  }

  // 生成优化建议
  generateRecommendations() {
    const recommendations = [];
    
    // 分析性能数据
    this.testResults.detailedResults.forEach(test => {
      if (test.summary.averageResponseTime > 500) {
        recommendations.push({
          component: test.suite,
          test: test.name,
          issue: '响应时间过长',
          suggestion: '优化算法或增加缓存机制',
          currentValue: `${test.summary.averageResponseTime.toFixed(2)}ms`,
          targetValue: '<500ms'
        });
      }
      
      if (test.summary.successRate < 95) {
        recommendations.push({
          component: test.suite,
          test: test.name,
          issue: '成功率偏低',
          suggestion: '加强错误处理和异常恢复机制',
          currentValue: `${test.summary.successRate.toFixed(1)}%`,
          targetValue: '≥95%'
        });
      }
      
      if (test.summary.standardDeviation > test.summary.averageResponseTime * 0.5) {
        recommendations.push({
          component: test.suite,
          test: test.name,
          issue: '性能波动较大',
          suggestion: '优化资源管理和调度策略',
          currentValue: `${test.summary.standardDeviation.toFixed(2)}ms`,
          targetValue: `<${test.summary.averageResponseTime * 0.3}ms`
        });
      }
    });
    
    this.testResults.recommendations = recommendations;
  }

  // 辅助方法：生成模拟数据
  generateMockImageData() {
    return {
      width: 640,
      height: 480,
      format: 'jpeg',
      timestamp: new Date().toISOString(),
      data: Array(640 * 480 * 3).fill(128) // 模拟灰度图像数据
    };
  }

  generateMockFrameData() {
    return {
      frameNumber: Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      data: Array(1920 * 1080 * 3).fill(Math.floor(Math.random() * 256))
    };
  }

  generateTestSamples() {
    return Array(10).fill().map((_, i) => ({
      imageData: this.generateMockImageData(),
      expected: {
        objectCount: Math.floor(Math.random() * 5) + 1,
        confidence: 0.8 + Math.random() * 0.2
      }
    }));
  }

  generateMockBehaviorData() {
    return {
      timestamp: new Date().toISOString(),
      movementPattern: Array(10).fill().map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * 5
      })),
      activityLevel: Math.random(),
      healthIndicators: {
        heartRate: 60 + Math.random() * 40,
        temperature: 38 + Math.random() * 2
      }
    };
  }

  generateHealthBehaviorSamples() {
    const statuses = ['healthy', 'warning', 'critical'];
    return Array(20).fill().map((_, i) => ({
      data: this.generateMockBehaviorData(),
      expectedStatus: statuses[Math.floor(Math.random() * statuses.length)]
    }));
  }

  generateAnomalySamples() {
    return Array(30).fill().map((_, i) => ({
      data: this.generateMockBehaviorData(),
      isAnomaly: Math.random() > 0.7 // 30%的异常样本
    }));
  }

  // 验证检测结果
  verifyDetection(result, expected) {
    return result && 
           result.objectCount >= expected.objectCount * 0.8 &&
           result.confidence >= expected.confidence * 0.9;
  }

  // 导出测试报告
  exportReport(format = 'json') {
    if (format === 'html') {
      return this.generateHTMLReport();
    }
    
    return this.testResults;
  }

  // 生成HTML报告
  generateHTMLReport() {
    // 简化的HTML报告生成
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>慧牧云眸性能测试报告</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
          .recommendation { background: #fff3cd; padding: 10px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>慧牧云眸性能测试报告</h1>
        <div class="summary">
          <h2>测试概要</h2>
          <p>测试时间: ${this.testResults.startTime} - ${this.testResults.endTime}</p>
          <p>总测试数: ${this.testResults.totalTests}</p>
          <p>成功率: ${this.testResults.performanceMetrics.overallSuccessRate.toFixed(1)}%</p>
          <p>平均响应时间: ${this.testResults.performanceMetrics.averageResponseTime.toFixed(2)}ms</p>
        </div>
      </body>
      </html>
    `;
  }
}

// 导出供其他模块使用
export { PerformanceTest };

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
  // 在浏览器环境中自动运行测试
  window.runPerformanceTest = async function() {
    const test = new PerformanceTest();
    return await test.runFullPerformanceTest();
  };
}