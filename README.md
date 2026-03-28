# 智栏哨兵 - 畜禽健康智能防控中枢系统

![License](https://img.shields.io/badge/license-MIT-green)
![Vue](https://img.shields.io/badge/vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/vite-latest-blue)
![Node](https://img.shields.io/badge/node-16.0%2B-green)

## 项目简介

**智栏哨兵** 是一套基于 AI + 物联网技术的现代化畜禽健康智能防控系统。通过实时监测、数据分析、智能预警和科学决策支持，帮助养殖户实现精细化管理、降本增效、保障畜禽健康。

### 核心功能

- **登录认证** - 用户登录认证，支持模拟登录（后端不可用时）
- **仪表板** - 数据概览、环境监测、图表分析、AI 建议
- **AI 哨兵** - 基于大模型的深度数据分析、影响因素识别、改进建议
- **实时监控** - 多路视频监控、温湿度趋势分析、畜禽活动量监测
- **预警中心** - 实时预警分布、趋势预测、快速处理机制
- **知识库** - 官方防疫文件同步、疾病防治指南、养殖技术规范
- **养殖场管理** - 养殖场的增删改查、设备管理
- **个人中心** - 用户信息管理、系统设置

## 核心技术栈

| 技术         | 版本 | 说明        |
| ------------ | ---- | ----------- |
| Vue          | 3.x  | 前端框架    |
| Vite         | 8.x  | 构建工具    |
| Element Plus | 2.x  | UI 组件库   |
| ECharts      | 5.x  | 数据可视化  |
| Axios        | 1.x  | HTTP 客户端 |
| Vue Router   | 4.x  | 路由管理    |

## 快速开始

### 环境要求

- **Node.js** >= 16.0
- **npm** >= 8.0

### 安装步骤

1. **安装依赖**

```bash
npm install
```

2. **启动开发服务器**

```bash
npm run dev
```

3. **浏览器访问**
   打开浏览器，访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

## 后端 API 配置

### 环境变量

在项目根目录 `.env.development` 文件中配置：

```env
# 后端服务器地址
VITE_API_BASE_URL=http://10.10.110.219:8081

# 养殖 API 地址（可选）
VITE_FARM_API_BASE_URL=http://172.20.10.3:8081

# API 前缀
VITE_API_PREFIX=/api

# 是否启用代理（开发环境建议开启）
VITE_USE_PROXY=true
```

### 代理说明

项目使用 Vite 代理解决跨域问题。请求流程：

```
前端 /api/xxx → Vite 代理 → 后端 http://10.10.110.219:8081/xxx
```

### 后端接口清单

| 模块       | 接口           | 方法 | 参数                                              |
| ---------- | -------------- | ---- | ------------------------------------------------- |
| 登录       | `/user/login`  | GET  | username, passwordHash                            |
| 养殖场列表 | `/farm/page`   | GET  | current, size                                     |
| 养殖场新增 | `/farm/add`    | GET  | name, scale, province, city, district, status     |
| 养殖场修改 | `/farm/update` | GET  | id, name, scale, province, city, district, status |
| 养殖场删除 | `/farm/delete` | GET  | id                                                |

### 模拟登录

当后端服务不可用时，系统会自动进入模拟登录模式，使用默认账号登录：

- 用户名：admin
- 密码：123456

## 项目结构

```
zhilan-sentinel/
├── src/
│   ├── api/                    # API 接口
│   │   ├── auth.js             # 登录认证
│   │   ├── dashboard.js        # 仪表板
│   │   ├── ranch.js             # 养殖场管理
│   │   └── warning.js           # 预警
│   ├── components/             # 页面组件
│   │   ├── AISentinel.vue       # AI 哨兵
│   │   ├── AppHeader.vue        # 顶部导航
│   │   ├── AppFooter.vue        # 底部页脚
│   │   ├── Dashboard.vue        # 仪表板
│   │   ├── Knowledge.vue        # 知识库
│   │   ├── Login.vue            # 登录页
│   │   ├── Monitor.vue          # 实时监控
│   │   ├── Profile.vue          # 个人中心
│   │   ├── RanchManagement.vue  # 养殖场管理
│   │   └── Warning.vue          # 预警中心
│   ├── router/                 # 路由配置
│   ├── utils/                  # 工具函数
│   │   └── request.js          # HTTP 请求封装
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── .env.development            # 开发环境配置
├── vite.config.js              # Vite 配置
└── package.json                # 项目配置
```

## 功能页面

### 1. 登录页

- 用户名/密码认证
- 自动进入模拟登录（后端不可用时）

### 2. 仪表板 (Dashboard)

- 数据概览卡片（在线设备、健康率、预警数量）
- 环境监测（温度、湿度、空气质量）
- 图表分析（健康趋势、预警分布）
- AI 智能建议

### 3. AI 哨兵

- 基于大模型的深度数据分析
- 影响因素识别
- 改进建议生成

### 4. 实时监控

- 多路视频监控展示
- 温湿度趋势折线图
- 畜禽活动量监测

### 5. 预警中心

- 预警列表展示
- 预警类型分布图
- 24小时趋势预测
- 预警快速处理

### 6. 知识库

- 防疫知识分类展示
- 官方文件同步
- 知识搜索

### 7. 养殖场管理

- 养殖场列表（分页查询）
- 新增/编辑/删除养殖场
- 设备管理
- 饲喂记录
- 畜禽档案

### 8. 个人中心

- 用户信息展示
- 账号设置
- 通知偏好

## 配置说明

### 开发服务器端口

修改 `vite.config.js` 中的端口：

```javascript
server: {
  port: 3000,  // 默认 3000
  host: "0.0.0.0"  // 允许局域网访问
}
```

### 后端地址配置

有两种方式配置后端地址：

1. **环境变量**（推荐）
   编辑 `.env.development` 文件

2. **直接修改代码**
   编辑 `src/api/auth.js` 和 `src/api/ranch.js` 中的 URL

## 常见问题

### Q: 登录显示 Network Error？

A: 检查后端服务是否启动，确认 `VITE_API_BASE_URL` 地址正确且网络可达。

### Q: 养殖场的增删改返回 404？

A: 确认后端接口路径是否正确，参考上面的接口清单。

### Q: 怎么使用模拟登录？

A: 当后端不可用时，系统会自动进入模拟登录模式，无需额外配置。

## 许可证

MIT License

---

**最后更新时间**：2026年3月28日
**当前版本**：v1.0.0
