# 前端接入另一台电脑后端说明

## 1. 你现在项目的实际情况

- 当前项目是 Vue 3 + Vite 前端项目。
- 已经安装了 `axios`，但页面大部分数据仍然是前端本地假数据。
- 登录页已经在请求 `/api/login`，说明项目天然适合通过代理转发到后端。

## 2. 这次已经补好的内容

- `vite.config.js`
  - 支持通过环境变量配置后端地址
  - 支持把 `/api` 代理到另一台电脑上的后端
  - 开发服务器已设置为 `0.0.0.0`
- `.env.example`
  - 提供了后端地址配置模板
- `src/utils/request.js`
  - 新增统一请求封装
  - 自动携带 `Authorization: Bearer <token>`
- `src/api/*.js`
  - 预留了登录、首页、预警、知识库、养殖场管理等接口模块

## 3. 你现在要做的第一步

在项目根目录新建 `.env.development`，内容参考：

```env
VITE_API_BASE_URL=http://192.168.1.88:8080
VITE_API_PREFIX=/api
VITE_USE_PROXY=true
```

说明：

- `VITE_API_BASE_URL`：另一台电脑后端服务地址
- `VITE_API_PREFIX`：前端统一请求前缀，通常保持 `/api`
- `VITE_USE_PROXY=true`：开发阶段建议开启，避免浏览器跨域问题

## 4. 后端那台电脑必须满足的条件

如果前端连不上，通常不是前端代码问题，而是后端机器没开放出来。后端至少要满足下面几点：

### 4.1 后端服务监听外网/局域网地址

不要只监听 `127.0.0.1`，要监听：

```txt
0.0.0.0
```

例如：

- Spring Boot：`server.address=0.0.0.0`
- Node/Express：`app.listen(8080, '0.0.0.0')`
- FastAPI：`uvicorn main:app --host 0.0.0.0 --port 8080`

### 4.2 端口要开放

例如后端跑在 `8080`，那台电脑的防火墙要允许 `8080` 入站。

### 4.3 两台电脑网络互通

前端电脑需要能访问：

```txt
http://后端电脑IP:端口
```

你可以先在前端电脑浏览器里直接访问：

```txt
http://192.168.1.88:8080/api/login
```

或者访问后端提供的健康检查接口，比如：

```txt
http://192.168.1.88:8080/api/health
```

## 5. 建议你的后端接口先统一成这类格式

### 登录

`POST /api/login`

请求：

```json
{
  "username": "admin",
  "password": "123456"
}
```

返回：

```json
{
  "token": "your-jwt-token",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "管理员"
  }
}
```

### 首页统计

`GET /api/dashboard/stats`

返回：

```json
{
  "totalMonitoring": 42967,
  "abnormalCount": 945,
  "warningCount": 1200,
  "healthRate": 97.8
}
```

### 预警列表

`GET /api/warnings`

返回：

```json
[
  {
    "id": 1,
    "time": "2026-03-28 10:23",
    "location": "A区猪舍1号",
    "type": "温度异常",
    "description": "温度超过阈值28°C，当前28.5°C",
    "level": "medium",
    "status": "待处理"
  }
]
```

## 6. 前端后续怎么逐步替换假数据

推荐按这个顺序改，风险最低：

1. 先接登录接口
2. 再接首页通知和统计
3. 再接预警列表
4. 最后接养殖场、设备、知识库等增删改查

例如在页面中这样使用：

```js
import { getWarnings } from "./api/warning";

const list = await getWarnings();
```

## 7. 如果后端在另一台电脑但不是同一局域网

你还需要额外解决其中一种：

- 公网 IP + 端口映射
- 内网穿透
- VPN
- 把前后端都部署到同一台云服务器

如果只是学校、办公室、家里两台电脑联调，优先用同一 Wi-Fi/同一局域网最简单。

## 8. 当前最重要的结论

数据库不需要直接从前端连接。

你的前端应该只连接：

```txt
前端 -> 后端接口 -> 后端连接数据库
```

不要做成：

```txt
前端 -> 直接连接数据库
```

前端只需要知道后端地址和接口，不需要数据库账号密码。
