<template>
  <router-view v-slot="{ Component }">
    <template v-if="isLoginRoute">
      <component :is="Component" @login-success="onLoginSuccess" />
    </template>
    <template v-else>
      <Layout
        :activeIndex="activeIndex"
        :unread-notifications="unreadNotifications"
        :is-care-mode="isCareMode"
        @toggle-care-mode="toggleCareMode"
        @select="handleSelect"
      >
        <component :is="Component" />
      </Layout>
    </template>
  </router-view>
</template>

<script setup>
import {
  ref,
  computed,
  provide,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import * as echarts from "echarts";

import Layout from "./Layout.vue";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import Monitor from "./components/Monitor.vue";
import AISentinel from "./components/AISentinel.vue";
import Warning from "./components/Warning.vue";
import Knowledge from "./components/Knowledge.vue";
import Profile from "./components/Profile.vue";
import RanchManagement from "./components/RanchManagement.vue";
import { getDashboardStats, getNotifications } from "./api/dashboard";
import { getWarnings } from "./api/warning";

const router = useRouter();
const route = useRoute();
const activeIndex = ref("dashboard");
const username = ref("用户");
const isLoginRoute = computed(() => route.path === "/login");
const dateRange = ref([]);
const searchKeyword = ref("");
const refreshSpinning = ref(false);
const isFullscreen = ref(false);
const isCareMode = ref(localStorage.getItem("careModeEnabled") === "true");

const onLoginSuccess = (user) => {
  username.value = user || "用户";
  ElMessage.success("登录成功");
};

const applyCareModeClass = (enabled) => {
  document.body.classList.toggle("care-mode", enabled);
};

const toggleCareMode = () => {
  isCareMode.value = !isCareMode.value;
  localStorage.setItem("careModeEnabled", String(isCareMode.value));
  applyCareModeClass(isCareMode.value);
  ElMessage.success(isCareMode.value ? "已开启关怀版模式" : "已关闭关怀版模式");
};

const notifications = ref([
  {
    id: 1,
    title: "A区3号棚温度异常",
    time: "10分钟前",
    type: "warning",
    status: "预警",
    read: false,
  },
  {
    id: 2,
    title: "B区健康检查完成",
    time: "1小时前",
    type: "success",
    status: "正常",
    read: true,
  },
  {
    id: 3,
    title: "防疫知识更新通知",
    time: "2小时前",
    type: "info",
    status: "信息",
    read: true,
  },
  {
    id: 4,
    title: "系统维护计划",
    time: "5小时前",
    type: "info",
    status: "通知",
    read: true,
  },
]);

const cameras = ref([
  {
    id: 1,
    name: "A区猪舍1号",
    status: "online",
    animals: 20,
    location: "A区1号棚",
    healthRate: "90%",
    warnings: 2,
    gifUrl: "/src/assets/images/猪2.gif",
  },
  {
    id: 2,
    name: "A区猪舍2号",
    status: "online",
    animals: 12,
    location: "A区2号棚",
    healthRate: "100%",
    warnings: 0,
    gifUrl: "/src/assets/images/猪.gif",
  },
  {
    id: 3,
    name: "B区鸡舍1号",
    status: "online",
    animals: 50,
    location: "B区1号棚",
    healthRate: "99%",
    warnings: 0,
    gifUrl: "/src/assets/images/鸡.gif",
  },
  {
    id: 4,
    name: "B区鸡舍2号",
    status: "online",
    animals: 50,
    location: "B区2号棚",
    healthRate: "96%",
    warnings: 3,
    gifUrl: "/src/assets/images/鸡.gif",
  },
  {
    id: 5,
    name: "C区牛舍1号",
    status: "online",
    animals: 14,
    location: "C区1号棚",
    healthRate: "85%",
    warnings: 2,
    gifUrl: "/src/assets/images/牛.gif",
  },
  {
    id: 6,
    name: "C区牛舍2号",
    status: "online",
    animals: 12,
    location: "C区2号棚",
    healthRate: "83.3%",
    warnings: 2,
    gifUrl: "/src/assets/images/牛2.gif",
  },
]);

const dataStats = ref([
  { label: "总监测数量", value: "24", type: "success" },
  { label: "异常数量", value: "5", type: "warning" },
  { label: "预警数量", value: "5", type: "error" },
  { label: "平均健康率", value: "97.8%", type: "success" },
]);

const warningList = ref([
  {
    id: 1,
    time: "2025-01-11 10:23",
    location: "A区猪舍1号",
    type: "温度异常",
    description: "温度超过阈值28°C，当前28.5°C",
    level: "medium",
    status: "待处理",
  },
  {
    id: 2,
    time: "2025-01-11 09:15",
    location: "B区鸡舍2号",
    type: "湿度异常",
    description: "湿度过低，当前45%",
    level: "low",
    status: "处理中",
  },
  {
    id: 3,
    time: "2025-01-11 08:42",
    location: "A区猪舍2号",
    type: "行为异常",
    description: "检测到多只猪只活动异常",
    level: "high",
    status: "待处理",
  },
  {
    id: 4,
    time: "2025-01-11 07:30",
    location: "C区牛舍1号",
    type: "进食异常",
    description: "进食量减少30%",
    level: "medium",
    status: "已处理",
  },
  {
    id: 5,
    time: "2025-01-10 22:15",
    location: "B区鸡舍1号",
    type: "空气质量异常",
    description: "氨气浓度超标",
    level: "high",
    status: "处理中",
  },
]);
const unreadNotifications = computed(
  () => notifications.value.filter((item) => !item.read).length,
);

const pickList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const formatPercent = (value, fallback = "0%") => {
  if (value === null || value === undefined || value === "") return fallback;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return `${numeric}%`;
};

const mapDashboardStats = (data) => {
  const source = data?.data && !Array.isArray(data.data) ? data.data : data;
  if (!source || Array.isArray(source)) return null;

  const totalMonitoring =
    source.totalMonitoring ??
    source.totalCount ??
    source.total ??
    source.monitoringCount;
  const abnormalCount =
    source.abnormalCount ?? source.exceptionCount ?? source.errorCount;
  const warningCount =
    source.warningCount ?? source.warnCount ?? source.alertCount;
  const healthRate =
    source.healthRate ?? source.avgHealthRate ?? source.averageHealthRate;

  if (
    totalMonitoring === undefined &&
    abnormalCount === undefined &&
    warningCount === undefined &&
    healthRate === undefined
  ) {
    return null;
  }

  return [
    {
      label: "总监测数量",
      value: String(totalMonitoring ?? dataStats.value[0].value),
      type: "success",
    },
    {
      label: "异常数量",
      value: String(abnormalCount ?? dataStats.value[1].value),
      type: "warning",
    },
    {
      label: "预警数量",
      value: String(warningCount ?? dataStats.value[2].value),
      type: "error",
    },
    {
      label: "平均健康率",
      value: formatPercent(healthRate, dataStats.value[3].value),
      type: "success",
    },
  ];
};

const mapNotificationItem = (item, index) => ({
  id: item.id ?? item.noticeId ?? item.messageId ?? index + 1,
  title: item.title ?? item.name ?? item.content ?? item.message ?? `通知${index + 1}`,
  time: item.time ?? item.createTime ?? item.createdAt ?? item.date ?? "刚刚",
  type:
    item.type ??
    (String(item.level ?? "").includes("警")
      ? "warning"
      : String(item.status ?? "").includes("正常")
        ? "success"
        : "info"),
  status: item.status ?? item.level ?? item.category ?? "信息",
  read: Boolean(item.read ?? item.isRead ?? item.readFlag),
});

const normalizeWarningLevel = (value) => {
  const level = String(value ?? "").toLowerCase();
  if (level.includes("high") || level.includes("高")) return "high";
  if (level.includes("low") || level.includes("低")) return "low";
  return "medium";
};

const normalizeWarningStatus = (value) => {
  const status = String(value ?? "");
  if (status.includes("已")) return "已处理";
  if (status.includes("中")) return "处理中";
  return "待处理";
};

const mapWarningItem = (item, index) => ({
  id: item.id ?? item.warningId ?? item.warnId ?? index + 1,
  time: item.time ?? item.createTime ?? item.createdAt ?? item.date ?? "",
  location: item.location ?? item.address ?? item.area ?? item.farmName ?? "未知位置",
  type: item.type ?? item.warningType ?? item.warnType ?? "异常预警",
  description: item.description ?? item.content ?? item.detail ?? "暂无描述",
  level: normalizeWarningLevel(item.level ?? item.warningLevel ?? item.warnLevel),
  status: normalizeWarningStatus(item.status ?? item.handleStatus ?? item.processStatus),
});

const knowledgeList = ref([
  {
    id: 1,
    title: "非洲猪瘟防控指南",
    type: "disease",
    description:
      "非洲猪瘟的临床症状识别、传播途径分析、生物安全防控措施及应急处置方案。",
    date: "2025-01-10",
    views: 245,
    content: `
              <h3>非洲猪瘟防控指南 (2025版)</h3>
              <p><strong>一、病原与传播</strong></p>
              <ul>
                <li>病原体：非洲猪瘟病毒（ASFV），DNA病毒。</li>
                <li>主要传播途径：直接接触感染猪或污染物（粪便、血液、饲料）、蜱虫叮咬、车辆和人员携带。</li>
              </ul>
              <p><strong>二、临床症状</strong></p>
              <ul>
                <li>急性型：高热（40-42°C）、皮肤发绀、呕吐腹泻、呼吸困难、死亡率接近100%。</li>
                <li>亚急性/慢性型：体温波动、消瘦、关节肿胀、皮肤坏死。</li>
              </ul>
              <p><strong>三、防控措施</strong></p>
              <ol>
                <li><strong>严格生物安全：</strong>执行“全进全出”制度，加强场区消毒（推荐使用过硫酸氢钾复合物）。</li>
                <li><strong>禁止泔水喂猪：</strong>严禁使用餐厨剩余物饲喂生猪。</li>
                <li><strong>强化监测：</strong>定期采样送检，发现疑似病例立即上报并隔离。</li>
                <li><strong>扑杀与无害化处理：</strong>确诊后，对疫点内所有生猪进行扑杀，并进行深埋或焚烧处理。</li>
              </ol>
             <p><em>数据来源：农业农村部《非洲猪瘟疫情应急实施方案（2025年修订）》</em></p>
             `,
  },
  {
    id: 2,
    title: "禽流感预防措施",
    type: "disease",
    description: "H5N8亚型禽流感的流行病学、疫苗免疫策略及养殖场综合防控技术",
    date: "2025-01-09",
    views: 189,
    content: `
              <h3>禽流感预防措施 (2025年春季版)</h3>
              <p><strong>一、流行病学</strong></p>
              <ul>
                <li>主要毒株：H5N8亚型，高致病性。</li>
                <li>易感动物：鸡、鸭、鹅等家禽，野鸟为主要宿主。</li>
              </ul>
              <p><strong>二、免疫策略</strong></p>
              <ul>
                <li>强制免疫：对蛋鸡、肉鸡、种鸡等进行H5+H7亚型灭活疫苗免疫，免疫程序参照《全国动物防疫计划（2025）》。</li>
                <li>免疫监测：免疫后21天进行抗体检测，合格率应≥70%。</li>
              </ul>
              <p><strong>三、综合防控</strong></p>
              <ol>
                <li><strong>封闭管理：</strong>实行全封闭饲养，减少人员、车辆进出。</li>
                <li><strong>环境控制：</strong>保持舍内通风良好，降低氨气浓度。</li>
                <li><strong>消毒制度：</strong>每日带禽喷雾消毒，每周彻底清洗消毒一次。</li>
              </ol>
              <p><em>数据来源：中国动物疫病预防控制中心《高致病性禽流感防控技术规范（2025）》</em></p>
              `,
  },
  {
    id: 3,
    title: "科学养殖管理",
    type: "technology",
    description: "现代化畜禽养殖场的精细化管理要点、环境控制和自动化技术应用。",
    date: "2025-01-08",
    views: 312,
    content: `
              <h3>科学养殖管理 (2025年标准)</h3>
              <p><strong>一、环境控制</strong></p>
              <ul>
                <li><strong>温度：</strong>育雏期32-35°C，逐渐降至21-23°C；产蛋期18-22°C。</li>
                <li><strong>湿度：</strong>维持在50%-60%，防止过高导致霉菌滋生。</li>
                <li><strong>通风：</strong>采用负压通风系统，保证每小时换气次数≥10次。</li>
              </ul>
              <p><strong>二、饲养管理</strong></p>
              <ul>
                <li><strong>精准饲喂：</strong>根据生长阶段调整饲料配方，避免浪费。</li>
                <li><strong>饮水管理：</strong>保证清洁水源，水温控制在18-22°C。</li>
                <li><strong>行为观察：</strong>每天定时巡查，记录采食量、饮水量、精神状态。</li>
              </ul>
              <p><strong>三、智能化应用</strong></p>
              <ul>
                <li>安装智能传感器，实时监测环境参数。</li>
                <li>利用AI视频分析，自动识别异常行为（如跛行、拒食）。</li>
               </ul>
               <p><em>数据来源：农业农村部《现代畜牧业高质量发展指导意见（2025）》</em></p>
               `,
  },
  {
    id: 4,
    title: "疫苗使用规范",
    type: "technology",
    description: "畜禽疫苗的选择原则、储存条件、免疫程序和不良反应处理方法。",
    date: "2025-01-07",
    views: 156,
    content: `
            <h3>疫苗使用规范 (2025年)</h3>
            <p><strong>一、疫苗选择</strong></p>
            <ul>
              <li>优先选用国家批准的、有GMP认证的正规厂家产品。</li>
              <li>根据当地流行病情况制定免疫程序。</li>
            </ul>
            <p><strong>二、储存与运输</strong></p>
            <ul>
              <li>冷藏储存：2-8°C，避免冻结。</li>
              <li>运输过程：使用专用冷链箱，全程监控温度。</li>
            </ul>
            <p><strong>三、免疫操作</strong></p>
            <ol>
              <li><strong>消毒：</strong>注射部位用碘伏消毒，针头一次性使用。</li>
              <li><strong>剂量：</strong>严格按照说明书执行，不可随意增减。</li>
              <li><strong>记录：</strong>详细记录免疫时间、疫苗批号、接种数量。</li>
            </ol>
            <p><strong>四、不良反应</strong></p>
            <ul>
              <li>常见反应：局部红肿、发热、食欲下降，通常24小时内自行恢复。</li>
              <li>严重反应：过敏休克，立即注射肾上腺素并送医。</li>
            </ul>
            <p><em>数据来源：中国兽医协会《兽用生物制品使用指导手册（2025）》</em></p>
            `,
  },
  {
    id: 5,
    title: "口蹄疫防治",
    type: "disease",
    description: "口蹄疫的诊断方法、免疫策略和综合防控措施。",
    date: "2025-01-06",
    views: 278,
    content: `
            <h3>口蹄疫防治 (2025年新版)</h3>
            <p><strong>一、诊断方法</strong></p>
            <ul>
              <li>临床诊断：口腔黏膜、蹄部出现水泡和溃烂，体温升高。</li>
              <li>实验室诊断：RT-PCR检测病毒RNA，血清学检测抗体水平。</li>
            </ul>
            <p><strong>二、免疫策略</strong></p>
            <ul>
              <li>强制免疫：对牛、羊、猪等易感动物进行O型和A型口蹄疫灭活疫苗免疫。</li>
              <li>免疫间隔：首次免疫后3周加强免疫一次，以后每年免疫2次。</li>
            </ul>
            <p><strong>三、防控措施</strong></p>
            <ol>
              <li><strong>封锁与扑杀：</strong>发现疫情立即封锁疫区，扑杀所有易感动物。</li>
              <li><strong>消毒：</strong>使用含氯制剂（如漂白粉）或过氧乙酸进行彻底消毒。</li>
              <li><strong>无害化处理：</strong>对病死动物尸体进行深埋或焚烧处理。</li>
            </ol>
            <p><em>数据来源：农业农村部《口蹄疫防治技术规范（2025年修订）》</em></p>
            `,
  },
  {
    id: 6,
    title: "畜禽营养需求",
    type: "technology",
    description: "不同生长阶段畜禽的营养需求和饲料配比建议。",
    date: "2025-01-05",
    views: 201,
    content: `
            <h3>畜禽营养需求 (2025年)</h3>
            <p><strong>一、猪只营养需求</strong></p>
            <ul>
              <li><strong>仔猪：</strong>蛋白质18-20%，能量3200-3400kcal/kg，赖氨酸1.2-1.4%。</li>
              <li><strong>育肥猪：</strong>蛋白质14-16%，能量3100-3300kcal/kg，赖氨酸0.8-1.0%。</li>
              <li><strong>母猪：</strong>蛋白质14-16%，能量3000-3200kcal/kg，钙0.8-1.0%，磷0.6-0.8%。</li>
            </ul>
            <p><strong>二、禽类营养需求</strong></p>
            <ul>
              <li><strong>雏鸡：</strong>蛋白质20-22%，能量2800-3000kcal/kg，蛋氨酸0.45-0.55%。</li>
              <li><strong>产蛋鸡：</strong>蛋白质16-18%，能量2700-2900kcal/kg，钙3.5-4.0%。</li>
            </ul>
            <p><strong>三、饲料配比建议</strong></p>
            <ol>
              <li>以玉米、豆粕为基础原料。</li>
              <li>添加预混料（维生素、矿物质、氨基酸）。</li>
              <li>根据实际生产性能调整配方，避免过度营养。</li>
            </ol>
            <p><em>数据来源：中国农业科学院《畜禽营养需要量标准（2025）》</em></p>
            `,
  },
  // 原代码中的6条知识数据（因篇幅省略，请从原HTML中完整复制）
]);

const totalWarnings = computed(() => warningList.value.length);
const syncing = ref(false);
const syncOfficialData = () => {
  syncing.value = true;
  ElMessage.info("正在请求农业农村部官方防疫文件库...");
  setTimeout(() => {
    const newData = [
      {
        id: 7,
        title: "2026年春季动物疫病防控",
        type: "disease",
        description: "农业农村部发布的关于2026年春季重大动物疫病防控工作的通知及技术方案。",
        date: "2026-03-01",
        views: 1050,
        content: "<h3>2026年春季重大动物疫病防控技术指南</h3><p>官方最新指导文件内容...</p>"
      },
      {
        id: 8,
        title: "生猪标准化养殖技术规范",
        type: "technology",
        description: "国家标准GB/T最新修订版，涵盖场址选择、建设规范、饲养管理等全流程。",
        date: "2026-02-15",
        views: 890,
        content: "<h3>生猪标准化养殖技术规范 (2026版)</h3><p>最新国家标准详细条款...</p>"
      }
    ];
    // 避免重复添加
    newData.forEach(item => {
      if (!knowledgeList.value.find(k => k.id === item.id)) {
        knowledgeList.value.unshift(item);
      }
    });
    syncing.value = false;
    ElMessage.success("成功获取并同步 2 条官方最新防疫文件");
  }, 2000);
};

const aiAnalysisResult = ref(null);
const aiLoading = ref(false);
const fetchAIAnalysis = () => {
  aiLoading.value = true;
  setTimeout(() => {
    aiAnalysisResult.value = `
      <div class="ai-report">
        <div class="ai-report-header">
          <h4 style="color: #2e7d32; margin-top: 0;"><i class="fas fa-microchip"></i> 智栏 AI 深度数据洞察报告 (2025)</h4>
          <p style="font-size: 12px; color: #999;">分析引擎：Sentinel-AI v4.2 | 分析时间：${new Date().toLocaleString()}</p>
        </div>
        <el-divider></el-divider>
        <div class="ai-report-section">
          <h5 style="color: #e6a23c;"><i class="fas fa-bullseye"></i> 最直观影响分析</h5>
          <p>根据近一年的数据追踪，<strong>呼吸道感染</strong>在春季（3-4月）呈现明显的季节性爆发特征，发病率同比上升了 <strong>15.2%</strong>。这直接导致了该阶段畜禽的平均日增重下降了 <strong>8.5%</strong>，对整体养殖效益产生了显著的负面影响。</p>
        </div>
        <div class="ai-report-section">
          <h5 style="color: #409eff;"><i class="fas fa-filter"></i> 核心数据影响因素</h5>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li><strong>温差波动：</strong>3月份昼夜温差超过 12°C 的天数占 65%，是诱发呼吸道疾病的首要环境因素。</li>
            <li><strong>氨气浓度：</strong>监测数据显示，当舍内氨气浓度超过 20ppm 时，24小时内出现行为异常的比例提升了 40%。</li>
            <li><strong>湿度关联：</strong>高湿度（>75%）环境下，皮肤寄生虫的检出率与湿度呈现 0.82 的强正相关性。</li>
          </ul>
        </div>
        <div class="ai-report-section">
          <h5 style="color: #67c23a;"><i class="fas fa-lightbulb"></i> 智能化改进建议</h5>
          <p>建议在下个季度加强 <strong>A区</strong> 的通风自动化控制逻辑，将氨气阈值从 25ppm 调低至 18ppm，并引入基于 AI 的<strong>咳嗽声监测系统</strong>，以实现呼吸道疾病的早期预警（比肉眼观察提前约 48 小时）。</p>
        </div>
      </div>
    `;
    aiLoading.value = false;
  }, 1500);
};

const loadDashboardStats = async (silent = true) => {
  try {
    const data = await getDashboardStats();
    const mapped = mapDashboardStats(data);
    if (mapped) {
      dataStats.value = mapped;
    }
  } catch (error) {
    if (!silent) {
      ElMessage.warning(error.message || "首页统计接口暂不可用，已使用本地数据");
    }
  }
};

const loadNotifications = async (silent = true) => {
  try {
    const data = await getNotifications();
    const list = pickList(data);
    if (list.length) {
      notifications.value = list.map(mapNotificationItem);
    }
  } catch (error) {
    if (!silent) {
      ElMessage.warning(error.message || "通知接口暂不可用，已使用本地数据");
    }
  }
};

const loadWarnings = async (silent = true) => {
  try {
    const data = await getWarnings();
    const list = pickList(data);
    if (list.length) {
      warningList.value = list.map(mapWarningItem);
    }
  } catch (error) {
    if (!silent) {
      ElMessage.warning(error.message || "预警接口暂不可用，已使用本地数据");
    }
  }
};

const loadBusinessData = async (silent = true) => {
  await Promise.all([
    loadDashboardStats(silent),
    loadNotifications(silent),
    loadWarnings(silent),
  ]);
};

// 所有方法（原样保留）
const scrollToNotificationsSection = () => {
  const section = document.getElementById("notifications-section");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const openNotificationsCenter = async () => {
  sessionStorage.setItem("scrollToNotifications", "true");
  activeIndex.value = "dashboard";
  if (router.currentRoute.value.path !== "/dashboard") {
    await router.push("/dashboard");
  }
  nextTick(() => {
    scrollToNotificationsSection();
    initCharts();
  });
};

const markNotificationAsRead = (notification) => {
  const target = notifications.value.find((item) => item.id === notification.id);
  if (!target || target.read) return;
  target.read = true;
  ElMessage.success("通知已标记为已读");
};

const handleSelect = (key) => {
  if (key === "notifications") {
    openNotificationsCenter();
    return;
  }

  activeIndex.value = key;
  const path = key === "dashboard" ? "/dashboard" : `/${key}`;
  if (router.currentRoute.value.path !== path) {
    router.push(path);
  }
  nextTick(initCharts);
};
const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        localStorage.removeItem("authToken");
        activeIndex.value = "dashboard";
        router.push("/login");
        ElMessage.success("退出成功，已返回登录页");
      })
      .catch(() => {});
  } else if (command === "profile") {
    activeIndex.value = "profile";
    router.push("/profile");
    nextTick(initCharts);
  } else if (command === "notifications") openNotificationsCenter();
};
const goToMonitor = () => {
  activeIndex.value = "monitor";
  nextTick(initCharts);
};
const goToData = () => {
  activeIndex.value = "ai-sentinel";
  router.push("/ai-sentinel");
  nextTick(initCharts);
};
const goToWarning = () => {
  activeIndex.value = "warning";
  router.push("/warning");
  nextTick(initCharts);
};
const goToKnowledgeBase = () => {
  activeIndex.value = "knowledge";
  nextTick(initCharts);
};
const goToReport = () => ElMessage.info("生成报告功能开发中");
const goToEnvControl = () => ElMessage.info("环境监测调控功能开发中");
const goToHealthAnalysis = () => ElMessage.info("健康分析引擎功能开发中");
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
const handleAllWarnings = () =>
  ElMessage.info(`当前共有${totalWarnings.value}条预警信息`);
const handleWarningDetail = (row) => {
  ElMessageBox.alert(`<div style="line-height:1.6;">...</div>`, "预警详情", {
    dangerouslyUseHTMLString: true,
  });
};
const handleWarningConfirm = (row) => {
  ElMessageBox.confirm(`确认处理"${row.type}"预警？`, "处理预警", {
    confirmButtonText: "确认处理",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const targetWarning = warningList.value.find((item) => item.id === row.id);
      if (targetWarning) {
        targetWarning.status = "已处理";
      }
      ElMessage.success("预警已处理");
    })
    .catch(() => {});
};
const searchKnowledge = () => {
  if (searchKeyword.value.trim())
    ElMessage.info(`搜索关键词: ${searchKeyword.value}`);
};
const addKnowledge = () => ElMessage.info("新增防疫知识功能开发中");
const viewKnowledge = (item) => {
  selectedKnowledge.value = item;
  dialogVisible.value = true;
};
const dialogClose = () => {
  dialogVisible.value = false;
  selectedKnowledge.value = null;
};

const handleRefresh = () => {
  refreshSpinning.value = true;
  ElMessage.info("正在刷新监控数据...");
  loadBusinessData(false);
  cameras.value.forEach((camera) => {
    if (camera.status === "online") {
      const randomChange = Math.random() * 0.1 - 0.05;
      const currentHealth = parseFloat(camera.healthRate);
      const newHealth = Math.min(
        100,
        Math.max(0, currentHealth + randomChange * 100),
      );
      camera.healthRate = newHealth.toFixed(1) + "%";
      if (Math.random() > 0.7) camera.warnings = Math.floor(Math.random() * 5);
    }
  });
  setTimeout(() => {
    refreshSpinning.value = false;
    ElMessage.success("监控数据已更新");
  }, 1500);
};

const toggleFullscreen = () => {
  const monitorCard = document.querySelector(".monitor-container .el-card");
  if (!monitorCard) return;
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    if (monitorCard.requestFullscreen) monitorCard.requestFullscreen();
    else if (monitorCard.webkitRequestFullscreen)
      monitorCard.webkitRequestFullscreen();
    else if (monitorCard.msRequestFullscreen) monitorCard.msRequestFullscreen();
    ElMessage.info("已进入全屏模式");
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    ElMessage.info("已退出全屏模式");
  }
};

const handleFullscreenChange = () => {
  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    isFullscreen.value = false;
  }
};

const getChart = (id) => {
  const el = document.getElementById(id);
  if (!el) return null;
  return echarts.getInstanceByDom(el) || echarts.init(el);
};

const resizeChart = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  echarts.getInstanceByDom(el)?.resize();
};

const initCharts = () => {
  if (activeIndex.value === "dashboard") {
    // 1. 健康趋势图
    const healthChart = getChart("healthChart");
    if (healthChart) {
      healthChart.setOption({
        color: ["#52c41a", "#1890ff", "#faad14"],
        tooltip: { trigger: "axis" },
        legend: { data: ["健康率", "异常率", "预警率"] },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "健康率",
            type: "line",
            smooth: true,
            data: [91.5, 93.2, 95.8, 94.5, 97.6, 98.2, 98.5],
          },
          {
            name: "异常率",
            type: "line",
            smooth: true,
            data: [7.0, 5.3, 3.0, 4.0, 1.4, 0.8, 0.5],
          },
          {
            name: "预警率",
            type: "line",
            smooth: true,
            data: [1.5, 1.5, 1.2, 1.2, 1.0, 1.0, 1.0],
          },
        ],
      });
    }

    // 2. 预警分布图表
    const warningChart = getChart("warningChart");
    if (warningChart) {
      warningChart.setOption({
        color: ["#ff7875", "#ffc069", "#95de64", "#5cdbd3"],
        tooltip: { 
          trigger: "item",
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderWidth: 1,
          borderColor: '#eee',
          textStyle: { color: '#333' },
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: "vertical",
          right: "10%",
          top: "center",
          textStyle: { fontSize: 12, color: '#606266' }
        },
        series: [
          {
            name: "预警类型分布",
            type: "pie",
            radius: ["35%", "65%"],
            center: ['40%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 3,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            },
            emphasis: {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 3,
                shadowBlur: 15
              }
            },
            data: [
              { value: 35, name: "温度异常" },
              { value: 25, name: "湿度异常" },
              { value: 20, name: "行为异常" },
              { value: 20, name: "其他异常" },
            ],
            label: { show: true, formatter: "{b}\n{d}%", fontSize: 11 },
          },
        ],
      });
    }

    // 3. 养殖规模图表
    const scaleChart = getChart("scaleChart");
    if (scaleChart) {
      scaleChart.setOption({
        color: ["#1890ff", "#52c41a", "#faad14"],
        tooltip: { trigger: "axis", backgroundColor: 'rgba(255, 255, 255, 0.95)', borderWidth: 1, borderColor: '#eee' },
        legend: { data: ["猪", "鸡", "牛"], top: 10 },
        grid: { left: "3%", right: "4%", bottom: "10%", top: "15%", containLabel: true },
        xAxis: { 
          type: "category", 
          data: ["A区", "B区", "C区"],
          axisLine: { lineStyle: { color: '#ddd' } },
          axisLabel: { color: '#606266' }
        },
        yAxis: { 
          type: "value", 
          name: "存栏数量",
          axisLine: { lineStyle: { color: '#ddd' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
          axisLabel: { color: '#606266' }
        },
        series: [
          { 
            name: "猪", 
            type: "bar", 
            barWidth: '20%', 
            itemStyle: { borderRadius: [6, 6, 0, 0], shadowColor: 'rgba(0, 0, 0, 0.1)', shadowBlur: 8 },
            data: [240, 180, 120] 
          },
          { 
            name: "鸡", 
            type: "bar", 
            barWidth: '20%', 
            itemStyle: { borderRadius: [6, 6, 0, 0], shadowColor: 'rgba(0, 0, 0, 0.1)', shadowBlur: 8 },
            data: [500, 450, 380] 
          },
          { 
            name: "牛", 
            type: "bar", 
            barWidth: '20%', 
            itemStyle: { borderRadius: [6, 6, 0, 0], shadowColor: 'rgba(0, 0, 0, 0.1)', shadowBlur: 8 },
            data: [80, 65, 50] 
          },
        ],
      });
    }
  }
};

const handleResize = () => {
  if (activeIndex.value === "dashboard") {
    resizeChart("healthChart");
    resizeChart("warningChart");
    resizeChart("scaleChart");
  } else if (activeIndex.value === "monitor") {
    resizeChart("temperatureChart");
    resizeChart("humidityChart");
  } else if (activeIndex.value === "ai-sentinel") {
    resizeChart("diseaseChart");
  } else if (activeIndex.value === "warning") {
    resizeChart("warningTypeChart");
    resizeChart("warningTrendChart");
  }
};

const dialogVisible = ref(false);
const selectedKnowledge = ref(null);
const activeAITab = ref("suggestions");

// 提供所有数据和方法给子组件
provide("activeIndex", activeIndex);
provide("setActiveIndex", (val) => (activeIndex.value = val));
provide("username", username);
provide("notifications", notifications);
provide("markNotificationAsRead", markNotificationAsRead);
provide("cameras", cameras);
provide("dataStats", dataStats);
provide("warningList", warningList);
provide("knowledgeList", knowledgeList);
provide("dateRange", dateRange);
provide("searchKeyword", searchKeyword);
provide("refreshSpinning", refreshSpinning);
provide("isFullscreen", isFullscreen);
provide("aiAnalysisResult", aiAnalysisResult);
provide("aiLoading", aiLoading);
provide("totalWarnings", totalWarnings);
provide("syncing", syncing);
provide("syncOfficialData", syncOfficialData);
provide("dialogVisible", dialogVisible);
provide("selectedKnowledge", selectedKnowledge);
provide("handleCommand", handleCommand);
provide("handleSelect", handleSelect);
provide("goToMonitor", goToMonitor);
provide("goToData", goToData);
provide("goToWarning", goToWarning);
provide("goToKnowledgeBase", goToKnowledgeBase);
provide("goToReport", goToReport);
provide("goToEnvControl", goToEnvControl);
provide("goToHealthAnalysis", goToHealthAnalysis);
provide("getWarningType", getWarningType);
provide("handleAllWarnings", handleAllWarnings);
provide("handleWarningDetail", handleWarningDetail);
provide("handleWarningConfirm", handleWarningConfirm);
provide("searchKnowledge", searchKnowledge);
provide("addKnowledge", addKnowledge);
provide("viewKnowledge", viewKnowledge);
provide("dialogClose", dialogClose);
provide("handleRefresh", handleRefresh);
provide("toggleFullscreen", toggleFullscreen);
provide("fetchAIAnalysis", fetchAIAnalysis);
provide("exportData", () => ElMessage.info("导出功能开发中"));
provide("activeAITab", activeAITab);
provide("setActiveAITab", (val) => (activeAITab.value = val));

onMounted(() => {
  applyCareModeClass(isCareMode.value);
  loadBusinessData();
  if (!isLoginRoute.value) {
    nextTick(initCharts);
  }
  window.addEventListener("resize", handleResize);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
  setTimeout(() => ElMessage.success("智栏哨兵系统已加载完成！"), 500);
});

onBeforeUnmount(() => {
  document.body.classList.remove("care-mode");
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  document.removeEventListener(
    "webkitfullscreenchange",
    handleFullscreenChange,
  );
  document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
});

watch(
  () => route.fullPath,
  (newFullPath) => {
    const [newPath] = newFullPath.split("#");
    const key = newPath.replace(/^\//, "");
    const available = ["dashboard", "monitor", "ai-sentinel", "warning", "knowledge", "ranch", "profile"];
    activeIndex.value = available.includes(key) ? key : "dashboard";
    if (newPath !== "/login") {
      nextTick(initCharts);
      if (sessionStorage.getItem("scrollToNotifications") === "true") {
        sessionStorage.removeItem("scrollToNotifications");
        nextTick(() => {
          setTimeout(scrollToNotificationsSection, 80);
        });
      }
    }
  },
  { immediate: true },
);
</script>

<style>
:root {
  --primary-color: #2e7d32;
  --primary-light: #4caf50;
  --primary-dark: #1b5e20;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --info-color: #1890ff;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #f0f0f0;
  --background-color: #f8fafc;
  --card-background: #ffffff;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  --hover-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--background-color);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 头部样式（已在组件中scoped，但全局可能也需要） */
.app-header {
  background-color: #dcdfe6;
  color: #333333;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #e0e0e0;
}
.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

/* 新增布局：头部 + 侧边栏 + 内容区域 */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-body {
  flex: 1;
  display: flex;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  background-color: var(--background-color);
}
.app-sidebar {
  width: 220px;
  min-width: 220px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  padding: 16px 14px;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.04);
}
.app-sidebar h3 {
  margin: 0 0 12px;
  color: var(--primary-dark);
  font-size: 16px;
  font-weight: 600;
}
.sidebar-menu {
  border-right: none;
}
.app-main {
  flex: 1;
  min-height: calc(100vh - 130px);
  padding: 18px;
  background-color: var(--background-color);
}
.app-footer {
  margin-top: auto;
}

/* ... 其余全局样式请从原HTML完整复制 ... */
:root {
  --primary-color: #2e7d32;
  --primary-light: #4caf50;
  --primary-dark: #1b5e20;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --info-color: #1890ff;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #f0f0f0;
  --background-color: #f8fafc;
  --card-background: #ffffff;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  --hover-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--background-color);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 头部样式(改过) */
.app-header {
  background-color: #ffffff;
  color: #333333;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
  width: auto;
}

/* 将导航栏主标题换成主题颜色绿色 */
.app-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #2e7d32;
}

.app-subtitle {
  font-size: 14px;
  color: #606266;
  margin-left: 8px;
}

.nav-menu {
  border-bottom: none;
}

.nav-menu .el-menu-item {
  font-size: 16px;
  font-weight: 500;
  margin: 0 4px;
}

/* 移除点击后的焦点背景色，防止区域持续变暗 */
.el-menu-item:focus {
  background-color: transparent !important;
}

.el-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04) !important; 
}


.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
}

/* 主要内容区域 */
.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 底部样式 */
.app-footer {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: white;
  padding: 24px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-info p {
  margin: 4px 0;
  font-size: 14px;
  opacity: 0.8;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.footer-links a:hover {
  opacity: 1;
}

/* 仪表板样式 */
.dashboard-container {
  padding: 0;
}

.welcome-banner {
  margin-bottom: 30px;
}

/* 欢迎卡片背景图 */
.welcome-card {
  background: url("/src/assets/images/牛3.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: black;
  border: none;
  min-height: 280px;
  position: relative;
  overflow: hidden;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.welcome-text h2 {
  color: aliceblue;
  font-family: Arial, Helvetica, sans-serif;
  margin: 0 0 8px 0;
  font-size: 24px;
}
.welcome-text h1 {
  color: aliceblue;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 500px;
  font-style: normal;
}
.welcome-subtitle {
  opacity: 0.9;
  margin-bottom: 20px;
}

.stats-overview {
  display: flex;
  gap: 32px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  display: inline-block;
  animation: data 0.6s ease infinite;
}
.stat-value {
  display: inline-block;
  animation: data 0.6s ease infinite;
  color: aliceblue;
  font-style: oblique;
  font-family: Arial, Helvetica, sans-serif;
  font-size: larger;
  display: block;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  color: aliceblue;
  font-weight: 600;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  opacity: 0.8;
}

.weather-info {
  min-width: 200px;
}

.weather-card {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #000;
}

.weather-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weather-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-label {
  opacity: 0.8;
}

.weather-value {
  font-weight: bold;
  font-size: 16px;
}

/* 图表卡片 */
.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  height: 300px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #2e7d32;
}

.chart-container {
  height: 250px;
  width: 100%;
}

/* 快速操作 */
.quick-actions-row {
  margin-bottom: 24px;
}

.actions-header,
.notifications-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #2e7d32;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.action-btn {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.action-btn .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

/* 通知列表 */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.notification-item.unread {
  background-color: #e8f5e9;
  border-left: 4px solid #52c41a;
}

.notification-item:hover {
  background-color: #e8f5e9;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

/* 监测页面样式 */
.monitor-container {
  padding: 0;
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.camera-card {
  overflow: hidden;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.camera-preview {
  width: 100%;
  height: 200px;
  background-color: #000;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-bottom: 10px;
}

.camera-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-overview {
    justify-content: center;
    flex-wrap: wrap;
  }

  .weather-info {
    margin-top: 20px;
    width: 100%;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 0;
  }

  .nav-menu {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }
}

/* 自定义Element Plus主题覆盖 */
.el-button--primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.el-button--primary:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
}

.el-button--success {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

.el-menu--horizontal .el-menu-item.is-active {
  border-bottom-color: var(--primary-color);
}

.el-card {
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-card:hover {
  box-shadow: var(--hover-shadow);
  transform: translateY(-2px);
}

/* 工具类 */
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.mt-5 {
  margin-top: 20px;
}

.mb-1 {
  margin-bottom: 4px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-5 {
  margin-bottom: 20px;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.flex-wrap {
  flex-wrap: wrap;
}

/* 数据高亮样式 */
.data-highlight {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.data-highlight.success {
  color: var(--success-color);
}

.data-highlight.warning {
  color: var(--warning-color);
}

.data-highlight.error {
  color: var(--error-color);
}

/* 状态标签 */
.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-normal {
  background-color: #e8f5e9;
  color: var(--success-color);
}

.status-warning {
  background-color: #fff7e6;
  color: var(--warning-color);
}

.status-error {
  background-color: #fff1f0;
  color: var(--error-color);
}

body.care-mode {
  font-size: 17px;
}

body.care-mode .app-title {
  font-size: 24px !important;
  line-height: 1.2;
  white-space: nowrap;
}

body.care-mode .app-subtitle {
  font-size: 15.5px !important;
}

body.care-mode .el-menu-item,
body.care-mode .el-dropdown-menu__item,
body.care-mode .el-button,
body.care-mode .el-input__inner,
body.care-mode .el-textarea__inner,
body.care-mode .el-select__selected-item,
body.care-mode .el-form-item__label,
body.care-mode .el-table,
body.care-mode .el-card__header,
body.care-mode .el-card__body,
body.care-mode p {
  font-size: 1.05em;
}

body.care-mode .el-button {
  min-height: 41px;
  padding: 9px 17px;
}

body.care-mode .el-input__wrapper,
body.care-mode .el-textarea__inner,
body.care-mode .el-select__wrapper {
  min-height: 43px;
}

body.care-mode .el-menu-item {
  height: 50px;
  line-height: 50px;
}

body.care-mode .el-table .cell {
  line-height: 1.8;
}

/* 增加系统介绍样式 */
.system-intro {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.system-intro .intro-content {
  display: flex;
  align-items: center;
  padding: 18px 25px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.system-intro .intro-content {
  gap: 0;
}

.system-intro .intro-content:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.system-intro .intro-text {
  flex: 1;
  text-align: center;
}

.system-intro .intro-text p {
  color: aliceblue;
  font-style: oblique;
  font-family: Arial, Helvetica, sans-serif;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 600;
}

.system-intro .intro-text strong {
  color: rgb(47, 255, 109);
  font-weight: 600;
}

/*系统介绍响应式调整 */
@media (max-width: 768px) {
  .system-intro .intro-content {
    padding: 15px 20px;
  }

  .system-intro .intro-text p {
    font-size: 13px;
  }
}

/* 按钮动画效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.el-button:active {
  transform: translateY(0);
}

/* 刷新图标旋转动画 */
.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 全屏样式 */
:fullscreen .monitor-container .el-card,
:-webkit-full-screen .monitor-container .el-card,
:-ms-fullscreen .monitor-container .el-card {
  background-color: #f0f2f5;
}

:fullscreen .camera-grid,
:-webkit-full-screen .camera-grid,
:-ms-fullscreen .camera-grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}
/* 工具类 */
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}
.mt-1 {
  margin-top: 4px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-5 {
  margin-top: 20px;
}
.mb-1 {
  margin-bottom: 4px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mb-5 {
  margin-bottom: 20px;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.flex-wrap {
  flex-wrap: wrap;
}

/* 其他样式（如数据高亮、状态标签等） */
.data-highlight {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}
.data-highlight.success {
  color: var(--success-color);
}
.data-highlight.warning {
  color: var(--warning-color);
}
.data-highlight.error {
  color: var(--error-color);
}
.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-normal {
  background-color: #e8f5e9;
  color: var(--success-color);
}
.status-warning {
  background-color: #fff7e6;
  color: var(--warning-color);
}
.status-error {
  background-color: #fff1f0;
  color: var(--error-color);
}

/* 其他全局样式请务必从原HTML全部复制过来 */
</style>
