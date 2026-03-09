<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo 部分 -->
      <div class="logo-section">
        <div class="logo-icon">🏡</div>
        <div class="logo-text">
          <h1 class="app-title">智栏哨兵</h1>
          <span class="app-subtitle">AI 驱动的畜禽健康防控中枢</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        mode="horizontal"
        :default-active="currentRoute.name?.toLowerCase() || 'dashboard'"
        background-color="transparent"
        text-color="rgba(255, 255, 255, 0.8)"
        active-text-color="#00bcd4"
        @select="handleMenuSelect"
        class="nav-menu"
      >
        <el-menu-item index="dashboard">
          <i class="fas fa-home"></i> 首页
        </el-menu-item>
        <el-menu-item index="monitor">
          <i class="fas fa-video"></i> 实时监控
        </el-menu-item>
        <el-menu-item index="data">
          <i class="fas fa-chart-bar"></i> 数据分析
        </el-menu-item>
        <el-menu-item index="warning">
          <i class="fas fa-exclamation-circle"></i> 预警中心
        </el-menu-item>
        <el-menu-item index="knowledge">
          <i class="fas fa-book"></i> 防疫知识
        </el-menu-item>
      </el-menu>

      <!-- 右侧功能区 -->
      <div class="right-section">
        <!-- AI 状态指示器 -->
        <div class="ai-status">
          <div class="ai-status-dot" :class="{ active: aiRunning }"></div>
          <span class="ai-status-text">{{ aiRunning ? "AI 运行中" : "AI 就绪" }}</span>
        </div>

        <!-- 系统通知 -->
        <el-popover
          placement="bottom"
          :width="300"
          trigger="click"
          @show="loadNotifications"
        >
          <template #reference>
            <div class="notification-bell">
              <i class="fas fa-bell"></i>
              <span class="notification-badge" v-if="notificationCount > 0">
                {{ notificationCount }}
              </span>
            </div>
          </template>
          <div class="notification-content">
            <div v-if="notifications.length === 0" class="no-notifications">
              暂无新通知
            </div>
            <div v-else class="notification-list">
              <div
                v-for="(notif, index) in notifications"
                :key="index"
                class="notification-item"
                :class="'notif-' + notif.type"
              >
                <div class="notif-icon">
                  <i :class="getNotificationIcon(notif.type)"></i>
                </div>
                <div class="notif-content">
                  <div class="notif-title">{{ notif.title }}</div>
                  <div class="notif-time">{{ notif.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-popover>

        <!-- 用户菜单 -->
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-info">
            <el-avatar
              :size="36"
              src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            />
            <div class="user-details">
              <div class="username">{{ username }}</div>
              <div class="user-role">系统管理员</div>
            </div>
            <i class="fas fa-chevron-down"></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <i class="fas fa-user-circle"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <i class="fas fa-cog"></i> 系统设置
              </el-dropdown-item>
              <el-dropdown-item command="help">
                <i class="fas fa-question-circle"></i> 帮助文档
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="fas fa-sign-out-alt"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const currentRoute = useRoute();
const username = ref("管理员");
const aiRunning = ref(false);
const notificationCount = ref(3);
const notifications = ref([]);

const getNotificationIcon = (type) => {
  const icons = {
    warning: "fas fa-exclamation-triangle",
    success: "fas fa-check-circle",
    error: "fas fa-times-circle",
    info: "fas fa-info-circle",
  };
  return icons[type] || "fas fa-bell";
};

const loadNotifications = () => {
  notifications.value = [
    {
      type: "warning",
      title: "C 区温度异常",
      time: "5 分钟前",
    },
    {
      type: "success",
      title: "疫苗接种完成",
      time: "1 小时前",
    },
    {
      type: "info",
      title: "系统更新提醒",
      time: "2 小时前",
    },
  ];
};

const handleMenuSelect = (key) => {
  router.push(`/${key}`);
};

const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => ElMessage.success("退出成功"))
      .catch(() => {});
  } else if (command === "profile") {
    ElMessage.info("跳转到个人中心");
  } else if (command === "settings") {
    ElMessage.info("跳转到系统设置");
  } else if (command === "help") {
    ElMessage.info("打开帮助文档");
  }
};

onMounted(() => {
  // 模拟 AI 运行状态
  setInterval(() => {
    aiRunning.value = !aiRunning.value;
  }, 3000);
});
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #004d40 0%, #00695c 100%);
  box-shadow: 0 4px 12px rgba(0, 77, 64, 0.15);
  border: none;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Logo 部分 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-section:hover {
  transform: translateX(2px);
}

.logo-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.app-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  border: none;
  background-color: transparent !important;
  margin: 0 30px;
}

.nav-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-menu :deep(.el-menu-item:hover) {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #00bcd4 !important;
  background-color: rgba(0, 188, 212, 0.15) !important;
  border-bottom: 3px solid #00bcd4 !important;
}

/* 右侧功能区 */
.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* AI 状态指示器 */
.ai-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: rgba(0, 188, 212, 0.15);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #00bcd4;
  letter-spacing: 0.5px;
}

.ai-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00bcd4;
  animation: pulse 1.5s ease-in-out infinite;
}

.ai-status-dot.active {
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 188, 212, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 188, 212, 0.6);
  }
}

/* 通知铃 */
.notification-bell {
  position: relative;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.notification-content {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 12px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.notif-warning .notif-icon {
  color: #ff9800;
}

.notification-item.notif-success .notif-icon {
  color: #4caf50;
}

.notification-item.notif-error .notif-icon {
  color: #f44336;
}

.notification-item.notif-info .notif-icon {
  color: #2196f3;
}

.notif-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: #263238;
  margin-bottom: 4px;
}

.notif-time {
  font-size: 11px;
  color: #999;
}

/* 用户菜单 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.user-role {
  font-size: 11px;
  opacity: 0.8;
}

.user-info i {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-info:hover i {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 16px;
  }

  .logo-section {
    min-width: 200px;
  }

  .app-title {
    font-size: 18px;
  }

  .nav-menu {
    margin: 0 20px;
  }
}

@media (max-width: 768px) {
  .app-subtitle {
    display: none;
  }

  .nav-menu :deep(.el-menu-item) {
    padding: 0 10px !important;
  }

  .right-section {
    gap: 12px;
  }

  .ai-status {
    display: none;
  }
}
</style>
