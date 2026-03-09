<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo 部分 - 保留原始设计 -->
      <div class="logo-section">
        <img
          src="/src/assets/images/logo.jpg"
          alt="logo"
          class="logo-image"
        />
        <div class="logo-text">
          <h1 class="app-title">智栏哨兵</h1>
          <span class="app-subtitle">畜禽健康智能防控中枢系统</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        mode="horizontal"
        :default-active="currentRoute.name?.toLowerCase() || 'dashboard'"
        background-color="transparent"
        text-color="#333"
        active-text-color="#2e7d32"
        @select="handleMenuSelect"
        class="nav-menu"
      >
        <el-menu-item index="dashboard">首页</el-menu-item>
        <el-menu-item index="monitor">实时监控</el-menu-item>
        <el-menu-item index="data">数据分析</el-menu-item>
        <el-menu-item index="warning">预警中心</el-menu-item>
        <el-menu-item index="knowledge">防疫知识</el-menu-item>
      </el-menu>

      <!-- 右侧功能区 -->
      <div class="right-section">
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
            <i class="el-icon-arrow-down"></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item command="help">帮助文档</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const currentRoute = useRoute();
const username = ref("管理员");

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
    router.push("/profile");
  } else if (command === "settings") {
    ElMessage.info("跳转到系统设置");
  } else if (command === "help") {
    ElMessage.info("打开帮助文档");
  }
};
</script>

<style scoped>
.app-header {
  background: linear-gradient(90deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-section:hover {
  opacity: 0.8;
}

.logo-image {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2e7d32;
  letter-spacing: 0.5px;
}

.app-subtitle {
  font-size: 11px;
  color: #999;
  letter-spacing: 0.5px;
}

.nav-menu {
  flex: 1;
  border: none;
  margin: 0 30px;
}

.nav-menu :deep(.el-menu-item) {
  color: #333 !important;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-menu :deep(.el-menu-item:hover) {
  color: #2e7d32 !important;
  background-color: rgba(46, 125, 50, 0.05) !important;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #2e7d32 !important;
  background-color: rgba(46, 125, 50, 0.1) !important;
  border-bottom: 3px solid #2e7d32 !important;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: #333;
}

.user-info:hover {
  background-color: rgba(46, 125, 50, 0.05);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.user-role {
  font-size: 11px;
  color: #999;
}

@media (max-width: 1024px) {
  .header-content {
    padding: 0 16px;
  }

  .logo-section {
    min-width: 200px;
  }

  .app-title {
    font-size: 16px;
  }

  .nav-menu {
    margin: 0 20px;
  }
}

@media (max-width: 768px) {
  .app-subtitle {
    display: none;
  }

  .logo-image {
    height: 40px;
  }

  .nav-menu :deep(.el-menu-item) {
    padding: 0 10px !important;
    font-size: 12px;
  }
}
</style>
