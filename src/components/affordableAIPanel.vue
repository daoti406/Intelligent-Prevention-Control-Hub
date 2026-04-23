<template>
  <div class="affordable-ai-panel">
    <!-- mmcow视觉AI功能引导区 -->
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-icon">
          <i class="el-icon-star"></i>
        </div>
        <div class="welcome-content">
          <h3>mmcow视觉AI智能监测系统</h3>
          <p>专为中小养殖场设计，用AI技术替代昂贵传感器</p>
          <div class="benefit-tags">
            <span class="tag cost-saving">成本降低70%</span>
            <span class="tag easy-use">零技术门槛</span>
            <span class="tag efficient">一键部署</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速启动向导 -->
    <div class="quick-start-wizard">
      <h4>快速开始您的AI监测之旅</h4>
      <div class="wizard-steps">
        <div class="step" :class="{ active: activeStep >= 1, completed: activeStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-content">
            <h5>上传样本照片</h5>
            <p>每种动物状态提供3-5张照片</p>
            <div v-if="activeStep === 1" class="step-action">
              <el-upload
                class="sample-upload"
                action="#"
                :on-change="handleSampleUpload"
                :show-file-list="false"
                :auto-upload="false"
              >
                <el-button type="primary" size="small">选择照片</el-button>
              </el-upload>
            </div>
          </div>
        </div>

        <div class="step" :class="{ active: activeStep >= 2, completed: activeStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-content">
            <h5>AI模型训练</h5>
            <p>系统自动训练个性化识别模型</p>
            <div v-if="activeStep === 2" class="step-action">
              <el-button 
                type="success" 
                :loading="isTraining"
                @click="startTraining"
              >
                {{ isTraining ? '训练中...' : '开始训练' }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="step" :class="{ active: activeStep >= 3, completed: activeStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-content">
            <h5>实时监测</h5>
            <p>享受AI带来的精准健康监测</p>
            <div v-if="activeStep === 3" class="step-action">
              <el-button type="warning" @click="startMonitoring">
                开启监测
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI能力展示区 -->
    <div class="ai-capabilities">
      <h4>AI视觉识别能力</h4>
      <div class="capability-grid">
        <div class="capability-item">
          <div class="capability-icon temperature">
            <i class="el-icon-thermometer"></i>
          </div>
          <h5>体温监测</h5>
          <p>通过视觉特征分析估算动物体温，替代红外传感器</p>
          <div class="accuracy">准确率: 87%</div>
        </div>

        <div class="capability-item">
          <div class="capability-icon behavior">
            <i class="el-icon-video-play"></i>
          </div>
          <h5>行为分析</h5>
          <p>识别异常行为模式，早期预警疾病风险</p>
          <div class="accuracy">准确率: 92%</div>
        </div>

        <div class="capability-item">
          <div class="capability-icon disease">
            <i class="el-icon-first-aid-kit"></i>
          </div>
          <h5>疾病识别</h5>
          <p>基于小样本学习，快速识别常见疾病</p>
          <div class="accuracy">准确率: 85%</div>
        </div>

        <div class="capability-item">
          <div class="capability-icon density">
            <i class="el-icon-data-analysis"></i>
          </div>
          <h5>密度监测</h5>
          <p>实时统计牲畜数量，优化饲养密度</p>
          <div class="accuracy">准确率: 95%</div>
        </div>
      </div>
    </div>

    <!-- 成本对比展示 -->
    <CostBenefit class="cost-benefit-section" />

    <!-- 用户反馈和案例 -->
    <div class="user-testimonials">
      <h4>用户真实反馈</h4>
      <div class="testimonials-grid">
        <div class="testimonial">
          <div class="quote">"以前要装几十个传感器，现在一个摄像头全搞定，太省心了！"</div>
          <div class="user-info">
            <span class="farm-name">李老板 · 小型肉牛养殖场</span>
            <span class="savings">月省 ¥2,800</span>
          </div>
        </div>

        <div class="testimonial">
          <div class="quote">"AI学习很快，只用几张照片就能识别我们羊场的特殊品种。"</div>
          <div class="user-info">
            <span class="farm-name">张阿姨 · 特色山羊养殖</span>
            <span class="savings">设备投资减70%</span>
          </div>
        </div>

        <div class="testimonial">
          <div class="quote">"零技术基础也能用，系统自动提醒异常情况，再也不用半夜跑猪圈了。"</div>
          <div class="user-info">
            <span class="farm-name">王师傅 · 家庭养猪场</span>
            <span class="savings">人力节省60%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CostBenefit from './CostBenefit.vue'

export default {
  name: 'AffordableAIPanel',
  components: {
    CostBenefit
  },
  data() {
    return {
      activeStep: 1,
      isTraining: false,
      uploadedSamples: 0,
      trainingProgress: 0
    }
  },
  methods: {
    handleSampleUpload(file, fileList) {
      this.uploadedSamples = fileList.length
      if (fileList.length >= 3) {
        this.activeStep = 2
      }
    },
    
    async startTraining() {
      this.isTraining = true
      
      // 模拟训练过程
      for (let i = 0; i <= 100; i += 10) {
        this.trainingProgress = i
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      this.isTraining = false
      this.activeStep = 3
    },
    
    startMonitoring() {
      this.$emit('start-monitoring')
      this.$message.success('AI监测系统已启动，开始守护您的养殖场！')
    }
  }
}
</script>

<style scoped>
.affordable-ai-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-card {
  background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%);
  color: white;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 30px rgba(46, 125, 50, 0.3);
}

.welcome-icon {
  font-size: 48px;
  margin-right: 20px;
}

.welcome-content h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.welcome-content p {
  margin: 0 0 15px 0;
  opacity: 0.9;
}

.benefit-tags {
  display: flex;
  gap: 10px;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag.cost-saving { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
.tag.easy-use { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
.tag.efficient { background: rgba(33, 150, 243, 0.2); color: #2196f3; }

.quick-start-wizard {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
}

.quick-start-wizard h4 {
  margin-bottom: 20px;
  color: #333;
}

.wizard-steps {
  display: grid;
  gap: 20px;
}

.step {
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #2196f3;
  color: white;
}

.step.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-content h5 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.step-content p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.ai-capabilities {
  margin-bottom: 40px;
}

.ai-capabilities h4 {
  margin-bottom: 20px;
  color: #333;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.capability-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.capability-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.capability-icon {
  font-size: 36px;
  margin-bottom: 15px;
}

.capability-icon.temperature { color: #ff6b6b; }
.capability-icon.behavior { color: #4ecdc4; }
.capability-icon.disease { color: #45b7d1; }
.capability-icon.density { color: #96ceb4; }

.capability-item h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.capability-item p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.accuracy {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.cost-benefit-section {
  margin-bottom: 40px;
}

.user-testimonials h4 {
  margin-bottom: 20px;
  color: #333;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.testimonial {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.testimonial::before {
  content: '"';
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 40px;
  color: #e0e0e0;
  font-family: serif;
}

.quote {
  font-style: italic;
  margin-bottom: 15px;
  padding-left: 30px;
  line-height: 1.5;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.farm-name {
  color: #666;
}

.savings {
  background: #fff3cd;
  color: #856404;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .affordable-ai-panel {
    padding: 10px;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .benefit-tags {
    justify-content: center;
  }
  
  .capability-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}
</style>