<template>
  <div class="warning-container">
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card class="warning-card">
          <template #header>
            <div class="header-bar">
              <h3 class="page-title">预警中心</h3>
              <div class="header-actions">
                <el-button type="danger" size="small" @click="handleAllWarnings">
                  <i class="fas fa-exclamation-circle"></i>
                  全部预警 ({{ totalWarnings }})
                </el-button>
                <el-button type="primary" size="small">
                  <i class="fas fa-cog"></i>
                  预警设置
                </el-button>
              </div>
            </div>
          </template>

          <div class="filter-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索预警类型、位置或描述"
              clearable
              size="small"
              class="filter-input"
            />
            <el-select
              v-model="selectedStatus"
              placeholder="按状态筛选"
              clearable
              size="small"
              class="filter-select"
            >
              <el-option
                v-for="status in statusOptions"
                :key="status"
                :label="status"
                :value="status"
              />
            </el-select>
            <div class="filter-summary">
              当前显示 {{ filteredWarnings.length }} / {{ warningList.length }} 条
            </div>
          </div>

          <div class="warning-table-wrap">
            <el-table
              ref="warningTableRef"
              :data="filteredWarnings"
              size="small"
              class="warning-table"
              @expand-change="handleExpandChange"
            >
              <el-table-column type="expand" width="48">
                <template #default="scope">
                  <div class="description-panel">
                    <div class="description-title">预警描述</div>
                    <div class="description-content">
                      {{ scope.row.description }}
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="time" label="时间" width="150">
                <template #default="scope">
                  <i class="fas fa-clock"></i>
                  {{ scope.row.time }}
                </template>
              </el-table-column>

              <el-table-column prop="location" label="位置" width="126">
                <template #default="scope">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ scope.row.location }}
                </template>
              </el-table-column>

              <el-table-column prop="type" label="预警类型" min-width="150">
                <template #default="scope">
                  <el-tag
                    size="small"
                    effect="light"
                    :class="['warning-type-tag', getWarningTypeClass(scope.row.type)]"
                  >
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="描述" width="98" align="center">
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    @click="toggleDescription(scope.row)"
                  >
                    {{ isRowExpanded(scope.row.id) ? "收起" : "查看" }}
                  </el-button>
                </template>
              </el-table-column>

              <el-table-column prop="level" label="等级" width="84" align="center">
                <template #default="scope">
                  <span :class="'status-' + scope.row.level" class="status-tag">
                    {{
                      scope.row.level === "high"
                        ? "高危"
                        : scope.row.level === "medium"
                          ? "中危"
                          : "低危"
                    }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column prop="status" label="状态" width="96" align="center">
                <template #default="scope">
                  <el-tag :type="getWarningStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="110" align="center">
                <template #default="scope">
                  <div class="action-group">
                    <el-button
                      size="small"
                      link
                      type="primary"
                      @click="handleWarningDetail(scope.row)"
                    >
                      详情
                    </el-button>
                    <el-button
                      size="small"
                      link
                      type="success"
                      :disabled="scope.row.status === '已处理'"
                      @click="handleWarningConfirm(scope.row)"
                    >
                      处理
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty
            v-if="!filteredWarnings.length"
            description="暂无符合筛选条件的预警"
            class="warning-empty"
          />

          <el-row :gutter="16" class="mt-4">
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <i class="fas fa-chart-pie"></i>
                    预警类型分布
                  </div>
                </template>
                <div id="warningTypeChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <i class="fas fa-chart-line"></i>
                    预警趋势
                  </div>
                </template>
                <div id="warningTrendChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";

const warningList = inject("warningList");
const totalWarnings = inject("totalWarnings");
const handleAllWarnings = inject("handleAllWarnings");
const handleWarningDetail = inject("handleWarningDetail");
const handleWarningConfirm = inject("handleWarningConfirm");
const activeIndex = inject("activeIndex");

const searchKeyword = ref("");
const selectedStatus = ref("");
const statusOptions = ["待处理", "处理中", "已处理"];
const warningTableRef = ref(null);
const expandedRowIds = ref([]);

const filteredWarnings = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return warningList.value.filter((warning) => {
    const matchesStatus =
      !selectedStatus.value || warning.status === selectedStatus.value;
    const matchesKeyword =
      !keyword ||
      [warning.type, warning.location, warning.description, warning.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));

    return matchesStatus && matchesKeyword;
  });
});

const getWarningStatusType = (status) => {
  if (status === "已处理") return "success";
  if (status === "处理中") return "warning";
  return "danger";
};

const getWarningTypeClass = (type) => {
  if (type.includes("温度")) return "warning-type-tag--temperature";
  if (type.includes("湿度")) return "warning-type-tag--humidity";
  if (type.includes("行为")) return "warning-type-tag--behavior";
  if (type.includes("进食")) return "warning-type-tag--feeding";
  if (type.includes("空气")) return "warning-type-tag--air";
  return "warning-type-tag--default";
};

const isRowExpanded = (id) => expandedRowIds.value.includes(id);

const toggleDescription = (row) => {
  warningTableRef.value?.toggleRowExpansion(row, !isRowExpanded(row.id));
};

const handleExpandChange = (_row, expandedRows) => {
  expandedRowIds.value = expandedRows.map((item) => item.id);
};

let warningTypeChart = null;
let warningTrendChart = null;

onMounted(() => {
  setTimeout(() => {
    initWarningTypeChart();
    initWarningTrendChart();
  }, 300);
});

onUnmounted(() => {
  warningTypeChart?.dispose();
  warningTrendChart?.dispose();
});

watch(
  () => activeIndex.value,
  (newIndex) => {
    if (newIndex === "warning") {
      setTimeout(() => {
        initWarningTypeChart();
        initWarningTrendChart();
      }, 100);
    }
  },
);

function initWarningTypeChart() {
  const dom = document.getElementById("warningTypeChart");
  if (!dom) return;

  warningTypeChart?.dispose();
  warningTypeChart = echarts.init(dom);
  warningTypeChart.setOption({
    color: ["#2e7d32", "#4caf50", "#66bb6a", "#a5d6a7"],
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, left: "center" },
    series: [
      {
        name: "预警类型",
        type: "pie",
        radius: ["52%", "72%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: "高温预警", value: 12 },
          { name: "湿度异常", value: 25 },
          { name: "空气质量异常", value: 8 },
          { name: "行为异常", value: 14 },
        ],
      },
    ],
  });
}

function initWarningTrendChart() {
  const dom = document.getElementById("warningTrendChart");
  if (!dom) return;

  warningTrendChart?.dispose();
  warningTrendChart = echarts.init(dom);
  warningTrendChart.setOption({
    tooltip: { trigger: "axis" },
    grid: { left: "4%", right: "4%", bottom: "4%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["0点", "4点", "8点", "12点", "16点", "20点", "24点"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "预警数量",
        type: "line",
        smooth: true,
        lineStyle: { width: 3, color: "#2e7d32" },
        showSymbol: false,
        areaStyle: {
          opacity: 0.25,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(46, 125, 50, 0.35)" },
            { offset: 1, color: "rgba(46, 125, 50, 0)" },
          ]),
        },
        data: [2, 5, 3, 9, 6, 14, 7],
      },
    ],
  });
}
</script>

<style scoped>
.warning-container {
  width: 100%;
  min-width: 0;
  padding-right: 8px;
  box-sizing: border-box;
}

.warning-card {
  width: 100%;
  max-width: 100%;
}

:deep(.warning-card .el-card__body) {
  overflow: hidden;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  color: #2e7d32;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 150px;
}

.filter-summary {
  color: #606266;
  font-size: 13px;
}

.warning-table-wrap {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
}

.warning-table {
  min-width: 900px;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.warning-empty {
  padding-top: 12px;
}

.description-panel {
  padding: 8px 16px;
  background: #f8fbf8;
  border-left: 3px solid #67c23a;
  border-radius: 8px;
}

.description-title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
}

.description-content {
  color: #606266;
  line-height: 1.7;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  height: 280px;
}

.warning-type-tag {
  display: inline-flex;
  align-items: center;
  border-width: 1px;
  border-style: solid;
  font-weight: 600;
  white-space: nowrap;
  font-size: 12px;
}

.warning-type-tag--temperature {
  color: #1f7a45;
  background: linear-gradient(135deg, #eef9f0 0%, #d7f1dd 100%);
  border-color: #88c999;
}

.warning-type-tag--humidity {
  color: #1d6f5f;
  background: linear-gradient(135deg, #edf9f6 0%, #d4f0e9 100%);
  border-color: #7ecab9;
}

.warning-type-tag--behavior {
  color: #3e7f2f;
  background: linear-gradient(135deg, #f4faeb 0%, #e3f3cc 100%);
  border-color: #a8cf75;
}

.warning-type-tag--feeding {
  color: #4b7a2a;
  background: linear-gradient(135deg, #f7fbe9 0%, #e7f2c7 100%);
  border-color: #b8d36f;
}

.warning-type-tag--air {
  color: #216c52;
  background: linear-gradient(135deg, #eefaf4 0%, #d5efdf 100%);
  border-color: #84c6a0;
}

.warning-type-tag--default {
  color: #2e7d32;
  background: linear-gradient(135deg, #f1faef 0%, #def2dc 100%);
  border-color: #9acd9e;
}

@media (max-width: 1200px) {
  .warning-table {
    min-width: 840px;
  }
}

@media (max-width: 768px) {
  .warning-container {
    padding-right: 0;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .warning-table {
    min-width: 760px;
  }

  .action-group {
    gap: 4px;
  }
}
</style>
