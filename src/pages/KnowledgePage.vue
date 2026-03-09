<template>
  <div class="knowledge-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">防疫知识库</h3>
              <div>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索知识..."
                  style="width: 200px; margin-right: 10px"
                  @keyup.enter="searchKnowledge"
                />
                <el-button type="primary" size="small" @click="searchKnowledge">
                  <i class="fas fa-search"></i> 搜索
                </el-button>
                <el-button type="success" size="small" @click="addKnowledge">
                  <i class="fas fa-plus"></i> 新增
                </el-button>
              </div>
            </div>
          </template>
          <div class="knowledge-grid">
            <div
              v-for="item in knowledgeList"
              :key="item.id"
              class="knowledge-card"
            >
              <el-card shadow="hover" @click="viewKnowledge(item)">
                <template #header>
                  <div class="knowledge-header">
                    <span class="knowledge-title">{{ item.title }}</span>
                    <el-tag
                      :type="item.type === 'disease' ? 'danger' : 'info'"
                      size="small"
                    >
                      {{ item.type === "disease" ? "疾病防控" : "技术指导" }}
                    </el-tag>
                  </div>
                </template>
                <p class="knowledge-description">{{ item.description }}</p>
                <div class="knowledge-footer">
                  <span class="knowledge-date">{{ item.date }}</span>
                  <span class="knowledge-views">
                    <i class="fas fa-eye"></i> {{ item.views }}
                  </span>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="selectedKnowledge?.title" width="70%">
      <div v-if="selectedKnowledge" v-html="selectedKnowledge.content"></div>
      <template #footer>
        <el-button @click="dialogClose">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { getKnowledgeList } from "../services/dataService";

const knowledgeList = ref(getKnowledgeList());
const searchKeyword = ref("");
const dialogVisible = ref(false);
const selectedKnowledge = ref(null);

const searchKnowledge = () => {
  if (searchKeyword.value.trim()) {
    ElMessage.info(`搜索关键词: ${searchKeyword.value}`);
  }
};

const addKnowledge = () => {
  ElMessage.info("新增防疫知识功能开发中");
};

const viewKnowledge = (item) => {
  selectedKnowledge.value = item;
  dialogVisible.value = true;
};

const dialogClose = () => {
  dialogVisible.value = false;
  selectedKnowledge.value = null;
};
</script>

<style scoped>
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.knowledge-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.knowledge-card:hover {
  transform: translateY(-4px);
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.knowledge-title {
  font-weight: bold;
  flex: 1;
}

.knowledge-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 10px 0;
}

.knowledge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.knowledge-date {
  color: #999;
}

.knowledge-views {
  color: #999;
}
</style>
