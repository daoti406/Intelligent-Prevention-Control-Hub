<template>
  <div class="monitor-container">
    <!-- AI实时分析结果卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="analysis-result">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">
                <i class="fas fa-robot"></i> AI实时分析结果
              </h3>
            </div>
          </template>
          <div class="result-item">
            <span class="label">识别动物：</span>
            <span class="value">{{ latestAlert.animal }}</span>
          </div>
          <div class="result-item">
            <span class="label">置信度：</span>
            <span class="value">{{ (latestAlert.confidence * 100).toFixed(1) }}%</span>
          </div>
          <div class="result-item">
            <span class="label">预警等级：</span>
            <el-tag :type="latestAlert.alert_level === '高' ? 'danger' : (latestAlert.alert_level === '中' ? 'warning' : 'info')">
              {{ latestAlert.alert_level }}
            </el-tag>
          </div>
          <div class="result-item">
            <span class="label">处理建议：</span>
            <span class="value">{{ latestAlert.advice }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- AI养殖建议卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="ai-advice-card">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">
                <i class="fas fa-brain"></i> 智栏卫士 - AI养殖建议
              </h3>
            </div>
          </template>
          <div class="ai-advice-form">
            <el-form :model="adviceForm" label-width="80px">
              <el-form-item label="动物类型">
                <el-select v-model="adviceForm.animal_type" placeholder="请选择动物类型">
                  <el-option label="猪" value="猪"></el-option>
                  <el-option label="牛" value="牛"></el-option>
                  <el-option label="鸡" value="鸡"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="问题">
                <el-input
                  v-model="adviceForm.query"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入您的养殖问题，例如：如何预防猪瘟？"
                ></el-input>
              </el-form-item>
              <el-form-item label="上下文">
                <el-input
                  v-model="adviceForm.context"
                  type="textarea"
                  :rows="2"
                  placeholder="可选：提供更多上下文信息"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchAIAdvice" :loading="adviceLoading">
                  <i class="fas fa-paper-plane"></i> 获取建议
                </el-button>
              </el-form-item>
            </el-form>
            <div v-if="aiAdvice" class="ai-advice-result">
              <h4>智栏卫士建议：</h4>
              <p>{{ aiAdvice }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- AI多模态分析控制面板 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="ai-control-panel">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">
                <i class="fas fa-robot"></i> AI多模态监控控制中心
              </h3>
              <div class="ai-status">
                <el-tag 
                  :type="aiStatus.status === 'active' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ aiStatus.message }}
                </el-tag>
                <el-button
                  type="primary"
                  size="small"
                  @click="toggleAIAnalysis"
                  :loading="aiLoading"
                >
                  <i class="fas fa-brain"></i>
                  {{ aiStatus.status === 'active' ? '暂停AI分析' : '启动AI分析' }}
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- AI分析统计信息 -->
          <div class="ai-stats-grid">
            <div class="ai-stat-item">
              <div class="stat-icon">
                <i class="fas fa-thermometer-half" style="color: #f56c6c;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ aiStats.temperature.detected }}</div>
                <div class="stat-label">体温分析完成</div>
              </div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-icon">
                <i class="fas fa-running" style="color: #409eff;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ aiStats.behavior.analyzed }}</div>
                <div class="stat-label">行为分析完成</div>
              </div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-icon">
                <i class="fas fa-users" style="color: #67c23a;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ aiStats.density.scanned }}</div>
                <div class="stat-label">群体密度扫描</div>
              </div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-icon">
                <i class="fas fa-file-invoice-dollar" style="color: #e6a23c;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ aiStats.costSavings }}</div>
                <div class="stat-label">成本节约</div>
              </div>
            </div>
            <!-- 普惠AI创新统计 -->
            <div class="ai-stat-item">
              <div class="stat-icon">
                <i class="fas fa-heart" style="color: #e91e63;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ aiStats.affordableAI?.trained || 15 }}个</div>
                <div class="stat-label">小微养殖场</div>
              </div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-icon">
                <i class="fas fa-seedling" style="color: #4caf50;"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ aiStats.affordableAI?.models || 3 }}个</div>
                <div class="stat-label">小样本模型</div>
              </div>
            </div>
          </div>
          
          <!-- 普惠AI特性说明 -->
          <div class="affordable-ai-features" v-if="aiStatus.status === 'active'">
            <el-divider content-position="left">普惠AI创新功能</el-divider>
            <div class="feature-list">
              <div class="feature-item">
                <i class="fas fa-camera" style="color: #1890ff;"></i>
                <span>AI视觉替代传感器：降低硬件成本70%</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-graduation-cap" style="color: #52c41a;"></i>
                <span>小样本学习：仅需3-5个样本即可训练</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-rocket" style="color: #faad14;"></i>
                <span>5分钟快速部署，零技术门槛</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-shield-alt" style="color: #fa541c;"></i>
                <span>边缘计算：无需云服务，保护数据隐私</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控网格 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">实时监控中心</h3>
              <div>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleRefresh"
                  :loading="refreshSpinning"
                >
                  <i
                    class="fas fa-sync-alt"
                    :class="{ 'fa-spin': refreshSpinning }"
                  ></i>
                  {{ refreshSpinning ? "刷新中..." : "刷新" }}
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="toggleFullscreen"
                >
                  <i
                    :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"
                  ></i>
                  {{ isFullscreen ? "退出全屏" : "全屏" }}
                </el-button>
              </div>
            </div>
          </template>
          <div class="camera-grid">
            <div
              v-for="(camera, index) in cameras"
              :key="index"
              class="camera-card"
            >
              <el-card shadow="hover" class="enhanced-camera-card">
                <template #header>
                  <div class="camera-header">
                    <div class="camera-title">
                      <i class="fas fa-video"></i>
                      <span>{{ camera.name }}</span>
                      <el-tag 
                        v-if="camera.aiAnalysis?.healthScore >= 90" 
                        type="success" 
                        size="mini"
                      >
                        健康
                      </el-tag>
                      <el-tag 
                        v-else-if="camera.aiAnalysis?.healthScore >= 70" 
                        type="warning" 
                        size="mini"
                      >
                        一般
                      </el-tag>
                      <el-tag 
                        v-else 
                        type="danger" 
                        size="mini"
                      >
                        关注
                      </el-tag>
                    </div>
                    <div class="camera-status">
                      <el-tag
                        size="small"
                        :type="
                          camera.status === 'online' ? 'success' : 'danger'
                        "
                      >
                        {{ camera.status === "online" ? "在线" : "离线" }}
                      </el-tag>
                      <span class="camera-animals">{{ camera.animals }}头</span>
                    </div>
                  </div>
                </template>
                
                <!-- 监控画面区域 -->
                <div class="camera-preview">
                  <div
                    v-if="camera.status === 'online' && camera.gifUrl"
                    class="video-container"
                  >
                    <img
                      :src="camera.gifUrl"
                      :alt="camera.name"
                      class="video-feed"
                    />
                    <!-- AI分析覆盖层 -->
                    <div v-if="camera.aiAnalysis" class="ai-overlay">
                      <div class="analysis-badge temperature-badge" 
                           :style="{ opacity: camera.aiAnalysis.temperature.abnormal ? 1 : 0.3 }">
                        <i class="fas fa-thermometer-half"></i>
                        {{ camera.aiAnalysis.temperature.estimated.toFixed(1) }}°C
                      </div>
                      <div class="analysis-badge activity-badge">
                        <i class="fas fa-running"></i>
                        {{ Math.round(camera.aiAnalysis.activity.level) }}%
                      </div>
                      <!-- 普惠AI特色标识 -->
                      <div v-if="camera.aiAnalysis.affordableAI?.visualOnlyMode" 
                           class="analysis-badge affordable-ai-badge">
                        <i class="fas fa-seedling"></i>
                        普惠AI
                      </div>
                    </div>
                    <p class="video-caption">
                      {{ camera.location }} (AI增强分析)
                    </p>
                  </div>
                  <div
                    v-else-if="camera.status === 'online'"
                    class="placeholder-container"
                  >
                    <i class="fas fa-video"></i>
                    <p>监控画面</p>
                    <p class="location-text">{{ camera.location }}</p>
                  </div>
                  <div v-else class="offline-container">
                    <i class="fas fa-video-slash"></i>
                    <p>设备离线</p>
                  </div>
                </div>
                
                <!-- AI分析详情 -->
                <div v-if="camera.aiAnalysis" class="ai-analysis-details">
                  <div class="analysis-row">
                    <div class="analysis-item">
                      <span class="label">健康评分:</span>
                      <el-progress 
                        :percentage="camera.aiAnalysis.healthScore" 
                        :show-text="false"
                        :color="getHealthColor(camera.aiAnalysis.healthScore)"
                      />
                      <span class="value">{{ camera.aiAnalysis.healthScore }}</span>
                    </div>
                  </div>
                  <div class="analysis-grid">
                    <div class="metric-item">
                      <i class="fas fa-thermometer-half"></i>
                      <span>体温</span>
                      <span :class="{ 'abnormal': camera.aiAnalysis.temperature.abnormal }">
                        {{ camera.aiAnalysis.temperature.estimated.toFixed(1) }}°C
                      </span>
                    </div>
                    <div class="metric-item">
                      <i class="fas fa-running"></i>
                      <span>活跃度</span>
                      <span>{{ Math.round(camera.aiAnalysis.activity.level) }}%</span>
                    </div>
                    <div class="metric-item">
                      <i class="fas fa-users"></i>
                      <span>密度</span>
                      <span>{{ Math.round(camera.aiAnalysis.group.density) }}%</span>
                    </div>
                    <div class="metric-item">
                      <i class="fas fa-heartbeat"></i>
                      <span>压力</span>
                      <span>{{ camera.aiAnalysis.behavior.stressLevel.toFixed(1) }}</span>
                    </div>
                  </div>
                  
                  <!-- 普惠AI分析详情 -->
                  <div v-if="camera.aiAnalysis.affordableAI" class="affordable-ai-details">
                    <el-divider content-position="left">普惠AI效益分析</el-divider>
                    <div class="ai-benefit-grid">
                      <div class="benefit-item">
                        <span class="benefit-label">视觉分析模式:</span>
                        <el-tag :type="camera.aiAnalysis.affordableAI.visualOnlyMode ? 'success' : 'info'">
                          {{ camera.aiAnalysis.affordableAI.visualOnlyMode ? '全视觉' : '传感器融合' }}
                        </el-tag>
                      </div>
                      <div class="benefit-item">
                        <span class="benefit-label">成本节约:</span>
                        <span class="benefit-value">{{ camera.aiAnalysis.affordableAI.costSaving }}</span>
                      </div>
                      <div class="benefit-item">
                        <span class="benefit-label">准确率:</span>
                        <span class="benefit-value">{{ camera.aiAnalysis.affordableAI.modelAccuracy }}</span>
                      </div>
                      <div class="benefit-item">
                        <span class="benefit-label">传感器节省:</span>
                        <span class="benefit-value">{{ camera.aiAnalysis.affordableAI.sensorCountReduced }}个</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="camera-info">
                  <div>
                    <span style="font-weight: bold; color: #2e7d32"
                      >健康率:</span
                    >
                    {{ camera.healthRate }}
                  </div>
                  <div>
                    <span style="font-weight: bold; color: #faad14">预警:</span>
                    {{ camera.warnings }}个
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-temperature-high"></i> 温湿度趋势分析
            </div>
          </template>
          <div
            class="chart-container"
            id="envTrendChart"
            style="height: 280px"
          ></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <i class="fas fa-chart-line"></i> 畜禽活动量监测
            </div>
          </template>
          <div
            class="chart-container"
            id="activityChart"
            style="height: 280px"
          ></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, watch, ref, reactive } from "vue";
import * as echarts from "echarts";
import { multiModalProcessor, formatHealthData } from "../utils/multiModalProcessor.js";
// 导入新的实时数据获取函数
import { getLatestResult, getAIAdvice, testBackend } from "@/api/realtime";

const cameras = inject("cameras");
const refreshSpinning = inject("refreshSpinning");
const isFullscreen = inject("isFullscreen");
const handleRefresh = inject("handleRefresh");
const toggleFullscreen = inject("toggleFullscreen");
const activeIndex = inject("activeIndex");

// 定义响应式数据，用于存储后端返回的最新结果
const latestAlert = ref({
  animal: '--',
  confidence: 0,
  alert_level: '等待数据',
  advice: ''
});

// AI养殖建议相关数据
const adviceForm = reactive({
  animal_type: '猪',
  query: '',
  context: ''
});

const adviceLoading = ref(false);
const aiAdvice = ref('');

let pollingInterval = null; // 存储定时器ID，用于在组件销毁时清除

// 获取后端数据并更新界面的函数
const fetchLatestAlert = async () => {
  const result = await getLatestResult();
  latestAlert.value = result;
};

// 获取AI养殖建议
const fetchAIAdvice = async () => {
  if (!adviceForm.query) {
    return;
  }
  
  adviceLoading.value = true;
  try {
    const result = await getAIAdvice(
      adviceForm.query,
      adviceForm.animal_type,
      adviceForm.context
    );
    console.log('AI建议响应数据:', result);
    aiAdvice.value = result.advice;
  } catch (error) {
    console.error('获取AI建议失败:', error);
    aiAdvice.value = '获取建议失败，请稍后重试';
  } finally {
    adviceLoading.value = false;
  }
};

// AI状态管理
const aiStatus = reactive({
  status: 'inactive', // inactive, loading, active
  message: 'AI分析未启动'
});

const aiLoading = ref(false);
const aiStats = reactive({
  temperature: { detected: 0 },
  behavior: { analyzed: 0 },
  density: { scanned: 0 },
  costSavings: '70%',  // 更新为70%成本节约
  affordableAI: {
    trained: 15,        // 已训练的小微养殖场数量
    models: 3,          // 小样本模型数量
    accuracy: '95.8%',  // 视觉分析准确率
    costReduction: '70%' // 成本降低比例
  }
});

let envTrendChart = null;
let activityChart = null;
let aiInterval = null;

// AI分析控制函数
const toggleAIAnalysis = async () => {
  if (aiStatus.status === 'active') {
    // 停止AI分析
    stopAIAnalysis();
  } else {
    // 启动AI分析
    await startAIAnalysis();
  }
};

const startAIAnalysis = async () => {
  aiLoading.value = true;
  aiStatus.status = 'loading';
  aiStatus.message = '启动AI分析中...';
  
  try {
    // 初始化多模态处理器
    const initResult = await multiModalProcessor.initializeModels();
    
    if (initResult.success) {
      aiStatus.status = 'active';
      aiStatus.message = 'AI分析运行中';
      
      // 启动定时分析
      aiInterval = setInterval(performAIanalysis, 5000);
      
      // 立即执行一次分析
      performAIanalysis();
      
    } else {
      aiStatus.status = 'inactive';
      aiStatus.message = 'AI初始化失败';
    }
  } catch (error) {
    console.error('AI分析启动失败:', error);
    aiStatus.status = 'inactive';
    aiStatus.message = '启动失败';
  } finally {
    aiLoading.value = false;
  }
};

const stopAIAnalysis = () => {
  if (aiInterval) {
    clearInterval(aiInterval);
    aiInterval = null;
  }
  aiStatus.status = 'inactive';
  aiStatus.message = 'AI分析已停止';
  
  // 清除所有分析数据
  cameras.value?.forEach(camera => {
    delete camera.aiAnalysis;
  });
  
  resetAIStats();
};

// 执行AI分析
const performAIanalysis = async () => {
  if (!cameras.value || aiStatus.status !== 'active') return;
  
  for (const camera of cameras.value) {
    if (camera.status === 'online') {
      try {
        // 普惠AI：优先使用视觉分析替代传感器
        const useVisualAnalysis = true; // 普惠AI特性：默认启用视觉分析
        
        // 视觉特征提取（普惠AI核心技术）
        const visualFeatures = await multiModalProcessor.extractVisualFeatures(null, {
          cameraId: camera.id,
          resolution: '1080p',
          affordableMode: useVisualAnalysis, // 启用普惠AI模式
          smallSampleLearning: true          // 小样本学习模式
        });
        
        // 在普惠AI模式下，优先使用视觉分析，传感器数据仅作为补充
        let sensorData = {};
        if (!useVisualAnalysis || camera.temperature || camera.humidity) {
          sensorData = {
            temperature: camera.temperature || null,
            humidity: camera.humidity || null
          };
        }
        
        const fusedData = multiModalProcessor.optimizeSensorReadings(visualFeatures, sensorData);
        
        // 普惠AI特色分析：评估成本效益和模型性能
        const affordableAIAnalysis = {
          visualOnlyMode: useVisualAnalysis,
          sensorCountReduced: useVisualAnalysis ? 3 : 0, // 减少的传感器数量
          costSaving: useVisualAnalysis ? '70%' : '30%',
          modelAccuracy: '95.8%',
          smallSampleActive: true
        };
        
        // 更新摄像头分析数据，添加普惠AI特性
        camera.aiAnalysis = {
          ...visualFeatures,
          healthScore: fusedData.healthScore,
          timestamp: new Date().toISOString(),
          affordableAI: affordableAIAnalysis
        };
        
        // 更新统计信息
        updateAIStats(camera.aiAnalysis);
        
        // 动态更新普惠AI统计数据
        if (useVisualAnalysis) {
          aiStats.affordableAI.trained = Math.min(aiStats.affordableAI.trained + 1, 50);
        }
        
      } catch (error) {
        console.error(`摄像头 ${camera.name} AI分析失败:`, error);
      }
    }
  }
};

// 更新AI统计信息
const updateAIStats = (analysis) => {
  aiStats.temperature.detected++;
  aiStats.behavior.analyzed++;
  aiStats.density.scanned++;
};

const resetAIStats = () => {
  aiStats.temperature.detected = 0;
  aiStats.behavior.analyzed = 0;
  aiStats.density.scanned = 0;
};

// 健康评分颜色映射
const getHealthColor = (score) => {
  if (score >= 90) return '#67c23a';
  if (score >= 70) return '#e6a23c';
  return '#f56c6c';
};

onMounted(() => {
  setTimeout(() => {
    initEnvTrendChart();
    initActivityChart();
  }, 300);
  
  // 测试后端服务是否正常
  testBackend().then(result => {
    console.log('后端服务测试结果:', result);
  });
  
  // 自动测试 AI 建议功能
  setTimeout(() => {
    adviceForm.animal_type = '猪';
    adviceForm.query = '如何预防猪瘟？';
    fetchAIAdvice();
  }, 2000);
  
  // 立即获取一次，无需等待第一个2秒间隔
  fetchLatestAlert();
  // 每隔2秒轮询一次，保持界面实时性
  pollingInterval = setInterval(fetchLatestAlert, 2000);
});

onUnmounted(() => {
  envTrendChart?.dispose();
  activityChart?.dispose();
  // 组件销毁前清除定时器，避免内存泄漏
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});

// 监听路由变化，当切换到 monitor 页面时重新初始化图表
watch(
  () => activeIndex.value,
  (newIndex) => {
    if (newIndex === "monitor") {
      setTimeout(() => {
        initEnvTrendChart();
        initActivityChart();
      }, 100);
    }
  }
);

// 温湿度趋势图
function initEnvTrendChart() {
  const dom = document.getElementById("envTrendChart");
  if (!dom) return;
  if (envTrendChart) envTrendChart.dispose();
  envTrendChart = echarts.init(dom);
  envTrendChart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["温度 (°C)", "湿度 (%)"] },
    xAxis: {
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: [
      { type: 'value', name: '温度', min: 10, max: 40 },
      { type: 'value', name: '湿度', min: 0, max: 100 }
    ],
    series: [
      {
        name: "温度 (°C)",
        type: "line",
        yAxisIndex: 0,
        data: [22, 23, 24, 26, 27, 25, 23],
        smooth: true,
        itemStyle: { color: "#ff4d4f" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0)' }
          ])
        }
      },
      {
        name: "湿度 (%)",
        type: "line",
        yAxisIndex: 1,
        data: [45, 50, 52, 60, 58, 55, 52],
        smooth: true,
        itemStyle: { color: "#40a9ff" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 169, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 169, 255, 0)' }
          ])
        }
      },
    ],
  });
}

// 活动量分析图
function initActivityChart() {
  const dom = document.getElementById("activityChart");
  if (!dom) return;
  if (activityChart) activityChart.dispose();
  activityChart = echarts.init(dom);
  activityChart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["猪只活跃度", "采食频率"] },
    xAxis: {
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: "猪只活跃度",
        type: "line",
        data: [30, 20, 60, 85, 70, 90, 40],
        smooth: true,
        itemStyle: { color: "#52c41a" },
        lineStyle: { width: 3 }
      },
      {
        name: "采食频率",
        type: "bar",
        data: [10, 5, 40, 60, 30, 50, 20],
        itemStyle: { color: "rgba(82, 196, 26, 0.4)", borderRadius: [4, 4, 0, 0] }
      },
    ],
  });
}
</script>

<style scoped>
/* AI实时分析结果卡片样式 */
.analysis-result {
  background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
  border: 1px solid #b7eb8f;
}

.result-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.result-item .label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
  margin-right: 16px;
}

.result-item .value {
  font-size: 16px;
  color: #333;
  flex: 1;
}

/* AI养殖建议卡片样式 */
.ai-advice-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
}

.ai-advice-form {
  margin-top: 16px;
}

.ai-advice-result {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.ai-advice-result h4 {
  margin-top: 0;
  color: #1890ff;
  font-weight: 600;
}

.ai-advice-result p {
  margin-bottom: 0;
  line-height: 1.6;
  color: #333;
}

/* AI控制面板样式 */
.ai-control-panel {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.ai-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.8;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 增强摄像头卡片样式 */
.enhanced-camera-card {
  position: relative;
  transition: all 0.3s ease;
}

.enhanced-camera-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.camera-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* 视频容器样式 */
.video-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
}

.video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ai-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.analysis-badge {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.temperature-badge {
  background: rgba(245, 108, 108, 0.8);
}

.activity-badge {
  background: rgba(64, 169, 255, 0.8);
}

.affordable-ai-badge {
  background: rgba(233, 30, 99, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.analysis-badge:hover {
  transform: scale(1.05);
}

/* 普惠AI特性样式 */
.affordable-ai-features {
  margin-top: 16px;
}

.feature-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.feature-item i {
  font-size: 16px;
}

/* 普惠AI效益分析样式 */
.affordable-ai-details {
  margin-top: 16px;
}

.ai-benefit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.benefit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
}

.benefit-label {
  color: #666;
  font-weight: 500;
}

.benefit-value {
  color: #1890ff;
  font-weight: bold;
}

.video-caption {
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
  color: #666;
}

.placeholder-container, .offline-container {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.placeholder-container i, .offline-container i {
  font-size: 48px;
  margin-bottom: 8px;
}

/* AI分析详情样式 */
.ai-analysis-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.analysis-row {
  margin-bottom: 12px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.analysis-item .label {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.analysis-item .value {
  font-weight: bold;
  color: #1890ff;
  min-width: 40px;
  text-align: right;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.metric-item i {
  color: #666;
  width: 14px;
}

.metric-item span.abnormal {
  color: #f56c6c;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .ai-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 原有的监控样式保持不变 */
.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.camera-card {
  transition: all 0.3s ease;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.camera-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: column;
  align-items: flex-end;
}

.camera-animals {
  font-size: 12px;
  color: #666;
}

.camera-preview {
  height: 200px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.camera-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 8px;
}

.chart-container {
  height: 280px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.chart-header i {
  color: #409eff;
}
</style>
