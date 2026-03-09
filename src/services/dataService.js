/**
 * 数据服务层
 * 用于管理所有数据的获取和处理
 * 未来可以轻松替换为真实的后端 API 调用
 */

// 模拟通知数据
export const getNotifications = () => {
  return [
    {
      title: "A区3号棚温度异常",
      time: "10分钟前",
      type: "warning",
      status: "预警",
      read: false,
    },
    {
      title: "B区健康检查完成",
      time: "1小时前",
      type: "success",
      status: "正常",
      read: true,
    },
    {
      title: "防疫知识更新通知",
      time: "2小时前",
      type: "info",
      status: "信息",
      read: true,
    },
    {
      title: "系统维护计划",
      time: "5小时前",
      type: "info",
      status: "通知",
      read: true,
    },
  ];
};

// 模拟摄像头数据
export const getCameras = () => {
  return [
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
  ];
};

// 模拟数据统计
export const getDataStats = () => {
  return [
    { label: "总监测数量", value: "42967", type: "success" },
    { label: "异常数量", value: "945", type: "warning" },
    { label: "预警数量", value: "1200", type: "error" },
    { label: "平均健康率", value: "97.8%", type: "success" },
  ];
};

// 模拟预警列表
export const getWarnings = () => {
  return [
    {
      id: 1,
      time: "2025-01-11 10:23",
      location: "A区猪舍1号",
      type: "温度异常",
      description: "温度超过阈值28°C，当前28.5°C",
      level: "medium",
    },
    {
      id: 2,
      time: "2025-01-11 09:15",
      location: "B区鸡舍2号",
      type: "湿度异常",
      description: "湿度过低，当前45%",
      level: "low",
    },
    {
      id: 3,
      time: "2025-01-11 08:42",
      location: "A区猪舍2号",
      type: "行为异常",
      description: "检测到多只猪只活动异常",
      level: "high",
    },
    {
      id: 4,
      time: "2025-01-11 07:30",
      location: "C区牛舍1号",
      type: "进食异常",
      description: "进食量减少30%",
      level: "medium",
    },
    {
      id: 5,
      time: "2025-01-10 22:15",
      location: "B区鸡舍1号",
      type: "空气质量异常",
      description: "氨气浓度超标",
      level: "high",
    },
  ];
};

// 模拟知识库数据
export const getKnowledgeList = () => {
  return [
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
          <li><strong>严格生物安全：</strong>执行"全进全出"制度，加强场区消毒（推荐使用过硫酸氢钾复合物）。</li>
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
      `,
    },
  ];
};

// 模拟 AI 分析
export const fetchAIAnalysis = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        content: "<div><h4>2025年AI分析报告</h4><p>呼吸道疾病同比下降12%...</p></div>",
      });
    }, 1500);
  });
};
