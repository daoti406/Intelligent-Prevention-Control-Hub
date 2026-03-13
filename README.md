# 智栏哨兵 - 畜禽健康智能防控中枢系统

![License](https://img.shields.io/badge/license-MIT-green)
![Vue](https://img.shields.io/badge/vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/vite-latest-blue)
![Node](https://img.shields.io/badge/node-16.0%2B-green)

## 📋 项目简介

**智栏哨兵** 是一套基于 AI + 物联网技术的现代化畜禽健康智能防控系统。通过实时监测、数据分析、智能预警和科学决策支持，帮助养殖户实现精细化管理、降本增效、保障畜禽健康。

### 核心功能

- **🎥 实时监控中心** - 多路视频监控、温湿度趋势分析、畜禽活动量监测
- **📊 数据分析平台** - 疫病趋势分析、AI 大模型智能洞察、多维度数据对比
- **🚨 预警响应系统** - 实时预警分布、趋势预测、快速处理机制
- **📚 防疫知识库** - 官方防疫文件同步、疾病防治指南、养殖技术规范
- **👤 个人中心** - 用户信息管理、系统设置、通知偏好配置
- **🤖 AI 智能分析** - 基于大模型的深度数据分析、影响因素识别、改进建议

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0
- **npm** >= 8.0 或 **yarn** >= 1.22

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/daoti406/Intelligent-Prevention-Control-Hub.git
cd Intelligent-Prevention-Control-Hub
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

4. **浏览器访问**
打开浏览器，访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 📁 项目结构

```
Intelligent-Prevention-Control-Hub/
├── src/
│   ├── components/
│   │   ├── AppHeader.vue          # 顶部导航栏
│   │   ├── AppFooter.vue          # 底部页脚
│   │   ├── Dashboard.vue          # 首页仪表板
│   │   ├── Monitor.vue            # 实时监控中心
│   │   ├── Data.vue               # 数据分析平台
│   │   ├── Warning.vue            # 预警响应中心
│   │   ├── Knowledge.vue          # 防疫知识库
│   │   └── Profile.vue            # 个人中心
│   ├── assets/
│   │   └── images/                # 静态资源
│   ├── App.vue                    # 根组件
│   └── main.js                    # 应用入口
├── index.html                     # HTML 模板
├── package.json                   # 项目配置
├── vite.config.js                 # Vite 配置
└── README.md                      # 项目文档
```

## 🎨 核心技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| Vite | Latest | 构建工具 |
| Element Plus | Latest | UI 组件库 |
| ECharts | Latest | 数据可视化 |
| Axios | Latest | HTTP 客户端 |

## 📖 功能详解

### 1. 首页仪表板 (Dashboard)
- **欢迎横幅** - 梯度渲染标题、实时数据跳动动画
- **数据概览** - 在线设备、健康率、今日预警等关键指标
- **环境监测** - 实时温度、湿度、空气质量显示
- **图表分析** - 健康趋势、预警分布、养殖规模三维度分析
- **AI 建议** - 基于数据的智能管理建议时间轴
- **最新通知** - 系统消息和预警提醒

### 2. 实时监控中心 (Monitor)
- **多路监控** - 支持多个养殖区域的视频监控
- **健康指标** - 每个监控点的健康率和预警数量
- **温湿度趋势** - 双轴折线图展示温湿度变化
- **活动量分析** - 畜禽活动度和采食频率监测
- **刷新和全屏** - 实时数据更新和全屏展示功能

### 3. 数据分析平台 (Data)
- **数据统计卡** - 总监测数量、异常数量、预警数量、平均健康率
- **疫病趋势图** - 呼吸道感染、消化道疾病、皮肤寄生虫三维度分析
- **AI 智能分析** - 点击"重新分析"获取基于大模型的深度洞察
- **日期筛选** - 支持自定义时间范围的数据查询
- **数据导出** - 支持分析数据的导出功能

### 4. 预警响应中心 (Warning)
- **预警列表** - 时间、位置、类型、描述、等级一览表
- **快速操作** - 查看详情和处理预警的快捷按钮
- **预警分布** - 南丁格尔玫瑰图展示各类型预警占比
- **趋势预测** - 24 小时预警数量变化趋势
- **预警统计** - 显示当前系统总预警数量

### 5. 防疫知识库 (Knowledge)
- **知识卡片** - 疾病防治和养殖技术分类展示
- **详情查看** - 点击卡片打开详细内容对话框
- **官方同步** - 一键同步农业农村部最新防疫文件
- **知识搜索** - 支持关键词搜索防疫知识
- **新增知识** - 支持添加自定义防疫知识

### 6. 个人中心 (Profile)
- **用户信息** - 显示登录次数、处理预警数、管理设备数
- **基本设置** - 修改用户名、电话、邮箱、所属区域
- **通知偏好** - 配置短信、邮件、APP 推送通知
- **个性签名** - 添加个人简介和工作描述

## 🎯 主要改进点

### 第一轮优化
- ✅ 导航栏间距优化，视觉更舒展
- ✅ Banner 数字跳动动画效果
- ✅ 环境监测文字颜色调整
- ✅ 预警分布和养殖规模图表升级
- ✅ 快速操作改为 AI 智能建议
- ✅ 温湿度合并展示，新增活动量分析
- ✅ AI 大模型分析功能完善
- ✅ 官方防疫数据同步功能
- ✅ 新增个人中心模块

### 第二轮优化
- ✅ 首页欢迎语梯度渲染
- ✅ 预警分布图表美化（玫瑰图 + 阴影效果）
- ✅ 养殖规模图表优化（渐变色 + 圆角）
- ✅ 数据分析组件样式升级
- ✅ 预警中心按钮对齐
- ✅ 防疫知识详情 Dialog 显示修复
- ✅ 个人中心跳转功能修复
- ✅ 预警类型分布图表美化
- ✅ 全局样式和阴影优化

## 🔧 配置说明

### 环境变量
项目使用 Vite 的环境变量系统。在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://your-api-server.com
VITE_APP_TITLE=智栏哨兵
```

### 自定义配置
编辑 `vite.config.js` 修改构建配置：

```javascript
export default {
  server: {
    port: 5173,
    host: 'localhost'
  }
}
```

## 📊 数据模型

### 监控设备数据结构
```javascript
{
  id: 1,
  name: "A区猪舍1号",
  status: "online",
  animals: 20,
  location: "A区1号棚",
  healthRate: "90%",
  warnings: 2,
  gifUrl: "/src/assets/images/猪2.gif"
}
```

### 预警数据结构
```javascript
{
  id: 1,
  time: "2025-01-11 10:23",
  location: "A区猪舍1号",
  type: "温度异常",
  description: "温度超过阈值28°C，当前28.5°C",
  level: "medium" // high | medium | low
}
```

### 防疫知识数据结构
```javascript
{
  id: 1,
  title: "非洲猪瘟防控指南",
  type: "disease", // disease | technology
  description: "防控指南描述",
  date: "2025-01-10",
  views: 245,
  content: "<h3>详细内容</h3><p>...</p>"
}
```

## 🌐 浏览器兼容性

| 浏览器 | 版本 | 支持状态 |
|--------|------|---------|
| Chrome | Latest | ✅ |
| Firefox | Latest | ✅ |
| Safari | Latest | ✅ |
| Edge | Latest | ✅ |
| IE | 11 | ❌ |

## 📝 常见问题

### Q: 如何修改系统主题色？
A: 编辑 `src/App.vue` 中的 `:root` CSS 变量：
```css
:root {
  --primary-color: #2e7d32;
  --success-color: #52c41a;
  /* ... */
}
```

### Q: 如何添加新的图表？
A: 在对应组件中使用 ECharts：
```javascript
import * as echarts from 'echarts';
const chart = echarts.init(dom);
chart.setOption({ /* 配置 */ });
```

### Q: 如何集成真实 API？
A: 在 `App.vue` 中的数据初始化部分替换为 API 调用：
```javascript
const fetchData = async () => {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  // 更新响应式数据
}
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 📞 联系方式

- 项目主页：[GitHub](https://github.com/daoti406/Intelligent-Prevention-Control-Hub)
- 问题反馈：[Issues](https://github.com/daoti406/Intelligent-Prevention-Control-Hub/issues)
- 邮件联系：support@sentinel.com

## 🙏 致谢

感谢所有贡献者和使用者的支持！

---

**最后更新时间**：2026年3月13日  
**当前版本**：v2.0.0
