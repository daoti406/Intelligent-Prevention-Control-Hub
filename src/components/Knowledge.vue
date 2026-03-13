<template>
  <div class="knowledge-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">防疫知识库</h3>
              <div>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索防疫知识..."
                  size="small"
                  style="width: 200px; margin-right: 10px"
                  @keyup.enter="searchKnowledge"
                >
                  <template #prefix><i class="fas fa-search"></i></template>
                </el-input>
                <el-button type="success" size="small" @click="syncOfficialData" :loading="syncing">
                  <i class="fas fa-sync"></i> 同步官方数据
                </el-button>
                <el-button type="primary" size="small" @click="addKnowledge">
                  <i class="fas fa-plus"></i> 新增知识
                </el-button>
              </div>
            </div>
          </template>
          <div>
            <el-row :gutter="20" v-if="knowledgeList && knowledgeList.length > 0">
              <el-col
                :span="6"
                v-for="(item, index) in knowledgeList"
                :key="index"
              >
                <el-card shadow="hover" class="knowledge-card">
                  <template #header>
                    <div class="flex justify-between items-center">
                      <span style="font-weight: bold">{{ item.title }}</span>
                      <el-tag
                        size="small"
                        :type="item.type === 'disease' ? 'danger' : 'success'"
                      >
                        {{ item.type === "disease" ? "疾病防治" : "养殖技术" }}
                      </el-tag>
                    </div>
                  </template>
                  <div
                    style="font-size: 13px; color: #666; margin-bottom: 10px"
                  >
                    {{ item.description }}
                  </div>
                  <div
                    class="flex justify-between"
                    style="font-size: 12px; color: #999"
                  >
                    <span
                      ><i class="fas fa-calendar-alt"></i> {{ item.date }}</span
                    >
                    <span><i class="fas fa-eye"></i> {{ item.views }}</span>
                  </div>
                  <div class="mt-3">
                    <el-button
                      size="small"
                      type="primary"
                      @click="viewKnowledge(item)"
                      >查看详情</el-button
                    >
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <div v-else style="text-align: center; padding: 40px; color: #909399;">
              <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block; color: #c0c4cc;"></i>
              <p>暂无防疫知识数据，请点击"同步官方数据"按钮加载</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 知识详情 Dialog -->
    <el-dialog v-model="dialogVisible" :title="selectedKnowledge?.title" width="70%" @close="dialogClose" destroy-on-close>
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div v-if="selectedKnowledge.content" v-html="selectedKnowledge.content" class="detail-content"></div>
        <div v-else style="text-align: center; color: #909399; padding: 20px;">
          <p>暂无详细内容</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { inject } from "vue";

const knowledgeList = inject("knowledgeList");
const searchKeyword = inject("searchKeyword");
const searchKnowledge = inject("searchKnowledge");
const addKnowledge = inject("addKnowledge");
const viewKnowledge = inject("viewKnowledge");
const syncOfficialData = inject("syncOfficialData");
const syncing = inject("syncing");
const dialogVisible = inject("dialogVisible");
const selectedKnowledge = inject("selectedKnowledge");
const dialogClose = inject("dialogClose");
</script>

<style scoped>
.knowledge-detail {
  padding: 20px 0;
}
.detail-content {
  line-height: 1.8;
  color: #333;
}
.detail-content h3 {
  color: #2e7d32;
  margin-top: 20px;
  margin-bottom: 10px;
}
.detail-content h4 {
  color: #52c41a;
  margin-top: 15px;
  margin-bottom: 8px;
}
.detail-content p {
  margin-bottom: 10px;
}
.detail-content ul, .detail-content ol {
  margin-left: 20px;
  margin-bottom: 10px;
}
.detail-content li {
  margin-bottom: 5px;
}
.detail-content strong {
  color: #2e7d32;
}
</style>
