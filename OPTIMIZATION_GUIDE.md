# 代码优化指南

## 优化内容

本项目已完成以下优化：

1. **引入 Vue Router** - 实现声明式路由导航
2. **拆分 App.vue** - 从 1500+ 行精简到 20 行
3. **创建页面组件** - 5 个独立的页面组件
4. **抽离业务逻辑** - 创建 dataService.js 服务层
5. **改进导航组件** - AppHeader.vue 支持 Router 导航

## 项目结构

```
src/
├── App.vue                 # 主布局容器（已精简）
├── main.js                 # 应用入口（已更新）
├── router/
│   └── index.js           # 路由配置
├── pages/                 # 页面组件
│   ├── DashboardPage.vue
│   ├── MonitorPage.vue
│   ├── DataPage.vue
│   ├── WarningPage.vue
│   └── KnowledgePage.vue
├── services/              # 业务逻辑层
│   └── dataService.js
├── components/            # 可复用组件
│   ├── AppHeader.vue
│   └── AppFooter.vue
└── assets/                # 静态资源
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

## 路由说明

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 重定向到 `/dashboard` |
| `/dashboard` | 仪表板 | 数据统计和趋势分析 |
| `/monitor` | 实时监控 | 摄像头监控和环境监测 |
| `/data` | 数据分析 | 疫病趋势分析和 AI 洞察 |
| `/warning` | 预警中心 | 预警列表和处理 |
| `/knowledge` | 防疫知识 | 知识库查看和搜索 |

## 后端集成指南

### 1. 修改 dataService.js

将模拟数据替换为真实 API 调用：

```javascript
// 原始模拟方式
export const getNotifications = () => {
  return [/* 模拟数据 */];
};

// 改为 API 调用
import axios from 'axios';

export const getNotifications = async () => {
  const response = await axios.get('/api/notifications');
  return response.data;
};
```

### 2. 在页面组件中使用

```javascript
import { getNotifications } from '../services/dataService';

// 在 onMounted 中调用
onMounted(async () => {
  const data = await getNotifications();
  notifications.value = data;
});
```

## 常见问题

### Q: 如何添加新页面？

A: 按以下步骤操作：

1. 在 `src/pages/` 创建新的 Vue 组件，例如 `NewPage.vue`
2. 在 `src/router/index.js` 中添加路由配置
3. 在 `AppHeader.vue` 中添加菜单项

### Q: 如何修改导航菜单？

A: 编辑 `src/components/AppHeader.vue` 中的菜单项：

```vue
<el-menu-item index="your-route">菜单名称</el-menu-item>
```

### Q: 如何添加新的数据服务？

A: 在 `src/services/dataService.js` 中添加新的导出函数，然后在页面组件中导入使用。

## 性能建议

1. **图表优化** - 使用 `onUnmounted` 销毁 ECharts 实例，避免内存泄漏
2. **数据缓存** - 考虑使用 Pinia 缓存频繁访问的数据
3. **懒加载** - 对大型图片和视频使用懒加载
4. **代码分割** - 使用动态导入优化首屏加载速度

## 下一步计划

- [ ] 集成真实后端 API
- [ ] 添加用户认证和授权
- [ ] 引入 Pinia 进行状态管理
- [ ] 编写单元测试
- [ ] 性能优化和监控

---

**更新日期：** 2026年3月9日
