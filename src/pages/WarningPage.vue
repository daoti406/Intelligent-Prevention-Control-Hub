<template>
  <div class="warning-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #ff4d4f">预警管理中心</h3>
              <div>
                <el-button type="danger" size="small" @click="handleAllWarnings">
                  <i class="fas fa-bell"></i> 全部预警 ({{ totalWarnings }})
                </el-button>
              </div>
            </div>
          </template>
          <el-table :data="warningList" stripe>
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="location" label="位置" width="150" />
            <el-table-column prop="type" label="预警类型" width="120" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getWarningType(row.level)">
                  {{ row.level === "high" ? "高" : row.level === "medium" ? "中" : "低" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleWarningDetail(row)"
                >
                  详情
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="handleWarningConfirm(row)"
                >
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getWarnings } from "../services/dataService";

const warningList = ref(getWarnings());
const totalWarnings = ref(warningList.value.length);

const getWarningType = (level) => {
  switch (level) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "";
  }
};

const handleAllWarnings = () => {
  ElMessage.info(`当前共有${totalWarnings.value}条预警信息`);
};

const handleWarningDetail = (row) => {
  ElMessageBox.alert(
    `<div style="line-height:1.6;">
      <p><strong>位置：</strong>${row.location}</p>
      <p><strong>时间：</strong>${row.time}</p>
      <p><strong>类型：</strong>${row.type}</p>
      <p><strong>描述：</strong>${row.description}</p>
      <p><strong>级别：</strong>${row.level}</p>
    </div>`,
    "预警详情",
    {
      dangerouslyUseHTMLString: true,
    }
  );
};

const handleWarningConfirm = (row) => {
  ElMessageBox.confirm(`确认处理"${row.type}"预警？`, "处理预警", {
    confirmButtonText: "确认处理",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      warningList.value = warningList.value.filter((item) => item.id !== row.id);
      totalWarnings.value = warningList.value.length;
      ElMessage.success("预警已处理");
    })
    .catch(() => {});
};
</script>

<style scoped>
.warning-container {
  width: 100%;
}
</style>
