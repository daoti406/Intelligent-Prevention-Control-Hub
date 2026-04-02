<template>
  <div class="cost-benefit-container">
    <!-- 普惠农业AI成本效益分析面板 -->
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card class="cost-card" shadow="hover">
          <template #header>
            <div class="cost-header">
              <h3 class="cost-title">
                <i class="fas fa-piggy-bank"></i> 普惠农业AI成本效益分析
              </h3>
              <div class="time-range-selector">
                <el-radio-group v-model="timeRange" size="small">
                  <el-radio-button label="daily">日统计</el-radio-button>
                  <el-radio-button label="monthly">月统计</el-radio-button>
                  <el-radio-button label="yearly">年统计</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>

          <!-- 成本对比分析 -->
          <div class="cost-comparison-section">
            <h4 class="section-title">传感器方案成本对比</h4>
            <div class="comparison-grid">
              <div class="cost-item traditional">
                <div class="cost-icon">
                  <i class="fas fa-microchip"></i>
                </div>
                <div class="cost-content">
                  <div class="cost-label">传统传感器方案</div>
                  <div class="cost-amount">¥{{ costAnalysis.traditionalSetupCost.toLocaleString() }}</div>
                  <div class="cost-desc">红外测温+行为传感器+计数设备</div>
                </div>
              </div>
              
              <div class="cost-divider">
                <i class="fas fa-arrow-right"></i>
                <div class="saving-badge">
                  {{ costSavingPercentage }}%
                  <span>成本节省</span>
                </div>
              </div>
              
              <div class="cost-item visual">
                <div class="cost-icon">
                  <i class="fas fa-camera"></i>
                </div>
                <div class="cost-content">
                  <div class="cost-label">AI视觉传感器方案</div>
                  <div class="cost-amount">¥{{ costAnalysis.visualSetupCost.toLocaleString() }}</div>
                  <div class="cost-desc">计算机视觉一站式解决方案</div>
                </div>
              </div>
            </div>
            
            <!-- 节省金额展示 -->
            <div class="saving-stats">
              <div class="saving-item">
                <span class="saving-label">一次性节省</span>
                <span class="saving-value">¥{{ costSavingAmount.toLocaleString() }}</span>
              </div>
              <div class="saving-item">
                <span class="saving-label">{{ timeRangeText }}节省</span>
                <span class="saving-value">¥{{ currentSaving.toLocaleString() }}</span>
              </div>
              <div class="saving-item">
                <span class="saving-label">投资回报周期</span>
                <span class="saving-value">{{ paybackPeriod }}天</span>
              </div>
            </div>
          </div>

          <!-- 投资回报分析 -->
          <div class="roi-analysis-section">
            <h4 class="section-title">投资回报分析</h4>
            <div class="roi-grid">
              <div class="roi-item">
                <div class="roi-metric">
                  <div class="roi-value">{{ roiPercentage }}%</div>
                  <div class="roi-label">年投资回报率</div>
                </div>
                <el-progress 
                  :percentage="Math.min(roiPercentage, 100)" 
                  :color="roiPercentage > 100 ? '#67c23a' : '#e6a23c'"
                  :show-text="false"
                />
              </div>
              
              <div class="roi-item">
                <div class="roi-metric">
                  <div class="roi-value">{{ costSavingPercentage }}%</div>
                  <div class="roi-label">成本降低比例</div>
                </div>
                <el-progress 
                  :percentage="costSavingPercentage" 
                  color="#67c23a"
                  :show-text="false"
                />
              </div>
              
              <div class="roi-item">
                <div class="roi-metric">
                  <div class="roi-value">{{ accuracyRating }}%</div>
                  <div class="roi-label">监测准确率</div>
                </div>
                <el-progress 
                  :percentage="accuracyRating" 
                  color="#409eff"
                  :show-text="false"
                />
              </div>
            </div>
          </div>

          <!-- 环境效益展示 -->
          <div class="environmental-benefits">
            <h4 class="section-title">环境与普惠效益</h4>
            <div class="benefits-list">
              <div class="benefit-item">
                <i class="fas fa-recycle" style="color: #4caf50;"></i>
                <span>减少电子废弃物：视觉方案替代多个传感器</span>
              </div>
              <div class="benefit-item">
                <i class="fas fa-leaf" style="color: #67c23a;"></i>
                <span>能效提升：视觉处理功耗低于传统传感器</span>
              </div>
              <div class="benefit-item">
                <i class="fas fa-users" style="color: #e6a23c;"></i>
                <span>普惠农业：中小养殖场可负担的AI解决方案</span>
              </div>
              <div class="benefit-item">
                <i class="fas fa-expand-arrows-alt" style="color: #909399;"></i>
                <span>易于扩展：单一摄像头可监测多个区域</span>
              </div>
            </div>
          </div>

          <!-- 传感器类型详细对比 -->
          <div class="sensor-detail-comparison">
            <h4 class="section-title">各类传感器成本对比</h4>
            <el-table :data="sensorComparisonData" style="width: 100%">
              <el-table-column prop="type" label="传感器类型" width="150">
                <template #default="{ row }">
                  <div class="sensor-type">
                    <i :class="row.icon"></i>
                    <span>{{ row.type }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="traditional" label="传统方案成本" align="right">
                <template #default="{ row }">
                  <span class="cost-traditional">¥{{ row.traditional.toLocaleString() }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="visual" label="视觉方案成本" align="right">
                <template #default="{ row }">
                  <span class="cost-visual">¥{{ row.visual.toLocaleString() }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="saving" label="节省金额" align="right">
                <template #default="{ row }">
                  <span class="saving-amount">¥{{ row.saving.toLocaleString() }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="savingPercent" label="节省比例" align="center" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.savingPercent > 50 ? 'success' : 'warning'" size="small">
                    {{ row.savingPercent }}%
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 适用场景推荐 -->
          <div class="application-scenarios">
            <h4 class="section-title">推荐应用场景</h4>
            <div class="scenario-cards">
              <el-card class="scenario-card" shadow="never">
                <template #header>
                  <div class="scenario-header">
                    <i class="fas fa-home" style="color: #409eff;"></i>
                    <span>中小型养殖场</span>
                  </div>
                </template>
                <div class="scenario-content">
                  <p>✅ 成本控制在5万元以内</p>
                  <p>✅ 无需专业技术人员维护</p>
                  <p>✅ 即插即用，快速部署</p>
                </div>
              </el-card>
              
              <el-card class="scenario-card" shadow="never">
                <template #header>
                  <div class="scenario-header">
                    <i class="fas fa-building" style="color: #67c23a;"></i>
                    <span>规模化养殖企业</span>
                  </div>
                </template>
                <div class="scenario-content">
                  <p>✅ 多区域集中管理</p>
                  <p>✅ 大数据分析和预测</p>
                  <p>✅ ROI最大化</p>
                </div>
              </el-card>
              
              <el-card class="scenario-card" shadow="never">
                <template #header>
                  <div class="scenario-header">
                    <i class="fas fa-hand-holding-usd" style="color: #e6a23c;"></i>
                    <span>政府补贴项目</span>
                  </div>
                </template>
                <div class="scenario-content">
                  <p>✅ 符合普惠农业政策</p>
                  <p>✅ 带动产业升级</p>
                  <p>✅ 可复制推广模式</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { visionSensor, COST_SAVINGS } from '../utils/visionSensor.js';

const timeRange = ref('monthly');

// 成本效益数据
const costAnalysis = computed(() => {
  return visionSensor.getCostBenefitAnalysis(timeRange.value);
});

// 计算属性
const costSavingPercentage = computed(() => {
  return COST_SAVINGS.SAVING_PERCENTAGE;
});

const costSavingAmount = computed(() => {
  return COST_SAVINGS.TRADITIONAL_PER_REGION - COST_SAVINGS.VISUAL_PER_REGION;
});

const currentSaving = computed(() => {
  return costAnalysis.value.savings;
});

const paybackPeriod = computed(() => {
  return costAnalysis.value.paybackPeriod;
});

const roiPercentage = computed(() => {
  return costAnalysis.value.roi;
});

const timeRangeText = computed(() => {
  const texts = { daily: '每日', monthly: '每月', yearly: '每年' };
  return texts[timeRange.value];
});

const accuracyRating = computed(() => {
  return 87; // 基于视觉传感器的准确率
});

// 传感器详细对比数据
const sensorComparisonData = ref([
  {
    type: '体温监测',
    icon: 'fas fa-thermometer-half',
    traditional: 5000,
    visual: 1500,
    saving: 3500,
    savingPercent: 70
  },
  {
    type: '行为分析',
    icon: 'fas fa-walking',
    traditional: 8000,
    visual: 2000,
    saving: 6000,
    savingPercent: 75
  },
  {
    type: '群体计数',
    icon: 'fas fa-users',
    traditional: 2000,
    visual: 1000,
    saving: 1000,
    savingPercent: 50
  },
  {
    type: '环境监测',
    icon: 'fas fa-cloud',
    traditional: 5000,
    visual: 1000,
    saving: 4000,
    savingPercent: 80
  },
  {
    type: '健康评估',
    icon: 'fas fa-heartbeat',
    traditional: 10000,
    visual: 3000,
    saving: 7000,
    savingPercent: 70
  }
]);

onMounted(() => {
  console.log('成本效益分析组件初始化完成');
});
</script>

<style scoped>
.cost-benefit-container {
  width: 100%;
  min-width: 0;
}

.cost-card {
  width: 100%;
  max-width: 100%;
}

.cost-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.cost-title {
  margin: 0;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-range-selector {
  display: flex;
  gap: 8px;
}

/* 成本对比部分 */
.cost-comparison-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.comparison-grid {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cost-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  flex: 1;
  min-width: 250px;
}

.cost-item.traditional {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 1px solid #f56c6c;
}

.cost-item.visual {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #409eff;
}

.cost-icon {
  font-size: 32px;
  color: #606266;
}

.cost-item.traditional .cost-icon {
  color: #f56c6c;
}

.cost-item.visual .cost-icon {
  color: #409eff;
}

.cost-content {
  flex: 1;
}

.cost-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.cost-amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.cost-desc {
  font-size: 12px;
  color: #909399;
}

.cost-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cost-divider i {
  font-size: 20px;
  color: #67c23a;
}

.saving-badge {
  background: #67c23a;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  min-width: 80px;
}

.saving-badge span {
  display: block;
  font-size: 10px;
  font-weight: normal;
}

/* 节省统计 */
.saving-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.saving-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.saving-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.saving-value {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

/* ROI分析 */
.roi-analysis-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.roi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.roi-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.roi-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.roi-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.roi-label {
  font-size: 12px;
  color: #909399;
}

/* 环境效益 */
.environmental-benefits {
  margin-bottom: 24px;
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.benefit-item i {
  font-size: 16px;
}

/* 传感器详细对比 */
.sensor-detail-comparison {
  margin-bottom: 24px;
}

.sensor-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cost-traditional {
  color: #f56c6c;
  font-weight: 600;
}

.cost-visual {
  color: #409eff;
  font-weight: 600;
}

.saving-amount {
  color: #67c23a;
  font-weight: 600;
}

/* 应用场景 */
.application-scenarios {
  margin-bottom: 16px;
}

.scenario-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.scenario-card {
  border: 1px solid #e4e7ed;
}

.scenario-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.scenario-content {
  font-size: 14px;
  color: #606266;
}

.scenario-content p {
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cost-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .comparison-grid {
    flex-direction: column;
    gap: 16px;
  }
  
  .cost-item {
    min-width: 100%;
  }
  
  .saving-stats {
    grid-template-columns: 1fr;
  }
  
  .roi-grid {
    grid-template-columns: 1fr;
  }
  
  .benefits-list {
    grid-template-columns: 1fr;
  }
  
  .scenario-cards {
    grid-template-columns: 1fr;
  }
}
</style>