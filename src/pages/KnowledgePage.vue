<template>
  <div class="knowledge-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>📚 防疫知识库</h2>
      <p>专业的畜禽防疫知识与技术指导</p>
    </div>

    <!-- 搜索与操作栏 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索知识..."
              style="width: 300px; margin-right: 10px"
              @keyup.enter="searchKnowledge"
              clearable
            />
            <el-button type="primary" @click="searchKnowledge">
              <i class="fas fa-search"></i> 搜索
            </el-button>
            <el-button type="success" @click="addKnowledge">
              <i class="fas fa-plus"></i> 新增知识
            </el-button>
          </div>
          
          <!-- 分类标签 -->
          <div class="category-tags">
            <el-tag
              v-for="cat in categories"
              :key="cat"
              :type="selectedCategory === cat ? 'primary' : 'info'"
              @click="selectedCategory = cat"
              style="cursor: pointer; margin-right: 8px; margin-top: 8px"
            >
              {{ cat }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 知识卡片网格 -->
    <el-row :gutter="20">
      <el-col :span="8" v-for="item in filteredKnowledgeList" :key="item.id">
        <el-card class="knowledge-card" @click="viewKnowledge(item)">
          <template #header>
            <div class="knowledge-header">
              <span class="knowledge-title">{{ item.title }}</span>
              <el-tag :type="getCategoryType(item.category)" size="small">
                {{ item.category }}
              </el-tag>
            </div>
          </template>
          <div class="knowledge-content">
            <p class="knowledge-description">{{ item.description }}</p>
            <div class="knowledge-meta">
              <span class="meta-item">
                <i class="fas fa-calendar"></i> {{ item.date }}
              </span>
              <span class="meta-item">
                <i class="fas fa-eye"></i> {{ item.views }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 知识详情对话框 -->
    <el-dialog v-model="showDetailDialog" :title="selectedKnowledge?.title" width="70%">
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div class="detail-header">
          <el-tag :type="getCategoryType(selectedKnowledge.category)">
            {{ selectedKnowledge.category }}
          </el-tag>
          <span class="detail-date">{{ selectedKnowledge.date }}</span>
          <span class="detail-views">
            <i class="fas fa-eye"></i> {{ selectedKnowledge.views }}
          </span>
        </div>
        <div class="detail-content">
          <h3>{{ selectedKnowledge.title }}</h3>
          <p>{{ selectedKnowledge.fullContent }}</p>
        </div>
        <div class="detail-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="shareKnowledge">
            <i class="fas fa-share"></i> 分享
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

const searchKeyword = ref("");
const selectedCategory = ref("全部");
const showDetailDialog = ref(false);
const selectedKnowledge = ref(null);

const categories = ref([
  "全部",
  "疾病防控",
  "饲养管理",
  "营养饲料",
  "环境控制",
  "免疫预防",
  "应急处理",
  "法律法规",
]);

const knowledgeList = ref([
  // 疾病防控类
  {
    id: 1,
    title: "非洲猪瘟防控指南",
    description: "详细介绍非洲猪瘟的症状、传播途径和防控措施...",
    fullContent: "非洲猪瘟是一种急性、烈性传染病，对养猪业造成严重威胁。本指南详细介绍了该病的症状特征、传播途径、诊断方法和防控措施。关键防控措施包括：建立完善的生物安全体系、加强饲养管理、定期消毒、及时隔离疑似病猪等。",
    category: "疾病防控",
    date: "2026-03-01",
    views: 1250,
  },
  {
    id: 2,
    title: "禽流感防控知识",
    description: "禽流感的识别、预防和应急处理方案...",
    fullContent: "禽流感是由禽流感病毒引起的急性传染病。本知识介绍了禽流感的临床症状、诊断方法、防控措施和应急处理流程。预防重点包括：加强饲养管理、提高饲料营养水平、定期免疫接种、做好环境卫生等。",
    category: "疾病防控",
    date: "2026-02-28",
    views: 980,
  },
  {
    id: 3,
    title: "口蹄疫防控措施",
    description: "口蹄疫的症状识别与防控方案...",
    fullContent: "口蹄疫是一种高度接触传染性疾病。本指南详细说明了口蹄疫的临床表现、诊断标准、防控措施和应急预案。防控重点包括：建立隔离饲养区、加强消毒、及时免疫、建立应急预案等。",
    category: "疾病防控",
    date: "2026-02-25",
    views: 756,
  },
  {
    id: 4,
    title: "呼吸道疾病防控",
    description: "畜禽呼吸道疾病的预防与治疗...",
    fullContent: "呼吸道疾病是养殖场常见的多发病。本知识介绍了常见呼吸道疾病的病因、症状、诊断和防控方法。预防措施包括：改善饲养环境、加强通风、控制饲养密度、定期消毒等。",
    category: "疾病防控",
    date: "2026-02-20",
    views: 1120,
  },
  {
    id: 5,
    title: "寄生虫病防控指南",
    description: "内外寄生虫的识别与防控...",
    fullContent: "寄生虫病严重影响畜禽生长发育和生产性能。本指南介绍了常见的内外寄生虫病、症状表现、诊断方法和防控措施。防控重点包括：定期驱虫、环境卫生、饲料卫生等。",
    category: "疾病防控",
    date: "2026-02-18",
    views: 845,
  },

  // 饲养管理类
  {
    id: 6,
    title: "现代化养猪场管理",
    description: "养猪场的科学管理与运营方案...",
    fullContent: "现代化养猪场需要科学的管理体系。本知识涵盖了养猪场的规划设计、饲养管理、卫生防疫、人员管理等方面。重点包括：制定合理的饲养制度、建立完善的记录系统、加强员工培训等。",
    category: "饲养管理",
    date: "2026-02-15",
    views: 1340,
  },
  {
    id: 7,
    title: "蛋鸡饲养管理技术",
    description: "蛋鸡的全程饲养管理指南...",
    fullContent: "蛋鸡饲养需要精细化管理。本指南详细介绍了蛋鸡的育雏、育成、产蛋期的饲养管理技术，包括温度控制、光照管理、饲料配置等。",
    category: "饲养管理",
    date: "2026-02-12",
    views: 1050,
  },
  {
    id: 8,
    title: "肉牛饲养管理规范",
    description: "肉牛的科学饲养与管理方法...",
    fullContent: "肉牛饲养管理关系到生产效益。本知识介绍了肉牛的选种、饲养、疾病防控等全过程管理技术。",
    category: "饲养管理",
    date: "2026-02-10",
    views: 920,
  },

  // 营养饲料类
  {
    id: 9,
    title: "猪饲料配方设计",
    description: "科学的饲料配方与营养平衡...",
    fullContent: "合理的饲料配方是提高生产效益的关键。本指南介绍了饲料配方设计的原理、方法和实践案例。",
    category: "营养饲料",
    date: "2026-02-08",
    views: 1180,
  },
  {
    id: 10,
    title: "家禽饲料营养需求",
    description: "不同生长阶段的营养需求分析...",
    fullContent: "家禽在不同生长阶段对营养的需求不同。本知识详细说明了各阶段的营养需求标准和饲料配置方案。",
    category: "营养饲料",
    date: "2026-02-05",
    views: 876,
  },
  {
    id: 11,
    title: "饲料添加剂使用指南",
    description: "常用饲料添加剂的选择与使用...",
    fullContent: "饲料添加剂可以改善饲料品质和动物生产性能。本指南介绍了常用添加剂的种类、作用和使用方法。",
    category: "营养饲料",
    date: "2026-02-03",
    views: 745,
  },

  // 环境控制类
  {
    id: 12,
    title: "养殖场环境控制技术",
    description: "温度、湿度、通风的科学控制...",
    fullContent: "良好的饲养环境对动物健康至关重要。本知识介绍了养殖场环境的各项指标、控制方法和监测技术。",
    category: "环境控制",
    date: "2026-02-01",
    views: 1090,
  },
  {
    id: 13,
    title: "养殖场消毒规程",
    description: "科学的消毒方案与实施方法...",
    fullContent: "消毒是防疫的重要环节。本指南介绍了常用消毒剂、消毒方法和消毒规程。",
    category: "环境控制",
    date: "2026-01-30",
    views: 1240,
  },

  // 免疫预防类
  {
    id: 14,
    title: "畜禽免疫程序制定",
    description: "科学的免疫程序与疫苗选择...",
    fullContent: "合理的免疫程序是防疫的基础。本知识介绍了免疫程序的制定原则、常用疫苗和免疫方法。",
    category: "免疫预防",
    date: "2026-01-28",
    views: 1320,
  },
  {
    id: 15,
    title: "疫苗冷链管理",
    description: "疫苗的储存、运输与使用规范...",
    fullContent: "疫苗冷链管理直接影响免疫效果。本指南详细说明了疫苗的储存温度、运输方式和使用规范。",
    category: "免疫预防",
    date: "2026-01-25",
    views: 890,
  },

  // 应急处理类
  {
    id: 16,
    title: "养殖场应急预案制定",
    description: "疫病爆发时的应急处理流程...",
    fullContent: "完善的应急预案可以有效控制疫病传播。本知识介绍了应急预案的内容、制定方法和演练要求。",
    category: "应急处理",
    date: "2026-01-23",
    views: 1050,
  },
  {
    id: 17,
    title: "疫病爆发应急处理",
    description: "疫病爆发时的应对措施...",
    fullContent: "疫病爆发时需要迅速有效的应对。本指南介绍了应急处理的步骤、措施和注意事项。",
    category: "应急处理",
    date: "2026-01-20",
    views: 1170,
  },

  // 法律法规类
  {
    id: 18,
    title: "动物防疫法规解读",
    description: "国家动物防疫法律法规要点...",
    fullContent: "了解和遵守动物防疫法规是养殖场的法律义务。本知识介绍了主要的法律法规和要求。",
    category: "法律法规",
    date: "2026-01-18",
    views: 756,
  },
  {
    id: 19,
    title: "养殖场许可证办理指南",
    description: "养殖场办证流程与要求...",
    fullContent: "养殖场需要获得相关许可证才能合法运营。本指南介绍了办证流程、所需材料和注意事项。",
    category: "法律法规",
    date: "2026-01-15",
    views: 620,
  },
]);

const filteredKnowledgeList = computed(() => {
  let filtered = knowledgeList.value;

  if (selectedCategory.value !== "全部") {
    filtered = filtered.filter((item) => item.category === selectedCategory.value);
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );
  }

  return filtered;
});

const getCategoryType = (category) => {
  const types = {
    "疾病防控": "danger",
    "饲养管理": "warning",
    "营养饲料": "success",
    "环境控制": "info",
    "免疫预防": "primary",
    "应急处理": "warning",
    "法律法规": "info",
  };
  return types[category] || "info";
};

const searchKnowledge = () => {
  ElMessage.info(`搜索关键词: ${searchKeyword.value || "全部"}`);
};

const addKnowledge = () => {
  ElMessage.info("新增知识功能开发中");
};

const viewKnowledge = (item) => {
  selectedKnowledge.value = item;
  showDetailDialog.value = true;
};

const shareKnowledge = () => {
  ElMessage.success("已复制分享链接到剪贴板");
};
</script>

<style scoped>
.knowledge-container {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.knowledge-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.knowledge-card :deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.knowledge-title {
  font-weight: 600;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.knowledge-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-description {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.knowledge-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-date {
  font-size: 12px;
  color: #999;
}

.detail-views {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.detail-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1024px) {
  .knowledge-container :deep(.el-col) {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 18px;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar :deep(.el-input) {
    width: 100% !important;
  }
}
</style>
