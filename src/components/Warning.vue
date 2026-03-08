<template>
  <div class="warning-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 style="margin: 0; color: #2e7d32">预警中心</h3>
              <div>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleAllWarnings"
                >
                  <i class="fas fa-exclamation-circle"></i> 全部预警 ({{
                    totalWarnings
                  }})
                </el-button>
                <el-button type="primary" size="small"
                  ><i class="fas fa-cog"></i> 预警设置</el-button
                >
              </div>
            </div>
          </template>
          <div>
            <el-table :data="warningList" style="width: 100%">
              <el-table-column prop="time" label="时间" width="180">
                <template #default="scope"
                  ><i class="fas fa-clock"></i> {{ scope.row.time }}</template
                >
              </el-table-column>
              <el-table-column prop="location" label="位置" width="150">
                <template #default="scope"
                  ><i class="fas fa-map-marker-alt"></i>
                  {{ scope.row.location }}</template
                >
              </el-table-column>
              <el-table-column prop="type" label="预警类型">
                <template #default="scope"
                  ><el-tag
                    :type="getWarningType(scope.row.level)"
                    size="small"
                    >{{ scope.row.type }}</el-tag
                  ></template
                >
              </el-table-column>
              <el-table-column
                prop="description"
                label="描述"
              ></el-table-column>
              <el-table-column prop="level" label="等级" width="100">
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
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button
                    size="small"
                    @click="handleWarningDetail(scope.row)"
                    >详情</el-button
                  >
                  <el-button
                    size="small"
                    type="success"
                    @click="handleWarningConfirm(scope.row)"
                    >处理</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <el-row :gutter="20" class="mt-4">
              <el-col :span="12">
                <el-card>
                  <template #header
                    ><div class="chart-header">
                      <i class="fas fa-chart-pie"></i> 预警类型分布
                    </div></template
                  >
                  <div class="chart-container" id="warningTypeChart" style="height: 280px;"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header
                    ><div class="chart-header">
                      <i class="fas fa-chart-line"></i> 预警趋势
                    </div></template
                  >
                  <div class="chart-container" id="warningTrendChart" style="height: 280px;"></div>
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
//引进图表库，加生命周期
import { inject,onMounted,onUnmounted } from "vue";
import*as echarts from "echarts";

const warningList = inject("warningList");
const totalWarnings = inject("totalWarnings");
const getWarningType = inject("getWarningType");
const handleAllWarnings = inject("handleAllWarnings");
const handleWarningDetail = inject("handleWarningDetail");
const handleWarningConfirm = inject("handleWarningConfirm");
//图表实例
let warningTypeChart = null;
let warningTrendChart = null;
//页面加载，离开()
onMounted(() => {
  setTimeout(() => {
    initWarningTypeChart();
    initWarningTrendChart();
  }, 300); 
})
onUnmounted(() => {
  warningTypeChart.dispose();
  warningTrendChart.dispose();  
})
// 1. 预警类型分布
function initWarningTypeChart() {
  const dom = document.getElementById("warningTypeChart");
  if (!dom) return;

  // 先销毁旧的（防止重复）
  if (warningTypeChart) warningTypeChart.dispose();

  // 创建图表
  warningTypeChart = echarts.init(dom);

  // 设置数据
  warningTypeChart.setOption({
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        data: [
          { name: "高温", value: 12 },
          { name: "湿度异常", value: 25 },
          { name: "氨气超标", value: 8 },
          { name: "正常", value: 55 },
        ],
      },
    ],
  });
}

// 2. 预警趋势
function initWarningTrendChart() {
  const dom = document.getElementById("warningTrendChart");
  if (!dom) return;

  if (warningTrendChart) warningTrendChart.dispose();

  warningTrendChart = echarts.init(dom);
  warningTrendChart.setOption({
    xAxis: { data: ["0点", "4点", "8点", "12点", "16点", "20点", "24点"] },
    yAxis: {},
    series: [
      {
        type: "line",
        data: [2, 5, 3, 9, 6, 14, 7],
        smooth: true,
      },
    ],
  });
}
</script>

<style scoped></style>
