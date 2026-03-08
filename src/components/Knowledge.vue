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
                <el-button type="primary" size="small" @click="addKnowledge"
                  ><i class="fas fa-plus"></i> 新增知识</el-button
                >
              </div>
            </div>
          </template>
          <div>
            <el-row :gutter="20">
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
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject } from "vue";

const knowledgeList = inject("knowledgeList");
const searchKeyword = inject("searchKeyword");
const searchKnowledge = inject("searchKnowledge");
const addKnowledge = inject("addKnowledge");
const viewKnowledge = inject("viewKnowledge");
</script>

<style scoped></style>
